import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((m) => m[1]).at(-1);

for (const token of [
  'id="topic-toggle"', 'id="topic-sidebar"', 'id="topic-close"', 'id="topic-backdrop"',
  'aria-controls="topic-sidebar"', 'aria-expanded="false"', "fa-bars", "fa-xmark",
  "-translate-x-full", "md:translate-x-0", "md:static", "z-40", "z-50",
  "invisible", "md:visible",
  "// DRAWER_BEHAVIOR_START", "// DRAWER_BEHAVIOR_END",
  'byId("topic-toggle").addEventListener("click", openTopicDrawer)',
  'byId("topic-backdrop").addEventListener("click"',
  'document.addEventListener("keydown"',
]) {
  assert.ok(html.includes(token), `missing: ${token}`);
}
assert.equal((html.match(/id="topic-list"/g) || []).length, 1);
assert.doesNotMatch(html, /fetch\(/);

const start = app.indexOf("// DRAWER_BEHAVIOR_START");
const end = app.indexOf("// DRAWER_BEHAVIOR_END");
assert.ok(start >= 0 && end > start, "drawer behavior markers not found");
const drawerSource = app.slice(start, end);

function harness({ matches = true, legacyListener = false } = {}) {
  const bodyClasses = new Set();
  const sidebarClasses = new Set(["-translate-x-full", "invisible"]);
  const toggle = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, focus() { doc.activeElement = this; } };
  const close = { focus() { doc.activeElement = this; } };
  let focusables = [close];
  const backdrop = { hidden: true };
  const sidebar = {
    classList: { add: (c) => sidebarClasses.add(c), remove: (c) => sidebarClasses.delete(c) },
    querySelectorAll: () => focusables,
    contains: (element) => focusables.includes(element),
  };
  const doc = {
    activeElement: null,
    body: { classList: { add: (c) => bodyClasses.add(c), remove: (c) => bodyClasses.delete(c) } },
  };
  const media = { matches };
  const register = (cb) => { media.listener = cb; };
  if (legacyListener) media.addListener = register;
  else media.addEventListener = (_name, cb) => register(cb);
  const context = {
    window: {
      matchMedia: (query) => {
        assert.equal(query, "(max-width: 767px)");
        return media;
      },
    },
    document: doc,
    byId: (id) => ({
      "topic-toggle": toggle, "topic-sidebar": sidebar,
      "topic-backdrop": backdrop, "topic-close": close,
    })[id],
  };
  vm.createContext(context);
  vm.runInContext(
    `${drawerSource}\nthis.__drawer = { isMobileDrawer, openTopicDrawer, closeTopicDrawer, syncTopicDrawerBreakpoint, onTopicDrawerKeydown };`,
    context
  );
  return {
    ...context.__drawer,
    toggle,
    close,
    backdrop,
    sidebarClasses,
    bodyClasses,
    media,
    doc,
    setFocusables: (items) => { focusables = items; },
  };
}

{
  const h = harness();
  assert.equal(h.isMobileDrawer(), true);
  h.openTopicDrawer();
  assert.equal(h.backdrop.hidden, false);
  assert.ok(h.sidebarClasses.has("translate-x-0"));
  assert.ok(!h.sidebarClasses.has("-translate-x-full"));
  assert.ok(h.sidebarClasses.has("visible"), "open drawer must be visible");
  assert.ok(!h.sidebarClasses.has("invisible"), "open drawer must not stay invisible");
  assert.equal(h.toggle.attrs["aria-expanded"], "true");
  assert.ok(h.bodyClasses.has("overflow-hidden"));
  assert.equal(h.doc.activeElement, h.close);

  h.closeTopicDrawer();
  assert.equal(h.backdrop.hidden, true);
  assert.ok(h.sidebarClasses.has("-translate-x-full"));
  assert.ok(h.sidebarClasses.has("invisible"), "closed mobile drawer must leave the tab order");
  assert.ok(!h.sidebarClasses.has("visible"));
  assert.equal(h.toggle.attrs["aria-expanded"], "false");
  assert.ok(!h.bodyClasses.has("overflow-hidden"));
  assert.equal(h.doc.activeElement, h.toggle);
}
{
  const h = harness();
  h.openTopicDrawer();
  h.onTopicDrawerKeydown({ key: "Escape", preventDefault() {} });
  assert.equal(h.backdrop.hidden, true, "Esc must close drawer");
}
{
  const h = harness();
  h.openTopicDrawer();
  h.media.matches = false;
  h.media.listener({ matches: false });
  assert.equal(h.backdrop.hidden, true, "resize to md must close drawer");
  assert.equal(h.doc.activeElement, h.close, "resize reset must not move focus");
  assert.ok(!h.bodyClasses.has("overflow-hidden"));
}
{
  const h = harness({ matches: false });
  h.openTopicDrawer();
  assert.equal(h.backdrop.hidden, true, "openTopicDrawer must no-op on desktop");
}
{
  const h = harness({ legacyListener: true });
  h.openTopicDrawer();
  h.media.matches = false;
  h.media.listener({ matches: false });
  assert.equal(h.backdrop.hidden, true, "legacy addListener fallback must work");
}
{
  const h = harness();
  const first = { focus() { h.doc.activeElement = this; } };
  const last = { focus() { h.doc.activeElement = this; } };
  h.setFocusables([first, last]);
  h.doc.activeElement = last;
  h.onTopicDrawerKeydown({ key: "Tab", shiftKey: false, preventDefault() { this.prevented = true; } });
  assert.equal(h.doc.activeElement, first, "Tab from last must wrap to first");
  h.doc.activeElement = first;
  h.onTopicDrawerKeydown({ key: "Tab", shiftKey: true, preventDefault() {} });
  assert.equal(h.doc.activeElement, last, "Shift+Tab from first must wrap to last");
}
{
  const h = harness();
  const first = { focus() { h.doc.activeElement = this; } };
  const last = { focus() { h.doc.activeElement = this; } };
  h.setFocusables([first, last]);
  const outside = { focus() { h.doc.activeElement = this; } };
  h.doc.activeElement = outside;
  const tabEvent = { key: "Tab", shiftKey: false, prevented: false, preventDefault() { this.prevented = true; } };
  h.onTopicDrawerKeydown(tabEvent);
  assert.equal(h.doc.activeElement, first, "Tab from outside must re-enter drawer at first focusable");
  assert.equal(tabEvent.prevented, true, "Tab from outside must be intercepted");
  h.doc.activeElement = outside;
  const shiftTabEvent = { key: "Tab", shiftKey: true, prevented: false, preventDefault() { this.prevented = true; } };
  h.onTopicDrawerKeydown(shiftTabEvent);
  assert.equal(h.doc.activeElement, last, "Shift+Tab from outside must re-enter drawer at last focusable");
  assert.equal(shiftTabEvent.prevented, true, "Shift+Tab from outside must be intercepted");
}
{
  const clickHandler = app.slice(app.indexOf('button.addEventListener("click", () => {'), app.indexOf("container.append(button);"));
  assert.ok(clickHandler.indexOf("if (!unlocked) return;") < clickHandler.indexOf("closeTopicDrawer()"),
    "locked topic must return before drawer close");
  assert.ok(clickHandler.includes("renderLesson();"), "topic selection must still render lesson");
  assert.ok(clickHandler.includes("if (isMobileDrawer()) closeTopicDrawer();"), "selected topic must close mobile drawer");
}

console.log("PASS: mobile drawer structural and behavioral contract");
