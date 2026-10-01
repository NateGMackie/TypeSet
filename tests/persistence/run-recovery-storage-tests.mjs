import { webcrypto } from "node:crypto";
import { createDocument } from "../../src/document/createDocument.ts";
import {
  RECOVERY_STORAGE_KEY,
  clearRecoverySnapshot,
  createRecoverySnapshot,
  parseRecoverySnapshot,
  readRecoverySnapshot,
  serializeRecoverySnapshot,
  writeRecoverySnapshot,
} from "../../src/persistence/recoveryStorage.ts";
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

let failures = 0;

function test(name, assertion) {
  try {
    assertion();
    console.log(`✅ ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`❌ ${name}`);
    console.error(error);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function createMemoryStorage() {
  const values = new Map();

  return {
    get length() {
      return values.size;
    },

    clear() {
      values.clear();
    },

    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },

    key(index) {
      return Array.from(values.keys())[index] ?? null;
    },

    removeItem(key) {
      values.delete(key);
    },

    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

test("recovery snapshot serializes and parses", () => {
  const document = createDocument();
  const snapshot = createRecoverySnapshot(document);
  const result = parseRecoverySnapshot(
    serializeRecoverySnapshot(snapshot)
  );

  assert(result.status === "valid", "Expected a valid recovery snapshot.");
});

test("recovery snapshot preserves document identity", () => {
  const document = createDocument();
  const snapshot = createRecoverySnapshot(document);
  const result = parseRecoverySnapshot(
    serializeRecoverySnapshot(snapshot)
  );

  assert(result.status === "valid", "Expected a valid recovery snapshot.");

  if (result.status === "valid") {
    assert(
      result.snapshot.document.document.id === document.document.id,
      "Expected the document ID to survive recovery serialization."
    );
  }
});

test("malformed recovery JSON is rejected", () => {
  const result = parseRecoverySnapshot("{");

  assert(result.status === "invalid", "Expected malformed JSON to be rejected.");
});

test("unsupported recovery version is rejected", () => {
  const document = createDocument();
  const text = JSON.stringify({
    recoveryVersion: 2,
    capturedAt: new Date().toISOString(),
    document,
  });

  const result = parseRecoverySnapshot(text);

  assert(
    result.status === "invalid",
    "Expected an unsupported recovery version to be rejected."
  );
});

test("invalid recovered document is rejected", () => {
  const text = JSON.stringify({
    recoveryVersion: 1,
    capturedAt: new Date().toISOString(),
    document: {
      format: "not-a-typeset-document",
    },
  });

  const result = parseRecoverySnapshot(text);

  assert(
    result.status === "invalid",
    "Expected an invalid TypeSet document to be rejected."
  );
});

test("new recovery snapshot replaces the previous snapshot", () => {
  const storage = createMemoryStorage();
  const firstDocument = createDocument();
  const secondDocument = createDocument();

  writeRecoverySnapshot(firstDocument, storage);
  writeRecoverySnapshot(secondDocument, storage);

  assert(storage.length === 1, "Expected only one recovery entry.");

  const result = readRecoverySnapshot(storage);

  assert(result.status === "valid", "Expected a valid stored snapshot.");

  if (result.status === "valid") {
    assert(
      result.snapshot.document.document.id === secondDocument.document.id,
      "Expected the latest snapshot to replace the previous snapshot."
    );
  }
});

test("stored recovery snapshot can be cleared", () => {
  const storage = createMemoryStorage();
  writeRecoverySnapshot(createDocument(), storage);

  const clearResult = clearRecoverySnapshot(storage);
  const readResult = readRecoverySnapshot(storage);

  assert(clearResult.ok, "Expected recovery clearing to succeed.");
  assert(readResult.status === "none", "Expected no recovery after clearing.");
});

test("invalid stored recovery is retained for explicit handling", () => {
  const storage = createMemoryStorage();
  storage.setItem(RECOVERY_STORAGE_KEY, "{");

  const result = readRecoverySnapshot(storage);

  assert(result.status === "invalid", "Expected invalid recovery to be reported.");
  assert(
    storage.getItem(RECOVERY_STORAGE_KEY) !== null,
    "Expected invalid recovery to remain until explicitly cleared."
  );
});

if (failures > 0) {
  console.error(`\nFAILED: ${failures} recovery storage test(s)`);
  process.exit(1);
}

console.log("\nALL PASSED: recovery storage tests");