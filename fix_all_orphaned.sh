#!/bin/bash
# Fix all orphaned /> on their own line
find . -name "*.html" -type f ! -path "./node_modules/*" ! -path "./mcp-servers/*" ! -path "./fonts/*" -print0 | while IFS= read -r -d '' file; do
    if grep -q "^[[:space:]]*/>$" "$file"; then
        echo "Fixing: $file"
        sed -i '/^[[:space:]]*\/>$/d' "$file"
    fi
done
echo "Done!"
