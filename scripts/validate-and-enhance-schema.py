#!/usr/bin/env python3
import json
import re
import os

def extract_json_ld(content):
    """Extract all JSON-LD scripts from HTML content"""
    pattern = r'<script\s+type="application/ld\+json">(.+?)</script>'
    matches = re.findall(pattern, content, re.DOTALL)
    return matches

def validate_json(filepath, content):
    """Validate JSON-LD in file"""
    json_lds = extract_json_ld(content)
    
    if not json_lds:
        return None, None
    
    results = []
    for i, json_str in enumerate(json_lds):
        try:
            data = json.loads(json_str)
            results.append({'valid': True, 'data': data, 'index': i})
        except json.JSONDecodeError as e:
            results.append({'valid': False, 'error': str(e), 'index': i})
    
    return len(json_lds), results

# Validate key files
key_files = [
    'index.html',
    'contact.html',
    'diabète.html',
    'EN/home.html',
    'NL/home.html',
    'DE/home.html',
]

print("=== SCHEMA.ORG JSON-LD VALIDATION ===\n")
valid_count = 0
invalid_count = 0
total_schemas = 0

for filepath in key_files:
    if not os.path.exists(filepath):
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        count, results = validate_json(filepath, content)
        
        if count:
            print(f"\n{filepath}:")
            print(f"  Found {count} JSON-LD schema(s)")
            total_schemas += count
            
            for result in results:
                if result['valid']:
                    valid_count += 1
                    data = result['data']
                    schema_type = data.get('@type', 'Unknown')
                    print(f"  ✓ Schema #{result['index'] + 1}: {schema_type} - VALID")
                else:
                    invalid_count += 1
                    print(f"  ✗ Schema #{result['index'] + 1}: INVALID - {result['error']}")
    except Exception as e:
        print(f"\n{filepath}: ERROR - {e}")

print(f"\n{'='*50}")
print(f"Total schemas found: {total_schemas}")
print(f"Valid: {valid_count} ✓")
print(f"Invalid: {invalid_count} ✗")
print(f"{'='*50}\n")
