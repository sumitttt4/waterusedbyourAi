# Publishing helper for Thirsty (PowerShell)
Write-Host "Thirsty - Publishing Helper" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "icons/icon-128.png")) {
    Write-Host "icons/icon-128.png missing - run: npm run icons" -ForegroundColor Yellow
    exit 1
}

# Core tests (the numbers) run from the repo root workspace.
Write-Host "Running tests..." -ForegroundColor Green
Push-Location ../..
npm test
$testExit = $LASTEXITCODE
Pop-Location
if ($testExit -ne 0) { Write-Host "Tests failed!" -ForegroundColor Red; exit 1 }
Write-Host "Tests passed" -ForegroundColor Green
Write-Host ""

Write-Host "Building + packaging..." -ForegroundColor Green
npm run package
if ($LASTEXITCODE -ne 0) { Write-Host "Packaging failed!" -ForegroundColor Red; exit 1 }

$version = (Get-Content manifest.json | ConvertFrom-Json).version
Write-Host ""
Write-Host "Created: thirsty.zip (v$version)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test locally: chrome://extensions -> Developer mode -> Load unpacked -> this folder"
Write-Host "  2. Publish: https://chrome.google.com/webstore/devconsole -> New item -> upload thirsty.zip"
Write-Host "     Fill listing from STORE_LISTING.md, privacy from PRIVACY_PRACTICES.md, then Submit for review"
Write-Host "  3. (optional) Tag a release: git tag -a v$version -m 'v$version'; git push origin v$version"
