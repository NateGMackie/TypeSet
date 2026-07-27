# TypeSet System Architecture

## Purpose

This document defines the high-level architecture of TypeSet and the responsibilities of its major subsystems.

TypeSet is a technical documentation authoring tool that produces clean, semantic HTML. The WYSIWYG editor is the primary authoring surface. Word and HTML import are input paths, and canonical HTML is a generated publishing format rather than the internal document model.

This document governs subsystem boundaries and data flow. More detailed rules belong in the linked architecture, contract, and specification documents.

## Architectural principles

1. TypeSet owns the document format.
2. Serialized Lexical editor state is the authoritative editable content inside a TypeSet document.
3. Lexical owns the interactive editing model, selection, commands, and in-session history.
4. Canonical HTML is generated from the document state and is not a second source of truth.
5. Imported content is normalized into supported TypeSet structures before it becomes authoritative document content.
6. Unsupported or invalid structures must be rejected, removed, or normalized deliberately rather than preserved accidentally.
7. Product behavior should be defined by architecture, contracts, and specifications rather than inferred from incidental implementation details.

## System context

```text
Word content ─────┐
                  │
External HTML ────┼──> Import adapters ──> Normalization and validation
                  │                              │
Future formats ───┘                              ▼
                                      TypeSet document state
                                                │
                                                ▼
                                         Lexical editor
                                                │
                         ┌──────────────────────┼──────────────────────┐
                         ▼                      ▼                      ▼
                  Manual save          Canonical HTML export   Recovery snapshots
                         │                      │                      │
                         ▼                      ▼                      ▼
                  TypeSet JSON file      ServiceNow or other     Local recovery
                                         publishing targets       storage
```

## Major subsystems

### Application shell

The application shell owns the overall user interface and coordinates the editor, HTML view, file operations, import, export, and application-level state.

It does not define document semantics. It delegates those responsibilities to the document model, Lexical nodes, import pipeline, export pipeline, and validation rules.

### TypeSet document

A TypeSet document is a versioned JSON envelope owned by TypeSet.

It contains:

- a schema version;
- document metadata;
- authoritative serialized Lexical editor state;
- optional persistence and recovery metadata.

The document does not store canonical HTML as independently authoritative content. HTML is generated when needed through the export pipeline.

See `document-model.md` and `persistence.md`.

### Lexical editor

Lexical is the interactive editing engine.

It owns:

- the live editor tree;
- selections;
- editor commands;
- node transforms;
- in-session undo and redo;
- interactive editing behavior.

TypeSet owns the node set, semantic restrictions, import/export mappings, normalization rules, and product-specific behavior layered on top of Lexical.

See `lexical-architecture.md` and `editor-content-model.md`.

### Import subsystem

The import subsystem accepts external representations and converts them into supported TypeSet content.

Its responsibilities include:

- parsing source content;
- removing source-specific noise;
- recognizing supported semantic structures;
- normalizing invalid or unsupported structures;
- creating supported Lexical nodes;
- reporting meaningful changes or losses.

Word paste and HTML Apply are separate entry paths but must converge on the same supported content model.

See `import-export-architecture.md`.

### Export subsystem

The export subsystem converts the authoritative Lexical state into canonical HTML.

Its responsibilities include:

- mapping supported nodes to contract-compliant HTML;
- enforcing required structure;
- omitting editor-only data;
- validating output against the export contract;
- formatting output consistently.

The export contract, not Lexical's default HTML representation, defines the final HTML.

See `import-export-architecture.md` and `../contracts/export-contract.md`.

### Validation and normalization

Validation determines whether content conforms to TypeSet's supported model and output contract.

Normalization repairs or converts content where a deterministic, safe result is defined. Validation must not silently invent meaning where the correct transformation is ambiguous.

Validation may occur:

- during import;
- after HTML Apply;
- during editor transforms;
- before save;
- during export;
- when opening a saved document.

### Persistence subsystem

The persistence subsystem serializes and restores TypeSet documents.

Current behavior is manual save to a local file. Future persistence capabilities may include local recovery snapshots, durable revisions, and repository-backed version history.

Persistence is separate from publishing. Saving a TypeSet document preserves editable state; exporting generates canonical HTML.

See `persistence.md`.

### Publishing targets

ServiceNow is the current primary publishing target, but it is not part of TypeSet's internal document model.

Publishing targets consume canonical HTML. Target-specific delivery mechanisms may be added later without changing the authoritative document representation.

## Sources of truth

| Concern | Governing source |
|---|---|
| Product direction | Product Principles |
| Saved editable document | TypeSet JSON document containing serialized Lexical state |
| Live editing state | Lexical editor state |
| Supported semantic structures | Editor Content Model |
| Canonical HTML | Export Contract |
| Feature interaction behavior | Feature specifications |
| Current implementation | Source code and tests |

When these disagree, the governing architecture or contract should be resolved explicitly and the implementation updated. The code should not silently redefine the intended product model.

## Primary data flows

### Authoring

```text
Open TypeSet document
        ↓
Validate schema version
        ↓
Restore serialized Lexical state
        ↓
Edit in Lexical
        ↓
Serialize updated editor state
        ↓
Manual save or future recovery snapshot
```

### Word or external HTML import

```text
External content
        ↓
Parse source representation
        ↓
Scrub source-specific noise
        ↓
Prepare and normalize supported structures
        ↓
Create Lexical editor state
        ↓
Validate resulting TypeSet content
```

### HTML Apply

```text
User-edited HTML
        ↓
Parse and validate
        ↓
Normalize to the supported contract
        ↓
Create replacement Lexical state
        ↓
Report changes, removals, or violations
```

HTML Apply is an import operation. It does not make HTML the source of truth.

### Export

```text
Authoritative Lexical state
        ↓
Generate canonical HTML
        ↓
Normalize and validate output
        ↓
Pretty-format output
        ↓
Copy, download, or publish
```

### Save

```text
Authoritative Lexical state
        ↓
Wrap in TypeSet document envelope
        ↓
Write versioned JSON file
```

## Architectural boundaries

### TypeSet versus Lexical

Lexical provides an editor framework. It does not define TypeSet's product semantics or canonical HTML contract.

TypeSet should work with Lexical's model rather than repeatedly forcing the editor to mirror HTML internally. Translation to canonical HTML belongs at the export boundary.

### Document state versus generated HTML

The document state is editable and authoritative. HTML is generated and disposable.

A failure to generate valid HTML is an export defect or contract violation; it must not be resolved by treating stale HTML as authoritative.

### Autosave versus recovery

Frequent local recovery snapshots are a future resilience feature. Automatic rewriting of a user-selected file is a separate capability. Cloud synchronization and cross-device history are larger product features and must not be implied by local autosave terminology.

### Undo versus revision history

Undo and redo are session-level editing functions. Durable revisions restore earlier document states across reloads. Repository-backed version history is a future capability distinct from both.

## Current and future state

The architecture documents describe the intended direction. Some capabilities are not yet implemented.

Current known behavior includes:

- Lexical-based WYSIWYG editing;
- Word and HTML cleanup/import paths;
- canonical HTML export;
- manual local file saving;
- session-level undo and redo.

Future capabilities include:

- a formal TypeSet JSON document envelope;
- schema-version validation;
- local recovery snapshots;
- durable document revisions;
- repository-backed version control;
- additional import and publishing targets.

Future capabilities must be implemented through roadmap stages and acceptance criteria. Their presence in this architecture does not indicate that they currently exist.

## Related documents

- `product-principles.md`
- `architecture/document-model.md`
- `architecture/editor-content-model.md`
- `architecture/lexical-architecture.md`
- `architecture/import-export-architecture.md`
- `architecture/persistence.md`
- `contracts/export-contract.md`
- feature specifications under `specifications/`
