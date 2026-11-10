# اژدهاسوار — Android app

A small WebView app that opens the published game (https://majidjoon1340.github.io/game1/) full screen and in landscape.
Game updates pushed to the site show up in the app without a new APK; the site's service worker keeps it playable offline after the first run.

The `Build Android APK` workflow builds a signed APK on every change under `android/` (or by hand from the Actions tab)
and attaches it to a GitHub release. Latest download:

https://github.com/Majidjoon1340/game1/releases/latest/download/Ejdehasavar.apk

Signing: if the repo secret `APK_KEYSTORE_B64` (a base64 keystore, alias and passwords `ejdehasavar`) is set, every build uses it,
so a new APK installs as an update over the old one. Without it each build gets a fresh key, and installing a newer APK
means uninstalling the old app first. Since the app loads the live site, a new APK is rarely needed.
