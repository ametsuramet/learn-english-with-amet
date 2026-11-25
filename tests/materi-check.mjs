import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const root = new URL("../", import.meta.url);
const draftDir = new URL("materi-baru/", root);

const requiredFields = [
  "Level:",
  "Saran penempatan:",
  "Sumber sesi:",
  "## Item",
  "## Prompt latihan",
  "## Kunci jawaban statis",
  "## Checklist koreksi",
];
const allowedLevels = ["pemula", "menengah", "mahir"];

const readDraft = (name) => readFileSync(new URL(name, draftDir), "utf8");

assert.ok(existsSync(draftDir), "missing directory: materi-baru/");
assert.ok(
  existsSync(new URL("_TEMPLATE.md", draftDir)),
  "missing: materi-baru/_TEMPLATE.md"
);

const template = readDraft("_TEMPLATE.md");
for (const field of requiredFields) {
  assert.ok(template.includes(field), `template missing: ${field}`);
}

const drafts = readdirSync(draftDir).filter(
  (name) => name.endsWith(".md") && name !== "_TEMPLATE.md"
);

for (const name of drafts) {
  const text = readDraft(name);

  for (const field of requiredFields) {
    assert.ok(text.includes(field), `${name} missing: ${field}`);
  }

  const level = text.match(/^Level:\s*(\S+)\s*$/m)?.[1];
  assert.ok(allowedLevels.includes(level), `${name} has invalid Level: ${level}`);

  assert.match(text, /^- en:/m, `${name} has no lesson item`);

  if (level === "mahir") {
    assert.doesNotMatch(text, /Arti:/, `${name} (mahir) must not use Arti:`);
    assert.doesNotMatch(text, /cara baca/, `${name} (mahir) must not use cara baca`);
  }
}

for (const file of ["index.html", "lessons.js"]) {
  const text = readFileSync(new URL(file, root), "utf8");
  assert.doesNotMatch(text, /materi-baru\//, `${file} must not load drafts`);
}

const agents = readFileSync(new URL("AGENTS.md", root), "utf8");
assert.ok(
  agents.includes("docs/agents/materi-dari-sesi.md"),
  "AGENTS.md missing pointer to session-material convention"
);

console.log("PASS: session-material draft contract");
