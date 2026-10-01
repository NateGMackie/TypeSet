# **Lexical Architecture**

**Version:** 1.0  
 **Status:** Adopted  
 **Related Documents:**

* System Architecture  
* Document Model  
* Editor Content Model  
* Import / Export Architecture  
* Export Contract

---

# **Purpose**

This document defines the role of Lexical within the TypeSet architecture.

Its purpose is to establish the boundary between the editor framework and the TypeSet product model. It explains why Lexical was selected, what responsibilities belong to the editor, what responsibilities belong to TypeSet, and how those responsibilities interact.

The goal is not merely to describe the implementation of the editor. Rather, this document captures the architectural decisions that allow TypeSet to remain independent of any particular editing framework while providing a modern authoring experience.

---

# **Governing Principle**

> **Lexical is the editing engine, not the product model.**

Everything else in this document follows from that single statement.

Lexical exists to provide an excellent editing experience.

TypeSet exists to create semantic technical documentation.

Those are related goals, but they are not the same goal.

---

# **Background**

TypeSet did not begin as a document editor.

The original project focused on converting Microsoft Word documents into clean HTML suitable for publishing in ServiceNow.

As the project evolved, additional editing features were introduced:

* semantic callouts  
* reusable formatting  
* variables  
* screenshots  
* improved list handling  
* table editing  
* future document components

Eventually the editor became the center of the application rather than simply a preview of imported HTML.

At that point, maintaining an HTML-first editing model became increasingly difficult.

---

# **The HTML-Centric Experiment**

Early versions of TypeSet treated HTML as both the editing model and the publishing model.

The workflow resembled:

HTML  
↓  
contenteditable  
↓  
Modified HTML  
↓  
Published HTML

This approach appeared simple but introduced numerous problems.

Browsers generate inconsistent HTML during editing.

Different editing operations produce different DOM structures.

Selections become difficult to preserve.

Undo behavior varies.

Semantic structure is easily lost.

Supporting advanced editing features becomes increasingly complex.

As TypeSet added richer authoring capabilities, these limitations became the dominant source of complexity.

Rather than building features, development increasingly focused on correcting browser behavior.

---

# **Why Lexical Was Chosen**

Lexical solves the editing problem.

Instead of editing HTML directly, Lexical maintains an internal editor state that is specifically designed for interactive editing.

This provides:

* reliable selection handling  
* predictable undo and redo  
* composable editing behavior  
* custom nodes  
* editor transforms  
* consistent editing across browsers

Lexical does not attempt to solve publishing.

That distinction aligns well with TypeSet's goals.

---

# **The Architectural Shift**

One of the most significant architectural decisions in TypeSet was recognizing that editing and publishing are separate concerns.

Instead of forcing HTML to serve both purposes, the responsibilities were divided.

Lexical became responsible for editing.

TypeSet became responsible for publishing.

The resulting architecture looks like:

Author

↓

Lexical Editor

↓

TypeSet Document

↓

Export Contract

↓

Canonical HTML

This separation dramatically reduces complexity throughout the system.

---

# **Responsibilities of Lexical**

Lexical is responsible for editing behavior.

Examples include:

* cursor movement  
* text entry  
* selections  
* copy and paste  
* keyboard shortcuts  
* undo  
* redo  
* node transforms  
* editor commands  
* editor state serialization

Lexical owns the mechanics of editing.

It does not own document semantics.

---

# **Responsibilities of TypeSet**

TypeSet owns the meaning of the document.

Examples include:

* semantic HTML  
* publishing contracts  
* callout behavior  
* table normalization  
* import pipeline  
* export pipeline  
* validation  
* document persistence  
* future publishing targets

TypeSet determines what the document means.

Lexical determines how the user edits it.

---

# **Why TypeSet Does Not Fight Lexical**

A recurring lesson throughout development was that attempting to force Lexical to behave like an HTML editor consistently increased complexity.

Examples included:

* forcing specific DOM structures  
* reproducing Word behavior  
* maintaining HTML-specific editing rules  
* treating exported HTML as editable state

Each of these approaches created fragile code that required increasingly complicated workarounds.

Instead, TypeSet adopts the philosophy of working with Lexical rather than against it.

When Lexical provides a natural editing model, TypeSet prefers that model.

Translation into canonical HTML occurs during export rather than during editing.

---

# **Translation Occurs at the Boundaries**

One of the most important architectural principles is that translation occurs only when information crosses subsystem boundaries.

Import translates external content into Lexical.

Export translates Lexical into canonical HTML.

Persistence stores serialized editor state.

Editing itself performs no publishing translation.

This keeps each subsystem focused on a single responsibility.

---

# **The Editor Is Not HTML**

Although TypeSet ultimately produces HTML, the editor should never be viewed as an HTML editor.

The editor manipulates structured document state.

HTML is simply one possible representation of that state.

Future publishing formats may include:

* Markdown  
* PDF  
* Confluence  
* documentation platforms  
* custom publishing targets

Supporting these formats becomes possible because editing is independent of publishing.

---

# **Lexical Nodes**

Lexical represents document structure through nodes.

TypeSet extends this system only when additional semantic meaning is required.

Examples include future custom nodes such as:

* Callout  
* Variable  
* Screenshot  
* Procedure Step  
* Warning  
* Example

Custom nodes should represent meaningful document concepts rather than visual styling.

---

# **Node Transforms**

Node transforms normalize editor state.

They should:

* simplify editing  
* remove invalid structures  
* maintain predictable behavior

Transforms should not perform publishing logic.

If a rule exists solely to satisfy exported HTML, it belongs in the export pipeline rather than inside the editor.

---

# **Selection Preservation**

Selections are an editing concern.

They belong entirely within the Lexical subsystem.

Import, export, persistence, and publishing should never rely upon cursor position.

This allows editing behavior to evolve independently of document serialization.

---

# **Undo and Redo**

Undo and redo are runtime editing features.

They exist to improve the author's editing experience.

They are intentionally separate from document persistence and future revision history.

Closing a document ends the editing session.

Document history belongs to the persistence architecture rather than the editor.

---

# **Error Recovery**

Editor failures should never compromise document integrity.

Whenever possible:

* invalid editor state should be normalized  
* unsupported content should be isolated  
* publishing should continue when safe  
* validation should identify recoverable problems

The editor should fail safely rather than corrupt document state.

---

# **Design Philosophy**

The editor should feel invisible.

Authors should think about documentation rather than HTML.

Technical writers should focus on:

* structure  
* meaning  
* clarity  
* workflow

The editor exists to support those goals rather than becoming the center of attention.

---

# **Architectural Summary**

The most important architectural decision made during the development of TypeSet was separating editing from publishing.

Lexical is responsible for editing.

TypeSet is responsible for document meaning.

The Export Contract is responsible for producing canonical HTML.

By keeping these responsibilities independent, TypeSet gains flexibility, maintainability, and the freedom to evolve beyond a single publishing platform.

This separation is expected to remain one of the defining architectural characteristics of the project.

