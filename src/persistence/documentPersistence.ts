import type { TypeSetDocumentV1 } from "../document/documentTypes";
import {
  parseAndValidateDocument,
  type DocumentValidationResult,
} from "../document/validateDocument";

export function serializeDocument(
  document: TypeSetDocumentV1
): string {
  return JSON.stringify(document, null, 2);
}

export function parseDocument(
  text: string
): DocumentValidationResult {
  return parseAndValidateDocument(text);
}