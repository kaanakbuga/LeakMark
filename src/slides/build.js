// LeakMark pitch deck: Xylem Global Student Innovation Challenge 2026
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const React = require('react');
const RDS = require('react-dom/server');
const sharp = require('sharp');
const Fi = require('react-icons/fi');
const Md = require('react-icons/md');
const { applyTheme } = require('./apply_theme.js');

const OUT = process.argv[2] || 'deck.pptx';
const THEME = {
  name: 'LeakMark', headFontFace: 'Calibri', bodyFontFace: 'Calibri',
  colors: { dk1: '0B2E4A', lt1: 'FFFFFF', dk2: '4A6478', lt2: 'EEF5F8',
    accent1: '0E9AA7', accent2: '7FD3DA', accent3: 'FF5A3C', accent4: '2FA86A', accent5: 'E6A325', accent6: '6E5236',
    hlink: '0E9AA7', folHlink: '1F6F7A' },
};
const HEX = { navy: '0B2E4A', teal: '0E9AA7', aqua: '7FD3DA', alert: 'FF5A3C', ok: '2FA86A', rain: 'E6A325', muted: '4A6478', light: 'EEF5F8', card: 'FFFFFF', grid: 'D5E3EA' };
const chart = JSON.parse(fs.readFileSync('chart.json', 'utf8'));
chart.labels = chart.labels.map(v => (Number(v) % 10 === 0 ? v : ' '.repeat(1 + chart.labels.indexOf(v) % 9)));

async function icon(Comp, color, px = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: '#' + color, size: px }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}
const img = f => 'image/png;base64,' + fs.readFileSync(f).toString('base64');

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in
  pres.author = 'Kaan Akbuğa';
  pres.title = 'LeakMark';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  // Camera overlay zone (kept empty on every slide): x >= 9.7 in, y >= 5.15 in.

  pres.defineSlideMaster({ title: 'LM_BLANK', background: { color: '061A2B' }, objects: [], placeholders: [] });
  const LOGO_W = { image: { data: img('logo_white.png'), x: 11.55, y: 0.6, w: 1.2, h: 0.36 } };
  const LOGO_D = { image: { data: img('logo_dark.png'), x: 11.55, y: 0.6, w: 1.2, h: 0.36 } };
  pres.defineSlideMaster({
    title: 'LM_DARK_PLAIN', background: { color: HEX.navy },
    objects: [{ text: { text: 'LeakMark  |  Xylem Global Student Innovation Challenge 2026', options: { x: 0.6, y: 6.95, w: 6.5, h: 0.3, fontSize: 10, color: C.accent2, margin: 0 } } }],
    slideNumber: { x: 7.2, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: C.accent2 },
    placeholders: [],
  });
  pres.defineSlideMaster({
    title: 'LM_DARK', background: { color: HEX.navy },
    objects: [LOGO_W, { text: { text: 'LeakMark  |  Xylem Global Student Innovation Challenge 2026', options: { x: 0.6, y: 6.95, w: 6.5, h: 0.3, fontSize: 10, color: C.accent2, margin: 0 } } }],
    slideNumber: { x: 7.2, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: C.accent2 },
    placeholders: [],
  });
  pres.defineSlideMaster({
    title: 'LM_LIGHT', background: { color: HEX.light },
    objects: [LOGO_D, { text: { text: 'LeakMark  |  Xylem Global Student Innovation Challenge 2026', options: { x: 0.6, y: 6.95, w: 6.5, h: 0.3, fontSize: 10, color: C.text2, margin: 0 } } }],
    slideNumber: { x: 7.2, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: C.text2 },
    placeholders: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.45, w: 12.1, h: 0.9, fontSize: 36, bold: true, color: C.text1, valign: 'middle', margin: 0 }, text: '' } }],
  });
  pres.defineSlideMaster({
    title: 'LM_DARK_TITLE', background: { color: HEX.navy },
    objects: [{ text: { text: 'LeakMark  |  Xylem Global Student Innovation Challenge 2026', options: { x: 0.6, y: 6.95, w: 6.5, h: 0.3, fontSize: 10, color: C.accent2, margin: 0 } } }],
    slideNumber: { x: 7.2, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: C.accent2 },
    placeholders: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.45, w: 12.1, h: 0.9, fontSize: 36, bold: true, color: C.background1, valign: 'middle', margin: 0 }, text: '' } }],
  });

  const I = {
    headphones: await icon(Fi.FiHeadphones, HEX.teal), meter: await icon(Fi.FiActivity, HEX.teal), eye: await icon(Fi.FiEyeOff, HEX.teal),
    tag: await icon(Fi.FiTag, 'FFFFFF'), truck: await icon(Fi.FiTruck, 'FFFFFF'), pin: await icon(Fi.FiMapPin, 'FFFFFF'),
    rain: await icon(Fi.FiCloudRain, HEX.rain), utility: await icon(Md.MdWaterDrop, HEX.teal), factory: await icon(Md.MdFactory, HEX.teal), people: await icon(Fi.FiUsers, HEX.teal), sensor: await icon(Md.MdSensors, HEX.teal), antenna: await icon(Md.MdSettingsInputAntenna, HEX.teal), map: await icon(Fi.FiMap, HEX.teal),
    check: await icon(Fi.FiCheckCircle, 'FFFFFF'),
  };
  const shadow = () => ({ type: 'outer', color: '0B2E4A', opacity: 0.12, blur: 8, offset: 2, angle: 90 });
  const T = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, ...o });
  const title = (s, text, dark) => T(s, text, { x: 0.6, y: 0.45, w: 10.7, h: 0.9, fontSize: 36, bold: true, color: dark ? C.background1 : C.text1, valign: 'middle', fontFace: THEME.headFontFace, objectName: 'title' });

  // 0 ---------------------------------------------------------------- Hook video
  pres.addSection({ title: 'Opening' });
  let s = pres.addSlide({ masterName: 'LM_BLANK', sectionTitle: 'Opening' });
  s.addMedia({ type: 'video', path: 'LeakMark_Hook.mp4', cover: img('hook_poster.png'), x: 0, y: 0, w: 13.333, h: 7.5, objectName: 'autoplay_hook' });
  s.addNotes("[The clip starts by itself and runs for 10 seconds. Let it play, then speak.] Every second, about four million litres of treated water are lost before reaching a tap.");

  // 1 ---------------------------------------------------------------- Title
  s = pres.addSlide({ masterName: 'LM_DARK_PLAIN', sectionTitle: 'Opening' });
  s.addImage({ data: img('logo_white.png'), x: 0.6, y: 1.0, w: 5.2, h: 1.56, objectName: 'logo' });
  T(s, 'Battery-free tags that make hidden pipe leaks visible', { x: 0.6, y: 2.85, w: 6.0, h: 1.3, fontSize: 30, bold: true, color: C.background1, valign: 'top', objectName: 'tagline' });
  T(s, [
    { text: 'Kaan Akbuğa', options: { bold: true, breakLine: true } },
    { text: 'MSc Telecommunications Engineering, Istanbul Technical University', options: { breakLine: true } },
    { text: 'University Track  |  Challenge #1: Water Quantity' },
  ], { x: 0.6, y: 4.4, w: 6.3, h: 1.1, fontSize: 16, color: C.accent2, valign: 'top', paraSpaceAfter: 4, objectName: 'meta' });
  s.addImage({ data: img('ill_solution.png'), x: 7.0, y: 0.9, w: 5.9, h: 3.85, objectName: 'hero' });
  s.addNotes("I'm Kaan Akbuğa from Istanbul Technical University, and this is LeakMark.");

  // 2 ---------------------------------------------------------------- Problem
  pres.addSection({ title: 'Problem' });
  s = pres.addSlide({ masterName: 'LM_LIGHT', sectionTitle: 'Problem' });
  title(s, 'Treated water is lost before it reaches a tap');
  const stat = (x, big, bigColor, line, small, tag) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.7, w: 4.2, h: 3.25, rectRadius: 0.12, fill: { color: C.background1 }, line: { color: C.background1 }, shadow: shadow(), objectName: tag + '_card' });
    T(s, big, { x: x + 0.35, y: 1.95, w: 3.6, h: 0.95, fontSize: 48, bold: true, color: bigColor, objectName: tag + '_big' });
    T(s, line, { x: x + 0.35, y: 2.95, w: 3.6, h: 0.9, fontSize: 18, bold: true, color: C.text1, valign: 'top', objectName: tag + '_line' });
    T(s, small, { x: x + 0.35, y: 3.9, w: 3.6, h: 0.9, fontSize: 14, color: C.text2, valign: 'top', objectName: tag + '_small' });
  };
  stat(0.6, '126 bn m³', C.accent1, 'of treated water is lost worldwide every year', 'About 30% of all water put into supply, worth about $39 billion a year', 'c1_world');
  stat(5.1, '≈ 60 days', C.accent3, "of Istanbul's water leaks from its pipes every year", '190.6 million m³ from mains and service connections in 2024, 16.42% of supply', 'c2_ist');
  T(s, 'Much of it escapes from buried pipes. Nobody sees it until it reaches the street.', { x: 9.75, y: 1.95, w: 2.95, h: 2.4, fontSize: 20, italic: true, color: C.text1, valign: 'top', objectName: 'c3_msg' });
  T(s, 'Sources: Liemberger & Wyatt, reported in IWA The Source (2018); İSKİ Standard Water Balance 2024; İSKİ daily consumption, 15 Oct 2026 (3.17 million m³/day).', { x: 0.6, y: 5.3, w: 8.7, h: 0.55, fontSize: 10, color: C.text2, valign: 'top', objectName: 'src' });
  s.addNotes("That's 126 billion cubic metres a year worldwide. In Istanbul, leaking mains waste 190 million cubic metres a year: two months of the city's water.");

  // 3 ---------------------------------------------------------------- Hidden leaks
  s = pres.addSlide({ masterName: 'LM_LIGHT', sectionTitle: 'Problem' });
  title(s, 'Leaks stay hidden underground');
  s.addImage({ data: img('ill_hidden.png'), x: 0.6, y: 1.65, w: 6.4, h: 4.0, rounding: false, objectName: 'ill' });
  const rows = [
    [I.headphones, 'Acoustic surveys are periodic', 'Crews listen for leaks zone by zone, so each street is checked only now and then.'],
    [I.meter, 'Meters show a loss, not a location', 'District meters reveal that water is missing, but not which pipe is leaking.'],
    [I.eye, 'Small leaks run unseen', 'Water soaks into the soil long before it appears on the street.'],
  ];
  rows.forEach(([ic, h, b], i) => {
    const y = 1.7 + i * 1.15, tag = `c${i + 1}_row${i}`;
    s.addShape(pres.shapes.OVAL, { x: 7.4, y, w: 0.7, h: 0.7, fill: { color: C.background1 }, line: { color: C.background1 }, objectName: tag + '_circ' });
    s.addImage({ data: ic, x: 7.55, y: y + 0.15, w: 0.4, h: 0.4, objectName: tag + '_icon' });
    T(s, h, { x: 8.3, y: y - 0.02, w: 4.4, h: 0.4, fontSize: 18, bold: true, color: C.text1, objectName: tag + '_h' });
    T(s, b, { x: 8.3, y: y + 0.38, w: 4.4, h: 0.62, fontSize: 14, color: C.text2, valign: 'top', objectName: tag + '_b' });
  });
  s.addNotes("Acoustic surveys are periodic, and meters show a loss, not a location. So small leaks run underground for weeks.");

  // 4 ---------------------------------------------------------------- Solution
  pres.addSection({ title: 'Solution' });
  s = pres.addSlide({ masterName: 'LM_DARK', sectionTitle: 'Solution' });
  title(s, 'LeakMark: a buried tag that reports wet soil', true);
  const sol = [
    ['A palm-sized tag goes into the trench above the pipe during planned maintenance.'],
    ['It has no battery and no chip: just a copper coil and a capacitor that faces the soil.'],
    ["When a leak wets the soil, the tag's resonance shifts, and a reader passing on the street detects it."],
  ];
  sol.forEach(([t], i) => {
    const y = 1.75 + i * 1.1;
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.08, w: 0.42, h: 0.42, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: `c${i + 1}_n${i}` });
    T(s, String(i + 1), { x: 0.6, y: y + 0.08, w: 0.42, h: 0.42, fontSize: 16, bold: true, color: C.background1, align: 'center', valign: 'middle', objectName: `c${i + 1}_nt${i}` });
    T(s, t, { x: 1.25, y, w: 5.5, h: 0.95, fontSize: 19, color: C.background1, valign: 'top', objectName: `c${i + 1}_t${i}` });
  });
  T(s, 'Coil (L)', { x: 7.5, y: 1.55, w: 2.0, h: 0.35, fontSize: 14, bold: true, color: C.accent2, objectName: 'lab1' });
  T(s, 'Soil-facing capacitor (C)', { x: 9.75, y: 1.55, w: 2.9, h: 0.35, fontSize: 14, bold: true, color: C.accent2, objectName: 'lab2' });
  s.addImage({ data: img('ill_tag.png'), x: 6.9, y: 1.9, w: 5.8, h: 3.63, objectName: 'tagimg' });
  s.addNotes("LeakMark is a palm-sized tag placed above the pipe during maintenance. No battery, no chip: a coil and a soil-facing capacitor. Wet soil shifts its resonance.");

  // 5 ---------------------------------------------------------------- How it works
  s = pres.addSlide({ masterName: 'LM_LIGHT', sectionTitle: 'Solution' });
  title(s, 'Tag. Scan. Map.');
  const steps = [
    [I.tag, 'Tag', 'Crews drop a LeakMark tag into the trench before backfill. Nothing to charge or maintain.'],
    [I.truck, 'Scan', 'A reader on a utility vehicle or a handheld unit sweeps frequency as it passes each tag.'],
    [I.pin, 'Map', 'Every tag appears on a map. A local, lasting shift sends a crew to confirm with acoustic tools.'],
  ];
  steps.forEach(([ic, h, b], i) => {
    const x = 0.6 + i * 3.05, tag = `c${i + 1}_st${i}`;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.7, w: 2.75, h: 3.25, rectRadius: 0.12, fill: { color: C.background1 }, line: { color: C.background1 }, shadow: shadow(), objectName: tag + '_card' });
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: 1.98, w: 0.85, h: 0.85, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: tag + '_circ' });
    s.addImage({ data: ic, x: x + 0.5, y: 2.18, w: 0.45, h: 0.45, objectName: tag + '_icon' });
    T(s, h, { x: x + 0.3, y: 3.0, w: 2.2, h: 0.5, fontSize: 22, bold: true, color: C.text1, objectName: tag + '_h' });
    T(s, b, { x: x + 0.3, y: 3.5, w: 2.2, h: 1.35, fontSize: 14, color: C.text2, valign: 'top', objectName: tag + '_b' });
    if (i < 2) s.addShape(pres.shapes.CHEVRON, { x: x + 2.82, y: 3.18, w: 0.18, h: 0.3, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: `c${i + 2}_arrow${i}` });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.85, y: 1.7, w: 2.85, h: 3.25, rectRadius: 0.12, fill: { color: 'FFF4DC' }, line: { color: 'FFF4DC' }, objectName: 'c4_rain_card' });
  s.addImage({ data: I.rain, x: 10.15, y: 1.98, w: 0.5, h: 0.5, objectName: 'c4_rain_icon' });
  T(s, 'Rain or leak?', { x: 10.15, y: 2.6, w: 2.35, h: 0.45, fontSize: 18, bold: true, color: C.text1, objectName: 'c4_rain_h' });
  T(s, 'Rain wets every tag at once. A leak wets one spot and keeps growing. LeakMark only flags the local, lasting change.', { x: 10.15, y: 3.05, w: 2.35, h: 1.8, fontSize: 14, color: C.text2, valign: 'top', objectName: 'c4_rain_b' });
  s.addNotes("A reader on a vehicle scans each tag and maps it. Rain wets every tag at once; a leak wets one spot. Only that local change raises an alert.");

  // 6 ---------------------------------------------------------------- Evidence
  pres.addSection({ title: 'Evidence' });
  s = pres.addSlide({ masterName: 'LM_LIGHT', sectionTitle: 'Evidence' });
  title(s, `Wet soil moves the tag's resonance by ${(chart.peaks.Dry - chart.peaks.Wet).toFixed(0)} MHz`);
  s.addChart(pres.charts.LINE, [
    { name: `Dry soil (${chart.peaks.Dry.toFixed(1)} MHz)`, labels: chart.labels, values: chart.Dry },
    { name: `Moist soil (${chart.peaks.Moist.toFixed(1)} MHz)`, labels: chart.labels, values: chart.Moist },
    { name: `Wet soil (${chart.peaks.Wet.toFixed(1)} MHz)`, labels: chart.labels, values: chart.Wet },
  ], {
    x: 0.6, y: 1.55, w: 6.0, h: 3.8, objectName: 'c1_chart',
    chartColors: [HEX.teal, HEX.rain, HEX.alert], lineSize: 2.5, lineDataSymbol: 'none',
    showLegend: true, legendPos: 't', legendFontSize: 12, legendFontFace: '+mn-lt', legendColor: HEX.navy,
    catAxisTitle: 'Reader frequency (MHz)', showCatAxisTitle: true, catAxisTitleFontSize: 12, catAxisTitleColor: HEX.muted, catAxisTitleFontFace: '+mn-lt',
    valAxisTitle: 'Reader response (Ω)', showValAxisTitle: true, valAxisTitleFontSize: 12, valAxisTitleColor: HEX.muted, valAxisTitleFontFace: '+mn-lt',
    catAxisLabelColor: HEX.muted, valAxisLabelColor: HEX.muted, catAxisLabelFontSize: 11, valAxisLabelFontSize: 11, catAxisLabelFontFace: '+mn-lt', valAxisLabelFontFace: '+mn-lt',
    catAxisLabelFrequency: 1, catAxisLineShow: true, valGridLine: { color: HEX.grid, size: 0.75 }, catGridLine: { style: 'none' }, valAxisMinVal: 0,
  });
  s.addImage({ data: img('hfss_model.png'), x: 6.8, y: 1.55, w: 6.0, h: 3.8, objectName: 'c1_hfss' });
  T(s, 'Sensor design simulated in Ansys HFSS; reader response modelled with extracted capacitance values, assumed coupling k = 0.02.', { x: 0.6, y: 5.5, w: 12.1, h: 0.5, fontSize: 11, color: C.text2, objectName: 'cap' });
  T(s, `${chart.peaks.Dry.toFixed(0)} → ${chart.peaks.Wet.toFixed(0)} MHz  |  Dry to wet soil`, { x: 0.6, y: 6.1, w: 4.0, h: 0.4, fontSize: 14, bold: true, color: C.accent3, objectName: 'c2_shift' });
  s.addNotes("In Ansys HFSS, the tag resonates at 100 megahertz in dry soil and 82 in wet soil: an 18 megahertz shift, easy to see. Left: frequency response graph. Right: the sensor geometry as modelled in Ansys.");

  // 7 ---------------------------------------------------------------- Who uses it
  s = pres.addSlide({ masterName: 'LM_LIGHT', sectionTitle: 'Evidence' });
  title(s, 'Who uses LeakMark');
  const users = [
    [I.utility, 'Water utilities', 'The main customer. Leak teams plan work in the web panel, and field crews scan and repair with the mobile app.'],
    [I.factory, 'Sites with their own pipe networks', 'Industrial zones, airports, campuses and data centres with buried water lines and no leak monitoring.'],
    [I.people, 'People in the city', 'Fewer hidden losses mean fewer supply cuts and more water left in the reservoirs during a drought.'],
  ];
  users.forEach(([ic, h, b], i) => {
    const y = 1.6 + i * 1.45, tag = `c${i + 1}_u${i}`;
    s.addShape(pres.shapes.OVAL, { x: 0.6, y, w: 0.7, h: 0.7, fill: { color: C.background1 }, line: { color: C.background1 }, objectName: tag + '_circ' });
    s.addImage({ data: ic, x: 0.75, y: y + 0.15, w: 0.4, h: 0.4, objectName: tag + '_icon' });
    T(s, h, { x: 1.5, y: y - 0.02, w: 3.75, h: 0.36, fontSize: 16, bold: true, color: C.text1, objectName: tag + '_h' });
    T(s, b, { x: 1.5, y: y + 0.36, w: 3.75, h: 0.95, fontSize: 13, color: C.text2, valign: 'top', objectName: tag + '_b' });
  });
  // Phone (780 x 1602 px) and web panel (2836 x 1974 px), captions above. The web panel ends above the camera zone.
  const capY = 1.45, imgTop = 1.85, webW = 4.74, webH = webW * 1974 / 2836, phH = 3.9, phW = phH * 780 / 1602;
  const webX = 12.73 - webW, phX = 5.7;
  T(s, 'Field app for crews', { x: phX - 0.3, y: capY, w: phW + 0.6, h: 0.3, fontSize: 12, bold: true, color: C.text2, align: 'center', objectName: 'cap_phone' });
  s.addImage({ data: img('phone_order.png'), x: phX, y: imgTop, w: phW, h: phH, objectName: 'phone' });
  T(s, 'Web panel for the control room', { x: webX, y: capY, w: webW, h: 0.3, fontSize: 12, bold: true, color: C.text2, align: 'center', objectName: 'cap_web' });
  s.addImage({ data: img('web_panel.png'), x: webX, y: imgTop, w: webW, h: webH, objectName: 'web', shadow: shadow() });
  s.addNotes("Utilities are the customer: leak teams use the web panel, field crews the mobile app.");

  // 8 ---------------------------------------------------------------- Live demo
  s = pres.addSlide({ masterName: 'LM_LIGHT', sectionTitle: 'Evidence' });
  title(s, 'Live demo: from scan to repair');
  s.addMedia({ type: 'video', path: 'LeakMark_Demo.mp4', cover: img('live_full.png'), x: 0.6, y: 1.5, w: 8.9, h: 4.73, objectName: 'autoplay_demo' });
  const flow = ['Scan the route with the field app', 'An alert appears in the control room', 'Send a crew with one click', 'Confirm the leak, repair, close'];
  flow.forEach((t, i) => {
    const y = 1.6 + i * 0.68;
    s.addShape(pres.shapes.OVAL, { x: 9.85, y: y + 0.04, w: 0.38, h: 0.38, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: `fn${i}` });
    T(s, String(i + 1), { x: 9.85, y: y + 0.04, w: 0.38, h: 0.38, fontSize: 13, bold: true, color: C.background1, align: 'center', valign: 'middle', objectName: `fnt${i}` });
    T(s, t, { x: 10.35, y, w: 2.4, h: 0.6, fontSize: 13, color: C.text1, valign: 'top', objectName: `ft${i}` });
  });
  s.addNotes("[The demo video starts by itself and runs for 30 seconds. Speak over it.] Here is the demo. The crew scans the route, and every scan reaches the control room. [About 12 s, red alert] On day 18, tag T-27 drops below its neighbours and an alert appears. [About 15 s] One click sends a crew. [About 19 s] They confirm the leak and repair it. [About 27 s] Two days from hidden leak to repair.");

  // 8 ---------------------------------------------------------------- Impact
  pres.addSection({ title: 'Impact' });
  s = pres.addSlide({ masterName: 'LM_LIGHT', sectionTitle: 'Impact' });
  title(s, 'Built from parts that already exist');
  const parts = [
    [I.sensor, 'Tag', 'A printed circuit board with a coil and a capacitor, sealed in a plastic housing.'],
    [I.antenna, 'Reader', 'A portable vector network analyzer with a simple loop antenna.'],
    [I.map, 'Software', 'A web panel for the control room and a mobile app for field crews.'],
  ];
  parts.forEach(([ic, h, b], i) => {
    const y = 1.7 + i * 1.05;
    s.addImage({ data: ic, x: 0.6, y: y + 0.05, w: 0.5, h: 0.5, objectName: `c1_pi${i}` });
    T(s, h, { x: 1.3, y, w: 5.6, h: 0.38, fontSize: 18, bold: true, color: C.text1, objectName: `c1_ph${i}` });
    T(s, b, { x: 1.3, y: y + 0.38, w: 5.6, h: 0.55, fontSize: 14, color: C.text2, valign: 'top', objectName: `c1_pb${i}` });
  });
  T(s, 'Tags go in during maintenance work that already happens, so LeakMark grows with every pipe renewal, in Istanbul and in any city.', { x: 0.6, y: 4.95, w: 6.4, h: 0.85, fontSize: 15, italic: true, color: C.text1, valign: 'top', objectName: 'c3_scale' });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.4, y: 1.7, w: 5.3, h: 3.25, rectRadius: 0.12, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: 'c2_card' });
  T(s, '≈ 216 m³', { x: 7.75, y: 1.95, w: 4.6, h: 0.95, fontSize: 48, bold: true, color: C.background1, objectName: 'c2_big' });
  T(s, 'of water saved when one 10 L/min leak is repaired 15 days earlier', { x: 7.75, y: 2.95, w: 4.6, h: 0.9, fontSize: 18, bold: true, color: C.background1, valign: 'top', objectName: 'c2_line' });
  T(s, 'Illustrative example: 15 days is half of a 30-day survey interval. Pilot data will replace these values.', { x: 7.75, y: 3.9, w: 4.6, h: 0.85, fontSize: 13, color: C.background1, valign: 'top', objectName: 'c2_small' });
  s.addNotes("Every part already exists. Repairing one 10-litre-per-minute leak 15 days earlier saves about 216 cubic metres.");

  // 9 ---------------------------------------------------------------- Water stress map
  s = pres.addSlide({ masterName: 'LM_LIGHT', sectionTitle: 'Impact' });
  title(s, 'Leaks hurt most where water is already scarce');
  const MAP = JSON.parse(fs.readFileSync('map_meta.json', 'utf8'));
  const mw = MAP.map_world, mx = 0.6, my = 1.5;
  s.addImage({ data: img('map_world.png'), x: mx, y: my, w: mw.widthIn, h: mw.heightIn, objectName: 'map' });
  const px = mx + mw.istanbul[0] * mw.widthIn, py = my + mw.istanbul[1] * mw.heightIn;
  s.addShape(pres.shapes.OVAL, { x: px - 0.09, y: py - 0.09, w: 0.18, h: 0.18, fill: { color: HEX.navy }, line: { color: 'FFFFFF', width: 1.5 }, objectName: 'pin' });
  T(s, 'Istanbul pilot', { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.06, x: px + 0.18, y: py - 0.5, w: 1.25, h: 0.3, fill: { color: 'FFFFFF' }, line: { color: HEX.navy, width: 0.75 }, fontSize: 11, bold: true, color: C.text1, align: 'center', valign: 'middle', objectName: 'pin_label' });
  s.addShape(pres.shapes.LINE, { x: px + 0.06, y: py - 0.2, w: 0.2, h: 0.13, flipV: true, line: { color: HEX.navy, width: 1 }, objectName: 'pin_line' });
  const RAMP = ['F7D3BD', 'F0A982', 'E27F51', 'C9552B', '8E2D14', 'C9D3DA'];
  const LEG = ['Low (<10%)', 'Low-medium (10-20%)', 'Medium-high (20-40%)', 'High (40-80%)', 'Extremely high (>80%)', 'No data'];
  const legY = my + mw.heightIn + 0.2;
  T(s, 'Baseline water stress: water demand as a share of the renewable supply', { x: mx, y: legY, w: 8.8, h: 0.28, fontSize: 11, bold: true, color: C.text1, objectName: 'leg_title' });
  const legW = [1.05, 1.6, 1.65, 1.25, 1.75, 0.9];
  let lx = mx;
  LEG.forEach((t, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: lx, y: legY + 0.4, w: 0.2, h: 0.16, fill: { color: RAMP[i] }, line: { color: '9AAAB6', width: 0.5 }, objectName: `leg_sw${i}` });
    T(s, t, { x: lx + 0.26, y: legY + 0.34, w: legW[i] - 0.3, h: 0.28, fontSize: 10, color: C.text2, valign: 'middle', objectName: `leg_t${i}` });
    lx += legW[i];
  });
  T(s, 'Source: WRI Aqueduct 4.0 country rankings, baseline water stress weighted by total demand (Kuzma et al., 2023, CC BY 4.0). Boundaries: Natural Earth.', { x: mx, y: 6.4, w: 9.0, h: 0.4, fontSize: 9, color: C.text2, valign: 'top', objectName: 'src' });
  const mt = MAP.map_turkey, tx = 9.8, ty = 1.55, tw = 2.93, th = tw * mt.heightIn / mt.widthIn;
  s.addImage({ data: img('map_turkey.png'), x: tx, y: ty, w: tw, h: th, objectName: 'c1_tur' });
  T(s, [
    { text: 'Istanbul, the pilot city', options: { bold: true, color: C.text1, breakLine: true } },
    { text: 'High water stress: demand equals 40-80% of the renewable supply', options: { color: C.text2 } },
  ], { x: tx, y: ty + th + 0.12, w: tw, h: 0.85, fontSize: 12, valign: 'top', paraSpaceAfter: 2, objectName: 'c1_tur_cap' });
  T(s, '47 countries', { x: tx, y: 3.85, w: tw, h: 0.55, fontSize: 30, bold: true, color: C.accent3, objectName: 'c2_big' });
  T(s, 'of the 164 assessed face high or extremely high water stress. That is where LeakMark scales next.', { x: tx, y: 4.4, w: tw, h: 0.72, fontSize: 12, color: C.text2, valign: 'top', objectName: 'c2_line' });
  s.addNotes("Leaks hurt most where water is scarce. [Click] Istanbul has high water stress, [Click] and 47 countries face high or extremely high stress.");

  // 9 ---------------------------------------------------------------- Next steps
  s = pres.addSlide({ masterName: 'LM_LIGHT', sectionTitle: 'Impact' });
  title(s, 'What is proven, and what comes next');
  const tl = [
    ['Done', 'Sensor simulated in Ansys HFSS, reader circuit model and demo console', C.accent1],
    ['Next', 'Prototype tag tested in a soil box with rain and leak cases', C.text2],
    ['Then', 'Pilot in one Istanbul district during planned maintenance', C.text2],
    ['Scale', 'Roll out to cities with high water loss', C.text2],
  ];
  s.addShape(pres.shapes.LINE, { x: 0.95, y: 2.25, w: 9.15, h: 0, line: { color: C.text2, width: 1.5, dashType: 'dash' }, objectName: 'line' });
  tl.forEach(([h, b, col], i) => {
    const x = 0.6 + i * 3.05, tag = `c${i + 1}_tl${i}`;
    s.addShape(pres.shapes.OVAL, { x: x + 0.05, y: 1.95, w: 0.6, h: 0.6, fill: { color: col }, line: { color: col }, objectName: tag + '_dot' });
    if (i === 0) s.addImage({ data: I.check, x: x + 0.18, y: 2.08, w: 0.34, h: 0.34, objectName: tag + '_chk' });
    T(s, h, { x, y: 2.8, w: 2.75, h: 0.45, fontSize: 20, bold: true, color: C.text1, objectName: tag + '_h' });
    T(s, b, { x, y: 3.25, w: 2.6, h: 1.3, fontSize: 14, color: C.text2, valign: 'top', objectName: tag + '_b' });
  });
  T(s, [{ text: 'Outside help: ', options: { bold: true } }, { text: 'none. AI tools assisted with research, code and drafting.' }], { x: 0.6, y: 5.25, w: 8.8, h: 0.4, fontSize: 14, color: C.text1, objectName: 'help' });
  s.addNotes("Next: a prototype in a soil box, then a pilot in one Istanbul district. Outside help: none; AI tools assisted with research, code and drafting.");

  // 10 --------------------------------------------------------------- Close
  pres.addSection({ title: 'Close' });
  s = pres.addSlide({ masterName: 'LM_DARK_PLAIN', sectionTitle: 'Close' });
  s.addImage({ data: img('logo_white.png'), x: 0.6, y: 1.0, w: 4.0, h: 1.2, objectName: 'logo' });
  T(s, 'The tag that marks where the pipe is also tells you when it leaks.', { x: 0.6, y: 2.6, w: 8.4, h: 1.8, fontSize: 36, bold: true, color: C.background1, valign: 'top', objectName: 'line' });
  T(s, 'Xylem has helped cut more than 4.3 billion m³ of non-revenue water since 2019. LeakMark takes that mission to the pipes nobody can see.', { x: 0.6, y: 4.3, w: 8.4, h: 0.9, fontSize: 16, color: C.accent2, valign: 'top', objectName: 'xylem' });
  T(s, 'Thank you', { x: 0.6, y: 5.35, w: 5.0, h: 0.6, fontSize: 24, bold: true, color: C.accent2, objectName: 'thanks' });
  T(s, [
    { text: 'Kaan Akbuğa', options: { bold: true, color: C.background1, breakLine: true } },
    { text: 'MSc Telecommunications Engineering, Istanbul Technical University', options: { color: C.accent2 } },
  ], { x: 0.6, y: 5.95, w: 8.4, h: 0.75, fontSize: 15, valign: 'top', paraSpaceAfter: 2, objectName: 'name' });
  s.addNotes("Xylem has cut over 4.3 billion cubic metres of non-revenue water since 2019. LeakMark takes that mission to the pipes nobody can see. Thank you.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('written', OUT);
})().catch(e => { console.error(e); process.exit(1); });
