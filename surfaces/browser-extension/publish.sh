#!/usr/bin/env bash
# Publishing helper for Thirsty
set -e
echo "Thirsty - Publishing Helper"
echo "==========================="

[ -f icons/icon-128.png ] || { echo "icons/icon-128.png missing - run: npm run icons"; exit 1; }

echo "Running tests..."
( cd ../.. && npm test )

echo "Building + packaging..."
npm run package

version=$(node -p "require('./manifest.json').version")
echo ""
echo "Created: thirsty.zip (v$version)"
echo ""
echo "Next steps:"
echo "  1. Test: chrome://extensions -> Developer mode -> Load unpacked -> this folder"
echo "  2. Publish: https://chrome.google.com/webstore/devconsole -> New item -> upload thirsty.zip"
echo "     Listing = STORE_LISTING.md, privacy = PRIVACY_PRACTICES.md, then Submit for review"
echo "  3. (optional) git tag -a v$version -m \"v$version\" && git push origin v$version"
