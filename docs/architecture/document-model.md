# **Document Model**

**Version:** 1.0  
 **Status:** Adopted

**Related Documents**

* Product Principles  
* System Architecture  
* Lexical Architecture  
* Import / Export Architecture  
* Persistence  
* Validation Architecture  
* Editor Content Model  
* Export Contract

---

# **Purpose**

This document defines what a TypeSet document is.

It describes the document's identity, ownership, structure, and lifecycle independently of any editor implementation or publishing format.

The document model serves as the conceptual center of the TypeSet architecture. Every subsystem—import, editing, persistence, validation, and export—exists to either create, manipulate, preserve, validate, or publish the TypeSet Document.

---

# **Governing Principle**

> **A TypeSet document is the single source of truth for every stage of the authoring lifecycle.**

The document exists independently of:

* HTML  
* Microsoft Word  
* ServiceNow  
* Lexical  
* any future publishing target

External formats are translated into the document.

Published formats are generated from the document.

The document itself remains the authoritative representation.

---

# **Why a Document Model Exists**

A document should not be defined by the application currently displaying it.

Likewise, it should not be defined by the format used to publish it.

Instead, the document should represent the author's intent independently of both editing and publishing technologies.

This separation allows TypeSet to evolve without changing what a document fundamentally is.

---

# **The TypeSet Document**

A TypeSet Document is a versioned JSON document owned entirely by TypeSet.

Conceptually, it contains two categories of information:

* document metadata  
* editor content

TypeSet Document  
│  
├── Metadata  
│  
└── Editor State

Everything required to continue authoring the document exists within this structure.

Published representations are generated when needed rather than stored.

---

# **Metadata**

Metadata describes the document itself rather than its content.

Examples include:

* schema version  
* title  
* author  
* creation date  
* last modified date  
* future document settings  
* future collaboration information

Metadata is not rendered as part of the document.

Instead, it provides information required for managing the document throughout its lifecycle.

---

# **Editor State**

The editor state contains the editable content of the document.

In Version 1, this consists of serialized Lexical editor state.

The editor state preserves the complete authoring experience, including:

* paragraphs  
* headings  
* lists  
* tables  
* callouts  
* inline formatting  
* future semantic nodes

The editor state is loaded into Lexical whenever a document is opened for editing.

---

# **Why Lexical State Is Stored**

TypeSet intentionally stores serialized Lexical editor state rather than canonical HTML.

Lexical provides a rich editing model capable of preserving information that HTML alone cannot represent reliably.

Examples include:

* editing behavior  
* custom node structures  
* future editor capabilities  
* consistent editing semantics

By preserving editor state directly, TypeSet avoids reconstructing editing behavior from published output.

---

# **Why HTML Is Not the Document**

Canonical HTML is a publishing format.

It is intentionally excluded from the stored document.

Storing HTML alongside editor state would introduce two competing representations of the same information.

Instead:

* the document preserves authoring state  
* export generates publishing state

This eliminates ambiguity regarding the source of truth.

---

# **Source of Truth**

The TypeSet Document is the only authoritative representation of a document.

Every other representation is derived.

Word  
        │  
HTML  
        │  
Markdown  
        │  
        ▼  
Import  
        │  
        ▼  
TypeSet Document  
        │  
        ├──────────────┐  
        │              │  
        ▼              ▼  
Persistence      Lexical Editor  
        │              │  
        └──────┬───────┘  
               │  
               ▼  
            Export  
               │  
               ▼  
        Canonical HTML

No subsystem may establish an independent source of truth.

---

# **Ownership**

Different architectural subsystems interact with the document in different ways.

Import creates the document.

Lexical edits the document.

Persistence preserves the document.

Validation protects the document.

Export publishes the document.

Only the TypeSet Document itself remains constant throughout every stage.

---

# **Document Lifecycle**

Every document progresses through a common lifecycle.

External Content  
        │  
        ▼  
Import  
        │  
        ▼  
TypeSet Document Created  
        │  
        ▼  
Author Editing  
        │  
        ▼  
Save  
        │  
        ▼  
Reopen  
        │  
        ▼  
Edit Again  
        │  
        ▼  
Export  
        │  
        ▼  
Published HTML

The document remains the same document throughout every stage.

Only its representations change.

---

# **Semantic Meaning**

The purpose of the document model is to preserve meaning rather than presentation.

Examples include:

* headings remain headings  
* procedures remain procedures  
* warnings remain warnings  
* lists remain lists  
* tables remain tables

Presentation may change between publishing targets.

Document meaning should not.

---

# **Document Identity**

The identity of a document is determined by its semantic content rather than by the format used to store or publish it.

A document exported to HTML and later re-imported should represent the same document, even though its internal representation has changed.

Likewise, future exporters should not redefine what a document is.

The document exists independently of its representations.

---

# **Schema Evolution**

Every document includes a schema version.

The schema version identifies the structure of the TypeSet Document.

As the application evolves, newer versions may introduce:

* additional metadata  
* new semantic nodes  
* revised document structures

Schema evolution should preserve the long-term stability of the document model whenever practical.

---

# **Relationship to Other Architecture**

The Document Model sits at the center of the TypeSet architecture.

Each subsystem interacts with it differently:

| Subsystem | Relationship |
| ----- | ----- |
| Import | Creates the document from external content |
| Lexical | Loads and edits the document |
| Persistence | Saves and restores the document |
| Validation | Ensures the document satisfies architectural contracts |
| Export | Generates published representations |

No subsystem owns the document itself.

The document belongs to TypeSet.

---

# **Future Evolution**

The document model intentionally avoids assumptions tied to current implementation details.

Future versions may support:

* additional metadata  
* collaboration  
* revision history  
* comments  
* publishing metadata  
* custom semantic node types

These additions should extend the document rather than redefine it.

---

# **Design Philosophy**

The TypeSet Document is intentionally independent of both editing technology and publishing technology.

Editors may change.

Publishing targets may change.

Document features will continue to evolve.

The document itself should remain a stable, long-lived representation of the author's work.

This stability protects both the author's investment and the long-term maintainability of the application.

---

# **Architectural Summary**

The TypeSet Document is the conceptual center of the TypeSet architecture.

It serves as the single source of truth throughout the authoring lifecycle, preserving semantic content independently of editing frameworks and publishing formats.

Import creates it.

Lexical edits it.

Persistence preserves it.

Validation protects it.

Export publishes it.

By defining the document independently of every subsystem that interacts with it, TypeSet maintains a stable architecture capable of evolving without redefining what a document fundamentally is.

