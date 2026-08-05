// Exercises the plugin's pure manifest/gradle transforms directly against
// fixture data, instead of running a full `expo prebuild` (no Java/Android
// SDK in CI or in the environment this scaffold was authored in — see
// docs/motus/android-auto-integration.md, "Verifiche manuali"). This is the
// part of Task 15's native scaffold that IS mechanically verifiable without
// a compiler: the shape of the manifest/gradle mutation. Imports the pure
// plugins/androidAutoManifest.js directly (not withAndroidAutoCarAppService.js)
// so this test never pulls in `expo/config-plugins` — see that file's header.
const plugin = require("../../plugins/androidAutoManifest");

function fixtureManifest() {
  return {
    manifest: {
      $: { "xmlns:android": "http://schemas.android.com/apk/res/android" },
      "uses-permission": [],
      queries: [],
      application: [
        {
          $: { "android:name": ".MainApplication" },
        },
      ],
    },
  };
}

describe("applyCarAppManifest", () => {
  it("adds the androidx.car.app.MAP_TEMPLATES permission required by PlaceListMapTemplate", () => {
    const result = plugin.applyCarAppManifest(fixtureManifest());
    const permissionNames = result.manifest["uses-permission"].map(
      (entry: any) => entry.$["android:name"],
    );
    expect(permissionNames).toContain(plugin.MAP_TEMPLATES_PERMISSION);
  });

  it("declares the minCarApiLevel meta-data on the main application", () => {
    const result = plugin.applyCarAppManifest(fixtureManifest());
    const mainApplication = result.manifest.application[0];
    const metaData = mainApplication["meta-data"].find(
      (entry: any) =>
        entry.$["android:name"] === plugin.MIN_CAR_API_LEVEL_META_DATA,
    );
    expect(metaData.$["android:value"]).toBe("1");
  });

  it("declares MotusCarAppService with the POI category intent-filter", () => {
    const result = plugin.applyCarAppManifest(fixtureManifest());
    const mainApplication = result.manifest.application[0];
    const service = mainApplication.service.find(
      (entry: any) => entry.$["android:name"] === plugin.SERVICE_MANIFEST_NAME,
    );
    expect(service.$["android:exported"]).toBe("true");
    expect(service["intent-filter"][0].action[0].$["android:name"]).toBe(
      "androidx.car.app.CarAppService",
    );
    expect(service["intent-filter"][0].category[0].$["android:name"]).toBe(
      "androidx.car.app.category.POI",
    );
  });

  it("does not duplicate the permission, meta-data, or service across repeated prebuilds", () => {
    const once = plugin.applyCarAppManifest(fixtureManifest());
    const twice = plugin.applyCarAppManifest(once);
    const mainApplication = twice.manifest.application[0];

    expect(twice.manifest["uses-permission"]).toHaveLength(1);
    expect(mainApplication.service).toHaveLength(1);
    expect(
      mainApplication["meta-data"].filter(
        (entry: any) =>
          entry.$["android:name"] === plugin.MIN_CAR_API_LEVEL_META_DATA,
      ),
    ).toHaveLength(1);
  });
});

describe("applyCarAppGradleDependencies", () => {
  const baseline =
    "apply plugin: \"com.android.application\"\n\ndependencies {\n    implementation project(':expo')\n}\n";

  it("inserts the Car App Library dependencies inside the dependencies block", () => {
    const result = plugin.applyCarAppGradleDependencies(baseline);
    expect(result).toContain(
      `androidx.car.app:app:${plugin.CAR_APP_LIBRARY_VERSION}`,
    );
    expect(result).toContain(
      `androidx.car.app:app-projected:${plugin.CAR_APP_LIBRARY_VERSION}`,
    );
    expect(result).toContain("implementation project(':expo')");
  });

  it("is idempotent — does not duplicate the dependency across repeated prebuilds", () => {
    const once = plugin.applyCarAppGradleDependencies(baseline);
    const twice = plugin.applyCarAppGradleDependencies(once);
    const occurrences =
      twice.split(`androidx.car.app:app:${plugin.CAR_APP_LIBRARY_VERSION}"`)
        .length - 1;
    expect(occurrences).toBe(1);
  });
});
