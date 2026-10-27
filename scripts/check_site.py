"""Dependency-free structural and evidence checks for the GitHub Pages portfolio."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.ids, self.refs = path, set(), []
        self.h1 = self.descriptions = self.canonicals = 0
        self.projects = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            assert a['id'] not in self.ids, f'{self.path}: duplicate id {a["id"]}'
            self.ids.add(a['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'meta' and a.get('name') == 'description': self.descriptions += 1
        if tag == 'link' and a.get('rel') == 'canonical': self.canonicals += 1
        if tag == 'img': assert a.get('alt') is not None, f'{self.path}: image missing alt'
        if tag == 'article' and 'project' in a.get('class', '').split(): self.projects.append(a)
        if a.get('target') == '_blank': assert 'noopener' in a.get('rel', ''), f'{self.path}: missing noopener'
        for field in ['src', 'href']:
            if field in a: self.refs.append(a[field])

pages = {}
for path in sorted(ROOT.rglob('*.html')):
    if any(p.startswith('.') for p in path.relative_to(ROOT).parts): continue
    page = Page(path)
    page.feed(path.read_text(encoding='utf-8'))
    assert page.h1 == page.descriptions == page.canonicals == 1, f'{path}: missing/duplicate h1 or metadata'
    pages[path.resolve()] = page
for path, page in pages.items():
    for ref in page.refs:
        u = urlsplit(ref)
        if u.scheme or u.netloc: continue
        target = (path.parent / unquote(u.path)).resolve() if u.path else path
        assert target.is_relative_to(ROOT), f'{path}: path escapes website'
        assert target.is_file(), f'{path}: missing {ref}'
        if u.fragment and target in pages: assert unquote(u.fragment) in pages[target].ids, f'{path}: missing fragment {ref}'

home = (ROOT/'index.html').read_text(encoding='utf-8')
assert len(pages[(ROOT/'index.html').resolve()].projects) == 7
assert 'based in' not in home.lower()
assert 'assets/avatar-v2.png' in home and (ROOT/'assets/Kelvin-Ojogbede-CV.pdf').read_bytes().startswith(b'%PDF')
for name in ['hotel', 'energy', 'sales', 'churn']:
    assert f'href="{name}.html"' in home
energy = (ROOT/'energy.html').read_text(encoding='utf-8')
results = json.loads((ROOT/'research/dissertation/reported-results.json').read_text())
assert results['forecast_years'] == [2025,2026,2027,2028,2029]
assert len(results['evaluation']) == 6 and len(results['forecast_rows']) == 5
for row in results['evaluation']:
    assert row['mae'] <= row['rmse']
    assert str(row['mape_pct']) in energy
for row in results['forecast_rows']:
    for value in row: assert value in energy, f'Forecast transcription missing {value}'
for term in ['factor', '2025–2029', 'not been reproduced', 'shuffled', '1.3–1.4', '1.01']:
    assert term in energy, f'Missing dissertation caveat: {term}'
assert not list(ROOT.rglob('*.docx')), 'Full private report must not be in public source'
assert len(list((ROOT/'assets/dissertation').glob('*.png'))) == 3
print(f'PASS: {len(pages)} HTML pages; local links/fragments/assets, metadata, CV, seven projects and dissertation transcriptions.')
