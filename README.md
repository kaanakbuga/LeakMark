# LeakMark

**Battery-free tags that make hidden pipe leaks visible.**

LeakMark is an entry to the Xylem Global Student Innovation Challenge 2026, University Track, Challenge #1: Water Quantity.
Team: Kaan Akbuğa, MSc Telecommunications Engineering, Istanbul Technical University.

## The idea

About 126 billion cubic metres of treated water are lost worldwide every year, roughly 30% of all water put into supply (Liemberger and Wyatt). Much of it leaks from buried pipes that nobody can see.

LeakMark is a palm-sized LC tag with no battery and no chip. Crews place it in the trench above the pipe, next to the standard warning tape, during maintenance that already happens. The tag's capacitor faces the soil. When a leak wets the soil, the tag's resonance frequency drops.

A reader on a utility vehicle or a handheld unit sweeps frequency as it passes each tag. A tag that reads 4 MHz or more below the median of its neighbours on two consecutive scans raises an alert. A shift seen across the whole zone at once is treated as rain or drainage and raises no alert. A web panel shows the alert to the leak team, and a mobile app guides the field crew from the work order to the repair.

## Try the live demo

Open `05_Demo_Panel/LeakMark_Live_Demo.html` in a browser. It is a single file with no install. It shows the control room web panel and the crew's field app side by side, on simulated data for a pilot zone of 33 tags in Istanbul. Press **Start scan** on the phone four times, then follow the alert from the control room to the closed repair.

## Simulation results

The sensor is an interdigital capacitor: 5 finger pairs, 1 mm finger width, 1 mm gap and 15 mm finger length on 1.6 mm FR4, under a 0.1 mm polyethylene cover, with a footprint of 31 × 26 mm. It was modelled buried in soil in Ansys HFSS (AEDT 2025.2, scripted with PyAEDT) and solved at 100 MHz. Capacitance and loss conductance come from the port admittance: C = Im(Y11)/ω, G = Re(Y11). All six cases converged.

| Soil | εr | σ (S/m) | C (pF) | G (µS) |
|---|---|---|---|---|
| Dry | 4 | 0.0001 | 6.879 | 55.28 |
| Moist | 12 | 0.001 | 10.205 | 91.10 |
| Wet | 25 | 0.01 | 13.156 | 248.23 |
| Wet, σ 0.03 | 25 | 0.03 | 13.223 | 611.10 |
| Wet, σ 0.05 | 25 | 0.05 | 13.381 | 955.84 |
| Wet, σ 0.10 | 25 | 0.10 | 14.049 | 1687.18 |

These values feed a circuit model of the tag coil and the reader coil (Ls 200 nH, Lr 500 nH, Rs = Rr = 1 Ω, coupling k = 0.02). The reader sees a resonance peak at 100.0 MHz in dry soil, 89.0 MHz in moist soil and 81.8 MHz in wet soil: an 18 MHz shift. The coupling k = 0.02 is an assumption; a prototype will measure the real value.

## Repository contents

| Folder | Contents |
|---|---|
| `01_HFSS` | Verified results (`LeakMark_HFSS_IDC_Results.json`), the final HFSS project (`..._20261020_172137.aedt`) and run logs, including convergence per case. HFSS needs a local Ansys AEDT installation. |
| `02_Demo` | Reader and scan model fed with the HFSS results (`LeakMark_Demo_Model.py --hfss-results`) and its outputs. |
| `03_Application` | Application texts, texts for each field of the project page, the Freestyle section, the video script with rehearsal timing, and English subtitles for the video. |
| `04_Images` | Logo (square, horizontal and circle), banner (1920 × 600), icon, opening clip, YouTube thumbnail and their HTML sources. `Project_Page` holds the images for the project page. |
| `05_Demo_Panel` | The live demo: control room web panel and field app in one HTML file. |
| `06_Slides` | The 13-slide pitch deck. |
| `src` | Source code that builds the slides, documents, demo video, opening clip, map and brand assets. |

## Rebuilding

Slides (in `src/slides`):

```
npm install
node build.js raw.pptx
python3 animate.py raw.pptx LeakMark.pptx
```

The deck in `06_Slides` is this build with the HFSS model image added on slide 6.

Demo video for slide 9 (in `src/live_demo`, needs Playwright and ffmpeg; the four scans play at 2x speed; if the video length changes, update `VIDEO_MS` in `src/slides/animate.py`):

```
node rec_demo.js ../slides/LeakMark_Demo.mp4
```

Water stress map for slide 11 (in `src/map`; the Aqueduct xlsx and Natural Earth GeoJSON files are downloaded by hand):

```
python3 prepare_data.py Aqueduct40_rankings_download_Y2023M07D05.xlsx ne_50m_admin_0_countries.geojson ne_10m_admin_1_states_provinces.geojson
npm install
node render_map.js
```

Documents (from the repository root):

```
node src/application/build_docx.js 03_Application/Xylem_Student_Innovation_Challenge_2026_LeakMark_Application_Texts_2026_11_03.docx
node src/application/build_page_docx.js 03_Application/Xylem_Student_Innovation_Challenge_2026_LeakMark_Project_Page_Texts_2026_11_03.docx
node src/application/build_freestyle_docx.js 03_Application/Xylem_Student_Innovation_Challenge_2026_LeakMark_Freestyle_Section_2026_11_20.docx
python3 src/application/build_script_docx.py 06_Slides/Xylem_Student_Innovation_Challenge_2026_LeakMark_Slides_2026_11_18.pptx 03_Application/Xylem_Student_Innovation_Challenge_2026_LeakMark_Video_Script_2026_11_03.docx
```

Live demo test (in `src/live_demo`, needs Playwright):

```
python3 test.py
```

## Data sources

- Liemberger, R. and Wyatt, A. (2019). Quantifying the global non-revenue water problem. Water Supply, 19(3), 831-837.
- İSKİ (Istanbul Water and Sewerage Administration). Standard Water Balance Form 2024.
- Kuzma, S. et al. (2023). Aqueduct 4.0: Updated decision-relevant global water risk indicators. Technical Note. World Resources Institute. CC BY 4.0.
- Natural Earth, country and province boundaries. Public domain.

The full source list is in the application texts in `03_Application`.

All data in the live demo is simulated.
