# Get all HTML files in the project
$htmlFiles = Get-ChildItem -Path .. -Filter *.html -Recurse -Exclude "Backup*", "Nouveau site*", "node_modules*", "testsprite_tests*"

foreach ($file in $htmlFiles) {
    Write-Host "Checking links in $($file.FullName)..."
    $content = Get-Content -Path $file.FullName -Raw
    $links = [regex]::Matches($content, '(?i)href="([^"]+)"')

    foreach ($link in $links) {
        $url = $link.Groups[1].Value
        
        # Ignore anchor, mailto, and tel links
        if ($url.StartsWith("#") -or $url.StartsWith("mailto:") -or $url.StartsWith("tel:") -or $url -eq "#") {
            continue
        }

        # Construct the full path for local files
        if (-not ($url.StartsWith("http"))) {
            $path = Join-Path -Path $file.DirectoryName -ChildPath $url
            if (-not (Test-Path -Path $path)) {
                Write-Host "Broken link in $($file.FullName): $url"
            }
        }
        else {
            try {
                $request = [System.Net.WebRequest]::Create($url)
                $request.Method = "HEAD"
                $response = $request.GetResponse()
                if ($response.StatusCode -ne "OK") {
                    Write-Host "Broken link in $($file.FullName): $url"
                }
                $response.Close()
            }
            catch {
                Write-Host "Broken link in $($file.FullName): $url"
            }
        }
    }
}
