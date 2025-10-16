from pathlib import Path
import re
home_path = Path('EN/home.html')
text = home_path.read_text(encoding="utf-8")
match = re.search(r'<footer class="modern-footer">[\s\S]*?</footer>', text)
if not match:
    raise SystemExit('Footer not found')
snippet = match.group(0)
Path('footer_en_home.html').write_text(snippet, encoding="utf-8")
