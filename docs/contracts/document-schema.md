# TypeSet Document Schema

**Version:** 1.0\
**Status:** Proposed

> **Note:** This is the first draft of the contract created during
> Release 0 planning.

## Purpose

This document defines the Version 1 TypeSet document format.

A TypeSet document is the authoritative, editable representation of an
authored document. It preserves the information required to reopen and
continue editing the document in TypeSet.

## Governing Principle

> A TypeSet document preserves authoring state. It does not store
> published output as a second source of truth.

## File Format

-   Preferred extension: `.typeset`
-   Encoding: UTF-8
-   MIME type: `application/json`

## Document Envelope

``` json
{
  "format": "typeset-document",
  "schemaVersion": 1,
  "document": {
    "id": "uuid",
    "title": "",
    "createdAt": "ISO-8601 UTC",
    "updatedAt": "ISO-8601 UTC"
  },
  "editorState": {
    "...": "Serialized Lexical state"
  }
}
```

## Required Fields

-   `format` = `typeset-document`
-   `schemaVersion` = `1`
-   `document`
-   `editorState`

## Metadata

The `document` object contains:

-   `id`
-   `title`
-   `createdAt`
-   `updatedAt`

The ID survives Save, Save As, rename, export, and moves.

## Intentionally Excluded

Version 1 does **not** store:

-   Generated HTML
-   Active editor view
-   Local filename
-   File handles
-   Published status

## Save vs Export vs Publish

-   **Save** preserves the `.typeset` document.
-   **Export** generates canonical HTML.
-   **Publish** delivers exported content to readers.

Saving does **not** imply publishing.

## Validation

TypeSet validates:

1.  JSON
2.  Document format
3.  Schema version
4.  Metadata
5.  Editor state

Unsupported documents are rejected safely.

## Legacy Formats

The following formats are obsolete:

-   `w2h-draft`
-   `ts-draft`
-   `.drft`

Version 1 is not required to support them.

## Acceptance Criteria

-   `.typeset` is the preferred extension.
-   Serialized Lexical state is the single source of truth.
-   HTML is generated rather than stored.
-   Save, export, and publish are distinct concepts.
-   Legacy formats are rejected.