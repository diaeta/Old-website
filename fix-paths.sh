#!/bin/bash

echo "Fixing path separators in HTML files..."

count=0
for file in $(find . -name "*.html" -not -path "*/node_modules/*" -not -path "*/mcp-servers/*" -type f); do
  if grep -q 'href="[^"]*\' "$file" || grep -q 'src="[^"]*\' "$file"; then
    # Create backup
    cp "$file" "$file.bak"
    
    # Replace backslashes with forward slashes in href and src attributes
    sed -i 's|href="\([^"]*\)\|href="\1/|g; s|src="\([^"]*\)\|src="\1/|g' "$file"
    
    # Check if file changed
    if ! cmp -s "$file" "$file.bak"; then
      echo "✓ Fixed: $file"
      ((count++))
    fi
    
    rm "$file.bak"
  fi
done

echo ""
echo "✓ Fixed $count files"
