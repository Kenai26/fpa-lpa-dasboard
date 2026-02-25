# Build a single self-contained HTML file for SharePoint distribution
$outFile = Join-Path $PSScriptRoot 'DC6084-FPA-LPA-Dashboard.html'
$enc = [System.Text.UTF8Encoding]::new($false)

$css = [System.IO.File]::ReadAllText((Join-Path $PSScriptRoot 'styles.css'), $enc)
$dataJs = [System.IO.File]::ReadAllText((Join-Path $PSScriptRoot 'data.js'), $enc)
$appJs = [System.IO.File]::ReadAllText((Join-Path $PSScriptRoot 'app.js'), $enc)
$importJs = [System.IO.File]::ReadAllText((Join-Path $PSScriptRoot 'import.js'), $enc)

$htmlLines = [System.IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'index.html'), $enc)

$output = [System.Collections.Generic.List[string]]::new()
foreach ($line in $htmlLines) {
    if ($line -match 'styles\.css') {
        $output.Add('<style>')
        $output.Add($css)
        $output.Add('</style>')
    }
    elseif ($line -match 'src="data\.js') {
        $output.Add('<script>')
        $output.Add($dataJs)
        $output.Add('</script>')
    }
    elseif ($line -match 'src="app\.js') {
        $output.Add('<script>')
        $output.Add($appJs)
        $output.Add('</script>')
    }
    elseif ($line -match 'src="import\.js') {
        $output.Add('<script>')
        $output.Add($importJs)
        $output.Add('</script>')
    }
    elseif ($line -match 'cdn\.sheetjs\.com') {
        $output.Add($line)
    }
    else {
        $output.Add($line)
    }
}

[System.IO.File]::WriteAllText($outFile, ($output -join "`n"), $enc)
Write-Host "Bundle created: $outFile"
Write-Host "Size: $([math]::Round((Get-Item $outFile).Length / 1KB, 1)) KB"
