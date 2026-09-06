# **TypeSet consolidated roadmap**

**Prepared:** July 27, 2026\
**Updated:** August 20, 2026, reconciled against `feature` and Release 0
implementation work\
**Source:** Consolidated backlog, repository audit of `feature@e93b248`,
and TypeSet architecture/specification documents

**How to use this roadmap:** Sections 1--10 record the governing
direction, evidence, and detailed backlog. Section 11 contains
self-contained release briefs. When beginning a release in a new chat,
paste the applicable release brief from section 11; it includes enough
context to orient the work without reconstructing the entire project
history.

## **Reconciliation note --- August 20, 2026**

The saved copy and the repository roadmap had drifted slightly. The
repository copy still reflected parts of the original July 27 audit
baseline (including 34 export fixtures / seven Word failures and several
unchecked Release 0 setup tasks), while the saved copy already reflected
later observations such as 35 export fixtures / five Word baseline
failures. This consolidated copy uses the current `feature` work and the
verified Release 0 results as the status source, while preserving the
July 27 audit appendix as historical evidence.

## **Purpose**

This roadmap consolidates duplicate and overlapping ideas into a smaller
set of actionable work items. It separates:

-   **Product and architecture decisions** that guide the work\
-   **Current roadmap work** that can be planned and completed\
-   **Later opportunities** that should not distract from stabilization\
-   **Conflicts and open decisions** that require an explicit choice\
-   **Historical work** that appears complete or partially complete

## **Status legend**

  Status   Meaning
  -------- ------------------------------------------------
  ✅       Addressed or decision confirmed
  🟡       Started or partially addressed
  ⬜       Not started or planned for later
  ⚠️       Verified implementation/documentation conflict
  🔍       Status still requires verification
  ❓       Decision or conflict must be resolved
  ⏸️       Intentionally deferred

> The July 27 audit remains the historical baseline. Statuses in the
> roadmap sections have been updated through the August 20 Release 0
> work on `feature`. The audit appendix remains historical evidence and
> should not be read as the current implementation state.

------------------------------------------------------------------------

# **1. Product direction and governing decisions**

These are not ordinary backlog items. They define what TypeSet is and
provide a filter for everything else.

## **1.1 Product identity**

-   ✅ Treat TypeSet as a **technical documentation authoring tool that
    produces clean, semantic HTML**, not merely a Word-to-HTML cleaner.\
-   ✅ Make the WYSIWYG authoring experience the center of the product.\
-   ✅ Keep TypeSet specialized for technical-writing workflows rather
    than pursuing Microsoft Word parity.\
-   ✅ Favor semantic structure, predictable behavior, and workflow
    improvements over presentation-oriented formatting.\
-   ✅ Keep the interface intentional and relatively minimal.\
-   ✅ Use real authoring work to identify problems instead of
    attempting to anticipate every theoretical edge case.\
-   ✅ Create and maintain concise TypeSet product principles against
    which new features are evaluated.

## **1.2 Editor and export architecture**

-   ✅ Continue using Lexical as the editing engine.\
-   ✅ Treat Lexical state as the working source of truth while
    authoring in Prep Mode.\
-   ✅ Treat clean HTML as a compiled/exported artifact and a protected
    public contract.\
-   ✅ Allow Lexical to use its native document model; translate that
    model into canonical HTML during export.\
-   ✅ Use Lexical-native nodes and editing behavior whenever
    practical.\
-   ✅ Reserve custom behavior and custom nodes for genuine TypeSet
    semantics.\
-   ✅ Keep browser DOM mutations behind Lexical instead of returning to
    a direct `contenteditable` architecture.\
-   ✅ Keep HTML as an inspection, validation, export, and deliberate
    power-user surface---not a second live WYSIWYG editor.\
-   ✅ Use an explicit Apply/Update gate when importing HTML edits into
    Lexical.\
-   ✅ Maintain distinct responsibilities for:
    -   Word/source cleanup\
    -   Canonical HTML normalization\
    -   HTML-to-Lexical import\
    -   Lexical editing\
    -   Lexical-to-HTML export

## **1.3 Structured authoring model with separate import and export boundaries**

-   ✅ Treat Scrub Mode and Prep Mode as workflows over one document
    architecture, not as competing sources of truth.\
-   ✅ Adopt a **TypeSet-owned, versioned document JSON schema** as the
    intended persistent source of truth.\
-   ✅ Treat live Lexical editor state as the in-memory working
    representation during authoring.\
-   ✅ Treat canonical HTML as a derived interchange and publication
    artifact governed by the export contract.\
-   ✅ Treat Word and external HTML as temporary input material handled
    through import adapters.\
-   ⚠️ The audited implementation is still transitional:
    -   Drafts persist both `state.cleanHtml` and serialized Lexical
        state.\
    -   Draft restore loads HTML first and Lexical JSON second.\
    -   Live WYSIWYG changes regenerate `docState.cleanHTML`.\
    -   Copy, export, and publish read `docState.cleanHTML`.\
-   ✅ Define whether the TypeSet document schema wraps Lexical JSON or
    uses raw serialized Lexical state directly.\
-   ✅ Define schema versioning, migration, validation, and recovery
    rules.\
-   ✅ Define how deliberate raw-HTML edits are converted into
    structured document state.\
-   ⬜ Decide whether canonical HTML is retained in drafts as a cache,
    recovery artifact, or provenance record.

## **1.4 Engineering principles**

-   ✅ Make canonicalization deterministic and idempotent.\
-   ✅ Prevent editor-only markup, arbitrary classes, Word residue, and
    inline presentation styles from leaking into export.\
-   ✅ Prefer semantic HTML and external CSS over presentation HTML.\
-   ✅ Separate editor, import, export, toolbar, keyboard, callout, and
    command responsibilities.\
-   ✅ Keep architecture decisions in documentation rather than allowing
    implementation details to define the product.\
-   ✅ Use small, bounded implementation changes with explicit
    acceptance criteria.\
-   ✅ Preserve existing architecture while allowing focused internal
    refactoring.\
-   ⬜ Version the export contract when a breaking output change is
    intentional.

## **1.5 Cross-cutting quality requirements**

These requirements apply to every release. A feature is not complete
merely because its primary behavior works.

-   ⬜ Prevent silent user-content loss across editing, Apply, import,
    export, save/open, migration, and recovery.\
-   ⬜ Preserve undo/redo, selection, focus, clipboard behavior, and
    dirty-state tracking unless an approved specification intentionally
    changes them.\
-   ⬜ Keep authoring workflows operable by keyboard and maintain
    visible focus, logical tab order, and accessible control names.\
-   ⬜ Ensure callouts, validation states, and other meaning do not
    depend on color or icons alone.\
-   ⬜ Require meaningful alternative text or an explicit
    decorative-image choice for published images.\
-   ⬜ Keep import, migration, canonicalization, and export
    deterministic and covered by regression tests.\
-   ⬜ Maintain recovery compatibility for supported existing drafts.\
-   ⬜ Test representative document sizes and investigate meaningful
    performance regressions.\
-   ⬜ Update governing documentation, tests, and migration behavior
    with every contract or schema change.\
-   ⬜ Include applicable accessibility, security, compatibility, and
    performance checks in each release exit review.

## **1.6 Language and type-safety strategy**

-   ✅ Adopt TypeScript incrementally rather than performing a
    repository-wide rewrite.\
-   ✅ Establish TypeScript during Release 0 so the new architectural
    boundaries begin with explicit types.\
-   ✅ Use TypeScript first for the TypeSet document schema, versioned
    document envelope, validation/migrations, persistence boundary,
    shared semantic commands, and import/export contract boundaries.\
-   ✅ Allow existing JavaScript to coexist temporarily while files are
    migrated as part of bounded architectural work.\
-   ✅ Add a strict `tsconfig.json`, type-check command, and CI
    type-check gate.\
-   🟡 Define TypeScript/JavaScript interoperation by using strict
    TypeScript for new architectural-boundary code while allowing
    existing JavaScript to coexist; broader `.ts`/`.tsx` conventions can
    be documented when needed.\
-   🟡 Add runtime validation at file/import boundaries; document-file
    validation is implemented, while HTML/import boundary validation
    remains broader Release 0 work.\
-   ⬜ Convert existing files when their responsibility is split,
    relocated, or materially changed.\
-   ⬜ Track remaining JavaScript intentionally without making complete
    conversion a Release 0 exit criterion.

**Rationale:** TypeScript will reduce ambiguity where TypeSet most needs
precision: versioned documents, Lexical serialization, migrations,
commands, and import/export transformations. An all-at-once conversion
would create a large, noisy change and delay the architectural baseline
without independently improving behavior.

------------------------------------------------------------------------

# **2. Immediate stabilization roadmap**

This is the recommended active roadmap. The order reflects dependency
and risk rather than excitement.

## **2.1 Release 0 --- Establish the verified architectural baseline**

**Priority:** Immediate architectural prerequisite\
**Status:** 🟡 Release 0 foundation underway; repository baseline,
document foundation, and persistence boundary complete
**Outcome:** The repository, document model, contracts, and tests agree
before structural editor changes begin.

-   ✅ Audit the repository and documentation against the architecture
    and export contract.\
-   ✅ Record the audited identity: `feature@e93b248`.\
-   ✅ Trace the current Word import, canonicalization, HTML-to-Lexical,
    Lexical export, draft, Apply, and publishing paths.\
-   ✅ Classify the current architecture as
    dual-representation/transitional rather than JSON-first.\
-   ✅ Establish the known test baseline:
    -   35 export-sanitizer fixtures pass.\
    -   5 Word import baseline failures
        -   1 runtime exception\
        -   3 semantic wrapper mismatches\
        -   1 malformed HTML recovery mismatch\
-   ⚠️ Recognize that the export fixtures test the sanitizer directly,
    not the full Lexical-to-HTML pipeline.\
-   ⚠️ Recognize that the final export gate does not validate the full
    export contract.\
-   ✅ Remove the previously tracked `node_modules` dependency tree
    while retaining `package-lock.json`.\
-   ✅ Approve and document the TypeSet-owned Version 1 document schema
    in `docs/contracts/document-schema.md`.\
-   🟡 Define validation and recovery behavior. Runtime document
    validation is implemented. Legacy `.drft` migration was explicitly
    rejected as unnecessary; recovery behavior for supported `.typeset`
    documents remains.\
-   ✅ Remove tracked dependencies while retaining `package-lock.json`.\
-   ✅ Establish clean `npm ci`, type-check, test, and build execution
    in CI.\
-   ✅ Add one standard npm test command that runs document, persistence,
and export golden suites.\
-   ✅ Establish incremental TypeScript with strict type checking and a
    CI type-check gate.\
-   ✅ Implement new document and boundary modules in TypeScript.
    `documentTypes.ts`, `validateDocument.ts`, `createDocument.ts`,
    `documentPersistence.ts`, and `browserDocumentFile.ts` are in place.
    Save/Open now operates through the Version 1 TypeSet document
    boundary. Legacy draft migration is not required.\
-   ⬜ Record the seven Word-suite failures as explicit baseline
    defects, then fix them deliberately.\
-   ⬜ Add initial Lexical import/export, round-trip, draft, and
    view-transition tests.\
-   ⬜ Create representative golden fixtures from real TypeSet
    documents.\
-   ⬜ Create a structural regression matrix covering import, editing,
    export, Apply, draft restore, and view switching.\
-   🟡 Reorganize tests around architectural boundaries instead of the
sanitizer. tests/document/, tests/persistence/,
tests/import/html/, tests/import/word/, and tests/export/html/
are established; editor and integration coverage remain:
    -   `tests/document/`\
    -   `tests/editor/`\
    -   `tests/import/word/`\
    -   `tests/export/html/`\
    -   `tests/persistence/`\
    -   `tests/integration/`\
    -   `tests/fixtures/`\
-   ✅ Move export fixtures to `tests/export/html/fixtures/`.\
-   ✅ Move Word-import fixtures to `tests/import/word/fixtures/`.\
-   ✅ Stop tracking generated `.actual.html` fixture output as ordinary
    source files.\
-   ✅ Remove `.DS_Store` files and prevent them from returning.\
-   ✅ Decide that generated `dist/` does not belong in source control
    and stop tracking it.\
-   ✅ Relocate the representative `world` HTML source to
    `tests/import/html/fixtures/world-source.html`.\
-   ⬜ Define the initially supported browsers and operating systems,
    including file, clipboard, download, and persistence fallbacks.\
-   ⬜ Establish an import/export content-safety contract and
    adversarial fixtures for scripts, event handlers, unsafe URLs, and
    unsafe restored draft content.\
-   ⬜ Create representative small, typical, and large document fixtures
    and record baseline timings for open, import, typing responsiveness,
    view switching, save, and export.\
-   ⬜ Establish application, document-schema, and export-contract
    versioning; add a changelog and release checklist.\
-   ⬜ Define the minimum Editor Behavior Contract for undo/redo,
    clipboard behavior, selection/focus, dirty state, unsaved-change
    warnings, and native Lexical behaviors TypeSet promises to preserve.

**Release 0 checkpoint A2.1** - node_modules no longer tracked -
package-lock.json retained - clean npm ci succeeds - build result
recorded - export-suite result recorded - Word-suite baseline recorded

### **Release 0 working notes --- August 20, 2026**

> **Scope guardrails**
>
> -   Release 0 retires the historical `w2h` identity from the new
>     document architecture.
> -   The new saved-document identity is TypeSet-owned: format
>     `typeset-document`, schema version `1`, preferred extension
>     `.typeset`.
> -   Serialized Lexical editor state is the authoritative persisted
>     content. Generated HTML is derived and is not stored in the
>     Version 1 document.
> -   `activeView`, local filename, and historical `cleanHTML` state are
>     not document data.
> -   Save and export are distinct operations. Saving preserves the
>     editable TypeSet document; exporting generates a publishable
>     artifact. "Published" should not be equated with merely saving a
>     document.
> -   Existing `.drft` files are relics and are intentionally
>     unsupported. Do not add migration work to Release 0. If conversion
>     is ever needed, treat it as a separate utility.
> -   Do not fix the known Word-import baseline defects incidentally
>     while working on the document boundary.
> -   Keep changes bounded: document creation → persistence boundary →
>     Save/Open integration → recovery.
> -   Terminology cleanup is needed later: retire internal/user-facing
>     `w2h`, reconsider `cleanHTML`, and replace "WYSIWYG" with a
>     purposeful editor name. Do not turn that terminology work into a
>     UI redesign during the current document-foundation unit.
> -   Word import and HTML-view prominence should be revisited after the
>     document architecture is stable; both currently carry more visual
>     weight than their intended boundary roles warrant.

## **Stage 2.1.B plan**

  | Unit | Purpose | Status | 
  |---|---|---| 
  | B1 | Define and approve document schema | ✅ Complete | 
  | B2 | Implement document creation and validation | 🟢 Complete — document creation and validation implemented and verified | 
  | B3 | Legacy draft handling | ✅ Decision complete — reject obsolete `.drft` formats; no migration | 
  | B4 | Implement save/open through the new document boundary | ✅ Complete — `.typeset` Save, Save As, and Open operate through the validated document and browser file-access boundaries | 
  | B5 | Add recovery behavior for supported TypeSet documents | ⬜ Not started | 
  | B6 | Add document and persistence tests | ✅ Complete — document validation, creation, and persistence round-trip coverage implemented and verified |
  
  -----------------------------------------------------------------------

## **2.2 Fix Lexical-to-HTML export**

**Priority:** Critical\
**Status:** 🟡 Started; broader structural cleanup remains

**Outcome:** Lexical export produces deterministic HTML that matches the
export contract without relying on accidental DOM structure.

-   🟡 Route Lexical output through a canonical export/normalization
    pipeline.\
-   🟡 Remove editor-only markup, inline styles, arbitrary classes, and
    unsupported attributes.\
-   ⚠️ Stop passing Lexical-generated output through Word/import cleanup
    after export normalization.\
-   ⬜ Make export derive from structured document state rather than
    stored `docState.cleanHTML`.\
-   ⬜ Replace the shallow final export check with complete contract
    validation.\
-   ⬜ Fix remaining improper or unstable nesting.\
-   ⬜ Remove unexpected wrapper elements.\
-   ⬜ Normalize paragraph placement.\
-   ⬜ Validate that all exported markup is properly nested.\
-   ⬜ Normalize attribute ordering, whitespace, nested inline markup,
    links, void elements, and code blocks.\
-   ⬜ Make repeated export/canonicalization operations produce
    identical output.\
-   ⬜ Ensure the Word scrubber and Lexical exporter converge on the
    same contract.\
-   ⬜ Review generated output against real downstream ServiceNow
    requirements.\
-   ⬜ Make the final HTML look intentionally authored rather than
    editor-generated.

## **2.3 Correct list structure**

**Priority:** Critical\
**Status:** ⚠️ Requirement decided; audited implementation enforces the
opposite

**Outcome:** Lists support procedural content, nested lists, and
callouts without structural drift.

-   ✅ Adopt paragraph-based list items as the internal and canonical
    model for procedural content: `<li><p>…</p></li>`.\
-   ⬜ Preserve the primary paragraph inside each list item during
    import and export.\
-   ⬜ Treat each list item as a block container rather than a
    direct-text container.\
-   ⬜ Allow a primary paragraph followed by additional blocks,
    including:
    -   Nested lists\
    -   Callouts\
    -   Horizontal rules\
    -   Additional paragraphs when allowed by the content model\
-   ⬜ Fix nested-list export so a nested `<ul>` or `<ol>` belongs to
    the preceding `<li>` rather than appearing as an invalid sibling.\
-   ⬜ Fix callout behavior inside list items.\
-   ⚠️ Remove or replace the audited `unwrapParasInListItems()` behavior
    that strips paragraph elements from list items.\
-   ⬜ Verify that HTML import reconstructs the same list-item
    structure.\
-   ⬜ Add list fixtures for simple, nested, and complex procedural
    items.\
-   ❓ Decide whether canonical export should **always** preserve the
    primary `<p>` or flatten a simple one-paragraph item to
    `<li>Text</li>`.

**Recommendation:** Preserve `<p>` consistently. The small increase in
markup buys a stable content model and avoids special-case behavior when
a simple step later gains a callout or second block.

## **2.4 Normalize headings**

**Priority:** High after list structure\
**Status:** ⬜ Not started or unverified

**Outcome:** Headings express document hierarchy rather than duplicated
visual formatting.

-   ⬜ Remove redundant `<strong>` wrappers when an entire heading is
    bold.\
-   ⬜ Prevent exporter-generated whole-heading bold formatting.\
-   ⬜ Define the intentionally supported inline content in headings,
    likely text and anchors.\
-   ⬜ Enforce headings as top-level blocks.\
-   ⬜ Prevent callouts and other block content inside headings.\
-   ⬜ Validate heading hierarchy during export.

## **2.5 Establish the table model**

**Priority:** High\
**Status:** ⚠️ Requirements/design started; audited implementation
flattens table sections

**Outcome:** TypeSet can author and export both simple data tables and
rich Step/Action tables without using formatting as fake semantics.

### **Canonical structure**

-   ✅ Define the explicit table content model:
    -   `<table>`\
    -   `<thead>`\
    -   `<tbody>`\
    -   `<tr>`\
    -   `<th>`\
    -   `<td>`\
-   ✅ Allow one optional `<thead>` followed by one required canonical
    `<tbody>`.\
-   ✅ Allow only `<tr>` children inside `<thead>` and `<tbody>`.\
-   ✅ Retain `<thead>` and `<tbody>` in canonical exported HTML.\
-   ✅ Exclude `<tfoot>`, `<colgroup>`, and `<col>` until a concrete
    authoring need is approved.\
-   ✅ Keep canonical rows uniform: do not mix `<th>` and `<td>` within
    a row unless row-header support is intentionally added.\
-   ⬜ Implement or update `normalizeTableStructure()` so it:
    -   Wraps direct `<tr>` children in `<tbody>`.\
    -   Detects an initial all-`<th>` header row and moves it into
        `<thead>`.\
    -   Places remaining rows in the canonical `<tbody>`.\
    -   Enforces at most one `<thead>` and one canonical `<tbody>`.\
    -   Removes unsupported or empty table scaffolding without
        discarding valid cell content.\
    -   Preserves valid block children and supported spans.\
-   ⬜ Derive `<thead>` and `<tbody>` during canonical export because
    Lexical does not represent them as separate nodes.\
-   ⬜ Export rows marked as header rows inside `<thead>` and all
    remaining rows inside `<tbody>`.\
-   ⬜ Preserve genuine `<th>` semantics instead of using
    `<td><strong>…</strong></td>`.\
-   ⚠️ Remove or replace the current import/export behavior that unwraps
    `<thead>`, `<tbody>`, and `<tfoot>`.\
-   ⬜ Make Step/Action header rows semantically explicit rather than
    relying on an ordinary first row with bold text.\
-   ⬜ Consider `scope="col"` for column headers.\
-   ⬜ Decide whether row headers and `scope="row"` belong in the
    initial contract; do not infer them from cell contents.\
-   ⬜ Preserve `rowspan` and `colspan` through import, Lexical state,
    normalization, and export.\
-   ⬜ Strip inline styles, editor-only classes, and unsupported table
    attributes while retaining only contract-approved attributes.

### **Table cell content**

-   ✅ Treat table cells as block containers in the editor model.\
-   ✅ Preserve `<p>` elements in both `<td>` and `<th>` cells,
    including single-paragraph cells.\
-   ⬜ Normalize direct text in cells into `<p>` elements.\
-   ⬜ Support multiple paragraphs.\
-   ⬜ Support ordered and unordered lists.\
-   ⬜ Preserve paragraphs inside list items and normalize direct
    list-item text into paragraphs.\
-   ⬜ Support images. Figure behavior follows the separate figure
    contract when implemented.\
-   ⬜ Support callouts.\
-   ⬜ Consider blockquotes and code blocks after the baseline cell
    model is stable.\
-   ✅ Disallow headings, nested tables, horizontal rules, and arbitrary
    `<div>` elements inside cells initially.\
-   ✅ Preserve the callout invariants: callouts may appear in cells;
    callouts cannot nest; tables remain disallowed inside callouts;
    images remain disallowed inside callouts unless the callout contract
    changes separately.\
-   ⬜ Preserve structured blocks when content moves between a cell and
    the main document.\
-   ⬜ Ensure Enter, list editing, callout insertion, and image
    insertion behave predictably inside cells.\
-   ✅ Design the baseline around Step/Action instructions whose Action
    cell may contain:
    -   One paragraph.\
    -   A paragraph followed by a bulleted or numbered list.\
    -   An image.\
    -   A callout.

### **Empty and template content**

-   ⬜ Do not export empty placeholder rows.\
-   ⬜ Do not use `<p><br></p>` to force blank-cell height.\
-   ⬜ Omit empty tables.\
-   ⬜ Optionally omit an entire optional section when its only table
    contains no data.\
-   ⬜ Distinguish authoring-template scaffolding from publishable
    content.

### **Native editor support**

-   ⬜ Install `@lexical/table` with all Lexical package versions
    aligned.\
-   ⬜ Register `TableNode`, `TableRowNode`, and `TableCellNode`; add
    Lexical's `TablePlugin`.\
-   ⬜ Add table theme classes plus HTML import and export mappings.\
-   ⬜ Use Lexical header-cell state to distinguish `<th>` from `<td>`.\
-   ⬜ Support table and cell selection, keyboard navigation, and Tab
    navigation.\
-   ⬜ Add a basic insert-table command or control.\
-   ⬜ Build a TypeSet-specific contextual cell menu using Lexical's
    commands and utilities rather than copying the Playground demo
    wholesale.\
-   ⬜ Show and position the menu near the selected cell, with invalid
    actions disabled.\
-   ⬜ Provide actions to insert a row above/below, insert a column
    left/right, delete a row/column/table, and toggle header rows and
    columns.\
-   ⬜ Decide whether merged cells are part of the baseline editor
    experience.\
-   ⬜ If merged cells are enabled, support merge, unmerge, `rowspan`,
    and `colspan` through Lexical's table APIs.\
-   ⏸️ Consider horizontal scrolling for wide tables.\
-   ⏸️ Consider cell resizing and row/column selection controls after
    the contract and common actions are stable.\
-   ✅ Start with reliable table creation and common editing before
    adopting advanced Playground-style controls.

### **Contract and tests**

-   ⬜ Update `docs/export_contract.md`.\
-   ⬜ Add `<thead>` and `<tbody>` to the effective export allowlist and
    update allowed-child rules for `<table>`, `<thead>`, `<tbody>`,
    `<tr>`, `<th>`, and `<td>`.\
-   ⬜ Document supported attributes, prohibited structures, callout
    interactions, and paragraph-backed cells.\
-   ⬜ Add golden fixtures for:
    -   Basic tables and explicit header rows.\
    -   Paragraph-backed cells.\
    -   Ordered and unordered lists inside cells.\
    -   Images and callouts inside cells.\
    -   `rowspan` and `colspan`.\
    -   Step/Action tables.\
    -   Noncanonical table HTML requiring normalization.\
-   ⬜ Update Pretty formatter expectations for `<thead>`, `<tbody>`,
    and paragraph, list, image, and callout blocks nested in cells.\
-   ⬜ Add full-pipeline round-trip coverage: HTML import → Lexical →
    edit → canonical export → reimport.

## **2.6 Refine sanitation and import normalization**

**Priority:** High\
**Status:** 🟡 Core enforcement exists; boundaries overlap

**Outcome:** All HTML entering Lexical already satisfies both the
TypeSet contract and Lexical root requirements.

-   ✅ Use an allowlist as the basis for accepted HTML.\
-   ⚠️ `cleanHTML()` currently combines general contract enforcement
    with Word/import transformations.\
-   ✅ Preserve supported semantic classes while stripping arbitrary
    classes.\
-   ✅ Normalize unsupported structures when user content can be
    preserved.\
-   ✅ Unwrap unsupported inline structures when appropriate.\
-   ✅ Convert unsupported block containers into valid supported blocks
    rather than leaving bare text at the Lexical root.\
-   ⬜ Separate Word-specific cleanup from general contract
    enforcement.\
-   ⬜ Formalize the pipeline as distinct responsibilities such as:
    -   `scrubWordHtml()`\
    -   `canonicalizeCleanHtml()`\
    -   `importCleanHtmlToLexical()`\
    -   `exportLexicalToCleanHtml()`\
-   ⬜ Expand auto-healing for invalid pasted/document structures.\
-   ⬜ Automatically unwrap nested callouts.\
-   ⬜ Move headings out of invalid containers.\
-   ⬜ Normalize illegal node structures after import and, where
    appropriate, after editor transactions.\
-   ⬜ Improve Word Web cleanup, including list reconstruction and link
    normalization.\
-   ⬜ Normalize bookmark links and remove unsupported link attributes
    without harming real external links.\
-   ⬜ Ensure import and export agree on every representable structure.

## **2.7 Control empty paragraphs and structural drift**

**Priority:** High\
**Status:** 🟡 Major historical drift fix completed; policy remains
partly open

**Outcome:** Meaningful blank lines are preserved intentionally, while
editor scaffolding never leaks or multiplies.

-   ✅ Prevent repeated HTML/WYSIWYG transitions from accumulating
    `<p><br></p>` paragraphs.\
-   ✅ Preserve stable canonical HTML across repeated Apply and
    view-switch operations.\
-   ✅ Trim known boundary helper paragraphs during export.\
-   ⬜ Define when an empty paragraph is meaningful authoring content.\
-   ⬜ Remove empty paragraphs used only for visual spacing.\
-   ⬜ Rely on CSS block margins for presentation spacing.\
-   ⬜ Add fixtures for blank documents, intentional blank blocks, empty
    list items, and empty cells.\
-   ❓ Decide whether blank HTML remains literally empty or maps to one
    internal Lexical paragraph while exporting as empty HTML.

**Recommendation:** Allow Lexical to maintain the internal empty
paragraph it needs, but export an empty document as empty canonical
HTML. This preserves native editing without leaking scaffolding.

## **2.8 Pretty HTML and HTML-view UX**

**Priority:** Medium after structural output\
**Status:** 🟡 Pretty formatting exists; broader expectations require
updates

-   🟡 Pretty-format exported HTML through an explicit action/gate.\
-   ⬜ Update formatting rules after list and table contracts are
    finalized.\
-   ⬜ Add syntax coloring for tags and attributes in the HTML view.\
-   ✅ Keep Apply explicit rather than live-synchronizing HTML and
    Lexical.\
-   ✅ Show a successful Apply status.\
-   ✅ Distinguish successful Apply, Apply with normalization, and Apply
    failure at a basic level.\
-   ⏸️ Add a detailed compile report listing removed tags, attributes,
    classes, and structural rewrites.

------------------------------------------------------------------------

# **3. Lexical-native authoring behavior**

This work follows export stabilization so TypeSet does not build richer
editing behavior on an unstable output model.

## **3.1 Audit and restore native keyboard behavior**

**Status:** 🟡 Direction decided; editor behavior remains largely
untested

-   ✅ Preserve Lexical defaults unless TypeSet has a semantic
    requirement to override them.\
-   ⬜ Audit:
    -   Enter\
    -   Shift+Enter\
    -   Tab and Shift+Tab\
    -   Backspace and Delete\
    -   Arrow keys\
    -   Selection behavior\
    -   List indentation and editing\
-   ⬜ Remove obsolete keyboard bridges and overrides.\
-   ⬜ Retain only the necessary custom list-cleanup behavior.\
-   ⬜ Define context-specific Enter behavior for paragraphs, list
    items, callouts, and code blocks.\
-   ⬜ Preserve caret and selection correctly during automatic wrapping
    or insertion.

## **3.2 Enforce the content model with Lexical transforms**

**Status:** 🟡 Some rules have been designed; editor-level coverage is
missing

-   ⬜ Enforce headings as top-level blocks.\
-   ⬜ Prevent nested callouts.\
-   ⬜ Prevent structured content inside code blocks.\
-   ⬜ Restrict code blocks to plain text.\
-   ⬜ Allow lists inside non-code callouts.\
-   ⬜ Allow callouts and horizontal rules inside list items.\
-   ⬜ Normalize invalid trees after applicable transactions.\
-   ⬜ Batch related editor updates into transactions.\
-   ⬜ Add regression tests for every enforced parent/child rule.

## **3.3 Revisit custom node design**

**Status:** 🟡 Audited; final model decisions and cleanup remain

-   ✅ Use Lexical-native `QuoteNode` for blockquotes.\
-   ✅ Use Lexical-native `CodeNode` for code blocks.\
-   ✅ Remove blockquote and code variants from the callout model.\
-   ✅ Native `QuoteNode` and `CodeNode` are registered.\
-   🟡 Keep one custom `CalloutNode` with a stored callout kind for true
    callout semantics.\
-   ✅ The active callout model supports Note, Warning, and Example.\
-   ⚠️ Variable and User Input currently use text-style markers; unused
    custom-node files still exist and older documents describe a
    different model.\
-   ❓ Formalize style markers or migrate to registered semantic nodes
    based on editing behavior, serialization stability, overlapping
    semantics, and future validation.\
-   ⬜ Consider a dedicated Caption node only if caption relationships
    cannot be represented reliably with native structures.

------------------------------------------------------------------------

# **4. Semantic authoring features**

## **4.1 Callouts**

**Status:** 🟡 Existing feature; documentation and behavior need
reconciliation

-   ✅ Support Note, Warning, and Example.\
-   ⬜ Add a distinct Important callout instead of exporting Important
    as Warning.\
-   ⬜ Standardize visible labels and exported class names.\
-   ❓ Decide whether visible Note and Example labels belong in content;
    the older specification requires them, while active code
    intentionally does not add them.\
-   ⬜ Avoid duplicate labels if labels remain part of the approved
    contract.\
-   ⬜ Wrap selected paragraphs or a whole list in one callout.\
-   ⬜ Create a callout from an empty paragraph.\
-   ⬜ Insert a blank callout inside a list item.\
-   ⬜ Preserve selection when wrapping content.\
-   ⬜ Move the caret to the intended authoring position after
    insertion.\
-   ⬜ Prevent or automatically repair nested callouts.\
-   ⬜ Add a focused callout regression suite.\
-   ❓ Decide whether icons are semantic document content or
    presentation-only decoration.\
-   ⬜ If decorative, generate callout icons in CSS instead of storing
    emoji in the document.

### **Later callout ideas**

-   ⬜ Merge adjacent callouts.\
-   ⬜ Split callouts.\
-   ⬜ Move callouts up/down.\
-   ⬜ Support collapsible callouts.\
-   ⬜ Replace text labels with icons only if accessibility and exported
    semantics remain clear.

## **4.2 Variables and User Input**

**Status:** ⚠️ Active style-marker implementation conflicts with older
custom-node plans

-   ✅ Export semantic spans such as `<span class="variable">` and
    `<span class="user-input">`.\
-   ✅ Import those spans back into Lexical text-style markers.\
-   ⚠️ `UserInputNode.js`, `VariableNode.js`, and
    `SemanticInlineNode.js` exist but are not registered.\
-   ⬜ Test toolbar, keyboard, serialization, overlap, and round-trip
    behavior before finalizing the representation.\
-   ⬜ Expand variable support beyond inline appearance when concrete
    reuse requirements are defined.

## **4.3 Figures, images, and captions**

**Status:** ⬜ Planned

-   ⬜ Support semantic `<figure>`, `<img>`, and `<figcaption>` output.\
-   ⬜ Store alternative text separately from the visible caption.\
-   ⬜ Associate figures and captions structurally.\
-   ⬜ Avoid representing a figure as an ordinary paragraph with a bold
    "Figure:" label.\
-   ⬜ Support intentionally allowed image classes such as screenshot
    and icon.\
-   ⬜ Strip arbitrary image classes and inline styles.\
-   ⬜ Add screenshot and figure authoring blocks.\
-   ❓ Decide whether image assets are embedded, referenced, copied
    beside the draft, or stored in a portable TypeSet document package.\
-   ⬜ Define portability across supported operating systems,
    missing-asset recovery, file-size/format limits, naming, and image
    compression/resizing behavior.\
-   ⬜ Define security and privacy rules for remote images and local
    asset references.

## **4.4 Procedure and reusable technical-writing blocks**

**Status:** ⬜ Planned

-   ⬜ Add Step/Action table templates.\
-   ⬜ Add procedure blocks and step blocks.\
-   ⬜ Add figure/screenshot blocks.\
-   ⬜ Add tool-list, requirement, hardware-reference, and other
    technical-document presets only as real workflows demand them.\
-   ⬜ Add reusable content snippets/components.\
-   ⬜ Give procedure and step numbers explicit semantics when TypeSet
    must renumber or validate them.\
-   ✅ Continue permitting hard-coded numbers when they are
    intentionally final display text.\
-   ❓ Decide whether procedural numbering belongs in structured editor
    data or is generated from document structure.

------------------------------------------------------------------------

# **5. Command and insertion UX**

The different insertion mechanisms should call one semantic command
layer rather than implement features separately.

## **5.1 Shared semantic command layer**

**Status:** ⬜ Planned

-   ⬜ Create a centralized command registry.\
-   ⬜ Separate semantic command execution from its trigger.\
-   ⬜ Allow the toolbar, slash menu, Leader-Key Command System, and
    future command palette to invoke the same commands.\
-   ⬜ Keep the command layer independent of browser and
    operating-system shortcuts.\
-   ⬜ Make adding commands a data/registry change rather than scattered
    hard-coded keyboard logic.

## **5.2 Slash commands**

**Priority:** High after foundation stabilization\
**Status:** ⬜ Not started

-   ⬜ Add a slash-command menu.\
-   ⬜ Convert commands into semantic Lexical operations rather than
    HTML insertion.\
-   ⬜ Initial commands:
    -   `/note`\
    -   `/warning`\
    -   `/example`\
    -   `/table` or `/stepaction`\
    -   `/code`\
    -   `/h1`, `/h2`, and applicable headings\
    -   `/hr`\
    -   `/bullet`\
    -   `/number`\
    -   `/variable`\
    -   `/input`\
-   ⬜ Expand commands into reusable building blocks.\
-   ⬜ Allow slash commands to coexist with toolbar and keyboard
    workflows.

## **5.3 Leader-Key Command System (LKCS)**

**Priority:** Medium\
**Status:** ⬜ Planned; first-iteration behavior already chosen

-   ✅ Use **Leader-Key Command System** as the architectural term and
    **Command Mode** as the user-facing term.\
-   ✅ First iteration: activate/deactivate Command Mode with a visible
    toggle.\
-   ✅ First iteration: do not use backtick timing.\
-   ⬜ Display an unmistakable Command Mode state.\
-   ⬜ Keep normal typing unchanged while Command Mode is disabled.\
-   ⬜ Use Escape to exit Command Mode.\
-   ⬜ Implement initial semantic keys such as:
    -   `n` --- Note\
    -   `e` --- Example\
    -   `w` --- Warning\
    -   `u` --- User Input\
    -   `v` --- Variable\
-   ⬜ Make undefined commands exit safely without modifying content.

### **Later LKCS trigger**

-   ⬜ Use backtick as a temporary leader key.\
-   ⬜ Use two backticks to insert a literal backtick.\
-   ⬜ Exit command state after a short timeout, Escape, or an undefined
    command.\
-   ⬜ Consider multi-key sequences after the initial registry is
    proven.

## **5.4 Markdown-style typing shortcuts**

**Status:** ⬜ Optional later enhancement

-   ⬜ Convert `#` , `##` , `>` , `-` , and `1.` into semantic
    structures.\
-   ⬜ Prefer Lexical-native support where it already exists.\
-   ⬜ Avoid implementing shortcuts that conflict with ordinary
    technical writing.

------------------------------------------------------------------------

# **6. Document safety, trust, and review**

## **6.1 Saving and recovery**

**Status:** 🟡 Version 1 document Save/Open complete; recovery remains

-   ✅ Save TypeSet document identity, metadata, and serialized Lexical
    state in the Version 1 JSON envelope.\
-   ✅ Open validated `.typeset` documents and restore their serialized
    Lexical state without persisting generated HTML.\
-   ✅ Treat serialized Lexical state as authoritative; regenerate
    canonical HTML after opening.\
-   ✅ Replace the historical dual-representation draft path with the
    approved TypeSet document boundary.\
-   🟡 Add document round-trip, schema-version, rejection, Save/Open, and
    recovery tests. Document validation and persistence round-trip
    coverage pass; Save/Open is manually verified in Chrome; recovery
    coverage remains.\
-   ⬜ Add backups or version history.\
-   ⬜ Preserve last successfully applied HTML when Apply fails.\
-   ✅ Prefer recovering user content over destructive rejection.\
-   ✅ Keep editor transitions non-destructive.

## **6.2 Error handling**

**Status:** ⏸️ Basic resilience implemented; broader polish
intentionally deferred

-   ✅ Prevent invalid or unsupported HTML from crashing the editor.\
-   ✅ Show understandable Apply failures.\
-   ✅ Release synchronization suppression state even when import
    fails.\
-   ✅ Preserve user work after failed Apply.\
-   ⏸️ Improve error reporting beyond basic user messages and console
    logging when real usage reveals a need.\
-   ⏸️ Add detailed sanitation/compile reports.\
-   ⏸️ Add a privacy-conscious diagnostic report containing app, schema,
    and contract versions; browser/platform; failed operation; and
    validation findings, without document content unless the user
    deliberately includes it.

## **6.3 Review and collaboration**

**Status:** ⬜ Long-term

-   ⬜ Add document review workflows.\
-   ⬜ Add comments.\
-   ⬜ Add collaborative review capabilities.

------------------------------------------------------------------------

# **7. Imports, exports, and publishing**

## **7.1 Word and HTML import**

**Status:** 🟡 Existing capability; architecture is being repositioned

-   ✅ Treat Word as one import source rather than the center of the
    product.\
-   ✅ Keep Word-specific cleanup outside Lexical.\
-   🟡 Strip Microsoft classes, namespaces, inline styles, and
    source-editor residue.\
-   🟡 Normalize clean HTML before importing it into Lexical.\
-   ⚠️ The known Word-import baseline has seven failing fixtures,
    including one runtime exception.\
-   ⬜ Improve Word Web list reconstruction.\
-   ⬜ Improve Word Web link and bookmark normalization.\
-   ⬜ Build import adapters that map external structures into semantic
    Lexical nodes.\
-   ⬜ Ensure arbitrary supported clean HTML can be mapped into Lexical
    without literal-markup dependence.

## **7.2 Publishing adapters**

**Status:** ⬜ Long-term

-   ⬜ Add DOCX export.\
-   ⬜ Support additional publishing targets.\
-   ⬜ Build target-specific publishing adapters.\
-   ⬜ Keep canonical HTML generation independent of the source and
    destination systems.\
-   ⬜ Support versioned export profiles if different destinations
    require intentionally different contracts.

------------------------------------------------------------------------

# **8. Historical fixes and completed foundation**

These items appear to have been addressed. They should remain regression
tests, not active feature work.

## **8.1 HTML Apply and sanitizer hardening**

-   ✅ Added an explicit HTML Apply/Update gate.\
-   ✅ Wrapped Apply/import so malformed or unsupported HTML does not
    crash the editor.\
-   ✅ Ensured synchronization-suppression state is released after
    errors.\
-   ✅ Prevented Apply failures from wiping the HTML editor.\
-   ✅ Corrected sanitizer integration issues involving the parsed
    document, root/body handling, unreachable returns, and invalid
    variables.\
-   ✅ Ensured `parseHTML()` and serialization handle the document body
    safely.\
-   ✅ Prevented the sanitizer from removing the root container.\
-   ✅ Normalized unsupported `<div>` blocks into valid blocks before
    Lexical import.\
-   ✅ Wrapped invalid top-level text/inline content so Lexical receives
    valid root children.\
-   ✅ Removed or normalized unknown tags according to the contract.\
-   ✅ Added basic Apply outcomes:
    -   Applied successfully\
    -   Applied with normalization\
    -   Apply failed

## **8.2 Round-trip and view-switch hardening**

-   ✅ Prevented repeated view switching from creating additional blank
    paragraphs.\
-   ✅ Prevented empty documents from expanding on each import.\
-   ✅ Stabilized canonical HTML across repeated HTML/WYSIWYG
    transitions.\
-   ✅ Normalized WYSIWYG output before storing canonical HTML.\
-   ✅ Preserved the last successfully applied HTML after failure.\
-   ✅ Removed inline whitespace drift that produced spacing errors such
    as `world .`.\
-   ✅ Made common transitions idempotent and non-destructive.

## **8.3 Known regression areas**

Maintain tests for:

-   Unsupported tags and `<div>` normalization\
-   Malformed HTML\
-   Top-level text nodes\
-   Blank documents\
-   Repeated Apply operations\
-   Repeated HTML/WYSIWYG switching\
-   Unsupported structures that must preserve their text\
-   Semantic classes and supported callouts\
-   Boundary empty paragraphs\
-   Inline whitespace

------------------------------------------------------------------------

# **9. Documentation and AI-assisted development**

**Status:** 🟡 Governing structure improved; product principles and
document-schema contract established

-   ✅ Review and classify:
    1.  `lexical_editor_setup.md` --- historical setup plan\
    2.  `lexical_node_plan.md` --- historical implementation plan\
    3.  `editor_content_model.md` --- historical design input\
    4.  `callout-behavior-spec.md` --- outdated behavior snapshot\
    5.  `v1_editor_spec.md` --- historical release specification\
    6.  `v1_addendum_scrub_vs_prep.md` --- superseded architecture\
    7.  `export_contract.md` --- partially current; must be updated
        after list/table decisions\
-   ✅ Review and classify all stage specifications under `docs/spec/`.\
-   ⬜ Add a clear historical-status header to retained superseded
    documents.\
-   ⬜ Create or update a concise TypeSet Product Vision.\
-   ⬜ Create the current Product Architecture document.\
-   ✅ Create the versioned TypeSet Document Schema in
    `docs/contracts/document-schema.md`.\
-   ⬜ Create the Editor Behavior Contract.\
-   ⬜ Revise the Canonical HTML Export Contract.\
-   ⬜ Create the Import Contract.\
-   ⬜ Create the Test Strategy and Traceability Matrix.\
-   ⬜ Organize governing documents separately from historical design
    and release records.\
-   ⬜ Reorganize documentation into clear roles:
    1.  `docs/architecture/`\
    2.  `docs/contracts/`\
    3.  `docs/specifications/`\
    4.  `docs/decisions/`\
    5.  `docs/archive/`\
-   ⬜ Move `docs/spec/` to `docs/specifications/` when references can
    be updated in one coherent change.\
-   ⬜ Document the four explicit boundaries:
    1.  External HTML/Word → canonical import HTML\
    2.  Canonical import HTML → structured editor state\
    3.  Structured editor state → canonical export HTML\
    4.  Canonical export HTML → validation/publishing adapter\
-   ⬜ Keep historical bug-fix specifications separate from governing
    architecture.\
-   ✅ Continue using AI coding agents for bounded implementation while
    retaining architecture and review decisions in the TypeSet project.

------------------------------------------------------------------------

# **9A. Repository organization direction**

The audited folder structure is workable, but it still presents HTML
sanitation as the center of TypeSet. The intended structure should
instead make the TypeSet document model, editor, import boundary, export
boundary, persistence, and tests visible as separate responsibilities.

## **9A.1 Target responsibility map**

TypeSet/\
├── docs/\
│ ├── architecture/\
│ ├── contracts/\
│ ├── specifications/\
│ ├── decisions/\
│ └── archive/\
├── src/\
│ ├── app/\
│ │ ├── main.js\
│ │ └── workflows/\
│ ├── document/\
│ │ ├── schema.js\
│ │ ├── validation.js\
│ │ └── migrations/\
│ ├── editor/\
│ │ ├── lexical/\
│ │ ├── nodes/\
│ │ ├── plugins/\
│ │ ├── import/\
│ │ └── export/\
│ ├── import/\
│ │ ├── html/\
│ │ ├── word/\
│ │ └── markdown/\
│ ├── export/\
│ │ └── html/\
│ ├── persistence/\
│ ├── views/\
│ └── styles/\
├── tests/\
│ ├── document/\
│ ├── editor/\
│ ├── import/word/\
│ ├── export/html/\
│ ├── persistence/\
│ ├── integration/\
│ └── fixtures/\
└── package.json

This is a direction, not an instruction to create every empty folder
immediately.

## **9A.2 Low-risk relocations**

Move these when Release 0 begins and verify imports/tests in the same
commit:

  ----------------------------------------------------------------------------
  | Current location | Intended location |
  | --- | --- | 
  | `src/nodes/*` | `src/editor/nodes/*` |
  | `src/utils/KeyboardPlugin.js` | `src/editor/plugins/KeyboardPlugin.js` |
  | `src/app/draftStore.js` | Removed — superseded by `src/persistence/browserDocumentFile.ts` |
  | `src/domain/markdown/markdown.js` | `src/import/markdown/markdown.js` |
  | `tests/sanitize/fixtures/` | `tests/export/html/fixtures/` --- ✅ moved |
  | `tests/sanitize/fixtures_word/` | `tests/import/word/fixtures/` --- ✅ moved |

  ----------------------------------------------------------------------------

## **9A.3 Architecture-led moves**

Do not merely rename these files. Split or relocate them only when the
corresponding responsibility is implemented:

-   `src/domain/doc/docState.js` → replace with the TypeSet document
    schema, serialization, validation, and migration boundary.\
-   `src/domain/html/htmlImport.js` → split into generic HTML ingestion
    and Word-specific transformations.\
-   `src/domain/html/htmlExport.js` and `sanitizeToContract.js` →
    establish a dedicated export/contract pipeline.\
-   `src/app/main.js` → retain as the composition root while extracting
    bounded workflows such as open draft, save draft, import content,
    switch mode, and export document.

## **9A.4 Reorganization rule**

Avoid a repository-wide folder-only refactor. For each move:

1.  Establish or confirm the responsibility boundary.\
2.  Move the related implementation.\
3.  Update imports and documentation references.\
4.  Move or add the corresponding tests.\
5.  Run the affected suites and build.\
6.  Commit the coherent change independently.

This keeps organizational changes reviewable and prevents folder names
from implying boundaries the code does not yet honor.

------------------------------------------------------------------------

# **10. Conflicts and decisions requiring resolution**

## **10.1 What is the source of truth?**

**Conflicting statements found:**

-   "Canonical HTML is the single source of truth."\
-   "Treat Lexical state/document model as the source of truth."\
-   "Continue treating clean HTML as the canonical representation."

**Resolution:** ✅ Adopt one structured authoring architecture:

-   Persistent source of truth: a TypeSet-owned, versioned JSON
    document\
-   Live working representation: Lexical editor state\
-   Import/export boundary: canonical HTML\
-   Scrub and Prep: user workflows, not separate document architectures

**Implementation status:** ⚠️ The audited repository still stores and
restores both HTML and Lexical state. Release 0 must define and
implement the migration deliberately.

## **10.2 Should HTML and Lexical synchronize automatically?**

**Conflicting ideas found:**

-   Ensure HTML and WYSIWYG remain synchronized.\
-   Avoid automatic HTML↔Lexical synchronization.\
-   Preserve explicit Apply/Update.

**Resolution:** ✅ Synchronize through deliberate transitions, not
continuous bidirectional mutation. WYSIWYG changes may update the export
preview, but raw HTML edits enter Lexical only through Apply.

## **10.3 Should list-item paragraphs be preserved or flattened?**

-   ❓ Preserve `<li><p>…</p></li>` consistently.\
-   ❓ Flatten a simple item to `<li>Text</li>`.

**Recommendation:** Preserve the paragraph. It matches the richer
content model and avoids changing structure when an item gains
additional blocks.

## **10.4 Should table-cell paragraphs be preserved or flattened?**

**Resolution:** ✅ Preserve paragraphs consistently because table cells
are block containers. Normalize direct cell text into paragraphs. If
TypeSet later needs compact flat-text data tables, define a separate
explicit table type rather than guessing from cell contents.

## **10.5 Should `<tbody>` be retained?**

**Resolution:** ✅ Retain or generate one canonical `<tbody>` in
exported HTML. Retain one optional `<thead>` before it. Continue
excluding `<tfoot>`, `<colgroup>`, and `<col>` for now.

## **10.6 Are callout icons content or decoration?**

-   ❓ Store icons/emoji in content.\
-   ❓ Generate icons through presentation styling.

**Recommendation:** Treat icons as decoration unless an icon conveys
meaning that is not present in the callout label and semantic class.

## **10.7 How should procedure numbers work?**

-   ❓ Store numbers as structured document data.\
-   ❓ Generate numbers from document structure.\
-   ✅ Permit hard-coded numbers when they are intentionally final text.

**Decision needed:** Determine whether automatic renumbering and
validation are near-term requirements. If not, defer the structured
numbering system.

## **10.8 Are callouts custom nodes?**

**Historical tension:**

-   Minimize custom nodes.\
-   Create a custom `CalloutNode`.

**Resolution:** ✅ These are compatible. Use native nodes for blockquote
and code; retain one custom node with variants for true
Note/Warning/Example/Important semantics.

## **10.9 What triggers LKCS?**

-   Future vision: backtick plus timing.\
-   First iteration: explicit toggle.

**Resolution:** ✅ Use the toggle first. Keep the trigger separate from
the command engine so backtick activation can be added later without
redesign.

## **10.10 How prominent should the HTML editor be?**

-   Power-user editing is retained.\
-   HTML should not behave as a second full editor.

**Resolution:** ✅ Keep it as an inspection/export surface with
deliberate power-user Apply. Do not design new primary authoring
workflows around raw HTML.

## **10.11 Should TypeSet move to TypeScript?**

**Decision:** ✅ Yes, incrementally.

-   Configure strict TypeScript during Release 0.\
-   Use TypeScript for new document-model and architectural-boundary
    code.\
-   Migrate existing JavaScript when the corresponding file is
    materially changed or moved.\
-   Do not block Release 1 on converting every existing file.\
-   Keep runtime validation for imported HTML and saved JSON because
    TypeScript cannot validate external data by itself.

## **10.12 Which environments does TypeSet support first?**

**Open decision:** Define the initial browser and operating-system
support policy during Release 0.

**Recommendation:** Begin with the Chromium-based desktop environments
used for real TypeSet work on Ubuntu, Windows, and macOS. Document
graceful fallbacks for unavailable file-system and clipboard
capabilities before expanding the support claim.

## **10.13 How are images stored with a document?**

**Open decision:** Embedded data, external references, sidecar assets,
and a packaged document each have different portability and file-size
tradeoffs.

**Recommendation:** Resolve this before Release 5 implementation. Prefer
a portable document/package model if real figure-heavy SOPs demonstrate
that standalone JSON plus external paths is fragile.

------------------------------------------------------------------------

# **11. Recommended release sequence**

Each release below is written as a self-contained starting brief. A
release is complete only when its deliverables and exit criteria are
satisfied. If implementation reveals a new architectural decision,
record it before continuing.

## **Release 0 --- Verified architecture and engineering baseline**

**Purpose:** Make the repository reproducible and establish one approved
document architecture before changing structural content.

**Starting context:**

-   Audited baseline: `feature@e93b248`.\
-   TypeSet is an authoring tool built on Lexical and publishes
    canonical HTML.\
-   The approved persistent source of truth is a TypeSet-owned,
    versioned JSON document containing serialized Lexical editor state.\
-   The current implementation is transitional: it saves both HTML and
    Lexical JSON, restores both, continuously regenerates
    `docState.cleanHTML`, and exports from stored HTML.\
-   The export sanitizer suite passes 34 fixtures, but it does not cover
    the full Lexical-to-HTML path.\
-   The Word-import suite has seven known failures.\
-   Tracked dependencies and the current repository layout reduce
    reproducibility and obscure architectural boundaries.

**In scope:**

1.  Approve the TypeSet document envelope and its relationship to
    serialized Lexical state.\
2.  Define schema versioning, runtime validation, obsolete-format
    rejection, and recovery. Do not implement legacy `.drft` migration.\
3.  Define how HTML Apply updates structured state and whether drafts
    retain derived/recovery HTML.\
4.  Make export derive from structured state and pass through full
    contract validation.\
5.  Establish strict incremental TypeScript and implement new
    architectural boundaries in TypeScript without requiring an
    all-at-once conversion.\
6.  Remove tracked dependencies; retain the lockfile; establish clean
    install, build, test, type-check, and CI behavior.\
7.  Add a standard `npm test` command.\
8.  Record and resolve the seven Word-import baseline failures.\
9.  Add initial Lexical import/export, draft round-trip,
    view-transition, and full-pipeline tests.\
10. Capture representative real-world and performance fixtures from
    TypeSet documents.\
11. Define the initial supported-environment and capability-fallback
    policy.\
12. Add accessibility and keyboard checks to the engineering baseline.\
13. Define the content-safety contract and add adversarial import/export
    fixtures.\
14. Establish app, schema, and export-contract versioning plus
    release/change-management basics.\
15. Define the Editor Behavior Contract.\
16. Perform repository hygiene and relocate the deeply nested test
    fixtures.\
17. Begin the staged folder reorganization described in section 9A.\
18. Update the authoritative architecture, schema, contract, and
    test-strategy documents.

**Key deliverables:**

-   Approved TypeSet document schema and architecture decision record\
-   Explicit rejection rules for obsolete `.drft`/`w2h` formats and
    recovery rules for supported `.typeset` documents\
-   Strict TypeScript foundation and typed document/boundary modules\
-   Reproducible clean repository and CI baseline\
-   Standard test entry point and initial integration coverage\
-   Architecture-aligned test/fixture folders\
-   Supported-environment policy and fallback expectations\
-   Content-safety contract and adversarial fixtures\
-   Editor Behavior Contract and accessibility baseline\
-   Versioning, changelog, and release checklist\
-   Representative performance fixtures and recorded baseline\
-   Updated authoritative document set

**Exit criteria:**

-   A clean checkout can install, build, type-check, and run the
    standard test command.\
-   The JSON document authority and HTML derivation rules are
    unambiguous in code and documentation.\
-   Obsolete draft formats are rejected predictably; supported
    `.typeset` documents have a tested recovery path.\
-   Full-pipeline tests cover at least HTML import/Apply, Lexical
    editing/export, draft save/open, and view switching.\
-   Known baseline failures are resolved or explicitly accepted with
    documented reasons.\
-   Test fixtures are no longer buried under sanitizer-specific
    nesting.\
-   New document and boundary code is typed; any remaining JavaScript is
    intentional and does not block later incremental migration.\
-   Supported environments, security rules, editor invariants, and
    release/versioning rules are documented and represented in
    applicable tests or checklists.\
-   Representative performance measurements are recorded so later
    releases can detect meaningful regressions.

**Non-goals:** Converting every JavaScript file, lists, headings, richer
tables, slash commands, figures, broad UI redesign, and comprehensive
performance optimization.

## **Release 1 --- Lists and headings**

**Purpose:** Establish stable block structure for the procedural content
TypeSet authors most often.

**Starting context:**

-   Release 0 is complete and the JSON/document and export boundaries
    are stable.\
-   The intended list model is paragraph-based: `<li><p>…</p></li>`.\
-   The audited implementation currently strips paragraphs from list
    items.\
-   Lists must be able to contain nested lists, callouts, horizontal
    rules, and approved additional blocks.\
-   Headings should express hierarchy without redundant whole-heading
    `<strong>` markup.

**In scope:**

1.  Finalize whether canonical simple list items always retain their
    primary `<p>`; recommendation: retain it.\
2.  Remove or replace `unwrapParasInListItems()`.\
3.  Implement valid simple, nested, and complex list-item
    import/export.\
4.  Correct callouts inside list items.\
5.  Normalize heading structure and redundant inline formatting.\
6.  Enforce headings as top-level blocks with intentionally supported
    inline content.\
7.  Add editor, import, export, and round-trip fixtures.

**Exit criteria:**

-   Lists remain structurally identical through import → edit → export →
    reimport.\
-   Nested lists are children of the correct `<li>`.\
-   Adding a callout or second block does not require changing the
    list-item model.\
-   Headings export without redundant wrappers or invalid block
    children.\
-   The list and heading rules are recorded in the content model and
    export contract.

**Non-goals:** General table work, command menus, figure support, and
unrelated toolbar redesign.

## **Release 2 --- Table foundation**

**Purpose:** Support both simple data tables and rich Step/Action tables
with semantic, deterministic structure.

**Starting context:**

-   The approved direction uses `<thead>`, `<tbody>`, `<th>`, and
    `<td>`.\
-   A canonical table has one optional header section followed by one
    required body section; only rows appear in those sections.\
-   Cells are paragraph-backed block containers and may contain
    paragraphs, lists, images, and callouts.\
-   Headings, nested tables, horizontal rules, and arbitrary `<div>`
    elements are initially prohibited inside cells.\
-   The audited implementation currently unwraps table-section
    elements.\
-   TypeSet must distinguish meaningful authoring content from empty
    template scaffolding.

**In scope:**

1.  Record the canonical table/cell model, prohibited structures,
    callout rules, headers, scopes, spans, and empty-content behavior in
    the content model and export contract.\
2.  Implement `normalizeTableStructure()` for direct rows, header
    detection, canonical sections, paragraph-backed cells, spans, and
    invalid or empty scaffolding.\
3.  Install and configure aligned `@lexical/table` packages, nodes,
    plugin, theme, import, and export mappings.\
4.  Derive canonical `<thead>` and `<tbody>` from Lexical row/header
    state during export.\
5.  Add basic table creation, selection, keyboard/Tab navigation, header
    controls, and row/column insertion and deletion.\
6.  Build the initial TypeSet cell menu around Lexical table commands;
    include delete-table and disable invalid actions.\
7.  Add Step/Action and simple-data fixtures covering paragraphs, lists,
    images, callouts, spans, and noncanonical input.\
8.  Verify structured-content round trips and editing behavior inside
    cells.\
9.  Omit empty placeholder rows and empty tables from publication
    output.

**Exit criteria:**

-   Table structure is deterministic across import, editing, export, and
    reimport.\
-   Genuine headers remain semantic `<th>` elements.\
-   Canonical export retains one optional `<thead>` and one required
    `<tbody>`, in that order.\
-   Direct cell and list-item text is normalized into paragraphs.\
-   Paragraphs, lists, images, callouts, and supported spans round-trip
    without flattening or invalid nesting.\
-   Empty template scaffolding does not publish.\
-   Creation, selection, keyboard navigation, header toggles, and common
    row/column actions work without direct DOM mutation.\
-   The export contract, content model, formatter expectations, and
    golden/full-pipeline tests agree.

**Planning decisions:**

-   ❓ Include merged-cell editing in the Release 2 baseline, or
    preserve imported spans first and add merge/unmerge afterward?\
-   ❓ Include blockquotes and code blocks in the initial cell
    allowlist, or defer both until their main-document behavior is fully
    stable?\
-   ❓ Is horizontal scrolling required for the first usable Step/Action
    table experience?

**Non-goals:** Nested tables, headings or horizontal rules inside cells,
arbitrary cell `<div>` content, `<tfoot>`, `<colgroup>`, `<col>`, cell
resizing, advanced row/column selection controls, and wholesale adoption
of the Lexical Playground table UI.

## **Release 3 --- Editor behavior and semantic nodes**

**Purpose:** Make the editor behave natively and predictably while
enforcing TypeSet's semantic content rules.

**Starting context:**

-   Lexical-native behavior is preferred unless TypeSet has a documented
    semantic reason to override it.\
-   Native QuoteNode and CodeNode are the approved blockquote/code
    representations.\
-   CalloutNode remains the custom semantic block for Note, Warning,
    Example, and eventually Important.\
-   Variable and User Input currently use style markers while unused
    custom-node files remain.

**In scope:**

1.  Audit Enter, Shift+Enter, Tab, deletion, arrows, selection, and list
    indentation.\
2.  Remove obsolete keyboard bridges and overrides.\
3.  Decide and implement the stable Variable/User Input representation.\
4.  Reconcile callout behavior, labels, kinds, insertion, nesting, and
    selection handling.\
5.  Enforce parent/child rules with Lexical transforms.\
6.  Colocate nodes and plugins under `src/editor/` as their code is
    touched.\
7.  Add focused behavioral and serialization tests.

**Exit criteria:**

-   Native editing behavior works unless an approved TypeSet rule
    intentionally changes it.\
-   Every registered custom node has a documented semantic purpose.\
-   Unused competing node implementations are removed or archived.\
-   Invalid trees are prevented or repaired without losing content or
    caret position.\
-   Callout and inline-semantic behavior survives save/open and
    import/export round trips.

**Non-goals:** Slash commands, LKCS, advanced callout manipulation, and
new figure nodes.

## **Release 4 --- Authoring acceleration**

**Purpose:** Speed up technical authoring without creating separate
implementations for each trigger mechanism.

**Starting context:**

-   Structural editing and semantic nodes are stable.\
-   Toolbar actions, slash commands, LKCS, and future command palettes
    must invoke one shared semantic command layer.\
-   The first LKCS iteration uses a visible Command Mode toggle, not
    backtick timing.

**In scope:**

1.  Build a centralized semantic command registry.\
2.  Route existing toolbar actions through it where practical.\
3.  Add the initial slash-command menu.\
4.  Add reusable Step/Action and callout blocks.\
5.  Add toggle-based Command Mode with safe Escape/undefined-command
    behavior.\
6.  Add Markdown-style shortcuts only where Lexical-native behavior is
    useful and non-conflicting.

**Exit criteria:**

-   Each semantic action has one implementation that multiple triggers
    can invoke.\
-   Slash commands and Command Mode create valid Lexical structures, not
    inserted HTML.\
-   Command Mode is visibly distinct and cannot silently alter normal
    typing.\
-   New commands can be added through the registry without scattered
    keyboard logic.

**Non-goals:** Backtick timing, multi-key sequences, AI-generated
authoring, and a broad command-palette redesign.

## **Release 5 --- Figures and document trust**

**Purpose:** Add trustworthy media authoring and mature the safety of
long-lived TypeSet documents.

**Starting context:**

-   The document schema and structural blocks are stable.\
-   Figures require separate alternative text, visible captions, and
    structural relationships.\
-   Figure implementation cannot begin until TypeSet chooses an
    asset-storage and portability model.\
-   Basic draft persistence and error resilience exist, but autosave,
    backups, version history, and richer recovery remain incomplete.

**In scope:**

1.  Approve image storage, portability, missing-asset recovery,
    file-size/format, naming, compression, security, and privacy rules.\
2.  Add semantic figure, image, and caption support.\
3.  Store alternative text separately from the visible caption.\
4.  Support approved screenshot/icon classes while stripping arbitrary
    presentation markup.\
5.  Add figure/screenshot authoring blocks and round-trip tests.\
6.  Define and implement autosave, backup, recovery, and version-history
    behavior.\
7.  Improve sanitation reporting only where real usage demonstrates a
    need.

**Exit criteria:**

-   Figures export as valid `<figure>`, `<img>`, and `<figcaption>`
    structures.\
-   Alternative text and captions remain distinct through save/open and
    export.\
-   Figure assets remain portable or fail with an understandable,
    recoverable missing-asset state on supported environments.\
-   Recovery behavior is tested and cannot silently replace newer valid
    work with stale derived HTML.\
-   Users can understand when content was normalized or recovered.

**Non-goals:** Collaboration, full digital-asset management, and
speculative AI assistance.

## **Later releases**

-   Document outline and navigation\
-   Find and replace\
-   Word count and document statistics\
-   Broken-link, missing-alt-text, terminology, and style checks\
-   Templates and document metadata\
-   DOCX and additional publishing adapters\
-   Reusable content libraries\
-   Comments and collaborative review\
-   AI-assisted terminology, structure, and cleanup checks

------------------------------------------------------------------------

# **12. Explicitly deferred or rejected-for-now ideas**

-   ⏸️ Large speculative error-reporting system\
-   ⏸️ Detailed sanitation reports until basic statuses prove
    insufficient\
-   ⏸️ Advanced table resizing and complex contextual UI\
-   ⏸️ Backtick timing for LKCS\
-   ⏸️ Callout merging, splitting, moving, and collapsing\
-   ⏸️ Dedicated Caption node until figure requirements prove it
    necessary\
-   ⏸️ AI features that interrupt typing or generate content
    automatically\
-   ⏸️ General-purpose page layout and Word-parity formatting\
-   ⏸️ Switching away from Lexical without evidence that the engine
    cannot support the content model

------------------------------------------------------------------------

# **13. Suggested next action**

Continue **Release 0 --- Verified architecture and engineering
baseline**.

The repository baseline, TypeScript foundation, Version 1 document
contract, document creation and validation, persistence boundary, browser
file access, and Save/Open integration are established and verified.
Stage 2.1.B units B1–B4 and B6 are complete.

The next bounded task is B5: define recovery behavior for supported
`.typeset` documents before implementing it.

The remaining recovery decisions include:

1.  What event or interval creates a recovery snapshot?\
2.  Where are recovery snapshots stored, and how long are they retained?\
3.  When should TypeSet offer, replace, or discard recovery data?
4.  When and where is canonical HTML generated and fully validated?\
5.  How are existing dual-state `.drft` files migrated safely?\
6.  Which initial integration tests protect the migration?\
7.  What repository cleanup and CI changes make the baseline
    reproducible?\
8.  What strict TypeScript configuration and JavaScript-interoperation
    rules support incremental migration?\
9.  Which new Release 0 modules must be TypeScript from their first
    implementation?\
10. Which browsers, operating systems, and capability fallbacks are
    initially supported?\
11. What accessibility, editor-behavior, content-safety, performance,
    and versioning checks belong in the baseline?

After Release 0 is implemented and verified, begin **Release 1 --- Lists
and headings** as the first structural content-model release.

# **TypeSet Repository and Documentation Audit**

**Audit baseline:** `NateGMackie/TypeSet`\
**Branch:** `feature`\
**Commit:** `e93b2488ea2ca47cdd6b3278a2e40ddb97510789`\
**Parents:** `c391f21a9927885b96a01a8619e960d80dad26e0`,
`0c2c022bd04d8d2de938b14f02abdf913644cce5`\
**Audit date:** July 27, 2026

## **Executive summary**

TypeSet has a real, working architectural foundation, but its
implementation and documentation describe a transitional product:

-   The application is already a Lexical-based authoring tool.\
-   Canonical HTML is still the live serialized state used for export.\
-   Draft JSON stores both canonical HTML and serialized Lexical editor
    state.\
-   The saved Lexical state is restored, but it is not yet the sole
    persistent document model.\
-   Word cleanup, HTML contract enforcement, editor import/export, and
    view synchronization exist, but their boundaries overlap.\
-   The export sanitizer has useful golden fixtures, but there is almost
    no automated coverage of the editor, drafts, view transitions, or
    true Lexical round trips.\
-   The current export contract intentionally uses simple tables and
    text directly inside list items. The newer decisions to preserve
    paragraph blocks in list items and support richer table structure
    are not yet reflected in the contract or implementation.

The repository is ready for roadmap work, but the first implementation
release should be an architectural baseline release. Before changing
lists or tables, TypeSet needs one explicit document-source-of-truth
decision and tests that protect the current behavior during migration.

## **Status legend**

  Status   Meaning
  -------- ------------------------------------------------------
  ✅       Implemented and consistent
  🟡       Implemented, but incomplete or insufficiently tested
  ⚠️       Implementation or documentation conflict
  ❌       Required or claimed behavior is missing
  📚       Documentation is outdated or historical
  🗑️       Repository or code hygiene issue
  ❓       Product or architectural decision required

## **Overall assessment**

  -----------------------------------------------------------------------
  Area                    Assessment              Summary
  ----------------------- ----------------------- -----------------------
  Repository identity     ✅                      The audited feature
                                                  branch and merge commit
                                                  match the supplied
                                                  baseline.

  Core editor             🟡                      Lexical is integrated
                                                  and actively drives
                                                  WYSIWYG editing, but
                                                  several behaviors rely
                                                  on bridge globals and
                                                  post-export cleanup.

  Persistent document     ⚠️                      Drafts store HTML and
  model                                           Lexical JSON; neither
                                                  documentation nor code
                                                  defines conflict
                                                  resolution between
                                                  them.

  Export contract         🟡                      A deterministic
                                                  sanitizer and fixtures
                                                  exist, but the final
                                                  export gate does not
                                                  actually validate the
                                                  full contract.

  Word import             🟡                      Substantial
                                                  normalization exists;
                                                  the latest known test
                                                  baseline contains seven
                                                  failures.

  Lists                   ⚠️                      The code intentionally
                                                  removes paragraphs from
                                                  list items, conflicting
                                                  with the newer
                                                  block-content decision.

  Tables                  ⚠️                      The current contract
                                                  and code flatten table
                                                  section elements,
                                                  conflicting with the
                                                  newer richer-table
                                                  direction.

  Callouts                🟡                      Native custom nodes
                                                  exist for note,
                                                  warning, and example;
                                                  older callout
                                                  documentation describes
                                                  obsolete kinds and
                                                  label behavior.

  Inline semantics        🟡                      User-input and variable
                                                  semantics work through
                                                  CSS-style markers
                                                  rather than the planned
                                                  custom-node model.

  Drafts                  🟡                      Draft identity and
                                                  dual-state
                                                  serialization exist;
                                                  round-trip correctness
                                                  and dual-state
                                                  reconciliation are
                                                  untested.

  Automated tests         ⚠️                      Sanitizer fixtures are
                                                  useful but do not test
                                                  the full editor
                                                  pipeline;
                                                  reproducibility is
                                                  weakened by tracked
                                                  dependencies.

  Documentation           ⚠️                      The set contains
                                                  valuable history, but
                                                  no document currently
                                                  describes the intended
                                                  2026 architecture
                                                  completely.

  Repository hygiene      🗑️                      `node_modules` is
                                                  ignored but 4,521
                                                  dependency files are
                                                  still tracked.
  -----------------------------------------------------------------------

## **1. Actual architecture at the audited commit**

### **1.1 Current data flow**

flowchart TD\
A\["Word or HTML input"\] \--\> B\["cleanHTML import pipeline"\]\
B \--\> C\["docState.cleanHTML"\]\
C \--\> D\["HTML-to-Lexical import"\]\
D \--\> E\["Live Lexical state"\]\
E \--\> F\["Lexical HTML generation"\]\
F \--\> G\["Export sanitizer"\]\
G \--\> B\
C \--\> H\["Copy, export, and publish"\]\
C \--\> I\["Draft JSON"\]\
E \--\> I

The final `G → B` step is important: `exportHtmlFromEditor()` already
runs the export sanitizer, but `main.js` then sends that output through
`cleanHTML()`, the broader import/Word-cleanup pipeline, before updating
`docState.cleanHTML`.

### **1.2 Current source-of-truth behavior**

  -----------------------------------------------------------------------
  Context                             Actual authoritative representation
  ----------------------------------- -----------------------------------
  Live WYSIWYG editing                Lexical editor state during the
                                      update

  After each editor change            `docState.cleanHTML`, regenerated
                                      from the editor

  Raw HTML editing                    Pending textarea text until Update;
                                      then sanitized HTML becomes
                                      `docState.cleanHTML` and is
                                      imported into Lexical

  Copy/export/publish                 `docState.cleanHTML`

  Saved draft                         JSON envelope containing both
                                      `state.cleanHtml` and
                                      `state.lexical`

  Draft restore                       HTML restored first; Lexical JSON
                                      restored second when present
  -----------------------------------------------------------------------

### **1.3 Finding: JSON is persisted, but is not yet the single source of truth**

**Status:** ⚠️ ❓

Evidence:

-   `main.js` serializes `lexicalEditor.getEditorState().toJSON()`.\
-   The `.drft` schema stores both `state.cleanHtml` and
    `state.lexical`.\
-   Draft loading restores both representations independently.\
-   Export reads `docState.getCleanHtml()`, not the saved Lexical JSON.\
-   Live editor changes regenerate and overwrite `cleanHTML`.

This means the repository is closer to a dual-representation draft than
a JSON-first document model.

**Recommendation:** Adopt a structured authoring model explicitly:

  -----------------------------------------------------------------------
  Layer                               Recommended responsibility
  ----------------------------------- -----------------------------------
  TypeSet document JSON               Persistent authoring source of
                                      truth

  Live Lexical state                  In-memory editor representation of
                                      the document JSON

  Canonical HTML                      Derived interchange/publication
                                      artifact

  Raw Word or external HTML           Temporary ingestion material
  -----------------------------------------------------------------------

Do not implement this by simply deleting `cleanHtml` from drafts. First
define:

1.  The TypeSet draft schema and whether it is identical to raw Lexical
    JSON or a TypeSet-owned envelope around it.\
2.  Schema-version migration rules.\
3.  How raw HTML edits become structured state.\
4.  Whether imported canonical HTML is retained as provenance, cache, or
    recovery data.\
5.  The recovery rule if stored JSON cannot be parsed.\
6.  When canonical export HTML is generated and validated.

## **2. Contract traceability matrix**

  -----------------------------------------------------------------------------------------------------------------------------
  Requirement or         Documentation           Implementation                     Automated coverage     Finding
  decision                                                                                                 
  ---------------------- ----------------------- ---------------------------------- ---------------------- --------------------
  Deterministic          `export_contract.md`;   `htmlExport.js`, `prettyHtml.js`   34 export-sanitizer    🟡 Strong sanitizer
  canonical HTML         Stage 1                                                    fixtures previously    boundary; not a full
                                                                                    passed                 editor round trip

  Only contract-valid    Stage 7                 Export reads `docState.cleanHTML`; No direct              ⚠️ The UI gate is
  HTML is exported                               final gate only rejects            export-action test     not a full contract
                                                 blank/full-document/script/style                          validator
                                                 patterns                                                  

  Word input becomes     Stage 2                 `htmlImport.js`                    Word golden suite;     🟡 Substantial
  clean HTML                                                                        latest known result    implementation,
                                                                                    has 7 failures         failing baseline

  Clean HTML imports     Stage 3                 `importHtmlToEditor.js`            No automated Lexical   🟡 Implemented,
  safely into Lexical                                                               import test            unprotected

  Raw HTML changes       Stage 4; v1 addendum    `html.js` dirty state and Update   No view-level test     ✅ Behavior exists;
  require explicit                               handler                                                   🟡 untested
  Update                                                                                                   

  Export/import/export   Stage 5                 Separate import/export pipelines   Sanitizer fixtures do  ❌ Claimed stability
  remains stable                                 exist                              not perform Lexical    is not
                                                                                    round trips            comprehensively
                                                                                                           tested

  Draft restores editor  Stage 6; Stage 8.5      Dual state stored and restored     No draft round-trip    🟡 Implemented path;
  exactly                                                                           test                   correctness
                                                                                                           unverified

  Stable draft identity  Stage 8.5a              UUID, filename, timestamps, File   No automated test      🟡 Implemented,
  and overwrite                                  System Access handle                                      browser-dependent,
                                                                                                           untested

  State divergence is    Stage 8.5c              Revision counter and HTML dirty    No integration test    ⚠️ Partial
  impossible or detected                         warning                                                   detection;
                                                                                                           dual-state drafts
                                                                                                           have no
                                                                                                           reconciliation rule

  Invalid HTML never     Stage 8.5d              Try/catch and Lexical `onError`    No invalid-HTML        🟡 Defensive
  crashes editor                                 event                              integration suite      handling exists;
                                                                                                           recovery UX
                                                                                                           incomplete

  Note/example/warning   Contract; v1 spec       `CalloutNode`, callout bridge,     Sanitizer fixtures     🟡 Core exists;
  callouts                                       sanitizer                          only                   editor behavior
                                                                                                           lacks tests

  Blockquote and code    v1 editor spec          `QuoteNode` and `CodeNode`         No node round-trip     ✅ Direction
  use native Lexical                             registered                         tests                  implemented; 🟡
  nodes                                                                                                    untested

  User input and         Content model and plans Text style markers converted to    Sanitizer span         ⚠️ Behavior works
  variable are semantic                          classes at import/export           fixtures only          through a different
  authoring features                                                                                       model than planned
                                                                                                           docs

  Paragraph blocks       Newer roadmap decision  `htmlImport.js` calls              No fixture for         ❌ Not implemented;
  inside list items                              `unwrapParasInListItems()`;        paragraph-preserving   current code
                                                 contract examples use direct text  list items             enforces the
                                                                                                           opposite

  Rich table sections    Newer roadmap decision  Import/export flatten `thead`,     Basic sanitizer table  ⚠️ Cell blocks
  and cell block content                         `tbody`, and `tfoot`; paragraphs   fixtures               partly supported;
                                                 in cells are supported                                    section semantics
                                                                                                           intentionally
                                                                                                           removed

  Comments, templates,   Stages 9--12            No corresponding feature           None                   📚 Future
  versioning, content                            implementation found                                      specifications
  validation                                                                                               
  -----------------------------------------------------------------------------------------------------------------------------

## **3. High-priority findings**

### **F-01: The document source of truth is unresolved**

**Severity:** Architectural blocker\
**Status:** ⚠️ ❓

The code persists two content representations and restores both. Older
documents declare canonical HTML authoritative; the newer product
direction favors structured JSON.

**Risk:** List, table, figure, comment, and versioning work will make
the dual-state ambiguity more expensive. HTML may not preserve
editor-only or future semantic data.

**Action:** Create and approve a current architecture decision record
before structural feature work.

### **F-02: The full export path is not covered by the golden suite**

**Severity:** High\
**Status:** ⚠️

The export fixtures pass HTML strings directly into
`cleanAndNormalizeExportHtml()`. They do not:

-   construct Lexical state;\
-   generate HTML through `$generateHtmlFromNodes()`;\
-   exercise custom nodes;\
-   pass through the live `onHtmlChange` synchronization path;\
-   reload the result into Lexical;\
-   verify a draft save/open round trip.

**Risk:** A Lexical node can export unexpected DOM while every sanitizer
fixture remains green.

**Action:** Add integration fixtures for:

1.  Lexical JSON → canonical HTML.\
2.  Canonical HTML → Lexical JSON → canonical HTML.\
3.  Draft JSON → restored Lexical state → canonical HTML.\
4.  Lists, nested lists, callouts in list items, tables, inline
    semantics, headings, code, and blockquotes.

### **F-03: The final export gate does not enforce the export contract**

**Severity:** High\
**Status:** ⚠️

`validateExportFragmentAgainstContract()` checks for empty content and a
short list of forbidden document-level strings. It does not run the
contract sanitizer, compare normalized output, or report structural
violations.

**Risk:** The UI can claim an export is valid even when it contains a
contract violation that bypassed earlier synchronization.

**Action:** Make export derive from the structured document, run the
canonical export gate, and block or explicitly normalize when the result
differs.

### **F-04: List-item structure conflicts with the new decision**

**Severity:** High for the next roadmap release\
**Status:** ⚠️

Current behavior deliberately removes `<p>` wrappers inside `<li>`. The
current contract also shows text directly inside list items. The new
direction requires block content such as paragraphs and callouts inside
list items.

**Risk:** Fixing only export output will not fix the Lexical model,
Enter behavior, nested lists, callout placement, or HTML re-import.

**Action:** Treat this as a coordinated
contract/model/import/export/editor/test change.

### **F-05: Table structure conflicts with the new richer-table model**

**Severity:** High for the table release\
**Status:** ⚠️

The current contract says "simple tables only" and excludes table
scaffolding. Both import and export code unwrap `thead`, `tbody`, and
`tfoot`. Table cells already support paragraphs, lists, and callouts in
the sanitizer, which is a useful foundation.

**Action:** Decide the canonical table contract first:

-   whether `thead` and `tbody` are required;\
-   whether `th` is restricted to `thead`;\
-   permitted blocks inside `th` and `td`;\
-   whether captions, merged cells, nested lists, images, and callouts
    are allowed;\
-   how Lexical's table DOM maps to the canonical structure.

### **F-06: Word cleanup is reused in the live WYSIWYG synchronization path**

**Severity:** Medium-high\
**Status:** ⚠️

Lexical output is already normalized by `cleanAndNormalizeExportHtml()`.
`main.js` then passes it through `cleanHTML()`, which contains
Word-specific transformations.

**Risk:** Import-only heuristics can affect authored editor output and
make boundary ownership unclear.

**Action:** Separate these named boundaries:

-   `importExternalHtmlToCanonicalHtml()`\
-   `importCanonicalHtmlToEditorState()`\
-   `exportEditorStateToCanonicalHtml()`\
-   `validateCanonicalHtml()`

The live editor path should not invoke Word-specific sanitation.

### **F-07: Inline semantics do not use the documented custom-node model**

**Severity:** Medium\
**Status:** ⚠️ 📚

`UserInputNode.js`, `VariableNode.js`, and `SemanticInlineNode.js`
exist, but none is registered in `lexicalConfig.js`. The active
implementation stores CSS custom-property markers on text nodes and
converts them to semantic span classes during HTML generation.

This may be a valid implementation choice. The problem is that the docs
describe custom nodes as the intended architecture while the active
editor uses style markers.

**Action:** Decide whether to:

-   formalize text-style markers as the supported Lexical
    representation; or\
-   migrate to registered TypeSet semantic nodes.

Base the decision on editing behavior, serialization stability,
overlapping semantics, and future validation---not on the mere existence
of unused node files.

### **F-08: Callout documentation is substantially outdated**

**Severity:** Medium\
**Status:** 📚

Conflicts include:

-   The older node plan treats blockquote and code as callout kinds.\
-   The active `CalloutNode` allows only note, warning, and example.\
-   The v1 editor implementation correctly uses native Lexical quote and
    code nodes.\
-   The 2025 callout behavior specification requires automatic
    Note/Example labels.\
-   The active code marks label initialization deprecated and the
    sanitizer explicitly avoids adding labels.\
-   Stage 8.6 says insertion should be favored, but the generic
    single-block behavior still wraps the current block.

**Action:** Supersede the 2025 behavior spec with a short current
callout contract and add editor behavior tests.

### **F-09: Tests and build are not reproducible from the committed dependency tree**

**Severity:** High for engineering reliability\
**Status:** 🗑️

The repository's `.gitignore` excludes `node_modules`, but 4,521 files
beneath `node_modules` remain tracked. A clean archive of the audited
commit could not run the test harness because required package entry
points were missing.

An isolated `npm ci` attempt also failed in the audit environment
because of package-transfer/cache errors, so this audit does not treat
that install failure as an application build failure.

**Action:**

1.  Remove tracked `node_modules` from Git history going forward while
    retaining `package-lock.json`.\
2.  Verify `npm ci`, both golden suites, and `npm run build` in CI.\
3.  Add a single `npm test` command that runs all required checks.\
4.  Add GitHub Actions for clean-install reproducibility.

### **F-10: The test harness writes `.actual.html` files during failure**

**Severity:** Low-medium\
**Status:** 🟡

This is useful locally and covered by `.gitignore`, but it means tests
mutate the checkout on failure.

**Action:** Write diagnostic artifacts to a dedicated ignored
test-results directory or only when a diagnostic flag is supplied.

## **4. Documentation currency matrix**

  -------------------------------------------------------------------------------------
  Document                              Classification          Audit disposition
  ------------------------------------- ----------------------- -----------------------
  `docs/export_contract.md`             Partially current       Keep as authoritative
                                                                only after list/table
                                                                decisions and
                                                                validation language are
                                                                updated

  `docs/editor_content_model.md`        Historical design input Supersede with a
                                                                current TypeSet
                                                                document model

  `docs/lexical_node_plan.md`           Historical              Archive; useful
                                        implementation plan     rationale but conflicts
                                                                with active native
                                                                quote/code and
                                                                inline-marker choices

  `docs/lexical_editor_setup.md`        Historical setup plan   Archive after
                                                                extracting still-valid
                                                                configuration
                                                                requirements

  `docs/callout-behavior-spec.md`       Outdated behavior       Supersede; label and
                                        snapshot                callout-kind behavior
                                                                no longer match

  `docs/v1_editor_spec.md`              Historical release      Retain as version
                                        specification           history, not current
                                                                product architecture

  `docs/v1_addendum_scrub_vs_prep.md`   Superseded architecture Retain as history;
                                                                HTML-first two-mode
                                                                model conflicts with
                                                                authoring-first
                                                                direction

  Stage 1                               Partially current       Update after contract
                                        foundation              and test-boundary
                                                                changes

  Stage 2                               Partially current       Keep as Word-import
                                        implementation spec     adapter specification

  Stage 3                               Superseded              Rewrite around
                                        source-of-truth         canonical import
                                        language                boundary and structured
                                                                authoring state

  Stage 4                               Partially current       Keep explicit HTML
                                        workflow spec           Update gate; revise
                                                                source-of-truth
                                                                language

  Stage 5                               Incomplete/current goal Keep, but define actual
                                                                round-trip test layers

  Stage 6                               Partially implemented   Replace dual-state
                                                                ambiguity with
                                                                versioned draft-schema
                                                                specification

  Stage 7                               Partially implemented   Strengthen actual
                                                                export validation
                                                                requirements

  Stage 8                               Partially implemented   Split HTML import, Word
                                                                import, and draft
                                                                opening into explicit
                                                                adapters

  Stage 8.5                             Historical/current      Preserve achievements;
                                        implementation record   supersede
                                                                HTML-authoritative
                                                                architecture

  Stage 8.6                             Partially current       Reconcile with actual
                                        roadmap input           callout behavior and
                                                                newer
                                                                LKCS/slash-command
                                                                roadmap

  Stages 9--12                          Future proposals        Move to
                                                                roadmap/future-spec
                                                                area until scheduled
  -------------------------------------------------------------------------------------

## **5. Recommended authoritative document set**

Create a small set of current documents and clearly label older material
historical.

1.  **Product architecture**
    -   TypeSet as an authoring-first tool.\
    -   Structured document JSON as persistent state.\
    -   Import and export adapters.\
    -   Scrub and Prep as workflows, not competing data architectures.\
2.  **TypeSet document schema**
    -   Versioned JSON envelope.\
    -   Supported nodes and metadata.\
    -   Migration and recovery rules.\
3.  **Editor behavior contract**
    -   Lexical node mapping.\
    -   Lists, tables, callouts, figures, code, blockquotes, and inline
        semantics.\
    -   Enter, Tab, selection, and nesting behavior.\
4.  **Canonical HTML export contract**
    -   Tags, attributes, nesting, normalization, and examples.\
5.  **Import contract**
    -   External HTML/Word cleanup versus canonical HTML-to-editor
        import.\
6.  **Test strategy and traceability matrix**
    -   Requirement → implementation → unit/integration/golden coverage.

Add a header to every retained historical document:

> **Status: Historical.** This document records an earlier TypeSet
> design or release and is not authoritative for current implementation.

## **6. Recommended execution order**

### **Release 0: Establish the verified baseline**

1.  Remove tracked dependencies and establish clean CI.\
2.  Record the seven existing Word-suite failures as explicit baseline
    defects.\
3.  Add a standard `npm test` command.\
4.  Add initial Lexical integration and draft round-trip tests.\
5.  Create the current architecture decision and draft schema.\
6.  Update the roadmap statuses from verified repository evidence.

### **Release 1: Lists and headings**

1.  Approve paragraph-in-list-item structure.\
2.  Update the HTML contract.\
3.  Update Lexical import/export mapping.\
4.  Update Enter/Tab/nesting behavior.\
5.  Protect callouts inside list items.\
6.  Add golden and editor-level regression tests.

### **Release 2: Rich table model**

1.  Approve table section and cell-content rules.\
2.  Update the contract and fixtures.\
3.  Map Lexical tables to canonical table HTML.\
4.  Add step/action table behavior.\
5.  Add import/export/round-trip tests.

### **Release 3: Semantic editor hardening**

1.  Resolve the inline-node versus style-marker decision.\
2.  Replace global DOM bridges where practical with editor
    commands/plugins.\
3.  Finalize callout insertion/removal behavior.\
4.  Add behavior tests for callouts, code, quotes, inline semantics, and
    recovery.

The remaining roadmap releases---authoring-efficiency features, figures,
and stronger persistence/versioning---can then build on the verified
structured model.

## **7. Proposed regression layers**

  -----------------------------------------------------------------------
  Layer                   Purpose                 Representative tests
  ----------------------- ----------------------- -----------------------
  Import unit tests       External input cleanup  Word variants,
                                                  malformed HTML,
                                                  explicit callout
                                                  signals

  Contract unit tests     Canonical normalization Tags, attributes,
                                                  nesting, deterministic
                                                  formatting

  Lexical import tests    Canonical HTML to       Lists, tables,
                          editor state            callouts, semantic
                                                  spans

  Lexical export tests    Editor JSON to          Every supported node
                          canonical HTML          and nesting combination

  Round-trip tests        Structural stability    HTML → Lexical → HTML
                                                  and JSON → HTML → JSON

  Draft tests             Persistence             Save/open identity,
                                                  schema version,
                                                  fallback recovery

  View integration tests  State transitions       HTML pending edits,
                                                  Update, WYSIWYG
                                                  changes, export

  Browser smoke tests     User-critical paths     New, import, edit,
                                                  save, reopen, copy,
                                                  publish
  -----------------------------------------------------------------------

## **8. Immediate decisions needed**

  -----------------------------------------------------------------------
  Decision                            Recommendation
  ----------------------------------- -----------------------------------
  Is persistent JSON the source of    Yes, through a TypeSet-owned
  truth?                              versioned draft schema containing
                                      Lexical-compatible structured
                                      content

  Is canonical HTML still important?  Yes; make it the derived
                                      interchange and publication
                                      contract

  Are Scrub and Prep separate         No; retain them as workflows over
  architectures?                      one document model

  Should `<li>` preserve paragraph    Yes, if callouts, multiple blocks,
  blocks?                             and technical step structures are
                                      first-class requirements

  Should tables preserve `thead` and  Likely yes; approve a specific
  `tbody`?                            canonical table model before coding

  Are blockquote and code callouts?   No; keep native quote and code
                                      nodes and reserve `CalloutNode` for
                                      note/example/warning

  Are user-input and variable custom  Decide during semantic hardening;
  nodes?                              do not leave docs and
                                      implementation describing different
                                      models

  Should Word cleanup run on editor   No; keep it inside the
  output?                             external-import adapter
  -----------------------------------------------------------------------

## **9. Audit limitations**

-   The audit is read-only and does not modify the TypeSet repository.\
-   The latest known behavioral baseline is 34 passing export fixtures
    and seven failing Word fixtures, based on the immediately preceding
    repository check.\
-   A fresh verification run could not be completed because the
    committed dependency tree is incomplete and an isolated clean
    install failed in the audit environment. This is recorded as a
    reproducibility finding, not proof of a TypeSet build failure.\
-   Browser-specific behavior was traced from source but not exercised
    interactively.\
-   Proposed 2026 decisions were evaluated against the repository; they
    were not treated as already implemented.

## **10. Audit conclusion**

TypeSet does not need a reset. It needs a controlled architectural
consolidation.

The existing application already provides:

-   a Lexical editor;\
-   deterministic HTML sanitation;\
-   Word-cleanup logic;\
-   custom callouts;\
-   semantic inline formatting;\
-   drafts with identity;\
-   explicit raw-HTML updates;\
-   export and publish paths;\
-   useful golden fixtures.

The next step is to make those pieces agree about one persistent
document model and to test the boundaries between them. Once that
baseline is established, the roadmap sequence---lists and headings,
richer tables, semantic-node hardening, authoring shortcuts, figures,
and stronger persistence---remains sound.