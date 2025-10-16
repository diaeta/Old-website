#!/bin/bash
find . -name "*.backup" -type f | while IFS= read -r backup; do
  original="${backup%.backup}"
  mv "$backup" "$original"
  echo "Restored: $original"
done
