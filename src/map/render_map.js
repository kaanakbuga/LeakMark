// Renders the water stress maps for the LeakMark deck from data/ (see prepare_data.py).
// Usage (in src/map): node render_map.js
// Writes ../slides/map_world.png, ../slides/map_turkey.png and ../slides/map_meta.json
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ordinal one-hue ramp, light -> dark, for WRI categories 0..4. No data: cool gray.
const RAMP = ['#F7D3BD', '#F0A982', '#E27F51', '#C9552B', '#8E2D14'];
const NODATA = '#C9D3DA';
const EDGE = '#9AAAB6';
const ISTANBUL = [28.98, 41.01]; // lon, lat
const DPI = 300;
const OUT = path.resolve(__dirname, '../slides');

const fill = c => (c >= 0 && c <= 4 ? RAMP[c] : NODATA);
const read = f => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', f), 'utf8'));

(async () => {
  const d3 = await import('d3-geo');
  const meta = {};

  async function draw(name, geo, proj, widthIn, edgeW, extra) {
    const W = Math.round(widthIn * DPI);
    proj.fitWidth(W, geo);
    const p = d3.geoPath(proj);
    const [[, y0], [, y1]] = p.bounds(geo);
    const H = Math.ceil(y1 - y0) + 8;
    proj.translate([proj.translate()[0], proj.translate()[1] - y0 + 4]);
    const shapes = geo.features.map(f =>
      `<path d="${p(f)}" fill="${fill(f.properties.cat)}" stroke="${EDGE}" stroke-width="${edgeW}" stroke-linejoin="round"/>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${shapes}${extra ? extra(p, proj) : ''}</svg>`;
    await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, name + '.png'));
    const [ix, iy] = proj(ISTANBUL);
    meta[name] = { widthIn, heightIn: H / DPI, istanbul: [ix / W, iy / H] };
  }

  await draw('map_world', read('countries.geojson'), d3.geoEqualEarth(), 8.8, 1.2);

  const tr = read('tur_provinces.geojson');
  await draw('map_turkey', tr, d3.geoMercator(), 3.0, 1.4, (p) => {
    const ist = tr.features.find(f => f.properties.name === 'Istanbul');
    return `<path d="${p(ist)}" fill="none" stroke="#0B2E4A" stroke-width="7" stroke-linejoin="round"/>`;
  });

  fs.writeFileSync(path.join(OUT, 'map_meta.json'), JSON.stringify(meta, null, 1));
  console.log(meta);
})();
