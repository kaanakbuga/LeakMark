"""Add click-triggered fade-in animations and fade transitions to a pptxgenjs deck.

Shapes whose name starts with c<N>_ appear on click N (all shapes of one N appear together).
"""
import re
import sys
import zipfile
from collections import defaultdict

src, dst = sys.argv[1], sys.argv[2]
SHAPE_RE = re.compile(r'<p:(sp|pic|graphicFrame)>.*?</p:\1>', re.S)
NV_RE = re.compile(r'<p:cNvPr id="(\d+)" name="([^"]*)"')


def timing(groups, kinds):
    ids = iter(range(3, 10000))
    clicks = []
    for n in sorted(groups):
        effects = []
        for k, spid in enumerate(groups[n]):
            node = 'clickEffect' if k == 0 else 'withEffect'
            a, b, c = next(ids), next(ids), next(ids)
            effects.append(
                f'<p:par><p:cTn id="{a}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="{node}">'
                f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                f'<p:set><p:cBhvr><p:cTn id="{b}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
                f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
                f'<p:to><p:strVal val="visible"/></p:to></p:set>'
                f'<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="{c}" dur="500"/>'
                f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:animEffect>'
                f'</p:childTnLst></p:cTn></p:par>')
        o, i2 = next(ids), next(ids)
        clicks.append(
            f'<p:par><p:cTn id="{o}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>'
            f'<p:par><p:cTn id="{i2}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
            + ''.join(effects) + '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')
    bld = []
    for n in sorted(groups):
        for spid in groups[n]:
            if kinds[spid] == 'sp':
                bld.append(f'<p:bldP spid="{spid}" grpId="0"/>')
            elif kinds[spid] == 'graphicFrame':
                bld.append(f'<p:bldGraphic spid="{spid}" grpId="0"><p:bldAsOne/></p:bldGraphic>')
    return ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
            '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
            + ''.join(clicks) +
            '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
            '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
            '</p:childTnLst></p:cTn></p:par></p:tnLst>'
            + (f'<p:bldLst>{"".join(bld)}</p:bldLst>' if bld else '') + '</p:timing>')


# Length of each auto-playing video, by its object name in build.js
VIDEO_MS = {'autoplay_hook': 10000, 'autoplay_demo': 29667}


def autoplay(spid, dur_ms):
    """Timing PowerPoint writes for a video set to Start: Automatically."""
    return ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
            '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
            '<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>'
            '<p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
            '<p:par><p:cTn id="5" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="afterEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
            f'<p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="6" dur="{dur_ms}" fill="hold"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:cmd>'
            '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>'
            '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
            '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
            f'<p:video><p:cMediaNode vol="80000"><p:cTn id="7" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cMediaNode></p:video>'
            '</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')


zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED)
report = {}
for item in zin.infolist():
    data = zin.read(item.filename)
    if re.fullmatch(r'ppt/slides/slide\d+\.xml', item.filename):
        x = data.decode('utf-8')
        groups, kinds, video = defaultdict(list), {}, None
        for m in SHAPE_RE.finditer(x):
            nv = NV_RE.search(m.group(0))
            if not nv:
                continue
            spid, name = nv.groups()
            if m.group(1) == 'pic' and 'videoFile' in m.group(0):
                video = spid
                video_ms = VIDEO_MS[name]
            g = re.match(r'c(\d+)_', name)
            if g:
                groups[int(g.group(1))].append(spid)
                kinds[spid] = m.group(1)
        block = '<p:transition spd="med"><p:fade/></p:transition>'
        if video:
            block += autoplay(video, video_ms)
            groups = {'video': [video]}
        elif groups:
            block += timing(groups, kinds)
        assert '</p:clrMapOvr>' in x, item.filename
        x = x.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + block, 1)
        report[item.filename] = {n: len(v) for n, v in groups.items()}
        data = x.encode('utf-8')
    zout.writestr(item, data)
zout.close()
for k in sorted(report, key=lambda s: int(re.search(r'(\d+)', s).group(1))):
    print(k, 'clicks:', report[k])
