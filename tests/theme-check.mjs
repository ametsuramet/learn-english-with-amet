import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

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

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const app = scripts.at(-1);

const helperStart = app.indexOf("// THEME_HELPER_START");
const helperEnd = app.indexOf("// THEME_HELPER_END");
assert.ok(helperStart >= 0 && helperEnd > helperStart, "theme helper markers not found");
const helperSource = app.slice(helperStart, helperEnd);

const themeContext = { window: { matchMedia: () => ({ matches: true }) } };
vm.createContext(themeContext);
vm.runInContext(
  `${helperSource}\nthis.__theme = { themePreference, effectiveTheme, nextTheme, themeUiState };`,
  themeContext
);
const { themePreference, effectiveTheme, nextTheme, themeUiState } = themeContext.__theme;

assert.equal(themePreference({}), "system");
assert.equal(themePreference({ theme: "bogus" }), "system");
assert.equal(themePreference({ theme: "system" }), "system");
assert.equal(effectiveTheme("system", false), "light");
assert.equal(effectiveTheme("system", true), "dark");
assert.equal(effectiveTheme("light", true), "light");
assert.equal(effectiveTheme("dark", false), "dark");
assert.equal(nextTheme("system"), "light");
assert.equal(nextTheme("light"), "dark");
assert.equal(nextTheme("dark"), "system");

const systemState = themeUiState("system", true);
assert.equal(systemState.effective, "dark");
assert.equal(systemState.icon, "fa-circle-half-stroke");
assert.ok(systemState.label.includes("dark"), "system label should name effective mode");
assert.equal(themeUiState("light", true).icon, "fa-sun");
assert.equal(themeUiState("dark", false).icon, "fa-moon");

for (const token of [
  'preferences: { theme: "system" }',
  "progress.preferences.theme",
  'addEventListener("change"',
  "fa-sun",
  "fa-moon",
  "prefers-color-scheme",
]) {
  assert.ok(html.includes(token), `missing: ${token}`);
}

const toggleStart = app.indexOf('byId("theme-toggle").addEventListener("click"');
assert.ok(toggleStart >= 0, "theme toggle handler not found");
const toggleEnd = app.indexOf("});", toggleStart);
assert.ok(app.slice(toggleStart, toggleEnd).includes("applyTheme()"), "toggle handler must call applyTheme()");

console.log("PASS: theme structural and behavioral contract");
