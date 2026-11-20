// Builds the BeMyApp project page texts (ready to paste) as a Word document.
// Usage: node build_page_docx.js <output.docx>
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat, BorderStyle,
  Footer, PageNumber, ShadingType,
} = require('docx');

const FONT = 'Arial', INK = '1F2A33', BRAND = '0E7C86', MUTED = '55636E';

// ---------------------------------------------------------------- Content (English, to paste)
const ISSUE = [
  { p: 'Every second, about four million litres of treated water are lost worldwide before they reach a tap. Liemberger and Wyatt estimate non-revenue water at about 126 billion cubic metres a year, roughly 30% of all water put into supply, worth about 39 billion US dollars. Much of it leaks from buried pipes that nobody can see.' },
  { p: 'In Istanbul, our pilot city, the utility İSKİ reports 190.6 million cubic metres of leakage from mains and service connections in 2024, 16.42% of supply. That is about 60 days of the whole city\'s water every year.' },
  { p: 'Leaks stay hidden for three reasons:' },
  { li: 'Acoustic surveys are periodic, so each street is checked only now and then.' },
  { li: 'District meters show that water is missing, but not which pipe is leaking.' },
  { li: 'Small leaks soak into the soil, sometimes for weeks, before they reach the street.' },
  { p: 'The loss hurts most where water is already scarce. In the Aqueduct 4.0 rankings of the World Resources Institute, 47 of the 164 countries assessed face high or extremely high water stress, and Istanbul is in the high category.' },
];

const SOLUTION = [
  { p: 'LeakMark is a palm-sized, battery-free tag that turns the soil above a pipe into a signal a utility can read.' },
  { li: [['The tag: ', true], ['a copper coil and a soil-facing capacitor on a small circuit board, sealed in plastic. No battery, no chip, nothing to charge. Crews place it in the trench above the pipe, next to the standard warning tape, during maintenance that already happens.']] },
  { li: [['The reader: ', true], ['a portable network analyzer with a loop antenna, on a utility vehicle or as a handheld unit. It sweeps frequency as it passes each tag.']] },
  { li: [['The software: ', true], ['a web panel for the control room and a mobile app for field crews.']] },
  { p: 'When a leak wets the soil, the tag\'s resonance frequency drops. A tag that reads 4 MHz or more below its neighbours on two consecutive scans raises an alert. Rain wets every tag at once, so it raises none. A crew then confirms the leak with acoustic tools and repairs it.' },
  { p: 'The physics is simulated in Ansys HFSS: the same tag resonates at 100 MHz in dry soil and at about 82 MHz in wet soil, an 18 MHz shift. A working demo shows the full workflow, from scan to alert, work order and closed repair.' },
];

const STEPS = [
  ['Tag the pipe', 'During planned maintenance, the crew drops a LeakMark tag into the open trench above the pipe and adds it to the map with the field app.'],
  ['Scan the route', 'A reader on a utility vehicle or a handheld unit sweeps frequency past each tag. Every reading uploads to the control room.'],
  ['Spot the leak', 'Each tag is compared with its neighbours. A local drop of 4 MHz or more on two scans in a row raises an alert. Area-wide shifts from rain do not.'],
  ['Confirm and repair', 'The leak team sends a crew with one click. The crew confirms the leak acoustically, repairs it and closes the work order with a photo.'],
];

const FREESTYLE = [
  { h: 'What is proven so far' },
  { li: 'Sensor simulated in Ansys HFSS (5-finger-pair interdigital capacitor under a 0.1 mm polyethylene cover, solved at 100 MHz, all cases converged).' },
  { li: 'Reader response from a circuit model fed with the HFSS values: 100.0 MHz dry, 89.0 MHz moist, 81.8 MHz wet soil. Reader coupling k = 0.02 is assumed.' },
  { li: 'Working demo of the web panel and field app: scan, alert, one-click dispatch, acoustic check, repair.' },
  { h: 'Impact' },
  { p: 'Water saved = leak flow × time by which the repair is brought forward. Example: a 10 L/min leak repaired 15 days earlier, half of a 30-day survey interval, saves about 216 cubic metres. Pilot data will replace these example values.' },
  { h: 'Who uses LeakMark' },
  { p: 'Water utilities first: leak teams in the control room and field crews. Then sites with their own buried networks, such as industrial zones, airports, campuses and data centres. People in the city benefit from fewer supply cuts and more water left in the reservoirs.' },
  { h: 'Next steps' },
  { p: 'Prototype tag tested in a soil box with rain and leak cases, then a pilot in one Istanbul district during planned maintenance, then roll-out to cities with high water loss. The main open question is the read range at burial depth, which the prototype will measure.' },
  { h: 'Outside help' },
  { p: 'Outside help: none. AI tools assisted with research, code and drafting.' },
];

// ---------------------------------------------------------------- Helpers
const plain = blocks => blocks.map(b => b.h || b.p || (Array.isArray(b.li) ? b.li.map(x => x[0]).join('') : b.li)).join('\n');
const runs = x => (Array.isArray(x) ? x.map(([t, bold]) => new TextRun({ text: t, bold: !!bold })) : [new TextRun(x)]);
const box = { top: { style: BorderStyle.SINGLE, size: 4, color: 'C9D3DA', space: 4 }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C9D3DA', space: 4 }, left: { style: BorderStyle.SINGLE, size: 12, color: BRAND, space: 8 }, right: { style: BorderStyle.SINGLE, size: 4, color: 'C9D3DA', space: 4 } };
const shade = { fill: 'F3F8F9', type: ShadingType.CLEAR, color: 'auto' };
const paste = blocks => blocks.map(b => {
  if (b.h) return new Paragraph({ border: box, shading: shade, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: b.h, bold: true })] });
  if (b.li) return new Paragraph({ border: box, shading: shade, numbering: { reference: 'bullets', level: 0 }, spacing: { after: 60, line: 276 }, children: runs(b.li) });
  return new Paragraph({ border: box, shading: shade, spacing: { after: 100, line: 276 }, children: runs(b.p) });
});
const h1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const h2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const tr = t => new Paragraph({ spacing: { after: 100, line: 276 }, children: [new TextRun({ text: t, color: MUTED })] });
const trb = (label, t) => new Paragraph({ spacing: { after: 80, line: 276 }, children: [new TextRun({ text: label, bold: true }), new TextRun({ text: t, color: MUTED })] });
const count = blocks => tr(`About ${plain(blocks).length} characters, spaces included.`);
const one = t => paste([{ p: t }]);

const children = [
  new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun('LeakMark project page texts')] }),
  tr('Text to paste and files to upload for each field of the BeMyApp project page. Text in the grey boxes is copied as it is. All files are in this repository.'),

  h1('1. Banner and logo'),
  trb('Banner: ', '04_Images\\LeakMark_Banner.png (1920 × 600 pixels, the size the page recommends).'),
  trb('Logo: ', '04_Images\\LeakMark_Logo_Circle.png. The page shows the logo inside a circle, so only the drop mark is used; the project name already appears next to it.'),
  trb('Project name: ', 'LeakMark'),
  trb('Short description or tagline, if asked: ', ''),
  ...one('Battery-free tags that make hidden pipe leaks visible'),

  h1('2. The issue'),
  ...paste(ISSUE),
  count(ISSUE),
  trb('Upload files: ', '04_Images\\Project_Page\\LeakMark_Page_Issue_Water_Loss_2026_11_03.png and LeakMark_Page_Issue_Water_Stress_Map_2026_11_03.png'),

  h1('3. Our magic solution'),
  ...paste(SOLUTION),
  count(SOLUTION),
  trb('Upload files: ', '04_Images\\Project_Page\\LeakMark_Page_Solution_Tag_Scan_Map_2026_11_03.png and LeakMark_Page_Solution_HFSS_Result_2026_11_03.png'),

  h1('4. How it works'),
  tr('Add four steps. Each step has a title box and a description box.'),
  ...STEPS.flatMap(([t, d], i) => [h2(`Step ${i + 1}`), trb('Title: ', ''), ...one(t), trb('Description: ', ''), ...one(d)]),

  h1('5. Freestyle section'),
  tr('Optional field. Evidence, impact, users and the roadmap in one section. Suggested title: "Evidence, impact and next steps". A longer, illustrated version is in the Freestyle section document.'),
  ...paste(FREESTYLE),
  count(FREESTYLE),

  h1('6. Presentation'),
  tr('Export the slides from PowerPoint as PDF (File > Export > Create PDF/XPS Document) and upload the PDF. In the PDF, the videos on slides 1 and 9 appear as their cover images. Suggested file name:'),
  ...one('Xylem_Student_Innovation_Challenge_2026_LeakMark_Slides_2026_11_DD.pdf'),
  tr('Replace DD with the export day. File upload fields on the page accept up to 20 MB. The PDF holds no video, so it will most likely stay under this limit; check its size before uploading.'),

  h1('7. Custom form section: video and demo link'),
  tr('This field takes the video link and the live demo link. Replace the placeholders below once the links are ready.'),
  ...paste([
    { p: [['Video (narrated presentation and live demo): ', true], ['<video link>']] },
    { p: [['Live demo (web panel and field app, runs in the browser): ', true], ['<demo link>']] },
    { p: 'The demo runs on simulated data for a pilot zone of 33 tags in Istanbul. Open the link, press Start scan on the phone four times, then follow the alert from the control room to the repair.' },
  ]),
];

const doc = new Document({
  creator: 'Kaan Akbuğa',
  title: 'LeakMark project page texts',
  styles: {
    default: { document: { run: { font: FONT, size: 21, color: INK } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal', run: { font: FONT, size: 40, bold: true, color: BRAND }, paragraph: { spacing: { before: 0, after: 120 }, keepNext: true } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 28, bold: true, color: BRAND }, paragraph: { spacing: { before: 320, after: 120 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 22, bold: true, color: INK }, paragraph: { spacing: { before: 160, after: 60 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1300, bottom: 1300, left: 1440, right: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'LeakMark  |  ', size: 16, color: '7A8791' }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '7A8791' })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(process.argv[2] || 'page.docx', buf);
  console.log('issue', plain(ISSUE).length, 'solution', plain(SOLUTION).length, 'freestyle', plain(FREESTYLE).length,
    'steps', STEPS.map(([t, d]) => `${t.length}/${d.length}`).join(' '));
});
