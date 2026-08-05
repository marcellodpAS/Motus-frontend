// @ts-check
/**
 * Pure, dependency-free AndroidManifest.xml / app-build.gradle transforms
 * for the Android Auto scaffold (Task 15). Deliberately does not import
 * `expo/config-plugins`: that barrel pulls in `xcode` (for iOS project
 * parsing), which in turn requires `uuid`'s ESM-only build — fine at real
 * `expo prebuild` time, but unloadable under this project's Jest config
 * without changing shared transformIgnorePatterns for every test file, not
 * just this one. Keeping this file free of that dependency means
 * __tests__/plugins/androidAutoManifest.test.ts exercises real,
 * unmocked logic. withAndroidAutoCarAppService.js (the actual Expo
 * ConfigPlugin, which unavoidably needs `expo/config-plugins` for
 * withAndroidManifest/withAppBuildGradle/withDangerousMod) is a thin
 * wrapper around the functions here.
 *
 * Verified 2026-08-05 against the live androidx.car.app docs (session
 * research, docs/motus/automotive-feasibility.md §1.11/§1.14/§1.15,
 * §1.17): CarAppService/manifest shape from
 * https://developer.android.com/training/cars/apps/library/set-up-project,
 * MAP_TEMPLATES permission from
 * https://developer.android.com/training/cars/apps/poi, Gradle coordinates
 * from https://developer.android.com/jetpack/androidx/releases/car-app.
 */

const CAR_APP_LIBRARY_VERSION = "1.7.0";
const CAR_APP_PACKAGE_SUFFIX = "androidauto";
const SERVICE_CLASS_NAME = "MotusCarAppService";
const SERVICE_MANIFEST_NAME = `.${CAR_APP_PACKAGE_SUFFIX}.${SERVICE_CLASS_NAME}`;
const MAP_TEMPLATES_PERMISSION = "androidx.car.app.MAP_TEMPLATES";
const MIN_CAR_API_LEVEL_META_DATA = "androidx.car.app.minCarApiLevel";

/**
 * Same lookup rule as @expo/config-plugins' AndroidConfig.Manifest.getMainApplicationOrThrow
 * (android/Manifest.js: `application.filter(e => e.$['android:name'].endsWith('.MainApplication'))[0]`)
 * — reimplemented here rather than imported, see file header.
 */
function getMainApplicationOrThrow(androidManifest) {
  const mainApplication = (androidManifest.manifest.application ?? []).find(
    (entry) => entry.$["android:name"]?.endsWith(".MainApplication"),
  );
  if (!mainApplication) {
    throw new Error(
      "AndroidManifest.xml is missing the required MainApplication element",
    );
  }
  return mainApplication;
}

/**
 * Adds the Android Auto entries to an already-parsed AndroidManifest.xml
 * (the shape @expo/config-plugins' withAndroidManifest hands to a mod
 * callback via `config.modResults`): the MAP_TEMPLATES permission, the
 * minCarApiLevel meta-data, and the CarAppService declaration with its POI
 * category intent-filter. Idempotent — safe to run across repeated
 * `expo prebuild` invocations without duplicating entries.
 */
function applyCarAppManifest(androidManifest) {
  androidManifest.manifest["uses-permission"] =
    androidManifest.manifest["uses-permission"] ?? [];
  const permissions = androidManifest.manifest["uses-permission"];
  const hasMapTemplatesPermission = permissions.some(
    (entry) => entry.$["android:name"] === MAP_TEMPLATES_PERMISSION,
  );
  if (!hasMapTemplatesPermission) {
    permissions.push({ $: { "android:name": MAP_TEMPLATES_PERMISSION } });
  }

  const mainApplication = getMainApplicationOrThrow(androidManifest);

  mainApplication["meta-data"] = mainApplication["meta-data"] ?? [];
  const existingMetaData = mainApplication["meta-data"].find(
    (entry) => entry.$["android:name"] === MIN_CAR_API_LEVEL_META_DATA,
  );
  if (existingMetaData) {
    existingMetaData.$["android:value"] = "1";
  } else {
    mainApplication["meta-data"].push({
      $: { "android:name": MIN_CAR_API_LEVEL_META_DATA, "android:value": "1" },
    });
  }

  mainApplication.service = mainApplication.service ?? [];
  const alreadyDeclared = mainApplication.service.some(
    (entry) => entry.$["android:name"] === SERVICE_MANIFEST_NAME,
  );
  if (!alreadyDeclared) {
    mainApplication.service.push({
      $: {
        "android:name": SERVICE_MANIFEST_NAME,
        "android:exported": "true",
      },
      "intent-filter": [
        {
          action: [{ $: { "android:name": "androidx.car.app.CarAppService" } }],
          category: [
            { $: { "android:name": "androidx.car.app.category.POI" } },
          ],
        },
      ],
    });
  }

  return androidManifest;
}

/**
 * Appends the Car App Library dependencies to a Groovy app/build.gradle's
 * `dependencies { ... }` block, idempotently. `app-automotive` (Android
 * Automotive OS target) is deliberately left out: automotive-feasibility.md's
 * own scope is Android Auto (projected, phone-hosted) only — see "Cosa NON
 * è stato implementato" in docs/motus/android-auto-integration.md.
 */
function applyCarAppGradleDependencies(contents) {
  if (contents.includes("androidx.car.app:app:")) {
    return contents;
  }
  return contents.replace(
    /dependencies\s*\{/,
    `dependencies {\n    implementation "androidx.car.app:app:${CAR_APP_LIBRARY_VERSION}"\n` +
      `    implementation "androidx.car.app:app-projected:${CAR_APP_LIBRARY_VERSION}"\n`,
  );
}

module.exports = {
  applyCarAppManifest,
  applyCarAppGradleDependencies,
  CAR_APP_LIBRARY_VERSION,
  CAR_APP_PACKAGE_SUFFIX,
  SERVICE_MANIFEST_NAME,
  MAP_TEMPLATES_PERMISSION,
  MIN_CAR_API_LEVEL_META_DATA,
};
