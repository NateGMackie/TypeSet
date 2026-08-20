import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { webcrypto } from "node:crypto";
import { pathToFileURL } from "node:url";

const repoRoot = process.cwd();
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}
const fixturesRoot = path.join(repoRoot, "tests/document/fixtures");

const validatorPath = path.join(
  repoRoot,
  "src/document/validateDocument.ts"
);

const validatorModule = await import(pathToFileURL(validatorPath).href);
const { parseAndValidateDocument, validateDocument } = validatorModule;

const creatorPath = path.join(
  repoRoot,
  "src/document/createDocument.ts"
);

const creatorModule = await import(pathToFileURL(creatorPath).href);
const { createDocument } = creatorModule;

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

const createdDocument = createDocument();
const secondCreatedDocument = createDocument();

const creationChecks = [
  {
    name: "new document passes validation",
    pass: validateDocument(createdDocument).valid,
  },
  {
    name: "new document receives an ID",
    pass:
      typeof createdDocument.document.id === "string" &&
      createdDocument.document.id.length > 0,
  },
  {
    name: "new documents receive unique IDs",
    pass:
      createdDocument.document.id !==
      secondCreatedDocument.document.id,
  },
  {
    name: "createdAt is a valid timestamp",
    pass: !Number.isNaN(
      Date.parse(createdDocument.document.createdAt)
    ),
  },
  {
    name: "updatedAt is a valid timestamp",
    pass: !Number.isNaN(
      Date.parse(createdDocument.document.updatedAt)
    ),
  },
  {
    name: "new document starts with empty editor state",
    pass:
      createdDocument.editorState.root?.type === "root" &&
      Array.isArray(createdDocument.editorState.root?.children) &&
      createdDocument.editorState.root.children.length === 0,
  },
  {
    name: "new document does not persist generated HTML",
    pass:
      !("html" in createdDocument) &&
      !("cleanHtml" in createdDocument) &&
      !("cleanHTML" in createdDocument),
  },
  {
    name: "new document does not persist filename",
    pass:
      !("filename" in createdDocument) &&
      !("currentDraftFilename" in createdDocument),
  },
  {
    name: "new document does not persist active view",
    pass: !("activeView" in createdDocument),
  },
  {
    name: "new document contains no obsolete draft fields",
    pass:
      !("schema" in createdDocument) &&
      !("state" in createdDocument) &&
      !("currentDraftId" in createdDocument),
  },
];

for (const check of creationChecks) {
  if (!check.pass) {
    failed++;
    console.error(`❌ ${check.name}`);
    continue;
  }

  console.log(`✅ ${check.name}`);
}

if (failed > 0) {
  console.error(`\nFAILED: ${failed} document fixture(s)`);
  process.exit(1);
}

console.log(`\nALL PASSED: ${cases.length} document fixture(s)`);