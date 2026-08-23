import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the YARA LABS landing hero", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>YARA LABS \| Systems, Automation, Infrastructure<\/title>/i);
  assert.match(html, /YARA LABS/);
  assert.match(html, /Systems/);
  assert.match(html, /Automation/);
  assert.match(html, /Infrastructure/);
  assert.match(html, /Good systems should feel almost invisible\./);
  assert.match(html, /Complexity is a natural part of growth\./);
  assert.match(html, /Enter your email/);
  assert.match(html, /Free Consult/);
  assert.match(html, /Explore Our Work/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/i);
});

test("documents the selected brand system and removes starter-only UI", async () => {
  const [page, layout, css, packageJson, readme] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../README.md", import.meta.url), "utf8"),
  ]);

  assert.match(page, /const navItems = \["Work", "Services", "About", "Contact"\]/);
  assert.match(page, /bg-\[linear-gradient\(120deg,#e93edc_0%,#8a4bff_48%,#1468ff_100%\)\]/);
  assert.match(layout, /title:\s*"YARA LABS"/);
  assert.match(css, /Roboto Mono/);
  assert.match(css, /Roboto/);
  assert.match(css, /--background:\s*#fbfbfa/);
  assert.match(css, /--foreground:\s*#15161c/);
  assert.match(packageJson, /"name": "yara-labs-website"/);
  assert.match(packageJson, /"packageManager": "pnpm@11\.19\.0"/);
  assert.match(readme, /Work From Another Device/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(page, /SkeletonPreview|_sites-preview|codex-preview/);
});
