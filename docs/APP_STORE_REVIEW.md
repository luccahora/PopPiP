# App Store Review Notes

## Suggested review note

PopPiP is a Safari Web Extension that detects a currently playing HTML `<video>`
element and asks Safari to enter Picture-in-Picture when the tab becomes hidden
or its window loses focus. Website access is needed only so the local content
script can examine video playback and geometry. PopPiP does not read page text,
forms, cookies, account details, video titles, or full URLs, and it transmits no
content. There is no backend, analytics, telemetry, advertising, or remote code.
All preferences and the website allowlist remain in `browser.storage.local`.

The extension declares HTTP and HTTPS content-script matches because Safari must
load the script on a page before page-level visibility and focus events can be
observed. It is inert unless the user enables that hostname in the PopPiP popup
or explicitly enables all websites. Safari's own per-website access setting is
an additional, higher-level permission that the user can revoke at any time.

## Review test

1. Install and launch PopPiP.
2. Click **Open Safari Extension Settings** and enable PopPiP.
3. Open YouTube in Safari and grant Safari website access when requested.
4. Open the PopPiP toolbar item and choose **Enable on this website**.
5. Start a video, then switch to another tab.
6. Confirm the playing video enters Picture-in-Picture.
7. Return to the original tab and confirm automatically-started PiP closes.
8. Start PiP manually and return to the tab; confirm PopPiP does not close it.

The optional viewport behavior is off by default and can be enabled in the popup.

