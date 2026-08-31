# Privacy Manifest Assessment

The current targets do not include `PrivacyInfo.xcprivacy` because they collect
no data, include no third-party SDKs, and use no API currently listed by Apple
as a required-reason API. `UserDefaults` is intentionally not used. Extension
preferences use `browser.storage.local`; that WebExtension API is not declared
through an Apple privacy manifest.

Reassess this file against Apple's current required-reason API list immediately
before each App Store submission, especially after changing persistence,
filesystem, device-information, or timestamp APIs. Do not add an empty or
inaccurate manifest merely to make a declaration.

