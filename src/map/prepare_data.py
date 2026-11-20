"""Prepares the water stress map data for the LeakMark deck.

Inputs (downloaded by hand):
  1. WRI Aqueduct 4.0 country rankings, Aqueduct40_rankings_download_Y2023M07D05.xlsx
     https://www.wri.org/data/aqueduct-40-country-rankings (CC BY 4.0)
  2. Natural Earth ne_50m_admin_0_countries.geojson and ne_10m_admin_1_states_provinces.geojson
     https://github.com/nvkelso/natural-earth-vector (public domain)

Usage: python3 prepare_data.py <xlsx> <ne_50m_countries.geojson> <ne_10m_admin1.geojson>
Writes the small files in data/ that render_map.js uses.
"""
import json
import os
import re
import sys
import unicodedata

import openpyxl

xlsx, ne_countries, ne_admin1 = sys.argv[1:4]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
os.makedirs(OUT, exist_ok=True)


def fix(s):
    """Some province names in the file are UTF-8 read as cp1252 (KÃ¼tahya)."""
    try:
        return s.encode('cp1252').decode('utf-8') if re.search('[ÃÄÅ]', s) else s
    except UnicodeError:
        return s


def key(s):
    s = s.replace('ı', 'i').replace('İ', 'I')
    return re.sub('[^a-z]', '', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower())


wb = openpyxl.load_workbook(xlsx, read_only=True)


def rows(sheet):
    it = wb[sheet].iter_rows(values_only=True)
    hdr = next(it)
    for r in it:
        d = dict(zip(hdr, r))
        # Baseline water stress weighted by total water demand
        if d['indicator_name'] == 'bws' and d['weight'] == 'Tot':
            yield d


country = {d['gid_0']: {'name': d['name_0'], 'score': d['score'], 'cat': d['cat'], 'label': d['label']}
           for d in rows('country_baseline')}
prov = {fix(d['name_1']): {'score': d['score'], 'cat': d['cat'], 'label': d['label']}
        for d in rows('province_baseline') if d['gid_0'] == 'TUR'}
assert len(prov) == 81, len(prov)

# Countries: keep geometry and the codes needed for the join
ne = json.load(open(ne_countries, encoding='utf-8'))
feats, matched = [], set()
for f in ne['features']:
    p = f['properties']
    if p['ADM0_A3'] == 'ATA':
        continue
    # GADM (used by Aqueduct) counts Somaliland as part of Somalia
    cands = [p['ADM0_A3'], p['ISO_A3'], p['ISO_A3_EH'], p['GU_A3']] + (['SOM'] if p['ADM0_A3'] == 'SOL' else [])
    k = next((c for c in cands if c in country), None)
    if k:
        matched.add(k)
    feats.append({'type': 'Feature', 'geometry': f['geometry'],
                  'properties': {'name': p['NAME'], 'gid': k, 'cat': country[k]['cat'] if k else -9999}})
missing = sorted(set(country) - matched)
assert not missing, missing
json.dump({'type': 'FeatureCollection', 'features': feats}, open(os.path.join(OUT, 'countries.geojson'), 'w'), separators=(',', ':'))

# Turkish provinces
alias = {'afyon': 'afyonkarahisar'}
pk = {alias.get(key(n), key(n)): n for n in prov}
a1 = json.load(open(ne_admin1, encoding='utf-8'))
tr = []
for f in a1['features']:
    if f['properties']['adm0_a3'] != 'TUR':
        continue
    n = f['properties']['name']
    src = pk[key(n)]
    tr.append({'type': 'Feature', 'geometry': f['geometry'], 'properties': {'name': src, 'cat': prov[src]['cat']}})
assert len(tr) == 81
json.dump({'type': 'FeatureCollection', 'features': tr}, open(os.path.join(OUT, 'tur_provinces.geojson'), 'w'), separators=(',', ':'), ensure_ascii=False)

json.dump({'source': 'WRI Aqueduct 4.0 country rankings (Aqueduct40_rankings_download_Y2023M07D05), baseline water stress (bws), weighted by total demand (Tot). Kuzma et al. 2023, CC BY 4.0.',
           'countries': country, 'turkey_provinces': prov},
          open(os.path.join(OUT, 'bws.json'), 'w'), ensure_ascii=False, indent=1)

cats = {}
for v in country.values():
    cats[v['label']] = cats.get(v['label'], 0) + 1
print('countries by category:', cats)
print('Turkey:', country['TUR'])
print('Istanbul:', prov['Istanbul'])
