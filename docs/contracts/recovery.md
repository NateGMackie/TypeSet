# TypeSet Recovery Contract

**Version:** 1.0  
**Status:** Approved for Release 0

## Purpose

Recovery protects recent authoring work when a TypeSet editing session ends unexpectedly.

Recovery is an emergency safeguard. It is not a replacement for Save, revision history, or document versioning.

## Governing principle

> TypeSet may preserve temporary recovery data, but it must not silently overwrite an intentionally saved document.

## Release 0 scope

Release 0 retains one recovery snapshot for the current editing session.

The snapshot is stored in the browser and contains the latest recoverable TypeSet document state.

Release 0 does not provide:

- Multiple recovery checkpoints
- Recovery history
- Named revisions
- Cross-browser recovery
- Cross-device recovery
- Automatic updates to saved `.typeset` files

## Recovery snapshot

A recovery snapshot contains:

- A recovery-format version
- The capture timestamp
- A complete Version 1 TypeSet document

The TypeSet document within the snapshot contains serialized Lexical editor state as its authoritative content.

The recovery snapshot does not contain:

- Generated HTML
- A browser file handle
- A local filename
- The active editor view
- Published status

## Storage

Release 0 stores the latest recovery snapshot in browser `localStorage`.

Only one snapshot is retained. A newer valid snapshot replaces the previous snapshot.

Recovery data is local to the browser profile and TypeSet origin that created it.

## Capture behavior

TypeSet schedules a recovery snapshot after the editor content changes.

The snapshot is written two seconds after the latest change. Additional changes restart that delay.

When possible, TypeSet also flushes pending recovery data when the page receives a `pagehide` event.

Recovery cannot guarantee preservation of changes made immediately before a browser crash, operating-system failure, or power loss.

## Startup behavior

When TypeSet starts and finds a recovery snapshot, it offers the author two explicit choices:

- **Restore** — Load the recovered TypeSet document into the editor.
- **Discard** — Delete the recovery snapshot and begin with a new document.

TypeSet does not silently restore or discard recovery data.

## Restore behavior

Before restoring content, TypeSet:

1. Parses the stored recovery record.
2. Validates the contained TypeSet document.
3. Parses the serialized Lexical editor state.
4. Replaces the current editor content only after those checks succeed.

A restored document retains its TypeSet document ID and metadata.

Because filenames and browser file handles are not recovery data, the next Save after recovery uses Save As.

Restoring does not immediately delete the snapshot. The snapshot remains available until the recovered document is saved successfully or deliberately discarded.

## Invalid recovery data

If recovery data is invalid, TypeSet:

- Reports that the recovery data cannot be restored.
- Does not replace the current editor content.
- Allows the author to discard the invalid recovery data.

Invalid recovery data is never treated as a valid TypeSet document.

## Successful Save

After TypeSet successfully saves the current `.typeset` document, it deletes the corresponding recovery snapshot.

Changes made after that Save create a new recovery snapshot.

## New and Open

If the current session contains unsaved recovery data and the author chooses New or Open, TypeSet warns that unsaved changes will be discarded.

The author may:

- Cancel and return to the current document.
- Continue and discard the current recovery snapshot.

TypeSet clears the snapshot only after the author confirms the destructive transition.

## Relationship to other features

Recovery is separate from:

- **Save**, which intentionally writes a `.typeset` document.
- **Undo and redo**, which operate within the active editing session.
- **Revision history**, which preserves meaningful document versions.
- **Export and Publish**, which generate or deliver canonical HTML.

## Acceptance criteria

Release 0 recovery is complete when:

- Editor changes produce a valid recovery snapshot after the debounce period.
- Pending recovery is flushed on `pagehide` when possible.
- Only one latest snapshot is retained.
- Startup offers Restore or Discard when recovery exists.
- Restore preserves the document ID and editable Lexical content.
- Invalid recovery never replaces current editor content.
- Successful Save clears the recovery snapshot.
- Later edits create a new snapshot.
- New and Open warn before discarding unsaved recovery data.
- Recovery never automatically overwrites a `.typeset` file.