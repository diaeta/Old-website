# DE Link Fix Guide

## Problem
Navigation links in German (DE) pages have a double `/DE/DE/` prefix instead of single `/DE/`, causing broken links like:
```
http://127.0.0.1:3000/DE/DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Termin.html
```

Instead of the correct:
```
http://127.0.0.1:3000/DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Termin.html
```

## Affected Files
All HTML files in the `/DE/` directory and subdirectories, including:
- `DE/home.html`
- `DE/index.html`
- `DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-und-Diätetik/*.html`
- `DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-Koekelberg/*.html`
- `DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-Ixelles/*.html`
- And others...

## Manual Fix (Search & Replace)

Use your text editor's "Find in Files" feature to make these replacements across all `.html` files in the `/DE/` directory:

### 1. Fix relative links with double prefix
**Find:** `href="../../DE/DE/`
**Replace:** `href="../`

### 2. Fix single-level relative links
**Find:** `href="../DE/DE/`
**Replace:** `href="../`

### 3. Fix absolute-style links
**Find:** `href="DE/DE/`
**Replace:** `href="`

### 4. Fix onclick window.location (double dots)
**Find:** `window.location.href='../../DE/DE/`
**Replace:** `window.location.href='../`

### 5. Fix onclick window.location (single)
**Find:** `window.location.href='DE/DE/`
**Replace:** `window.location.href='`

### 6. Fix canonical URLs
**Find:** `https://diaeta.be/DE/DE/`
**Replace:** `https://diaeta.be/DE/`

### 7. Fix localhost URLs
**Find:** `http://127.0.0.1:3000/DE/DE/`
**Replace:** `http://127.0.0.1:3000/DE/`

## Automated Fix Script

Run this from the Diaeta.be directory:

```bash
node scripts/fix-de-links.js
```

## Verification

After fixing:
1. Start your development server: `npm start` or similar
2. Navigate to: `http://127.0.0.1:3000/DE/home.html`
3. Click the appointment ("Termin") link in the navigation
4. Verify the URL is `http://127.0.0.1:3000/DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Termin.html`
5. Check that the page loads correctly

## Expected Changes

### Before:
```html
<a href="DE/DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Termin.html">Termin buchen</a>
```

### After:
```html
<a href="Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Termin.html">Termin buchen</a>
```

### Before (from subdirectory):
```html
<a href="../../DE/DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Termin.html">Termin</a>
```

### After:
```html
<a href="../Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Termin.html">Termin</a>
```

## Files to Check Manually

Based on the grep results, these files definitely need fixes:
1. `DE/home.html` - Multiple booking links
2. `DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-und-Diätetik/Der-Ernährungsberater-und-Diätetik.html`
3. `DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-und-Diätetik/beratung.html`
4. `DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-Koekelberg/Ernährungsberater-Koekelberg.html`
5. `DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-Koekelberg/chrysalide-center.html`
6. `DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-Ixelles/Ernährungsberater-Ixelles.html`
7. `DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Termin.html` (canonical tags)

## Using VS Code

1. Open the `Diaeta.be` folder in VS Code
2. Press `Ctrl+Shift+H` (or `Cmd+Shift+H` on Mac)
3. Enter the "Find" pattern
4. Enter the "Replace" pattern
5. Click "files to include" and enter: `DE/**/*.html`
6. Click "Replace All"
7. Repeat for each pattern above

## Using PowerShell (Windows)

```powershell
cd "C:\Users\pierr\Mon Drive (pierre@diaeta.be)\Diaeta.be"

# Fix all patterns
Get-ChildItem -Path "DE" -Filter "*.html" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $original = $content

    $content = $content -replace 'href="../../DE/DE/', 'href="../'
    $content = $content -replace 'href="../DE/DE/', 'href="../'
    $content = $content -replace 'href="DE/DE/', 'href="'
    $content = $content -replace "window\.location\.href='../../DE/DE/", "window.location.href='../"
    $content = $content -replace "window\.location\.href='DE/DE/", "window.location.href='"
    $content = $content -replace 'https://diaeta\.be/DE/DE/', 'https://diaeta.be/DE/'
    $content = $content -replace 'http://127\.0\.0\.1:3000/DE/DE/', 'http://127.0.0.1:3000/DE/'

    if ($content -ne $original) {
        $content | Set-Content $_.FullName -Encoding UTF8 -NoNewline
        Write-Host "Fixed: $($_.Name)"
    }
}
```

## Root Cause

The issue likely occurred from an earlier fix script (`fix-crawl-errors.js`) that added `DE/` prefix to links that already had it, or from manual edits where the relative path calculation was incorrect.

## Prevention

When creating or updating German (DE) pages:
- If the file is in `/DE/`, use relative paths without the `DE/` prefix
- If the file is in `/DE/subdirectory/`, use `../` to go up one level
- Never use `DE/DE/` - this is always incorrect
- Use absolute URLs (`https://diaeta.be/DE/...`) only in canonical tags
