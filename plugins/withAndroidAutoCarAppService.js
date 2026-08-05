// @ts-check
const fs = require("fs");
const path = require("path");
const {
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
  createRunOncePlugin,
} = require("expo/config-plugins");
const {
  applyCarAppManifest,
  applyCarAppGradleDependencies,
  CAR_APP_PACKAGE_SUFFIX,
} = require("./androidAutoManifest");

/**
 * Expo config plugin for the Android Auto scaffold (Task 15). NOT
 * registered in app.json's `plugins` array — see docs/motus/
 * android-auto-integration.md, "Perché il plugin non è attivo di default".
 * Applying this plugin is what a future automotive build profile would do
 * (e.g. an EAS build profile with its own app.config.js), never the
 * default mobile build: `npx expo prebuild`/`eas build` for the regular
 * Motus app must produce byte-identical output whether or not this file
 * exists, per architecture.md §22 ("l'automotive non deve accoppiare
 * l'architettura mobile"). The actual manifest/gradle logic lives in
 * ./androidAutoManifest.js, which stays free of the `expo/config-plugins`
 * dependency this file needs for withAndroidManifest/withAppBuildGradle/
 * withDangerousMod — see that file's header for why.
 */

const NATIVE_SOURCE_DIR = path.join(__dirname, "..", "native", "android-auto");
const NATIVE_KOTLIN_FILES = [
  "MotusViewModel.kt",
  "MotusDataSource.kt",
  "MotusCarAppService.kt",
  "MotusSession.kt",
  "NearbyListScreen.kt",
  "PlaceDetailScreen.kt",
  "MessageScreen.kt",
];
const PACKAGE_PLACEHOLDER = "__ANDROID_AUTO_PACKAGE__";

function withCarAppManifest(config) {
  return withAndroidManifest(config, (config) => {
    config.modResults = applyCarAppManifest(config.modResults);
    return config;
  });
}

function withCarAppGradleDependencies(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== "groovy") {
      throw new Error(
        `withAndroidAutoCarAppService only supports Groovy app/build.gradle files (found "${config.modResults.language}").`,
      );
    }
    config.modResults.contents = applyCarAppGradleDependencies(
      config.modResults.contents,
    );
    return config;
  });
}

function withCarAppNativeSources(config) {
  return withDangerousMod(config, [
    "android",
    (config) => {
      // No filesystem writes during introspection (config diffing) — see
      // ModProps.introspect in @expo/config-plugins' Plugin.types.
      if (config.modRequest.introspect) {
        return config;
      }

      const androidPackage = config.android && config.android.package;
      if (!androidPackage) {
        throw new Error(
          "withAndroidAutoCarAppService requires `expo.android.package` to be set in app.json/app.config " +
            'before prebuild (see docs/motus/android-auto-integration.md, "Prerequisiti").',
        );
      }

      const packagePath = androidPackage.split(".").join(path.sep);
      const targetDir = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "java",
        packagePath,
        CAR_APP_PACKAGE_SUFFIX,
      );
      fs.mkdirSync(targetDir, { recursive: true });

      const resolvedPackage = `${androidPackage}.${CAR_APP_PACKAGE_SUFFIX}`;
      for (const fileName of NATIVE_KOTLIN_FILES) {
        const source = fs.readFileSync(
          path.join(NATIVE_SOURCE_DIR, fileName),
          "utf8",
        );
        const rendered = source
          .split(PACKAGE_PLACEHOLDER)
          .join(resolvedPackage);
        fs.writeFileSync(path.join(targetDir, fileName), rendered);
      }

      return config;
    },
  ]);
}

function withAndroidAutoCarAppServiceUnwrapped(config) {
  config = withCarAppManifest(config);
  config = withCarAppGradleDependencies(config);
  config = withCarAppNativeSources(config);
  return config;
}

const withAndroidAutoCarAppService = createRunOncePlugin(
  withAndroidAutoCarAppServiceUnwrapped,
  "motus-android-auto-car-app-service",
  "1.0.0",
);

module.exports = withAndroidAutoCarAppService;
module.exports.NATIVE_KOTLIN_FILES = NATIVE_KOTLIN_FILES;
