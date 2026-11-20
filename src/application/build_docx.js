// Builds the LeakMark application text document (03_Application).
// Usage: node build_docx.js <output.docx>
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, LevelFormat, BorderStyle, Footer, PageNumber,
} = require('docx');

const FONT = 'Arial';
const INK = '1F2A33';
const BRAND = '0E7C86';

const p = (text, opts = {}) => new Paragraph({
  spacing: { after: 120, line: 276 },
  ...opts,
  children: (Array.isArray(text) ? text : [text]).map(t => typeof t === 'string' ? new TextRun(t) : t),
});
const b = t => new TextRun({ text: t, bold: true });
const i = t => new TextRun({ text: t, italics: true });
const h1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const h2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const bullet = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 }, spacing: { after: 80, line: 276 },
  children: (Array.isArray(text) ? text : [text]).map(t => typeof t === 'string' ? new TextRun(t) : t),
});
let STEP_INST = 1;
const step = (text) => new Paragraph({
  numbering: { reference: 'steps', level: 0, instance: STEP_INST }, spacing: { after: 80, line: 276 },
  children: (Array.isArray(text) ? text : [text]).map(t => typeof t === 'string' ? new TextRun(t) : t),
});
const note = t => new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: t, italics: true, size: 18, color: '55636E' })] });

const border = { style: BorderStyle.SINGLE, size: 4, color: 'C9D3DA' };
const borders = { top: border, bottom: border, left: border, right: border };
function table(widths, rows) {
  const total = widths.reduce((a, c) => a + c, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, ri) => new TableRow({
      tableHeader: ri === 0,
      children: r.map((c, ci) => new TableCell({
        borders,
        width: { size: widths[ci], type: WidthType.DXA },
        shading: ri === 0 ? { fill: 'E3F1F2', type: ShadingType.CLEAR, color: 'auto' } : undefined,
        margins: { top: 70, bottom: 70, left: 110, right: 110 },
        children: [new Paragraph({
          keepNext: ri < rows.length - 1, keepLines: true,
          alignment: (ci === 0 || widths[ci] > 4000) ? AlignmentType.LEFT : AlignmentType.CENTER,
          children: [new TextRun({ text: c, bold: ri === 0, size: 19 })],
        })],
      })),
    })),
  });
}
const gap = () => new Paragraph({ spacing: { after: 60 }, children: [] });

const children = [
  new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun('LeakMark')] }),
  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'Battery-free tags that make hidden pipe leaks visible', size: 28, color: BRAND })] }),
  p([new TextRun({ text: 'Xylem Global Student Innovation Challenge 2026  |  University Track  |  Challenge #1: Water Quantity', size: 20 })], { spacing: { after: 40 } }),
  p([new TextRun({ text: 'Kaan Akbuğa, MSc Telecommunications Engineering, Istanbul Technical University', size: 20 })], { spacing: { after: 40 } }),
  p([new TextRun({ text: 'Submission deadline: 20 November 2026, 13:00 ET', size: 20 })], {
    spacing: { after: 240 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND, space: 8 } },
  }),

  h1('1. Summary'),
  p('Around the world, about 126 billion cubic metres of treated water are lost every year before they reach a tap, roughly four million litres every second. Much of it leaks from buried pipes that nobody can see. LeakMark is a palm-sized, battery-free tag that crews place in the trench above a water pipe during maintenance work that already happens. The tag is a copper coil and a capacitor that faces the soil. When a leak wets the soil, the tag\'s resonance frequency drops, and a reader on a utility vehicle or a handheld unit detects the change as it passes. Every tag appears on a map in the utility\'s control room. Rain wets every tag at once, while a leak wets one spot and keeps growing, so LeakMark only raises an alert for a local, lasting shift. A field crew then confirms the leak with acoustic tools and repairs it.'),
  p('The sensing physics has been simulated in Ansys HFSS: the same tag resonates at 100 MHz in dry soil and at about 82 MHz in wet soil, an 18 MHz shift. A working live demo shows the full workflow, from a field scan to an alert in the control room, a work order on a crew\'s phone and a closed repair. LeakMark is designed for any city with high water loss. Istanbul is the pilot city.'),

  h1('2. The issue'),
  h2('Water lost before it reaches a tap'),
  p('Liemberger and Wyatt estimate that non-revenue water amounts to about 126 billion cubic metres a year worldwide, about 30% of all water put into supply, with a value of about 39 billion US dollars a year. This total also includes apparent losses such as metering errors, but a large share is physical leakage from pipes.'),
  p('In Istanbul, the pilot city, the water utility İSKİ reports in its 2024 Standard Water Balance that leakage from transmission and distribution mains and service connections reached 190.6 million cubic metres, 16.42% of system input (total water loss 18.63%). With the city\'s daily consumption of 3.17 million cubic metres reported by İSKİ for 15 October 2026, this leakage equals about 60 days of the whole city\'s water every year.'),
  h2('Why leaks stay hidden'),
  bullet([b('Acoustic surveys are periodic. '), 'Leak teams listen for leaks zone by zone, so each street is checked only now and then.']),
  bullet([b('Meters show a loss, not a location. '), 'District meters reveal that water is missing, but not which pipe is leaking.']),
  bullet([b('Small leaks run unseen. '), 'Water soaks into the soil, sometimes for weeks, before it appears on the street.']),
  p('The gap is therefore not the repair itself but the time between the start of a leak and the moment a crew knows where to look.'),

  h1('3. Our solution'),
  p('LeakMark turns the soil above a pipe into a signal that a utility can read. It has three parts.'),
  bullet([b('Tag. '), 'A printed circuit board with a coil (L) and an interdigital capacitor (C) that faces the soil, sealed in a plastic housing. It has no battery and no chip, so there is nothing to charge or maintain, and it can last as long as the pipe. Crews place it in the trench above the pipe, next to the standard pipe warning tape, before backfill. Its position is recorded on the utility\'s map, so the tag that marks where the pipe is also tells the utility when it leaks.']),
  bullet([b('Reader. '), 'A portable vector network analyzer with a simple loop antenna, carried on a utility vehicle or used as a handheld unit. It sweeps frequency as it passes each tag and records the tag\'s resonance.']),
  bullet([b('Software. '), 'A web panel for the control room, where the leak team sees every tag on a map with its status and alerts, and a mobile app for field crews, who scan routes, receive work orders, log acoustic checks and close repairs.']),
  p('Wet soil has a much higher permittivity than dry soil, as shown by Topp and colleagues in their classic measurements of soil water content. Because the tag\'s capacitor faces the soil, wetter soil raises its capacitance and lowers its resonance frequency. Higher soil conductivity adds loss and broadens the resonance.'),

  h1('4. How it works'),
  step([b('Tag. '), 'During planned maintenance or pipe renewal, the crew drops a LeakMark tag into the open trench and adds it to the map with the Add tag function of the field app.']),
  step([b('Scan. '), 'On each survey, the reader sweeps frequency past every tag on the route. Each reading is uploaded to the control room.']),
  step([b('Compare. '), 'Each tag is compared with the median of its nearest neighbours on the same main. A tag that reads 4 MHz or more below its neighbours on two consecutive scans is flagged as a suspected leak. A shift that appears across the whole zone at once is treated as rain or drainage and raises no alert.']),
  step([b('Map and dispatch. '), 'The alert appears in the web panel. The leak team sends a crew with one click, and the work order arrives on the crew\'s phone.']),
  step([b('Confirm and repair. '), 'On site, the crew confirms the leak with its existing acoustic tools, repairs it and logs the repair with a photo. The alert closes, and the tag returns to its dry reading as the soil drains.']),
  p('LeakMark does not replace acoustic leak detection. It tells the leak team where to point it first.'),

  h1('5. Evidence: sensor simulation in Ansys HFSS'),
  h2('Method'),
  p('The tag\'s soil-facing interdigital capacitor was modelled in Ansys HFSS (AEDT 2025.2, scripted with PyAEDT). The electrode has 5 finger pairs with 1 mm finger width, 1 mm gap and 15 mm finger length on a 1.6 mm FR4 board, covered by a 0.1 mm polyethylene layer, with a footprint of 31 × 26 mm. The model was solved at 100 MHz for dry, moist and wet soil, and for three more conductivity values of wet soil. Capacitance and loss conductance were extracted from the port admittance (C = Im(Y11)/ω, G = Re(Y11)). All six cases converged.'),
  gap(),
  table([2300, 1100, 1400, 1700, 1700], [
    ['Soil case', 'εr', 'σ (S/m)', 'C (pF)', 'G (µS)'],
    ['Dry', '4', '0.0001', '6.879', '55.28'],
    ['Moist', '12', '0.001', '10.205', '91.10'],
    ['Wet', '25', '0.01', '13.156', '248.23'],
    ['Wet, σ 0.03', '25', '0.03', '13.223', '611.10'],
    ['Wet, σ 0.05', '25', '0.05', '13.381', '955.84'],
    ['Wet, σ 0.10', '25', '0.10', '14.049', '1687.18'],
  ]),
  note('Table 1. Sensor capacitance and loss extracted in Ansys HFSS at 100 MHz. Soil permittivity and conductivity are representative assumed values for each condition.'),
  h2('Reader response'),
  p('The extracted values were fed into a circuit model of the tag coupled to the reader coil (sensor coil 200 nH, reader coil 500 nH, 1 Ω series resistance in each, assumed coupling k = 0.02). A fixed capacitor tunes the tag to 100 MHz in dry soil. The model was checked against an independent two-loop circuit solution and for passivity, zero coupling and frequency-grid convergence.'),
  gap(),
  table([2800, 2700, 2700], [
    ['Soil case', 'Reader peak (MHz)', 'Loaded Q'],
    ['Dry', '100.0', 'about 67'],
    ['Moist', '89.0', 'about 52'],
    ['Wet', '81.8', 'about 28'],
    ['Wet, σ 0.10 S/m', '80.0', 'about 5.6'],
  ]),
  note('Table 2. Modelled reader response with HFSS-extracted sensor values and assumed reader coupling k = 0.02.'),
  p([b('Result. '), 'The same tag moves from 100 MHz in dry soil to about 82 MHz in wet soil, an 18 MHz shift, well above the 4 MHz alert threshold. Very conductive wet soil makes the resonance much broader (loaded Q falls to about 5.6 at 0.10 S/m), but the peak stays near 80 MHz, so the frequency shift remains visible.']),

  h1('6. Live demo'),
  p('The live demo is a single web page with two views: the Control Room web panel and the field app (Scan, Work orders, Add tag). It runs a 30-day scenario on a network of 33 tags.'),
  ...(STEP_INST = 2, []),
  step('The scenario opens on day 14. Rain on days 8 and 9 wet the whole zone, and LeakMark raised no alert, because every tag shifted together.'),
  step('A hidden leak starts at tag T-27 on day 16. The crew scans the route with the field app, and every scan uploads to the control room.'),
  step('On day 18, after two consecutive scans with T-27 well below its neighbours, a red alert appears in the control room.'),
  step('The leak team presses Send crew. The work order arrives on the crew\'s phone, and the crew navigates to the tag.'),
  step('On site, the crew runs an acoustic check, confirms leak noise, adds a photo and marks the leak repaired. The control room closes the alert: from hidden leak to repair in two days.'),
  p('The demo shows the user experience and the alert logic. Its readings are generated by the scenario, shaped to match the simulated frequency shift; they are not field measurements.'),

  h1('7. Who uses LeakMark'),
  bullet([b('Water utilities. '), 'The main customer. Leak teams plan work in the web panel, and field crews scan and repair with the mobile app.']),
  bullet([b('Sites with their own pipe networks. '), 'Industrial zones, airports, campuses and data centres with buried water lines and no leak monitoring.']),
  bullet([b('People in the city. '), 'Fewer hidden losses mean fewer supply cuts and more water left in the reservoirs during a drought.']),

  h1('8. Impact'),
  p('The water saved by LeakMark is the leak flow multiplied by the time by which the repair is brought forward. For a leak of q litres per minute repaired Δt days earlier, the saving in cubic metres is 1.44 × q × Δt. If surveys take place every T days and a leak can start at any time in the interval, the average wait for the next survey is T/2 days.'),
  p([b('Illustrative example. '), 'A 10 L/min leak repaired 15 days earlier, half of a 30-day survey interval, saves 1.44 × 10 × 15 ≈ 216 cubic metres of water. These are example values; pilot data will replace them, and the time for water to reach the tag and for acoustic confirmation will be included in the comparison with the utility\'s current process.']),
  p([b('Where leaks matter most. '), 'Leaks waste water everywhere, but the cost is highest where water is already scarce. In the Aqueduct 4.0 country rankings of the World Resources Institute, 47 of the 164 countries assessed face high or extremely high baseline water stress, meaning that water demand equals more than 40% of the renewable supply. Turkey and the province of Istanbul, the pilot city, are both in the high category (40-80%). These water-stressed regions are where LeakMark scales next.']),
  p('Because tags go in during maintenance work that already happens, coverage grows with every pipe renewal, in Istanbul and in any city. Xylem\'s 2025 Sustainability Report states that Xylem solutions have helped customers reduce more than 4.3 billion cubic metres of non-revenue water since 2019. LeakMark takes that mission to the pipes nobody can see.'),

  h1('9. Feasibility'),
  bullet([b('Built from parts that already exist. '), 'A printed circuit board in a plastic housing, a portable vector network analyzer with a loop antenna, and standard web and mobile software.']),
  bullet([b('No new excavation. '), 'The tag is placed in a trench that is already open for maintenance or pipe renewal.']),
  bullet([b('Fits the existing workflow. '), 'Alerts lead to the acoustic confirmation and repair steps that utilities already use.']),
  bullet([b('Physics checked. '), 'The sensing principle has been simulated in Ansys HFSS with converged results, and the reader response has been modelled from those values.']),

  h1('10. Innovation'),
  p('Passive LC sensors that read soil moisture through a shift in resonance are known from research and patents, for example the interdigital capacitor LC moisture sensor of Dimitrov and colleagues (2020), the wireless passive sensor for pipeline integrity monitoring of Zarifi and colleagues (2017) and patent application US 2024/0319128 A1 for soil water content monitoring. LeakMark applies this principle to a new place and a new job:'),
  bullet('the tag is installed at the pipe during maintenance that already happens, so it also marks the pipe position on the map;'),
  bullet('a neighbour comparison separates a local, lasting leak signal from area-wide rain, using only the tags themselves;'),
  bullet('the reading is connected to a complete utility workflow, from scan to alert, work order, acoustic confirmation and closed repair.'),

  h1('11. What is proven, and what comes next'),
  table([1500, 6700], [
    ['Stage', 'Work'],
    ['Done', 'Sensor simulated in Ansys HFSS, reader circuit model and live demo'],
    ['Next', 'Prototype tag tested in a soil box with rain and leak cases'],
    ['Then', 'Pilot in one Istanbul district during planned maintenance'],
    ['Scale', 'Roll-out to cities with high water loss'],
  ]),
  gap(),
  h2('Open questions the next steps will test'),
  bullet([b('Read range at burial depth. '), 'The reader coupling (k = 0.02) is an assumed value. Passive LC tags usually have a short read range, so the distance between the reader and a buried tag, and the antenna needed to reach it, must be measured with the prototype.']),
  bullet([b('Real soil. '), 'The soil values in the simulation are representative assumptions, held constant across the frequency sweep. Measured soil data will replace them.']),
  bullet([b('Rain versus leak. '), 'The neighbour rule is a hypothesis until it is tested in the soil box and in the pilot. Water must also reach the tag, so the delay between a leak and a wet tag will be measured.']),
  bullet([b('Circuit details. '), 'The reader model uses ideal coupled coils; coil self-resonance and reader noise will be checked on hardware.']),
  p('Every alert is confirmed acoustically before any excavation, so a false alert costs a short site visit, not a dig.'),

  h1('12. Outside help'),
  p('Outside help: none. AI tools assisted with research, code and drafting.'),

  h1('13. Sources'),
  bullet('Xylem and BeMyApp. Xylem Global Student Innovation Challenge 2026, Official Rules.'),
  bullet('Liemberger, R. and Wyatt, A. (2019). Quantifying the global non-revenue water problem. Water Supply, 19(3), 831-837. Reported in IWA, The Source (2018), "Bursting at the seams: new study highlights the realities of water loss".'),
  bullet('İSKİ. Standard Water Balance Form 2024 (Standart Su Dengesi Formu). Mains and service connections: 190,638,385 m³/year (16.42%); total water loss 18.63%.'),
  bullet('İSKİ. Daily water consumption, 15 October 2026: 3.17 million m³/day.'),
  bullet('Xylem. 2025 Sustainability Report, released 12 May 2026.'),
  bullet('Kuzma, S., Bierkens, M. F. P., Lakshman, S., Luo, T., Saccoccia, L., Sutanudjaja, E. H. and Van Beek, R. (2023). Aqueduct 4.0: Updated decision-relevant global water risk indicators. Technical Note. Washington, DC: World Resources Institute. DOI 10.46830/writn.23.00061. Country rankings data file Y2023M07D05, baseline water stress weighted by total demand, CC BY 4.0.'),
  bullet('Topp, G. C., Davis, J. L. and Annan, A. P. (1980). Electromagnetic determination of soil water content: Measurements in coaxial transmission lines. Water Resources Research, 16(3), 574-582. DOI 10.1029/WR016i003p00574.'),
  bullet('Dimitrov, K. C., Song, S., Chang, H., Lim, T., Lee, Y. and Kwak, B.-J. (2020). Interdigital Capacitor-Based Passive LC Resonant Sensor for Improved Moisture Sensing. Sensors, 20(21), 6306. DOI 10.3390/s20216306.'),
  bullet('Zarifi, M. H., Deif, S. and Daneshmand, M. (2017). Wireless passive RFID sensor for pipeline integrity monitoring. Sensors and Actuators A: Physical, 261, 24-29. DOI 10.1016/j.sna.2017.04.006.'),
  bullet('US 2024/0319128 A1 (2024). Wireless sensor based on LC resonator for monitoring soil water content.'),
  bullet('Baù, M., Demori, M., Ferrari, M. and Ferrari, V. (2018). Contactless Readout of Passive LC Sensors with Compensation Circuit for Distance-Independent Measurements. Proceedings, 2(13), 842. DOI 10.3390/proceedings2130842.'),
  bullet('LeakMark project files: HFSS results (run 20261020_172137), reader model parameters and the live demo.'),
];

const doc = new Document({
  creator: 'Kaan Akbuğa',
  title: 'LeakMark application texts',
  styles: {
    default: { document: { run: { font: FONT, size: 21, color: INK } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal', run: { font: FONT, size: 52, bold: true, color: BRAND }, paragraph: { spacing: { before: 0, after: 60 }, keepNext: true } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 28, bold: true, color: BRAND }, paragraph: { spacing: { before: 300, after: 120 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 23, bold: true, color: INK }, paragraph: { spacing: { before: 180, after: 80 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
      { reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1300, bottom: 1300, left: 1440, right: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'LeakMark  |  ', size: 16, color: '7A8791' }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '7A8791' })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => { fs.writeFileSync(process.argv[2] || 'out.docx', buf); console.log('written'); });
