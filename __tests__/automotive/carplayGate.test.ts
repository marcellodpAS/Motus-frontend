// Task 16 concluded CarPlay is gated closed (requires-product-clarification,
// not feasible/feasible-with-native-work/partially-feasible — see
// docs/motus/carplay-integration.md). These are guardrails, not behavior
// tests: nothing CarPlay-specific exists to test. They fail loudly if either
// (a) the decision doc's status changes without this report being updated,
// or (b) CarPlay scaffolding is added despite the block still being in
// effect.
import fs from "fs";
import path from "path";

const repoRoot = path.resolve(__dirname, "../..");
const decisionDocPath = path.join(
  repoRoot,
  "docs/motus/automotive-architecture-decision.md",
);

describe("CarPlay gate (Task 16)", () => {
  it("automotive-architecture-decision.md still classifies CarPlay as requires-product-clarification", () => {
    const decisionDoc = fs.readFileSync(decisionDocPath, "utf8");
    const carplaySection = decisionDoc.slice(
      decisionDoc.indexOf("## Apple CarPlay"),
    );
    expect(carplaySection.length).toBeGreaterThan(0);
    expect(carplaySection.startsWith("## Apple CarPlay")).toBe(true);
    expect(carplaySection.split("\n")[0]).toContain(
      "requires-product-clarification",
    );
    // The summary table must agree with the section heading.
    const summaryTable = decisionDoc.slice(
      decisionDoc.indexOf("## Stato riassuntivo"),
      decisionDoc.indexOf("## Apple CarPlay"),
    );
    const carplayRow = summaryTable
      .split("\n")
      .find((line) => line.includes("Apple CarPlay"));
    expect(carplayRow).toBeDefined();
    expect(carplayRow).toContain("requires-product-clarification");
  });

  it("no ios/ directory exists (expo prebuild has not run, no CarPlay native project)", () => {
    expect(fs.existsSync(path.join(repoRoot, "ios"))).toBe(false);
  });

  it("no *.entitlements file exists anywhere in the repo (excluding node_modules)", () => {
    const found = findFiles(repoRoot, (name) => name.endsWith(".entitlements"));
    expect(found).toEqual([]);
  });

  it("no CarPlay config plugin exists in plugins/", () => {
    const pluginsDir = path.join(repoRoot, "plugins");
    const entries = fs.existsSync(pluginsDir) ? fs.readdirSync(pluginsDir) : [];
    const carplayPlugins = entries.filter((name) =>
      name.toLowerCase().includes("carplay"),
    );
    expect(carplayPlugins).toEqual([]);
  });

  it("app.json declares no CarPlay entitlement or scene manifest", () => {
    const appJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, "app.json"), "utf8"),
    );
    const serialized = JSON.stringify(appJson);
    expect(serialized).not.toContain("CarPlay");
    expect(serialized).not.toContain("com.apple.developer.carplay");
    expect(serialized).not.toContain("UIApplicationSceneManifest");
  });
});

function findFiles(
  dir: string,
  match: (name: string) => boolean,
  skip = new Set(["node_modules", ".git", "android"]),
): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, match, skip));
    } else if (match(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}
