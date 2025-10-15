import re
import os
from pathlib import Path

def find_headers_with_slash_gt(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        # Find all heading tags with their content
        heading_pattern = r'<(h[1-6])[^>]*>(.*?)</\1>'
        matches = re.finditer(heading_pattern, content, re.DOTALL | re.IGNORECASE)
        
        issues = []
        for match in matches:
            heading_content = match.group(2)
            # Remove HTML tags from content to get text
            text_content = re.sub(r'<[^>]+>', '', heading_content)
            # Check if text contains /&gt; or /> (not in tags)
            if '/&gt;' in text_content or ('/>' in text_content and '<br/>' not in heading_content):
                line_num = content[:match.start()].count('\n') + 1
                issues.append({
                    'file': file_path,
                    'line': line_num,
                    'tag': match.group(1),
                    'content': heading_content[:100]
                })
        return issues
    except:
        return []

# Find all HTML files
html_files = []
for root, dirs, files in os.walk('.'):
    # Skip node_modules and mcp-servers
    dirs[:] = [d for d in dirs if d not in ['node_modules', 'mcp-servers', 'fonts', '.git']]
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

all_issues = []
for file in html_files:
    issues = find_headers_with_slash_gt(file)
    all_issues.extend(issues)

print(f"Found {len(all_issues)} headings with '/>' or '/&gt;' in text:")
for issue in all_issues[:30]:
    print(f"\n{issue['file']}:{issue['line']}")
    print(f"  <{issue['tag']}> {issue['content']}")
