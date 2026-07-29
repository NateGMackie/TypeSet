# **Persistence Architecture**

**Version:** 1.0  
 **Status:** Adopted

**Related Documents**

* System Architecture  
* Lexical Architecture  
* Import / Export Architecture  
* Document Model  
* Export Contract

---

# **Purpose**

This document defines how TypeSet documents are stored, recovered, versioned, and evolved over time.

Persistence is responsible for preserving the author's work without coupling document storage to any specific publishing format or editor implementation.

The goal of persistence is not simply to write files to disk. Its responsibility is to preserve the complete authoring state of a document throughout its lifecycle.

---

# **Governing Principle**

> **A TypeSet document preserves authoring state, not published output.**

TypeSet stores the information required to continue editing a document.

Published HTML is generated when needed.

It is never considered the authoritative representation of the document.

---

# **Why Persistence Exists**

A document has a much longer lifespan than a single editing session.

Authors expect to:

* save work  
* reopen documents  
* recover from crashes  
* revise previous work  
* continue writing days or months later

Persistence ensures that the document remains editable throughout that lifecycle.

---

# **The Source of Truth**

TypeSet has a single authoritative representation of a document.

That representation is the **TypeSet Document**.

The TypeSet Document is stored as a versioned JSON envelope containing serialized Lexical editor state.

Conceptually:

{  
  "schemaVersion": 1,  
  "metadata": {  
    ...  
  },  
  "editorState": {  
    ...Lexical JSON...  
  }  
}

The document intentionally does **not** store canonical HTML.

HTML is regenerated whenever publishing is requested.

This keeps authoring independent from publishing.

---

# **Why HTML Is Not Stored**

Earlier versions of the project treated HTML as the primary document representation.

As the editor evolved, this approach became increasingly problematic.

HTML cannot reliably preserve:

* editor selections  
* editing behavior  
* future editor features  
* runtime state  
* framework-specific structures

Maintaining both editable HTML and editor state would create two competing sources of truth.

TypeSet intentionally avoids this duplication.

There is only one authoritative document.

Everything else is derived from it.

---

# **Document Envelope**

The TypeSet Document consists of two conceptual layers.

## **Metadata**

Metadata describes the document itself.

Examples include:

* schema version  
* title  
* author  
* creation date  
* last modified date  
* future document settings

Metadata describes the document.

It is not part of the document content.

---

## **Editor State**

The editor state contains the complete editable document.

This includes:

* paragraphs  
* headings  
* lists  
* tables  
* callouts  
* formatting  
* custom nodes

The editor state is the portion of the document loaded into Lexical when editing begins.

---

# **Schema Versioning**

Every document includes a schema version.

The schema version identifies the structure of the TypeSet Document rather than the version of the application.

This allows the document format to evolve independently of the editor implementation.

---

# **Current Migration Policy**

During early development, backward compatibility is not a primary objective.

If a document uses an unsupported schema version, TypeSet should fail safely rather than attempting unreliable conversions.

Migration tools may be introduced once the document format stabilizes.

---

# **Saving**

Saving writes the current TypeSet Document to persistent storage.

Saving preserves:

* metadata  
* serialized editor state

Saving does not generate canonical HTML.

Export remains responsible for publishing.

---

# **Opening Documents**

Opening a document consists of:

1. Reading the document envelope.  
2. Validating the schema version.  
3. Validating document integrity.  
4. Loading the serialized editor state.  
5. Initializing the editor.

If validation fails, the editor should report the problem without corrupting the stored document.

---

# **Recovery**

Recovery protects authors from unexpected interruptions.

Examples include:

* application crashes  
* operating system failures  
* power loss  
* accidental closure

Recovery snapshots exist solely to restore interrupted editing sessions.

They are separate from ordinary document saves.

---

# **Recovery Philosophy**

Recovery data is temporary.

It exists only to prevent loss of work.

Recovery should never replace intentional document saves.

Once recovery is no longer needed, temporary recovery data may be discarded.

---

# **Recovery Retention**

Recovery information should be retained using a hybrid strategy.

Examples include:

* recent checkpoints  
* editing sessions  
* editing days

This balances reliable recovery with reasonable storage requirements.

Retention policies may evolve as the application matures.

---

# **Undo Versus Revisions**

Undo is an editor feature.

Revision history is a persistence feature.

These concepts solve different problems.

Undo allows authors to reverse recent editing operations.

Revision history preserves meaningful document states across editing sessions.

Closing the document ends the undo history.

Revision history remains available.

---

# **Future Revision History**

Future versions of TypeSet may provide document revisions similar to source control systems.

Potential capabilities include:

* named revisions  
* restore previous versions  
* compare revisions  
* document history  
* collaborative editing

These capabilities build upon the persistence architecture but remain independent of the editing subsystem.

---

# **Autosave**

Autosave improves resilience without replacing explicit document saves.

Future implementations may periodically write recovery snapshots during editing.

Autosave should be:

* unobtrusive  
* reliable  
* independent of publishing

Recovery snapshots should never overwrite intentional document versions without the author's knowledge.

---

# **Integrity**

Persistence is responsible for preserving document integrity.

Whenever possible, stored documents should remain:

* complete  
* self-consistent  
* recoverable  
* version identifiable

Persistence should never silently discard document information.

If corruption is detected, it should be reported explicitly.

---

# **Relationship to Import and Export**

Persistence sits between editing and publishing.

Conceptually:

External Content  
        │  
        ▼  
Import  
        │  
        ▼  
Lexical Editor  
        │  
        ▼  
TypeSet Document  
        │  
        ▼  
Persistence  
        │  
        ▼  
Reopen Later  
        │  
        ▼  
Lexical Editor  
        │  
        ▼  
Export  
        │  
        ▼  
Canonical HTML

Persistence stores the editable document.

Export generates publishable output.

These responsibilities remain intentionally separate.

---

# **Future Collaboration**

Although TypeSet currently targets a single author, the persistence architecture intentionally avoids assumptions that would prevent future collaboration.

Potential future capabilities include:

* shared documents  
* cloud synchronization  
* collaborative editing  
* merge operations  
* revision branching

These features should extend the persistence layer rather than requiring changes to the editor architecture.

---

# **Responsibilities**

Persistence owns:

* document storage  
* document loading  
* schema version validation  
* metadata  
* recovery  
* autosave  
* revision history  
* migration support

Persistence does not own:

* HTML generation  
* document editing  
* publishing  
* import translation  
* export translation

---

# **Design Philosophy**

Persistence exists to preserve the author's work, not to preserve a particular output format.

By storing the complete editing state within a TypeSet-owned document, the application remains free to evolve its publishing formats, import sources, and editor implementation without changing what a document fundamentally is.

This separation protects both the author's work and the long-term stability of the document format.

---

# **Architectural Summary**

The Persistence Architecture defines how TypeSet documents survive beyond individual editing sessions.

The TypeSet Document serves as the single source of truth by storing versioned metadata together with serialized editor state.

Import creates the document.

Lexical edits the document.

Persistence preserves the document.

Export publishes the document.

By separating authoring state from published output, TypeSet gains flexibility, reliability, and the ability to evolve independently of any single editor or publishing platform.

