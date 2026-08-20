import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const repoRoot = process.cwd();
const fixturesRoot = path.join(repoRoot, "tests/document/fixtures");

const validatorPath = path.join(
  repoRoot,
  "src/document/validateDocument.ts"
);

const validatorModule = await import(pathToFileURL(validatorPath).href);
const { parseAndValidateDocument } = validatorModule;

const cases = [
  {
    file: "valid/minimal.typeset.json",
    valid: true,
  },
  {
    file: "valid/typical.typeset.json",
    valid: true,
  },
  {
    file: "invalid/malformed-json.typeset",
    valid: false,
    code: "INVALID_JSON",
  },
  {
    file: "invalid/missing-format.typeset.json",
    valid: false,
    code: "UNSUPPORTED_FORMAT",
  },
  {
    file: "invalid/unsupported-format.typeset.json",
    valid: false,
    code: "UNSUPPORTED_FORMAT",
  },
  {
    file: "invalid/missing-schema-version.typeset.json",
    valid: false,
    code: "MISSING_SCHEMA_VERSION",
  },
  {
    file: "invalid/unsupported-schema-version.typeset.json",
    valid: false,
    code: "UNSUPPORTED_SCHEMA_VERSION",
  },
  {
    file: "invalid/missing-document-metadata.typeset.json",
    valid: false,
    code: "INVALID_METADATA",
  },
  {
    file: "invalid/missing-editor-state.typeset.json",
    valid: false,
    code: "MISSING_EDITOR_STATE",
  },
  {
    file: "obsolete/ts-draft-v1.drft",
    valid: false,
    code: "OBSOLETE_FORMAT",
  },
];

let failed = 0;

for (const testCase of cases) {
  const fullPath = path.join(fixturesRoot, testCase.file);
  const text = fs.readFileSync(fullPath, "utf8");

  const result = parseAndValidateDocument(text);

  if (result.valid !== testCase.valid) {
    failed++;
    console.error(`❌ ${testCase.file}`);
    console.error(
      `   Expected valid=${testCase.valid}, received valid=${result.valid}`
    );
    continue;
  }

  if (
    !result.valid &&
    testCase.code &&
    result.code !== testCase.code
  ) {
    failed++;
    console.error(`❌ ${testCase.file}`);
    console.error(
      `   Expected code=${testCase.code}, received code=${result.code}`
    );
    continue;
  }

  console.log(`✅ ${testCase.file}`);
}

if (failed > 0) {
  console.error(`\nFAILED: ${failed} document fixture(s)`);
  process.exit(1);
}

console.log(`\nALL PASSED: ${cases.length} document fixture(s)`);