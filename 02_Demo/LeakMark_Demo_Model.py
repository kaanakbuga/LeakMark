#!/usr/bin/env python3
"""LeakMark illustrative reader-response simulation.

Run: python LeakMark_Demo_Model.py --out-dir demo-output
Requires: numpy, matplotlib.

All inputs are declared assumptions, not CST output or measured soil data.
The effective geometry factor is an illustrative homogeneous-field proxy.
The model is an ideal coupled lumped circuit with constant coil resistance.
Coupling k is dimensionless and is not assigned a burial depth.
This script produces PNG, CSV and JSON files with the model assumptions.
"""

from pathlib import Path
import argparse
import csv
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

EPS0 = 8.8541878128e-12
LS = 200e-9
LR = 500e-9
RS = 1.0
RR = 1.0
C_GEOM = 0.5e-12
F_NOM = 100e6
K_VALUES = (0.005, 0.010, 0.020)
K_MAIN = 0.020
FREQUENCIES = np.linspace(55e6, 120e6, 26001)
CSV_DECIMATION = 20  # CSV keeps every 20th point (50 kHz step); peaks use the full grid.
# After the CST step, add 'C_pF' and 'G_uS' to each scenario. When present, these
# extracted values replace the epsilon_r * C_GEOM and sigma * C_GEOM / EPS0 proxies.
SCENARIOS = (
    {'name': 'Dry', 'epsilon_r': 4.0, 'sigma_S_m': 1e-4, 'color': '#2563A6'},
    {'name': 'Moist', 'epsilon_r': 12.0, 'sigma_S_m': 1e-3, 'color': '#A85A13'},
    {'name': 'Wet', 'epsilon_r': 25.0, 'sigma_S_m': 1e-2, 'color': '#157F69'},
)
# Conductivity sensitivity for the wet permittivity (reported in JSON, not plotted).
WET_SIGMA_SWEEP_S_M = (0.01, 0.03, 0.05, 0.10)

def effective_parameters(scenario):
    if 'C_pF' in scenario and 'G_uS' in scenario:
        return scenario['C_pF'] * 1e-12, scenario['G_uS'] * 1e-6
    c_soil = scenario['epsilon_r'] * C_GEOM
    g_soil = scenario['sigma_S_m'] * C_GEOM / EPS0
    return c_soil, g_soil

# Fixed capacitor chosen so the dry scenario resonates at F_NOM.
C_FIXED = 1 / ((2 * np.pi * F_NOM) ** 2 * LS) - effective_parameters(SCENARIOS[0])[0]

def loaded_q(frequency_hz, values):
    """Peak frequency divided by the half-maximum width of a Delta R curve."""
    peak = int(np.argmax(values))
    above = frequency_hz[values >= values[peak] / 2]
    return float(frequency_hz[peak] / (above[-1] - above[0]))

def impedances(frequency_hz, scenario, k):
    omega = 2 * np.pi * np.asarray(frequency_hz)
    c_soil, g_soil = effective_parameters(scenario)
    z_cap = 1 / (g_soil + 1j * omega * (C_FIXED + c_soil))
    z_sensor = RS + 1j * omega * LS + z_cap
    mutual = k * np.sqrt(LR * LS)
    z_reader = RR + 1j * omega * LR
    z_input = z_reader + omega**2 * mutual**2 / z_sensor
    return z_input, z_sensor

def response(frequency_hz, scenario, k):
    z_input, _ = impedances(frequency_hz, scenario, k)
    return np.real(z_input) - RR

def validate():
    # Independent two-loop circuit solve checks the reflected-impedance formula.
    for scenario in SCENARIOS:
        for k in K_VALUES:
            for f in (70e6, 90e6, 110e6):
                z_input, z_sensor = impedances(f, scenario, k)
                omega = 2 * np.pi * f
                mutual = k * np.sqrt(LR * LS)
                z_reader = RR + 1j * omega * LR
                matrix = np.array([[z_reader, 1j*omega*mutual],
                                   [1j*omega*mutual, z_sensor]], dtype=complex)
                currents = np.linalg.solve(matrix, np.array([1.0, 0.0], dtype=complex))
                np.testing.assert_allclose(1 / currents[0], z_input, rtol=1e-11, atol=1e-11)
        assert np.min(response(FREQUENCIES, scenario, K_MAIN)) >= -1e-12
    assert C_FIXED > 0
    # CST override path: explicit C/G equal to the proxy values must give the same curve.
    wet = SCENARIOS[-1]
    c_proxy, g_proxy = effective_parameters(wet)
    override = {'name': 'Wet override', 'C_pF': c_proxy * 1e12, 'G_uS': g_proxy * 1e6}
    np.testing.assert_allclose(response(FREQUENCIES, override, K_MAIN),
                               response(FREQUENCIES, wet, K_MAIN), rtol=1e-12, atol=1e-12)
    assert np.max(np.abs(response(FREQUENCIES, SCENARIOS[0], 0))) < 1e-12

def load_hfss(path):
    """Replace the proxy C/G inputs with HFSS-extracted values (LeakMark_HFSS_IDC_Results.json)."""
    global C_FIXED
    data = json.loads(Path(path).read_text(encoding='utf-8'))
    by_name = {r['name']: r for r in data['results']}
    missing = [s['name'] for s in SCENARIOS if s['name'] not in by_name]
    if missing:
        raise SystemExit(f'HFSS results missing scenarios: {missing}')
    for s in SCENARIOS:
        r = by_name[s['name']]
        s['C_pF'], s['G_uS'] = float(r['C_pF']), float(r['G_uS'])
        s['epsilon_r'], s['sigma_S_m'] = float(r['epsilon_r']), float(r['sigma_S_m'])
        s['hfss_convergence'] = r.get('convergence')
    C_FIXED = 1 / ((2 * np.pi * F_NOM) ** 2 * LS) - effective_parameters(SCENARIOS[0])[0]
    if C_FIXED <= 0:
        raise SystemExit('HFSS dry capacitance is too large for the 100 MHz reader model.')
    sweep = [r for r in data['results'] if r['name'] == 'Wet' or r['name'].startswith('Wet_sigma')]
    sweep.sort(key=lambda r: r['sigma_S_m'])
    cases = [{'name': r['name'], 'epsilon_r': r['epsilon_r'], 'sigma_S_m': r['sigma_S_m'],
              'C_pF': r['C_pF'], 'G_uS': r['G_uS'], 'hfss_convergence': r.get('convergence')} for r in sweep]
    return data, cases


def main():
    global C_FIXED
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out-dir', type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument('--hfss-results', type=Path, default=None,
                        help='LeakMark_HFSS_IDC_Results.json; uses HFSS C/G instead of the proxy')
    args = parser.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    validate()
    hfss_data, hfss_cases = (None, None)
    if args.hfss_results:
        hfss_data, hfss_cases = load_hfss(args.hfss_results)
        validate()
    suffix = '_HFSS' if hfss_data else ''
    subtitle = ('HFSS-EXTRACTED SENSOR C AND G  |  ASSUMED READER COUPLING' if hfss_data
                else 'ILLUSTRATIVE CIRCUIT SIMULATION  |  ASSUMED PARAMETERS')
    detail = ('IDC: 5 finger pairs, 1 mm fingers and gaps, 0.1 mm PE cover  •  100 MHz dry tuning'
              if hfss_data else '100 MHz nominal dry design  •  Same effective sensor geometry across scenarios')

    peaks = []
    rows = []
    for scenario in SCENARIOS:
        c_soil, g_soil = effective_parameters(scenario)
        main_y = response(FREQUENCIES, scenario, K_MAIN)
        index = int(np.argmax(main_y))
        # Grid-convergence check: doubling resolution changes peak by < 0.005 MHz.
        fine_f = np.linspace(55e6, 120e6, 52001)
        fine_peak = fine_f[int(np.argmax(response(fine_f, scenario, K_MAIN)))]
        assert abs(fine_peak - FREQUENCIES[index]) <= 5000
        peaks.append({
            'name': scenario['name'], 'epsilon_r_assumed': scenario['epsilon_r'],
            'sigma_S_m_assumed': scenario['sigma_S_m'],
            'C_soil_pF': float(c_soil * 1e12), 'G_soil_uS': float(g_soil * 1e6),
            'reader_peak_MHz': float(FREQUENCIES[index] / 1e6),
            'reader_peak_added_resistance_ohm': float(main_y[index]),
            'loaded_Q_half_max': loaded_q(FREQUENCIES, main_y),
        })
        csv_f = FREQUENCIES[::CSV_DECIMATION]
        for k in K_VALUES:
            z_input, _ = impedances(csv_f, scenario, k)
            for f, z in zip(csv_f, z_input):
                rows.append((scenario['name'], k, float(f), float(np.real(z)),
                             float(np.imag(z)), float(np.real(z)-RR)))

    # Wet-permittivity conductivity sweep on a wider grid so broad curves are not truncated.
    wide_f = np.linspace(30e6, 140e6, 110001)
    sigma_sweep = []
    sweep_cases = hfss_cases or [{'name': f'Wet sigma {s}', 'epsilon_r': SCENARIOS[-1]['epsilon_r'],
                                  'sigma_S_m': s} for s in WET_SIGMA_SWEEP_S_M]
    for case in sweep_cases:
        y = response(wide_f, case, K_MAIN)
        i = int(np.argmax(y))
        entry = {'sigma_S_m_assumed': case['sigma_S_m'], 'reader_peak_MHz': float(wide_f[i] / 1e6),
                 'reader_peak_added_resistance_ohm': float(y[i]), 'loaded_Q_half_max': loaded_q(wide_f, y)}
        if 'C_pF' in case:
            entry.update({'C_pF': case['C_pF'], 'G_uS': case['G_uS'],
                          'hfss_convergence': case.get('hfss_convergence')})
        sigma_sweep.append(entry)

    plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 10.5,
                         'axes.spines.top': False, 'axes.spines.right': False,
                         'axes.titleweight': 'bold'})
    fig, axes = plt.subplots(1, 2, figsize=(13.8, 5.6), gridspec_kw={'width_ratios': [1.22, 1]})
    fig.subplots_adjust(left=0.07, right=0.98, bottom=0.18, top=0.73, wspace=0.27)
    fig.text(0.07, 0.94, 'LeakMark: Reader response demo', fontsize=21, weight='bold', color='#142B3A')
    fig.text(0.07, 0.875, subtitle, fontsize=10, weight='bold', color='#53636E')
    fig.text(0.07, 0.82, detail, fontsize=11, color='#334955')
    for scenario, peak in zip(SCENARIOS, peaks):
        axes[0].plot(FREQUENCIES/1e6, response(FREQUENCIES, scenario, K_MAIN),
                     color=scenario['color'], lw=2.5,
                     label=f"{scenario['name']}  ({peak['reader_peak_MHz']:.1f} MHz)")
    axes[0].set_title('A   Soil scenarios at k = 0.020', loc='left', fontsize=12, pad=12)
    axes[0].set_ylabel(r'Added reader resistance, $\Delta R$ ($\Omega$)')
    axes[0].legend(frameon=False, loc='upper left', fontsize=10)
    axes[0].set_ylim(bottom=0)
    wet = SCENARIOS[-1]
    for k, color in zip(K_VALUES, ['#9ABBCB', '#477D9B', '#163E58']):
        axes[1].plot(FREQUENCIES/1e6, response(FREQUENCIES, wet, k), color=color,
                     lw=2.3, label=f'k = {k:.3f}')
    axes[1].set_title('B   Wet scenario across coupling values', loc='left', fontsize=12, pad=12)
    axes[1].set_ylabel(r'Added reader resistance, $\Delta R$ ($\Omega$)')
    axes[1].legend(frameon=False, loc='upper right', fontsize=10)
    axes[1].set_ylim(bottom=0)
    for ax in axes:
        ax.set_xlabel('Reader excitation frequency (MHz)', labelpad=8)
        ax.set_xlim(55, 120)
        ax.grid(axis='y', color='#E1E7EC', lw=0.8)
        ax.tick_params(axis='both', labelsize=9.5)
    fig.text(0.07, 0.065, 'Model output: real input impedance minus the 1-ohm reader resistance. '
             'Coupling k is dimensionless.', fontsize=9, color='#53636E')
    figure_path = args.out_dir/f'LeakMark_Demo_Response{suffix}.png'
    fig.savefig(figure_path, dpi=240, facecolor='white')
    plt.close(fig)
    # Dedicated portrait-document export with readable labels and no cropped text.
    panel, ax = plt.subplots(figsize=(7.6, 3.5))
    panel.subplots_adjust(left=0.12, right=0.98, bottom=0.21, top=0.86)
    for scenario, peak in zip(SCENARIOS, peaks):
        ax.plot(FREQUENCIES/1e6, response(FREQUENCIES, scenario, K_MAIN),
                color=scenario['color'], lw=2.4,
                label=f"{scenario['name']}  ({peak['reader_peak_MHz']:.1f} MHz)")
    ax.set_title('Modelled reader response | ' + ('HFSS sensor values' if hfss_data else 'assumed parameters'),
                 loc='left', fontsize=12, pad=11)
    ax.set_xlabel('Reader excitation frequency (MHz)', fontsize=11)
    ax.set_ylabel(r'Added reader resistance, $\Delta R$ ($\Omega$)', fontsize=10)
    ax.set_xlim(55,120)
    ax.set_ylim(bottom=0)
    ax.legend(frameon=False,loc='upper left',fontsize=10)
    ax.grid(axis='y',color='#E1E7EC',lw=0.8)
    panel.savefig(args.out_dir/f'LeakMark_Demo_Overlay{suffix}.png',dpi=300,facecolor='white')
    plt.close(panel)

    # Conductivity sensitivity of the wet scenario (same permittivity, rising sigma).
    sens, ax = plt.subplots(figsize=(7.6, 3.5))
    sens.subplots_adjust(left=0.12, right=0.98, bottom=0.21, top=0.86)
    shades = ['#157F69', '#3F9A86', '#7DB9AA', '#B5D6CD']
    for case, entry, color in zip(sweep_cases, sigma_sweep, shades):
        ax.plot(wide_f/1e6, response(wide_f, case, K_MAIN), color=color, lw=2.3,
                label=f"σ = {case['sigma_S_m']:g} S/m  (Q ≈ {entry['loaded_Q_half_max']:.0f})")
    ax.set_title('Wet soil, rising conductivity | ' + ('HFSS sensor values' if hfss_data else 'assumed parameters'),
                 loc='left', fontsize=12, pad=11)
    ax.set_xlabel('Reader excitation frequency (MHz)', fontsize=11)
    ax.set_ylabel(r'Added reader resistance, $\Delta R$ ($\Omega$)', fontsize=10)
    ax.set_xlim(55, 110)
    ax.set_ylim(bottom=0)
    ax.legend(frameon=False, loc='upper right', fontsize=9.5)
    ax.grid(axis='y', color='#E1E7EC', lw=0.8)
    sens.savefig(args.out_dir/f'LeakMark_Demo_Conductivity{suffix}.png', dpi=300, facecolor='white')
    plt.close(sens)

    with (args.out_dir/f'LeakMark_Demo_Data{suffix}.csv').open('w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['scenario', 'k', 'frequency_Hz', 'Re_Zin_ohm', 'Im_Zin_ohm', 'delta_R_ohm'])
        writer.writerows(rows)
    metadata = {
        'stage': ('Lumped-circuit reader model with HFSS-extracted sensor C and G' if hfss_data
                  else 'Illustrative lumped-circuit simulation with assumed inputs'),
        'hfss_source': str(args.hfss_results) if hfss_data else None,
        'hfss_geometry': hfss_data.get('geometry') if hfss_data else None,
        'assumptions': {'L_sensor_H': LS, 'L_reader_H': LR, 'R_sensor_ohm': RS,
                        'R_reader_ohm': RR, 'C_geometry_F': C_GEOM, 'C_fixed_F': C_FIXED,
                        'f_dry_nominal_Hz': F_NOM, 'k_values': K_VALUES, 'k_main': K_MAIN,
                        'material_parameters_constant_within_sweep': True,
                        'capacitor_protection_and_coil_self_capacitance_modelled': False},
        'scenario_results': peaks,
        'wet_conductivity_sensitivity_k_main': sigma_sweep,
        'csv_frequency_step_Hz': float(FREQUENCIES[CSV_DECIMATION] - FREQUENCIES[0]),
        'interpretation': 'Scenario-specific response shifts and loss broadening in this assumed circuit. '
                          'CST extraction, calibrated soil data and depth mapping are future steps.',
        'validation': 'Closed-form result checked against independent 2-loop circuit solves; '
                      'passivity, zero coupling, and frequency-grid convergence checked.'
    }
    (args.out_dir/f'LeakMark_Demo_Parameters{suffix}.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
    print(json.dumps({'figure': str(figure_path), 'fixed_C_pF': C_FIXED*1e12,
                      'scenario_results': peaks, 'wet_conductivity_sensitivity': sigma_sweep,
                      'checks': 'passed'}, indent=2))

if __name__ == '__main__':
    main()
