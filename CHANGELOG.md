# Changelog

All notable changes to PopPiP will be documented in this file.

The format is based on Keep a Changelog, and this project currently documents work in progress before any public release.

## [Unreleased]

### Added

- Initial native macOS app and Safari Web Extension implementation.
- Automatic Picture-in-Picture when switching Safari tabs.
- Automatic Picture-in-Picture when the app or browser loses focus.
- Optional viewport-triggered PiP behavior for playing videos leaving the visible page area.
- Per-site allowlist and denylist controls with local-only settings.
- Local-only privacy-first behavior with no analytics, telemetry, or remote backend.
- Node-based validation tests for PiP selection and site logic.

### Changed

- Documentation was expanded to describe supported behavior, privacy expectations, and release planning.

### Security

- Kept the app and extension sandboxed and local-first by design.
- Avoided tracking, remote services, and unnecessary website inspection.
