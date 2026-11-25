import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.ok(html.includes('darkMode: "class"'), "missing darkMode: \"class\"");

const darkBlock = html.match(/\.dark\s*\{([\s\S]*?)\}/);
assert.ok(darkBlock, "missing .dark token block");
for (const token of ["--background", "--foreground", "--card", "--muted", "--primary", "--border"]) {
  assert.ok(darkBlock[1].includes(token), `missing dark token: ${token}`);
}

assert.match(
  html,
  /<link[^>]+href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^"]*"/,
  "missing Font Awesome stylesheet link"
);

for (const token of ['id="theme-toggle"', "fa-circle-half-stroke"]) {
  assert.ok(html.includes(token), `missing: ${token}`);
}

for (const token of ["dark:text-slate-400", "dark:text-slate-300", "dark:text-red-400"]) {
  assert.ok(html.includes(token), `missing: ${token}`);
}

console.log("PASS: theme structural contract");
