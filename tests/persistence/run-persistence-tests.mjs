import path from "node:path";
import process from "node:process";
import { webcrypto } from "node:crypto";
import { pathToFileURL } from "node:url";

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

const repoRoot = process.cwd();

const creatorPath = path.join(
  repoRoot,
  "src/document/createDocument.ts"
);

const persistencePath = path.join(
  repoRoot,
  "src/persistence/documentPersistence.ts"
);

const creatorModule = await import(pathToFileURL(creatorPath).href);
const persistenceModule = await import(pathToFileURL(persistencePath).href);

const { createDocument } = creatorModule;
const { serializeDocument, parseDocument } = persistenceModule;

let failed = 0;

function check(name, pass) {
  if (!pass) {
    failed++;
    console.error(`❌ ${name}`);
    return;
  }

  console.log(`✅ ${name}`);
}

const original = createDocument();
const serialized = serializeDocument(original);
const parsed = parseDocument(serialized);

check(
  "serialized document is JSON text",
  typeof serialized === "string" && serialized.length > 0
);

check(
  "serialized document parses successfully",
  parsed.valid
);

if (parsed.valid) {
  check(
    "document ID survives round trip",
    parsed.document.document.id === original.document.id
  );

  check(
    "document metadata survives round trip",
    parsed.document.document.title === original.document.title &&
      parsed.document.document.createdAt === original.document.createdAt &&
      parsed.document.document.updatedAt === original.document.updatedAt
  );

  check(
    "editor state survives round trip",
    JSON.stringify(parsed.document.editorState) ===
      JSON.stringify(original.editorState)
  );

  check(
    "round trip does not add generated HTML",
    !("html" in parsed.document) &&
      !("cleanHtml" in parsed.document) &&
      !("cleanHTML" in parsed.document)
  );

  check(
    "round trip does not add filename",
    !("filename" in parsed.document) &&
      !("currentDraftFilename" in parsed.document)
  );

  check(
    "round trip does not add active view",
    !("activeView" in parsed.document)
  );

  check(
    "round trip does not add obsolete draft fields",
    !("schema" in parsed.document) &&
      !("state" in parsed.document) &&
      !("currentDraftId" in parsed.document)
  );
}

const malformed = parseDocument("{not valid json");

check(
  "malformed JSON is rejected",
  !malformed.valid && malformed.code === "INVALID_JSON"
);

if (failed > 0) {
  console.error(`\nFAILED: ${failed} persistence test(s)`);
  process.exit(1);
}

console.log("\nALL PASSED: persistence tests");