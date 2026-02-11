# Stage 8.6 — Authoring Quality & Workflow Polish  
**SES: Execution Specification**

## Purpose

Improve day-to-day authoring usability of the WYSIWYG editor **without changing the export contract or core data model**.

This stage focuses on **UX friction reduction**, not new semantic features.

---

## Guiding Constraints (Do Not Violate)

1. **Export Contract is immutable**
   - No new HTML tags
   - No new classes
   - No changes to existing semantics

2. **No automatic content inference**
   - No auto-formatting based on typing patterns
   - No implicit transformations

3. **Insertion > Transformation**
   - New actions insert new blocks by default
   - Wrapping or transforming existing content must be explicit

4. **Stability > Cleverness**
   - Prefer predictable behavior over “smart” behavior
   - Fail safely and visibly

---

## Scope Summary

### In scope
- Keyboard shortcuts
- Simplified callout insertion behavior
- Image support (authoring only)
- Visual editor padding
- Confirmation for destructive actions
- Optional editor reset / recovery

### Out of scope
- Slash menu / command palette
- Word image import
- Auto-formatting (e.g., `**bold**`)
- New semantic node types
- Major callout redesign

---

## Stage Breakdown

---

## 8.6.1 — Keyboard Shortcuts (Inline Formatting)

### Goal
Allow writers to apply inline semantic formatting without using the toolbar.

### Supported actions
- Bold (existing)
- Italic (existing)
- User Input
- Variable

### Behavioral rules
- If text is selected → apply formatting to selection
- If caret is collapsed → insert empty formatted span and place caret inside
- No auto-wrapping of surrounding text
- No block-level effects

### Constraints
- Must use explicit keyboard combinations
- Must not conflict with native browser or Lexical defaults

---

## 8.6.2 — Keyboard Shortcuts (Block-Level Formatting)

### Goal
Reduce dependence on the block-type dropdown during writing.

### Supported actions
- Insert callout (note, example, warning)
- Insert ordered list
- Insert unordered list

### Behavioral rules
- Default behavior is **insert new block**
- Wrapping existing content only occurs when:
  - Selection spans full blocks, AND
  - User explicitly invokes the shortcut
- No auto-conversion of paragraphs

---

## 8.6.3 — Callout Behavior Simplification

### Problem Statement
Current callout logic over-wraps content, especially inside lists.

### Required change
Simplify insertion behavior to reduce surprises.

### New baseline rules
- Collapsed caret:
  - Insert a new callout at the caret position
  - Never wrap an entire list implicitly
- Inside list item:
  - Insert callout **within the list item**, not around the list
- Multi-block selection:
  - Wrapping is allowed, but only when selection clearly spans blocks

### Explicit non-goals
- No new callout types
- No nested callouts
- No automatic restructuring

---

## 8.6.4 — Editor Bottom Buffer (Visual Only)

### Goal
Prevent text from appearing flush against the bottom edge of the viewport.

### Requirements
- Add visual spacing below the last block
- Must not create actual document content
- Must not export to HTML
- Must not affect cursor behavior or selection logic

---

## 8.6.5 — Image Support (Authoring MVP)

### Scope
Enable adding images while authoring documents.

### Supported actions
- Insert image into WYSIWYG editor
- Image stored in a predictable local or virtual folder
- Stable, clean `src` attribute

### HTML requirements
- Use `<img>`
- Allowed classes only:
  - `screenshot`
  - `icon`
- No inline styles
- No Word image import in this stage

### Explicit exclusions
- No resizing UI
- No captions
- No drag-and-drop optimization
- No Word image handling

---

## 8.6.6 — Destructive Action Confirmation

### Goal
Prevent accidental data loss.

### Actions requiring confirmation
- Creating a new document when unsaved changes exist
- Leaving HTML editor with unapplied changes

### Rules
- Confirmation only appears when real data loss is possible
- Do not prompt unnecessarily
- Confirmation messaging must be explicit and unambiguous

---

## 8.6.7 — Editor Reset / Recovery Hook (Optional)

### Goal
Allow recovery from editor state corruption without full page refresh.

### Requirements
- Reset Lexical editor state
- Reload last known good draft if available
- Must not automatically delete saved drafts

### Notes
- UI exposure is optional
- May initially exist as a hidden or developer-only control

---

## Completion Criteria for Stage 8.6

Stage 8.6 is complete when:

1. Inline and block keyboard shortcuts work predictably
2. Callout insertion no longer wraps unintended structures
3. Images can be inserted and exported cleanly
4. Long documents feel visually comfortable to edit
5. Destructive actions are guarded
6. Editor can be recovered without hard reload (if implemented)

---

## Instruction to Implementing AI

> Follow this specification exactly.  
> Do not add features, shortcuts, heuristics, or semantics not explicitly listed.  
> When behavior is ambiguous, prefer insertion over transformation and safety over convenience.
