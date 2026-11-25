import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(
  new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
  "utf8"
);

assert.match(
  workflow,
  /^\s+actions: read\s*$/m,
  "workflow needs actions: read to poll artifact metadata"
);

const uploadIndex = workflow.indexOf("name: Upload artifact");
const waitIndex = workflow.indexOf("name: Wait for artifact metadata");
const deployIndex = workflow.indexOf("name: Deploy\n");
assert.ok(
  uploadIndex >= 0 && waitIndex > uploadIndex && deployIndex > waitIndex,
  "wait step must sit between upload and deploy"
);

const waitStep = workflow.slice(waitIndex, deployIndex);
assert.match(waitStep, /gh api/, "wait step must query the artifact API");
assert.match(waitStep, /sleep/, "wait step must retry with a delay");

assert.match(
  workflow,
  /name: Deploy[\s\S]*?continue-on-error: true/,
  "Deploy step must allow a retry"
);
assert.match(
  workflow,
  /name: Retry deploy[\s\S]*?steps\.deployment\.outcome == 'failure'/,
  "retry step must run only after a failed deploy"
);
assert.match(
  workflow,
  /steps\.deployment\.outputs\.page_url \|\| steps\.deployment_retry\.outputs\.page_url/,
  "environment url must use the successful deploy output"
);

console.log("PASS: deployment retry contract");
