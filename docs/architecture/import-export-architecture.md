# **Import / Export Architecture**

**Version:** 1.0  
 **Status:** Adopted

**Related Documents**

* System Architecture  
* Lexical Architecture  
* Document Model  
* Export Contract  
* Editor Content Model  
* Persistence

---

# **Purpose**

This document defines how content enters, moves through, and leaves TypeSet.

Its purpose is to establish a consistent architecture for translating between external document formats, the internal editing model, and published output while preserving semantic meaning.

Import and export are not treated as implementation details. They are fundamental architectural subsystems responsible for ensuring that information remains consistent across different representations.

---

# **Governing Principle**

> **Canonical HTML is a publishing format, not an editing format.**

TypeSet does not edit HTML.

TypeSet edits structured document state.

HTML is generated from that state whenever publishing is required.

This distinction allows the editor to optimize for authoring while the export pipeline optimizes for clean, semantic output.

---

# **The Translation Philosophy**

TypeSet exists at the intersection of many document formats.

Authors may create content from:

* Microsoft Word  
* Existing HTML  
* Future Markdown  
* Future plain text  
* Future imported documentation systems

Likewise, documents may eventually be published to:

* ServiceNow  
* Confluence  
* Markdown  
* PDF  
* Static websites  
* Future publishing targets

Rather than treating each format as a special case, TypeSet uses a translation architecture.

Every external representation is translated into a common internal editing model.

Every publishing target is generated from that same internal model.

The editor itself remains independent of any external format.

---

# **Architectural Overview**

The complete content pipeline is shown below.

               External Sources  
        ┌──────────┬──────────┬──────────┐  
        │          │          │  
      Word       HTML     Markdown  
        │          │          │  
        └──────────┴──────────┘  
                  │  
                  ▼  
             Import Pipeline  
                  │  
          Parse External Content  
                  │  
                  ▼  
                Scrub  
                  │  
                  ▼  
               Prepare  
                  │  
                  ▼  
             Normalize  
                  │  
                  ▼  
              Validate  
                  │  
                  ▼  
        Lexical Editor State  
                  │  
                  ▼  
         TypeSet Document (.typeset)  
                  │  
                  ▼  
            Export Pipeline  
                  │  
          Normalize for Export  
                  │  
                  ▼  
             Validate Contract  
                  │  
                  ▼  
          Canonical HTML Output  
                  │  
        ┌─────────┴─────────┐  
        │                   │  
   ServiceNow         Future Targets

Every stage has a single responsibility.

---

# **Import Architecture**

Import converts external content into editable TypeSet documents.

Import is responsible for translation.

It is not responsible for publishing.

---

## **Parse**

The parser converts raw input into a structured representation suitable for processing.

Examples include:

* DOM trees  
* Word document structures  
* Markdown syntax trees

Parsing does not alter document meaning.

It merely creates a structure that later stages can analyze.

---

## **Scrub**

Scrubbing removes information that TypeSet intentionally does not preserve.

Examples include:

* Microsoft Office artifacts  
* unnecessary spans  
* inline font declarations  
* proprietary attributes  
* empty formatting  
* unsupported metadata

Scrubbing answers the question:

> *What information should never become part of a TypeSet document?*

---

## **Prepare**

Preparation converts remaining content into structures expected by the editor.

Typical operations include:

* wrapping orphan text in paragraphs  
* restructuring lists  
* rebuilding tables  
* converting unsupported nesting  
* establishing valid block structure

Preparation does not remove information.

It reorganizes information into forms compatible with the TypeSet content model.

---

## **Normalize**

Normalization ensures structurally equivalent content always becomes identical.

Examples include:

* merging adjacent text nodes  
* consistent paragraph structures  
* canonical list nesting  
* canonical table organization

Normalization reduces ambiguity throughout the remainder of the pipeline.

---

## **Validate**

Validation verifies that imported content satisfies the document contract.

Validation may:

* accept content  
* repair recoverable issues  
* report warnings  
* reject invalid structures

Validation should never silently corrupt document meaning.

---

# **Lexical Boundary**

The import pipeline ends when valid editor state has been produced.

At this point the document is no longer HTML.

It has become structured editor content.

From this point forward, editing occurs entirely within the Lexical subsystem.

No further HTML translation occurs until export.

This boundary is one of the most important architectural separations in TypeSet.

---

# **Export Architecture**

Export performs the inverse translation.

Rather than interpreting external content, it produces canonical publishing output.

Export owns every rule required to satisfy the publishing contract.

---

## **Export Is Not Serialization**

Serialization preserves editor state.

Export creates published output.

These are different operations.

Saving a document preserves editing.

Export produces presentation.

The distinction prevents publishing requirements from influencing editing behavior.

---

## **Export Normalization**

Before generating HTML, editor content may require normalization.

Examples include:

* resolving temporary editor structures  
* simplifying nested formatting  
* flattening internal representations  
* producing consistent block organization

Export normalization prepares content for publishing without altering document meaning.

---

## **Export Validation**

Before HTML is produced, the document is validated against the Export Contract.

Validation ensures:

* supported structures only  
* semantic consistency  
* valid nesting  
* predictable output

Contract validation guarantees that every exported document satisfies the expectations of downstream systems.

---

## **Canonical HTML**

Canonical HTML is the authoritative published representation generated by TypeSet.

Its goals are:

* semantic correctness  
* predictable structure  
* minimal unnecessary markup  
* platform independence  
* readability  
* stability

Canonical HTML intentionally favors consistency over preserving the exact formatting produced by source documents.

---

# **Semantic Preservation**

The purpose of import and export is not to preserve every formatting decision.

Their purpose is to preserve meaning.

Examples include:

* headings remain headings  
* lists remain lists  
* procedures remain procedures  
* warnings remain warnings  
* tables remain tables

Presentation details that do not contribute to document meaning may be discarded.

Semantic information should always be preserved whenever possible.

---

# **Information Loss**

Some information cannot or should not survive translation.

Examples include:

* Word-specific formatting  
* unsupported HTML constructs  
* proprietary metadata  
* editor-specific artifacts

Information loss should always be:

* intentional  
* documented  
* predictable

Unexpected information loss is considered a defect.

---

# **Future Publishing Targets**

The export architecture is intentionally independent of HTML.

Although canonical HTML is currently the primary publishing format, future exporters may generate:

* Markdown  
* PDF  
* Confluence storage format  
* documentation APIs  
* custom publishing systems

Each exporter should consume the same editor model rather than translating from another exported format.

This avoids cascading conversion errors.

---

# **Why Translation Occurs at the Boundaries**

One of the defining architectural principles of TypeSet is that translation occurs only at subsystem boundaries.

External systems speak their native formats.

The editor speaks Lexical.

Persistence stores TypeSet documents.

Publishing produces canonical HTML.

Each subsystem communicates through explicit translation layers rather than continuously converting between representations.

This minimizes coupling and keeps each subsystem focused on a single responsibility.

---

# **Responsibilities**

## **Import owns**

* parsing  
* scrubbing  
* preparation  
* normalization  
* validation  
* translation into editor state

## **Lexical owns**

* editing  
* selections  
* commands  
* undo  
* document interaction

## **Persistence owns**

* saving editor state  
* metadata  
* schema versioning  
* recovery  
* revisions

## **Export owns**

* normalization for publication  
* contract validation  
* canonical HTML generation  
* future publishing targets

---

# **Design Philosophy**

Import and export exist to isolate the editor from external formats.

The editor should never contain Word-specific behavior.

It should never contain ServiceNow-specific behavior.

It should never contain HTML-specific editing logic.

Instead, those concerns belong entirely to the translation layers surrounding the editor.

This isolation allows TypeSet to evolve independently of any single import source or publishing target.

---

# **Architectural Summary**

The Import and Export Architecture defines how information moves through TypeSet.

External content is translated into a common editing model.

Authors edit structured document state rather than HTML.

Published output is generated from that state through explicit export contracts.

By confining translation to subsystem boundaries, TypeSet preserves semantic meaning while remaining flexible enough to support new document sources and publishing targets in the future.

