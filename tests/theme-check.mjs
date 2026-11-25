import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

const head = html.slice(0, html.indexOf("</head>"));
const beforeTailwind = head.slice(0, head.indexOf("cdn.tailwindcss.com"));
assert.match(
  beforeTailwind,
  /<script>[\s\S]*?learn-english-progress-v1[\s\S]*?prefers-color-scheme[\s\S]*?classList\.toggle\("dark"[\s\S]*?<\/script>/,
  "missing pre-paint theme bootstrap before Tailwind"
);

assert.ok(html.includes('darkMode: "class"'), "missing darkMode: \"class\"");

const darkBlock = html.match(/\.dark\s*\{([\s\S]*?)\}/);
assert.ok(darkBlock, "missing .dark token block");
for (const token of ["--background", "--foreground", "--card", "--muted", "--primary", "--border"]) {
  assert.ok(darkBlock[1].includes(token), `missing dark token: ${token}`);
}
assert.ok(
  darkBlock[1].includes("--primary: 221 83% 53%;"),
  "dark primary must keep AA contrast with white CTA text"
);
assert.ok(
  html.includes('class="mt-6 text-xs text-slate-400 dark:text-slate-400"'),
  "footer text must stay legible on dark background"
);

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

const behaviorStart = app.indexOf('    const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");');
const behaviorEnd = app.indexOf("    const activeLesson = () => LESSONS[progress.level];");
assert.ok(behaviorStart > helperEnd && behaviorEnd > behaviorStart, "theme behavior block not found");
const behaviorSource = app.slice(behaviorStart, behaviorEnd);

function themeDomHarness(preference, legacyMedia) {
  const toggles = [];
  const icon = { className: "" };
  const button = {
    title: "",
    setAttribute(name, value) {
      this[name] = value;
    },
    querySelector() {
      return icon;
    },
  };
  const media = { matches: true };
  if (legacyMedia) {
    media.addListener = (cb) => {
      media.listener = cb;
    };
  } else {
    media.addEventListener = (name, cb) => {
      media.listener = cb;
    };
  }
  const context = {
    window: { matchMedia: () => media },
    progress: { preferences: { theme: preference } },
    document: { documentElement: { classList: { toggle: (name, force) => toggles.push([name, force]) } } },
    byId: () => button,
  };
  vm.createContext(context);
  vm.runInContext(`${helperSource}\n${behaviorSource}\nthis.__applyTheme = applyTheme;`, context);
  context.__applyTheme();
  return { media, toggles, button, icon };
}

{
  const h = themeDomHarness("system", false);
  assert.deepEqual(h.toggles.at(-1), ["dark", true]);
  assert.equal(h.button.title, "Tema: system (dark)");
  assert.equal(h.icon.className, "fa-solid fa-circle-half-stroke");
  h.media.matches = false;
  h.media.listener({ matches: false });
  assert.deepEqual(h.toggles.at(-1), ["dark", false], "OS change should follow system preference");
  assert.equal(h.button.title, "Tema: system (light)");
}

{
  const h = themeDomHarness("light", false);
  h.media.matches = true;
  const before = h.toggles.length;
  h.media.listener({ matches: true });
  assert.equal(h.toggles.length, before, "OS change must not override explicit light");
}

{
  const h = themeDomHarness("system", true);
  h.media.matches = false;
  h.media.listener();
  assert.deepEqual(h.toggles.at(-1), ["dark", false], "legacy addListener should follow OS changes");
}

console.log("PASS: theme structural and behavioral contract");
