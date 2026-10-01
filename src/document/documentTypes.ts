export interface TypeSetDocumentMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface TypeSetDocumentV1 {
  format: "typeset-document";
  schemaVersion: 1;
  document: TypeSetDocumentMetadata;
  editorState: Record<string, unknown>;
}