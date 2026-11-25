import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

for (const id of [
  "name-modal",
  "name-input",
  "name-submit",
  "name-error",
  "greeting",
  "edit-name",
]) {
  assert.ok(html.includes(`id="${id}"`), `missing: ${id}`);
}

for (const fn of [
  "isTopicUnlocked",
  "isLevelUnlocked",
  "highestUnlockedLevel",
  "firstIncompleteTopic",
]) {
  assert.ok(html.includes(`function ${fn}`), `missing function: ${fn}`);
}

assert.match(html, /name: ""/);
assert.match(html, /preferences: \{\}/);
assert.doesNotMatch(html, /fetch\(/);

assert.match(html, /id="app-content"/);
assert.match(html, /role="dialog" aria-modal="true" aria-labelledby="name-modal-title"/);
assert.match(html, /id="name-modal-title"/);
assert.match(html, /byId\("app-content"\)\.inert = true/);
assert.match(html, /byId\("app-content"\)\.inert = false/);

console.log("PASS: learning path structural contract");
