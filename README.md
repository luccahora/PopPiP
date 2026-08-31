# PopPiP
Automatic Picture-in-Picture for Safari.

**Switch tabs. Keep watching.**

PopPiP automatically moves playing Safari videos into Picture-in-Picture when
you leave the tab and restores them when you return.

## Features

- Automatic PiP when switching Safari tabs
- Automatic PiP when switching to another app, with focus-loss debounce
- Optional PiP when the main playing video leaves the viewport
- Intelligent, site-independent selection when a page has multiple videos
- Per-website allowlist, deny list, and an optional all-permitted-sites mode
- Popup interface switchable between English and Brazilian Portuguese
- Local-only settings and debug logging that is off by default
- Native, sandboxed macOS host app and Safari Web Extension

YouTube, Twitch, Netflix, Disney+, Vimeo, and standards-based HTML5 players are
the primary compatibility targets. PopPiP only locates `<video>` elements; it
does not scrape service metadata.

## Demo

Demo media is planned for the first release. A placeholder for screenshots is
kept in the App Store metadata checklist. See also the Safari compatibility
checklist in [docs/SAFARI_COMPATIBILITY_CHECKLIST.md](docs/SAFARI_COMPATIBILITY_CHECKLIST.md).

## Installation

Install the official app, open it, select **Open Safari Extension Settings**,
and enable PopPiP. In Safari, grant access only to the websites where you want
it to work. Open the toolbar popup and select **Enable on this website**.

## Mac App Store

PopPiP is completely open source. If you enjoy PopPiP, purchasing the official
Mac App Store version is a simple way to support its continued development.
The App Store version provides one-click installation and automatic updates
while using the same open-source codebase.

The official version is a paid-upfront purchase with no subscription, account,
feature gating, license server, or in-app purchases. Updates come through the
Mac App Store; PopPiP contains no custom updater.

## Build from Source

Requirements: macOS with Xcode 26 or newer.

1. Clone the repository.
2. Open `PopPiP.xcodeproj` in Xcode.
3. Select the **PopPiP** scheme and a local Mac destination.
4. Choose your development team for the app and extension targets. If needed,
   change both bundle identifiers to identifiers owned by that team.
5. Build and run PopPiP.
6. Enable the extension in Safari Settings → Extensions.

Command-line unsigned validation:

```sh
node --test tests/*.test.js
xcodebuild -project PopPiP.xcodeproj -scheme PopPiP -configuration Debug \
  -derivedDataPath DerivedData CODE_SIGNING_ALLOWED=NO build test
```

## How It Works

The content script reacts to `visibilitychange`, debounced `blur`/`focus`, and,
when enabled, `IntersectionObserver`. It does not poll. A small scorer chooses a
playing, ready, meaningfully sized video using visible area and viewport
proximity. Safari's `webkitSetPresentationMode` is preferred, with the standard
Picture-in-Picture API as fallback. Internal ownership state ensures PopPiP
only closes PiP it started automatically.

## Website Permissions

The manifest requests only `storage` and `activeTab`. `storage` keeps settings
locally. `activeTab` lets the popup determine the current hostname after the
user clicks the toolbar item; the full URL is neither stored nor logged.

The content script declares `http://*/*` and `https://*/*` matches because it
must already be present to observe page visibility and window-focus changes.
Safari presents native website-access controls for this scope. PopPiP adds a
second local gate: it remains inert on every hostname until the user adds that
site to its allowlist, unless the user explicitly enables all websites that
Safari already permits. A deny entry always wins. This avoids a persistent
`tabs` permission, background page, navigation monitoring, or runtime script
injection machinery while preserving reliable automatic behavior.

Every permission has one purpose:

| Permission/access | Purpose |
| --- | --- |
| `storage` | Save preferences and hostname rules locally |
| `activeTab` | Show and change the clicked tab's hostname rule |
| HTTP/HTTPS content matches | Detect and control local `<video>` elements after Safari grants site access |

## Privacy

No analytics, telemetry, accounts, ads, backend, cookies, browsing history,
video metadata, automatic requests, or remote code. See [PRIVACY.md](PRIVACY.md)
and the [privacy-manifest assessment](docs/PRIVACY_MANIFEST.md).

## Security

PopPiP uses the App Sandbox with no additional entitlements. It has no external
dependencies, dynamic code, shell execution, private APIs, or executable
downloads. Please report security issues privately through the repository's
security contact once configured; do not include sensitive data in public issues.

## Development

JavaScript uses readable vanilla source and Node's built-in test runner only.
The Swift code uses SwiftUI and SafariServices. There are no package dependencies
or `Package.resolved`. Debug logging contains technical event names only and is
disabled by default.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Small, auditable changes with tests are
preferred.

## Support the Project

Star the repository, contribute a focused patch, report reproducible issues, or
purchase the official Mac App Store release when available.

## License

Source code is available under the [MIT License](LICENSE).

## Trademark

The MIT license does not grant rights to the PopPiP name or visual identity.
See [TRADEMARKS.md](TRADEMARKS.md).
