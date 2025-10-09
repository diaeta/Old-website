from pathlib import Path
import json

root = Path('.')
report_path = Path('reports/route_map.json')
report_path.parent.mkdir(exist_ok=True)

def normalize(name: str) -> str:
    value = name.lower()
    for ch in [" ", "'", ".", "_", "%20"]:
        value = value.replace(ch, '-')
    return value

route_map = {}
for en_file in sorted((root / 'EN').rglob('*.html')):
    rel = en_file.relative_to(root / 'EN')
    key = str(rel)
    route_map[key] = {'EN': str(en_file.relative_to(root))}
    slug = normalize(rel.stem)

    # FR files scattered at root directories (excluding EN/DE/NL)
    fr_matches = [p for p in root.glob(str(rel)) if p.is_file()]
    if not fr_matches:
        fr_candidates = [p for p in root.rglob(rel.name)
                         if p.is_file() and 'EN' not in p.parts and 'DE' not in p.parts and 'NL' not in p.parts]
        fr_matches = [p for p in fr_candidates if normalize(p.stem) == slug] or fr_candidates
    if fr_matches:
        route_map[key]['FR'] = str(fr_matches[0].relative_to(root))

    for locale in ['DE', 'NL']:
        base = root / locale
        candidates = list(base.glob(str(rel)))
        if candidates:
            route_map[key][locale] = str(candidates[0].relative_to(root))
            continue
        matches = [p for p in base.rglob('*.html') if normalize(p.stem) == slug]
        if matches:
            route_map[key][locale] = str(matches[0].relative_to(root))

report_path.write_text(json.dumps(route_map, indent=2, ensure_ascii=False), encoding='utf-8')
print(f'Route map written to {report_path}')
