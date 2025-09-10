# Get all HTML files, excluding backup/ignored directories
$htmlFiles = Get-ChildItem -Path ".." -Include "*.html" -Recurse -Exclude "Backup*", "Nouveau site*", "node_modules*", "testsprite_tests*"

$rootPath = (Get-Location).Path.TrimEnd('\')

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.FullName)..."
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8

    # Calculate relative path prefix
    $filePath = [System.IO.Path]::GetFullPath($file.FullName)
    $relPath = $filePath.Substring($rootPath.Length).TrimStart('\')
    $depth = 0
    if ($relPath.Contains('\')) {
        $depth = ($relPath.Split('\').Length) - 1
    }
    $prefix = ""
    if ($depth -gt 0) {
        $prefix = ("../" * $depth)
    }

    # --- 1. Fix CSS links ---
    # Define local CSS files to be replaced. This is safer than a generic block.
    $localCssFiles = @(
        "css/style.css",
        "css/style.min.css",
        "css/novi.css",
        "css/flabtn.css",
        "css/new-menu.css",
        "css/fontawesome-all.min.css"
    )

    $mainCssLink = "<link rel=`"stylesheet`" href=`"$($prefix)css/main.min.css`">"
    $cssInjected = $false

    foreach($cssFile in $localCssFiles) {
        $pattern = "<link.*?href=`"[^`"]*?$($cssFile)`".*?>"
        if ($content -match $pattern) {
            if (-not $cssInjected) {
                # Replace the first occurrence with the main css link
                $content = ([regex]$pattern).Replace($content, $mainCssLink, 1)
                $cssInjected = $true
            } else {
                # Remove subsequent occurrences
                $content = $content -replace $pattern, ''
            }
        }
    }
    
    # Clean up empty lines left from replacements
    $content = $content -replace '(?m)^\s*$', ''

    # --- 2. Remove inline styles ---
    $content = $content -replace ' style="[^"]*?"', ''

    # --- 3. Fix Scripts ---
    # Remove specific scripts from where they are
    $content = $content -replace '(?s)<script[^>]*?src="[^"]*?js/CalCalorie\.js "[^>]*?>.*?</script>', ''
    $content = $content -replace '(?s)<script[^>]*?src="https://kit\.fontawesome\.com/[^"]*?"[^>]*?>.*?</script>', ''
    $content = $content -replace '(?s)<script[^>]*?src="[^"]*?js/new-menu\.js"[^>]*?>.*?</script>', ''
    $content = $content -replace '(?s)<script[^>]*?src="[^"]*?js/cookie-banner\.js"[^>]*?>.*?</script>', ''
    $content = $content -replace '(?s)<script[^>]*?src="[^"]*?js/script\.min\.js"[^>]*?>.*?</script>', ''


    # Add them back at the end of the body if not already there
    $scriptsToAdd = @"
<script src="$($prefix)js/new-menu.js"></script>
<script src="https://kit.fontawesome.com/d02a233de5.js" crossorigin="anonymous" defer></script>
<script src="$($prefix)js/CalCalorie.js "></script>
"@
    if (($content -match '</body>') -and ($content -notmatch 'js/new-menu.js')) {
        $content = $content -replace '</body>', "$scriptsToAdd`r`n</body>"
    }

    # --- 4. Add ARIA labels to form inputs ---
    $content = [regex]::Replace($content, '(<input\s+((?!aria-label).)*?name="([^"]+)"[^>]*>)', {
        param($match)
        $inputTag = $match.Groups[1].Value
        $nameAttr = $match.Groups[3].Value
        return ($inputTag -replace '>', " aria-label=`"$nameAttr`">")
    }, 'IgnoreCase')
    
    $content = [regex]::Replace($content, '(<textarea\s+((?!aria-label).)*?name="([^"]+)"[^>]*>)', {
        param($match)
        $inputTag = $match.Groups[1].Value
        $nameAttr = $match.Groups[3].Value
        return ($inputTag -replace '>', " aria-label=`"$nameAttr`">")
    }, 'IgnoreCase')

    Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -Force
}

Write-Host "HTML optimization script finished."
