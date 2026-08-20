import type { TypeSetDocumentV1 } from "./documentTypes";

export type DocumentValidationErrorCode =
  | "INVALID_JSON"
  | "UNSUPPORTED_FORMAT"
  | "MISSING_SCHEMA_VERSION"
  | "UNSUPPORTED_SCHEMA_VERSION"
  | "INVALID_METADATA"
  | "MISSING_EDITOR_STATE"
  | "INVALID_EDITOR_STATE"
  | "OBSOLETE_FORMAT";

export type DocumentValidationResult =
  | {
      valid: true;
      document: TypeSetDocumentV1;
    }
  | {
      valid: false;
      code: DocumentValidationErrorCode;
      message: string;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalid(
  code: DocumentValidationErrorCode,
  message: string
): DocumentValidationResult {
  return {
    valid: false,
    code,
    message,
  };
}

export function validateDocument(input: unknown): DocumentValidationResult {
  if (!isRecord(input)) {
    return invalid("UNSUPPORTED_FORMAT", "The selected file is not a TypeSet document.");
  }

  if (input.schema === "ts-draft" || input.schema === "w2h-draft") {
    return invalid(
      "OBSOLETE_FORMAT",
      "This file uses an obsolete TypeSet draft format and cannot be opened."
    );
  }

  if (input.format !== "typeset-document") {
    return invalid(
      "UNSUPPORTED_FORMAT",
      "The selected file is not a TypeSet document."
    );
  }

  if (!("schemaVersion" in input)) {
    return invalid(
      "MISSING_SCHEMA_VERSION",
      "The document is missing its schema version."
    );
  }

  if (input.schemaVersion !== 1) {
    return invalid(
      "UNSUPPORTED_SCHEMA_VERSION",
      `This document uses an unsupported schema version: ${String(
        input.schemaVersion
      )}.`
    );
  }

  if (!isRecord(input.document)) {
    return invalid(
      "INVALID_METADATA",
      "The document metadata is missing or invalid."
    );
  }

  const metadata = input.document;

  if (
    typeof metadata.id !== "string" ||
    typeof metadata.title !== "string" ||
    typeof metadata.createdAt !== "string" ||
    typeof metadata.updatedAt !== "string"
  ) {
    return invalid(
      "INVALID_METADATA",
      "The document metadata is missing or invalid."
    );
  }

  if (!("editorState" in input)) {
    return invalid(
      "MISSING_EDITOR_STATE",
      "The document is missing its editor state."
    );
  }

  if (!isRecord(input.editorState)) {
    return invalid(
      "INVALID_EDITOR_STATE",
      "The document editor state is invalid."
    );
  }

  const root = input.editorState.root;

  if (
    !isRecord(root) ||
    root.type !== "root" ||
    !Array.isArray(root.children)
  ) {
    return invalid(
      "INVALID_EDITOR_STATE",
      "The document editor state is invalid."
    );
  }

  return {
    valid: true,
    document: input as unknown as TypeSetDocumentV1,
  };
}

export function parseAndValidateDocument(
  text: string
): DocumentValidationResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return invalid("INVALID_JSON", "The selected file is not valid JSON.");
  }

  return validateDocument(parsed);
}