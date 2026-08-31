# Contributing to PopPiP

Thanks for helping improve PopPiP.

This project is intentionally small, privacy-first, and focused on Safari-native behavior. We prefer clear, easy-to-review changes over broad rewrites.

## Before you start

- Check the issue tracker first if you are planning a larger change.
- Keep the scope narrow and explain the problem you are solving.
- Prefer local, audit-friendly changes over complex infrastructure.
- Preserve the privacy model: no analytics, tracking, remote code, or unnecessary page inspection.

## Development setup

1. Clone the repository.
2. Open `PopPiP.xcodeproj` in Xcode.
3. Make sure you are using a recent Xcode version compatible with the macOS 14.0 deployment target.
4. For JavaScript validation, run the built-in tests with Node.

```sh
git clone https://github.com/luccahora/PopPiP.git
cd PopPiP
node --test tests/*.test.js
```

For a local Xcode validation build without code signing:

```sh
xcodebuild -project PopPiP.xcodeproj -scheme PopPiP -configuration Debug \
  -derivedDataPath DerivedData CODE_SIGNING_ALLOWED=NO build
```

## Code expectations

- Keep JavaScript logic readable and deterministic.
- Favor explicit behavior over hidden state.
- Respect the allowlist/denylist and Safari permission model.
- Avoid introducing networking, telemetry, or external dependencies unless there is a clear need.
- Keep app-level and extension-level responsibilities separated.

## Tests

Please add or update tests when changing core selection logic, settings merging, or PiP flow behavior.

```sh
node --test tests/*.test.js
```

## Pull requests

- Use a clear branch name.
- Keep pull requests focused on one problem.
- Include a short summary and testing notes.
- Mention any compatibility limits or site-specific caveats when relevant.

## Reporting issues

For bugs, use the issue templates in `.github/ISSUE_TEMPLATE/`.

For security issues, use the private reporting path described in [SECURITY.md](SECURITY.md).

