import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSiteMetadata,
  publicApiUrl,
  resolvePage,
  sitePath,
  siteTheme
} from "../lib/site.js";

test("resolves supported public pages and rejects nested unknown paths", () => {
  assert.equal(resolvePage(undefined), "home");
  assert.equal(resolvePage([]), "home");
  assert.equal(resolvePage(["products"]), "products");
  assert.equal(resolvePage(["missing"]), null);
  assert.equal(resolvePage(["about", "nested"]), null);
});

test("builds public paths without exposing draft identifiers", () => {
  assert.equal(sitePath("bright-spark"), "/sites/bright-spark");
  assert.equal(sitePath("bright-spark", "contact"), "/sites/bright-spark/contact");
});

test("builds the backend public snapshot URL", () => {
  assert.equal(
    publicApiUrl("bright spark"),
    "http://localhost:4000/api/public/sites/bright%20spark"
  );
});

test("builds page-specific canonical and Open Graph metadata", () => {
  const metadata = buildSiteMetadata({
    slug: "bright-spark",
    publicUrl: "https://sites.example.com/sites/bright-spark",
    siteContent: { name: "Bright Spark", desc: "Electrical help" },
    seo: {
      title: "Bright Spark Electrical",
      description: "Licensed local electricians",
      keywords: ["electrician", "melbourne"]
    }
  }, "about");

  assert.equal(metadata.title, "About | Bright Spark");
  assert.equal(metadata.alternates.canonical, "https://sites.example.com/sites/bright-spark/about");
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.deepEqual(metadata.keywords, ["electrician", "melbourne"]);
});

test("maps published template style tokens to renderer theme values", () => {
  const theme = siteTheme({
    selectedTemplate: "bold-template",
    colorPalette: "bold-contrast",
    fontPairing: "elegant-serif"
  });

  assert.equal(theme["--site-bg"], "#0E1117");
  assert.equal(theme["--site-primary"], "#F05A28");
  assert.equal(theme["--site-font-display"], "Georgia, serif");
});
