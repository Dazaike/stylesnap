# StyleSnap (Element Extractor)

Chrome extension that picks any element on a page and copies its HTML, CSS, and computed styles.

## Install (unpacked)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder

## Usage

- **Popup**: click the extension icon for quick actions
- **DevTools**: open the **Element Extractor** panel to inspect and extract the selected node

## Permissions

- `activeTab` — interact with the current page when you invoke the extension
- `scripting` — inject the picker/content scripts
- `clipboardWrite` — copy extracted markup/styles

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Extension manifest (MV3) |
| `content.js` | In-page element picker |
| `devtools.html` / `devtools.js` | DevTools panel wiring |
| `panel.html` / `panel.js` | Extraction UI |
| `background.js` | Service worker |

## License

MIT
