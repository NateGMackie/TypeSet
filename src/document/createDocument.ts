import type { TypeSetDocumentV1 } from "./documentTypes";

function createEmptyEditorState(): Record<string, unknown> {
  return {
    root: {
      children: [],
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

export function createDocument(): TypeSetDocumentV1 {
  const now = new Date().toISOString();

  return {
    format: "typeset-document",
    schemaVersion: 1,
    document: {
      id: crypto.randomUUID(),
      title: "",
      createdAt: now,
      updatedAt: now,
    },
    editorState: createEmptyEditorState(),
  };
}