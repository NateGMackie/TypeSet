import type { TypeSetDocumentV1 } from "../document/documentTypes";
import { validateDocument } from "../document/validateDocument";

export const RECOVERY_STORAGE_KEY = "typeset:recovery:v1";

export interface RecoverySnapshotV1 {
  recoveryVersion: 1;
  capturedAt: string;
  document: TypeSetDocumentV1;
}

export type RecoveryReadResult =
  | {
      status: "none";
    }
  | {
      status: "valid";
      snapshot: RecoverySnapshotV1;
    }
  | {
      status: "invalid";
      message: string;
    }
  | {
      status: "unavailable";
      message: string;
    };

export type RecoveryWriteResult =
  | {
      ok: true;
      snapshot: RecoverySnapshotV1;
    }
  | {
      ok: false;
      message: string;
    };

export type RecoveryClearResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveStorage(storage?: Storage): Storage | null {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createRecoverySnapshot(
  document: TypeSetDocumentV1,
  capturedAt = new Date().toISOString()
): RecoverySnapshotV1 {
  return {
    recoveryVersion: 1,
    capturedAt,
    document,
  };
}

export function serializeRecoverySnapshot(
  snapshot: RecoverySnapshotV1
): string {
  return JSON.stringify(snapshot);
}

export function parseRecoverySnapshot(text: string): RecoveryReadResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      status: "invalid",
      message: "The recovery snapshot is not valid JSON.",
    };
  }

  if (!isRecord(parsed)) {
    return {
      status: "invalid",
      message: "The recovery snapshot has an invalid structure.",
    };
  }

  if (parsed.recoveryVersion !== 1) {
    return {
      status: "invalid",
      message: `The recovery snapshot uses an unsupported version: ${String(
        parsed.recoveryVersion
      )}.`,
    };
  }

  if (
    typeof parsed.capturedAt !== "string" ||
    Number.isNaN(Date.parse(parsed.capturedAt))
  ) {
    return {
      status: "invalid",
      message: "The recovery snapshot has an invalid capture timestamp.",
    };
  }

  const documentResult = validateDocument(parsed.document);

  if (!documentResult.valid) {
    return {
      status: "invalid",
      message: `The recovered TypeSet document is invalid. ${documentResult.message}`,
    };
  }

  return {
    status: "valid",
    snapshot: {
      recoveryVersion: 1,
      capturedAt: parsed.capturedAt,
      document: documentResult.document,
    },
  };
}

export function writeRecoverySnapshot(
  document: TypeSetDocumentV1,
  storage?: Storage
): RecoveryWriteResult {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage) {
    return {
      ok: false,
      message: "Browser recovery storage is unavailable.",
    };
  }

  const snapshot = createRecoverySnapshot(document);

  try {
    resolvedStorage.setItem(
      RECOVERY_STORAGE_KEY,
      serializeRecoverySnapshot(snapshot)
    );

    return {
      ok: true,
      snapshot,
    };
  } catch {
    return {
      ok: false,
      message: "TypeSet could not write the recovery snapshot.",
    };
  }
}

export function readRecoverySnapshot(
  storage?: Storage
): RecoveryReadResult {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage) {
    return {
      status: "unavailable",
      message: "Browser recovery storage is unavailable.",
    };
  }

  let text: string | null;

  try {
    text = resolvedStorage.getItem(RECOVERY_STORAGE_KEY);
  } catch {
    return {
      status: "unavailable",
      message: "TypeSet could not read browser recovery storage.",
    };
  }

  if (text === null) {
    return {
      status: "none",
    };
  }

  return parseRecoverySnapshot(text);
}

export function clearRecoverySnapshot(
  storage?: Storage
): RecoveryClearResult {
  const resolvedStorage = resolveStorage(storage);

  if (!resolvedStorage) {
    return {
      ok: false,
      message: "Browser recovery storage is unavailable.",
    };
  }

  try {
    resolvedStorage.removeItem(RECOVERY_STORAGE_KEY);

    return {
      ok: true,
    };
  } catch {
    return {
      ok: false,
      message: "TypeSet could not clear the recovery snapshot.",
    };
  }
}