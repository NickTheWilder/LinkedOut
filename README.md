# LinkedOut

Tired of seeing BS on LinkedIn that you don't care to see? Well I have a solution for you!

All in one browser extension that removes posts from LinkedIn based on keywords you set. Block the buzzwords, clean your feed.

# Installation

TODO: Extension store links

# Development

Clone this repo:
```bash
git clone https://github.com/NickTheWilder/LinkedOut.git
```

Build for your target browser:
```bash
./build.sh firefox  # Build Firefox extension
./build.sh chrome   # Build Chrome extension
./build.sh all      # Build both
```

Output zips are in `dist/`.

## Firefox
1. Go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `dist/firefox/manifest.json`

## Chrome
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/chrome/` folder

# Contributing

Currently, this extension serves its purpose. So likely won't be adding more.

If you would like to contribute, please open an issue or pull request.

Feel free to fork or copy this repo as your own.
