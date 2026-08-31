# Contributing

Thank you for helping improve PopPiP. Please open an issue before a large
change, keep patches focused, and include tests for behavior changes.

Run the checks before submitting a pull request:

```sh
node --test tests/*.test.js
xcodebuild -project PopPiP.xcodeproj -scheme PopPiP -configuration Debug -derivedDataPath DerivedData CODE_SIGNING_ALLOWED=NO build test
```

Contributions must preserve the privacy model: no analytics, tracking, remote
code, background networking, or unnecessary website inspection.

