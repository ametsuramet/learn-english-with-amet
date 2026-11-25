import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

const required = [
  'id="level-pemula"',
  'id="level-menengah"',
  'id="level-mahir"',
  'id="topic-list"',
  'id="lesson-card"',
  'id="exercise-input"',
  'id="check-answer"',
  'id="feedback"',
  'id="progress-xp"',
  'id="progress-streak"',
  'id="progress-topics"',
  'id="mark-done"',
  'id="reset-progress"',
  'id="export-progress"',
  "learn-english-progress-v1",
  "progressStore",
];

for (const token of required) {
  assert.ok(html.includes(token), `missing: ${token}`);
}

assert.match(html, /A1[\s\S]{0,80}A2/);
assert.match(html, /B1[\s\S]{0,80}B2/);
assert.match(html, /C1[\s\S]{0,80}C2/);

console.log("PASS: UI structural contract");
