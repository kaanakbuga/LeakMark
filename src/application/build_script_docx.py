"""Builds the video talk script with a rehearsal timeline from the deck's speaker notes.

Usage: python3 build_script_docx.py <deck.pptx> <output.docx>
Timing: spoken words at WPM words per minute, plus fixed video lengths and a short pause per slide change.
"""
import re
import sys

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, RGBColor, Cm
from pptx import Presentation

WPM = 130           # calm pace for a recorded pitch
PAUSE = 1.0         # seconds per slide change
FIXED = {1: 10.0}   # slide 1: opening clip plays before speaking
OVERLAP = {9: 29.7}  # slide 9: speech runs over the demo video, so the video sets the length
LIMIT = 180

deck, out = sys.argv[1:3]
titles = {1: 'Opening clip', 2: 'Title', 3: 'Water lost worldwide and in Istanbul', 4: 'Why leaks stay hidden',
          5: 'The LeakMark tag', 6: 'Tag. Scan. Map.', 7: 'HFSS result: 18 MHz shift', 8: 'Who uses LeakMark',
          9: 'Demo video', 10: 'Built from existing parts, impact', 11: 'Water stress map', 12: 'What comes next',
          13: 'Close'}

rows, t = [], 0.0
for i, s in enumerate(Presentation(deck).slides, 1):
    note = s.notes_slide.notes_text_frame.text.strip()
    words = len(re.sub(r'\[[^\]]*\]', '', note).split())
    sec = OVERLAP.get(i, words / WPM * 60 + FIXED.get(i, 0.0))
    rows.append((i, t, t + sec, words, note))
    t += sec + PAUSE
total = t - PAUSE
assert total <= LIMIT, total

mmss = lambda x: f'{int(x // 60)}:{int(round(x % 60)):02d}' if round(x % 60) < 60 else f'{int(x // 60) + 1}:00'

doc = Document()
st = doc.styles['Normal']
st.font.name = 'Arial'
st.font.size = Pt(10.5)
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Arial')
for sec in doc.sections:
    sec.left_margin = sec.right_margin = Cm(2.2)
    sec.top_margin = sec.bottom_margin = Cm(2.0)


def para(text, bold=False, size=None, color=None, after=6):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.bold = bold
    if size:
        r.font.size = Pt(size)
    if color:
        r.font.color.rgb = RGBColor.from_string(color)
    p.paragraph_format.space_after = Pt(after)
    return p


def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    sh = OxmlElement('w:shd')
    sh.set(qn('w:val'), 'clear')
    sh.set(qn('w:color'), 'auto')
    sh.set(qn('w:fill'), fill)
    tcPr.append(sh)


para('LeakMark video script and rehearsal timing', bold=True, size=18, color='0E7C86', after=4)
para(f'Target: under 3 minutes. Planned total: {mmss(total)} '
     f'({WPM} words per minute, {PAUSE:.0f} s pause at each slide change). '
     'The text is the speaker notes of the slides. Text in square brackets is a stage note and is not read aloud.', color='55636E')
para('Rehearsal: read the script twice with a stopwatch. If the total goes over 2:55, shorten the second sentences on slides 3, 6 and 12 first; '
     'on slide 9 the speech must end before the video does.', color='55636E', after=10)

tbl = doc.add_table(rows=1, cols=4)
tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
tbl.style = 'Table Grid'
widths = [Cm(1.3), Cm(2.2), Cm(1.6), Cm(11.5)]
for c, txt in zip(tbl.rows[0].cells, ['Slide', 'Time', 'Length', 'Script']):
    c.text = ''
    c.paragraphs[0].add_run(txt).bold = True
    shade(c, 'E3F1F2')
for i, a, b, words, note in rows:
    cells = tbl.add_row().cells
    cells[0].text = str(i)
    cells[1].text = f'{mmss(a)} - {mmss(b)}'
    cells[2].text = f'{b - a:.0f} s'
    cells[3].text = ''
    p = cells[3].paragraphs[0]
    h = p.add_run(titles.get(i, '') + '\n')
    h.bold = True
    h.font.size = Pt(9)
    h.font.color.rgb = RGBColor.from_string('55636E')
    for part in re.split(r'(\[[^\]]*\])', note):
        if not part:
            continue
        r = p.add_run(part)
        if part.startswith('['):
            r.italic = True
            r.font.color.rgb = RGBColor.from_string('0E7C86')
last = tbl.add_row().cells
tbl.autofit = False
for col, w in zip(tbl.columns, widths):
    col.width = w
for row in tbl.rows:
    for c, w in zip(row.cells, widths):
        c.width = w
last[0].text = ''
last[1].text = 'Toplam'
last[2].text = mmss(total)
last[3].text = 'Limit: 3:00'
for c in last:
    for r in c.paragraphs[0].runs:
        r.bold = True

doc.add_paragraph()
para('Recording notes', bold=True, size=12, color='0E7C86')
for t_ in ['The camera view sits small in the bottom right corner; that area is left empty on every slide.',
           'On slide 1 the opening clip plays for 10 seconds; start speaking when it ends.',
           'On slide 9 the demo video plays by itself for 30 seconds; do not click before it ends, or the next slide opens.',
           'On slide 11 and other animated slides, click at the [Click] marks in the script.',
           'No AI voice-over; the narration is in your own voice.']:
    p = doc.add_paragraph(t_, style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
doc.save(out)
print('total', round(total, 1), 's =', mmss(total))
