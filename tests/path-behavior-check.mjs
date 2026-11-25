import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const lessonSource = readFileSync(new URL("../lessons.js", import.meta.url), "utf8");

const lessonContext = { window: {} };
vm.createContext(lessonContext);
vm.runInContext(lessonSource, lessonContext);
const LESSONS = lessonContext.window.LESSONS;

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const app = scripts.at(-1);

const helperStart = app.indexOf('    const LEVEL_ORDER = ["pemula", "menengah", "mahir"];');
const helperEnd = app.indexOf("    if (!isLevelUnlocked(progress.level)) {");
assert.ok(helperStart >= 0 && helperEnd > helperStart, "helper block not found in index.html");
const helperSource = app.slice(helperStart, helperEnd);

function unlockHarness(completedTopics = [], level = "pemula") {
  const context = { LESSONS, progress: { completedTopics, level }, console };
  vm.createContext(context);
  vm.runInContext(helperSource, context);
  return context;
}

assert.equal(LESSONS.pemula.topics.length, 15);
assert.equal(LESSONS.menengah.topics.length, 4);
assert.equal(LESSONS.mahir.topics.length, 3);

{
  const h = unlockHarness();
  assert.equal(h.isLevelUnlocked("pemula"), true);
  assert.equal(h.isLevelUnlocked("menengah"), false);
  assert.equal(h.isLevelUnlocked("mahir"), false);
  assert.equal(h.isTopicUnlocked("pemula", 0), true);
  assert.equal(h.isTopicUnlocked("pemula", 1), false);
  assert.equal(h.highestUnlockedLevel(), "pemula");
  assert.equal(h.firstIncompleteTopic("pemula").id, "belanja");
}

{
  const done = [];
  const h = unlockHarness(done, "mahir");
  assert.equal(h.isLevelUnlocked("mahir"), false);
  assert.equal(h.highestUnlockedLevel(), "pemula");

  for (let i = 0; i < LESSONS.pemula.topics.length; i += 1) {
    assert.equal(h.isTopicUnlocked("pemula", i), true, `pemula topic ${i} should be open`);
    if (i < LESSONS.pemula.topics.length - 1) {
      assert.equal(h.isTopicUnlocked("pemula", i + 1), false, `pemula topic ${i + 1} should be locked`);
    }
    done.push(`pemula:${LESSONS.pemula.topics[i].id}`);
  }
  assert.equal(h.isLevelUnlocked("menengah"), true);
  assert.equal(h.isLevelUnlocked("mahir"), false);
  assert.equal(h.highestUnlockedLevel(), "menengah");
  assert.equal(h.firstIncompleteTopic("pemula").id, LESSONS.pemula.topics.at(-1).id);
  assert.equal(h.firstIncompleteTopic("menengah").id, "pendapat");

  for (let i = 0; i < LESSONS.menengah.topics.length; i += 1) {
    assert.equal(h.isTopicUnlocked("menengah", i), true, `menengah topic ${i} should be open`);
    done.push(`menengah:${LESSONS.menengah.topics[i].id}`);
  }
  assert.equal(h.isLevelUnlocked("mahir"), true);
  assert.equal(h.highestUnlockedLevel(), "mahir");
}

{
  const h = unlockHarness([42, {}, null, "pemula:belanja"], "mahir");
  assert.equal(h.isLevelUnlocked("mahir"), false);
  assert.equal(h.highestUnlockedLevel(), "pemula");
  assert.equal(h.isTopicUnlocked("pemula", 1), true);
}

{
  const h = unlockHarness(["pemula:belanja", "pemula:restoran"]);
  assert.equal(h.isTopicUnlocked("pemula", 1), true);
  assert.equal(h.isTopicUnlocked("pemula", 2), false);
  assert.equal(h.isTopicUnlocked("pemula", 3), true);
  assert.equal(h.isLevelUnlocked("menengah"), false);
}

{
  const raw = JSON.stringify({
    name: 42,
    level: "mahir",
    xp: "99",
    completedTopics: ["pemula:belanja", "junk", 7],
    preferences: [],
  });
  const storeStart = app.indexOf('    const STORAGE_KEY = "learn-english-progress-v1";');
  const storeEnd = app.indexOf("    let progress = progressStore.load();");
  assert.ok(storeStart >= 0 && storeEnd > storeStart, "progressStore block not found in index.html");
  const context = {
    localStorage: {
      getItem: (key) => (key === "learn-english-progress-v1" ? raw : null),
      setItem: () => {},
      removeItem: () => {},
    },
  };
  vm.createContext(context);
  vm.runInContext(`${app.slice(storeStart, storeEnd)}\nthis.__store = progressStore;`, context);
  const loaded = context.__store.load();
  assert.equal(loaded.name, "");
  assert.equal(loaded.level, "mahir");
  assert.equal(loaded.xp, 0);
  assert.deepEqual(Array.from(loaded.completedTopics), ["pemula:belanja"]);
  assert.deepEqual({ ...loaded.preferences }, {});
}

console.log("PASS: learning path behavioral contract");
