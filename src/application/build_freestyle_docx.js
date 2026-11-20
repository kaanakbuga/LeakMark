// Builds the BeMyApp Freestyle section (formatted, ready to paste) with its showcase images.
// Usage: node build_freestyle_docx.js <output.docx>
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, LevelFormat } = require('docx');

const IMG = path.resolve(__dirname, '../../04_Images/Project_Page');
const TEAL = '0E9AA7', NAVY = '0B2E4A', ALERT = 'FF5A3C', MUTED = '55636E', FONT = 'Arial';
const r = (text, o = {}) => new TextRun({ text, font: FONT, ...o });
const P = (runs, o = {}) => new Paragraph({ spacing: { after: 140, line: 288 }, ...o, children: Array.isArray(runs) ? runs : [r(runs, { size: 24, color: NAVY })] });
const note = t => P([r(t, { size: 20, color: MUTED, italics: true })], { spacing: { before: 120, after: 120 } });
const H1 = t => P([r(t, { size: 44, bold: true, color: TEAL })], { spacing: { before: 360, after: 160 } });
const H2 = (t, c = NAVY) => P([r(t, { size: 30, bold: true, color: c })], { spacing: { before: 240, after: 80 } });
const big = t => P([r(t, { size: 34, bold: true, color: ALERT })], { spacing: { before: 160, after: 120 } });
const pic = f => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new ImageRun({ type: 'png', data: fs.readFileSync(path.join(IMG, f)), transformation: { width: 600, height: 338 } })] });
const num = (n, head, t) => new Paragraph({ numbering: { reference: 'steps', level: 0 }, spacing: { after: 100, line: 288 }, children: [r(head + ': ', { size: 24, bold: true, color: n === 3 ? '2FA86A' : (n === 0 ? ALERT : TEAL) }), r(t, { size: 24, color: NAVY })] });

const children = [
  P([r('LeakMark Freestyle section', { size: 36, bold: true, color: TEAL })]),
  note('In the Freestyle field, open four sections with "Add section". Copy and paste the text of each section from below. Insert each image with the editor\'s image button at the marked place. The images are in 04_Images\\Project_Page.'),

  note('Section 1'),
  H1('See LeakMark in action'),
  P('LeakMark has a working demo of both apps: a web panel for the control room and a mobile app for field crews. It runs in the browser on simulated data for a pilot zone of 33 tags in Istanbul.'),
  note('[Image: LeakMark_Freestyle_1_Control_Room_2026_11_20.png]'),
  pic('LeakMark_Freestyle_1_Control_Room_2026_11_20.png'),
  big('A leak wets one spot. Rain wets them all.'),
  P('Every scan uploads to the control room. Each tag is compared with its neighbours, so a leak stands out, while rain, which wets every tag at once, raises no alert.'),

  note('Section 2'),
  H1("In the crew's hands"),
  note('[Image: LeakMark_Freestyle_2_Field_App_2026_11_20.png]'),
  pic('LeakMark_Freestyle_2_Field_App_2026_11_20.png'),
  num(0, 'Alert arrives', 'a new work order appears on the phone.'),
  num(1, 'Go to the tag', 'the app routes the crew to the tag that raised the alert.'),
  num(2, 'Confirm it', 'the crew checks the leak with its existing acoustic tools.'),
  num(3, 'Close it', 'a repair photo is logged and the alert closes in the control room.'),

  note('Section 3'),
  H1('From hidden leak to repair in 2 days'),
  note('[Image: LeakMark_Freestyle_3_Result_2026_11_20.png]'),
  pic('LeakMark_Freestyle_3_Result_2026_11_20.png'),
  P('In the demo, the leak starts underground on day 16, raises an alert on day 18 and is repaired the same day.'),
  H2('Why it matters', ALERT),
  P('Water saved = leak flow × days the repair is brought forward. Repairing a 10 L/min leak 15 days earlier saves about 216 cubic metres.'),
  H2('Proven in simulation', TEAL),
  P('In Ansys HFSS, the same tag resonates at 100 MHz in dry soil and at about 82 MHz in wet soil: an 18 MHz shift that the reader can see clearly.'),
  H2("What's next", TEAL),
  P('A prototype tested in a soil box with rain and leak cases, then a pilot in one Istanbul district during planned maintenance.'),
  note('Section 4'),
  H1('Under the hood: simulated in Ansys HFSS'),
  P('The LeakMark sensor is an interdigital capacitor: 5 pairs of copper fingers, 1 mm wide, 1 mm apart and 15 mm long, on 1.6 mm FR4 under a 0.1 mm polyethylene cover. We modelled it buried in soil in Ansys HFSS and solved it at 100 MHz for dry, moist and wet soil.'),
  note('[Image: LeakMark_Freestyle_4_HFSS_Sensor_2026_11_20.png]'),
  pic('LeakMark_Freestyle_4_HFSS_Sensor_2026_11_20.png'),
  big('Wet soil raises the capacitance from 6.9 pF to 13.2 pF.'),
  P('All six soil cases converged in 19 to 21 adaptive passes. Besides dry, moist and wet soil, three wet cases with higher conductivity, up to 0.1 S/m, were also solved.'),
  note('[Image: LeakMark_Freestyle_5_HFSS_Reader_2026_11_20.png]'),
  pic('LeakMark_Freestyle_5_HFSS_Reader_2026_11_20.png'),
  P('These values feed a circuit model of the tag coil and the reader coil. The reader sees one clear peak per soil: 100.0 MHz dry, 89.0 MHz moist and 81.8 MHz wet. Reader coupling k = 0.02 is assumed; the prototype will measure the real value.'),
];

const doc = new Document({
  creator: 'Kaan Akbuğa', title: 'LeakMark Freestyle section',
  numbering: { config: [{ reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } }, run: { font: FONT, bold: true, size: 24, color: TEAL } } }] }] },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1200, bottom: 1200, left: 1300, right: 1300 } } }, children }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(process.argv[2], b); console.log('written', process.argv[2]); });
