#!/bin/bash

set -e

DIST_DIR="dist"
FILES="background.js browser-polyfill.min.js content.js popup.html popup.js icons"

# Base manifest (shared)
base_manifest='{
  "manifest_version": 3,
  "name": "LinkedOut",
  "version": "1.1.1",
  "description": "Hide LinkedIn feed posts containing keywords you dont want to see. Block the buzzwords, clean your feed.",
  "author": "Indigo Development",
  "homepage_url": "https://github.com/NickTheWilder/LinkedOut",
  "permissions": ["storage"],
  "icons": {
    "48": "icons/icon-48.png",
    "96": "icons/icon-96.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "LinkedOut",
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png"
    }
  },
  "content_scripts": [{
    "matches": ["https://www.linkedin.com/feed*"],
    "js": ["browser-polyfill.min.js", "content.js"],
    "run_at": "document_idle"
  }]
}'

build_firefox() {
    echo "Building for Firefox..."
    rm -rf "$DIST_DIR/firefox"
    mkdir -p "$DIST_DIR/firefox"
    
    echo "$base_manifest" | jq '. + {
      browser_specific_settings: {
        gecko: {
          id: "nickwilder@duck.com",
          strict_min_version: "142.0",
          data_collection_permissions: { required: ["none"] }
        }
      },
      background: { scripts: ["browser-polyfill.min.js", "background.js"] }
    }' > "$DIST_DIR/firefox/manifest.json"
    
    for f in $FILES; do cp -r "$f" "$DIST_DIR/firefox/"; done
    
    (cd "$DIST_DIR/firefox" && zip -r ../linkedout-firefox.zip .)
    echo "Created dist/linkedout-firefox.zip"
}

build_chrome() {
    echo "Building for Chrome..."
    rm -rf "$DIST_DIR/chrome"
    mkdir -p "$DIST_DIR/chrome"
    
    echo "$base_manifest" | jq '. + {
      background: { service_worker: "background.js" }
    }' > "$DIST_DIR/chrome/manifest.json"
    
    for f in $FILES; do cp -r "$f" "$DIST_DIR/chrome/"; done
    
    (cd "$DIST_DIR/chrome" && zip -r ../linkedout-chrome.zip .)
    echo "Created dist/linkedout-chrome.zip"
}

case "$1" in
    firefox) build_firefox ;;
    chrome)  build_chrome ;;
    all)     build_firefox; build_chrome ;;
    *)       echo "Usage: $0 <firefox|chrome|all>"; exit 1 ;;
esac
