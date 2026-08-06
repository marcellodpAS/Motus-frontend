const path = require("path");

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

/**
 * zustand's ESM build reads `import.meta.env` inside its `devtools`
 * middleware, and `zustand/middleware` is one module — importing `persist`
 * from it pulls that code in too. Metro serves the web bundle as a classic
 * script, where `import.meta` is a *parse* error, so the whole bundle died
 * with "Cannot use 'import.meta' outside a module" and the page rendered
 * blank. (The `try`/`catch` zustand wraps the read in cannot help: nothing
 * ever runs.)
 *
 * zustand also ships a CommonJS build without that code, and native already
 * resolves to it through the package's own "react-native" export condition.
 * This points web at the same files instead of the `.mjs` ones. Scoped to
 * zustand on purpose: widening Metro's condition names would change
 * resolution for every dependency, including ones that only ship ESM.
 */
const zustandRoot = path.dirname(require.resolve("zustand/package.json"));
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isZustand =
    moduleName === "zustand" || moduleName.startsWith("zustand/");
  if (platform === "web" && isZustand && !moduleName.endsWith(".json")) {
    const subpath = moduleName.slice("zustand".length).replace(/^\//, "");
    return {
      type: "sourceFile",
      filePath: path.join(zustandRoot, `${subpath || "index"}.js`),
    };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(
    context,
    moduleName,
    platform,
  );
};

module.exports = withNativeWind(config, {
  input: "./src/styles/global.css",
});
