import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(
  new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
  "utf8"
);

// deploy-pages@v4 lists artifacts via the Twirp artifact service, not the REST
// API. Polling REST gives false confidence, so the mitigation is delayed
// retries of the Deploy action itself.
assert.doesNotMatch(
  workflow,
  /name: Wait for artifact metadata/,
  "REST artifact polling targets a different backend than deploy-pages"
);

for (const [name, id] of [
  ["name: Deploy (attempt 1)", "id: deploy_1"],
  ["name: Deploy (attempt 2)", "id: deploy_2"],
  ["name: Deploy (attempt 3)", "id: deploy_3"],
]) {
  assert.ok(workflow.includes(name), `missing step: ${name}`);
  assert.ok(workflow.includes(id), `missing id: ${id}`);
}

assert.equal(
  (workflow.match(/continue-on-error: true/g) || []).length,
  3,
  "every Deploy attempt must allow a later retry"
);
assert.match(workflow, /name: Wait before retry 1[\s\S]*?sleep 15/);
assert.match(workflow, /name: Wait before retry 2[\s\S]*?sleep 30/);
assert.match(
  workflow,
  /steps\.deploy_1\.outputs\.page_url \|\| steps\.deploy_2\.outputs\.page_url \|\| steps\.deploy_3\.outputs\.page_url/,
  "environment url must use the first successful deploy output"
);
assert.match(workflow, /name: Fail if all deploys failed/);

console.log("PASS: deployment retry contract");
