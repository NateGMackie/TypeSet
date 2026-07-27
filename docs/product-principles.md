# **TypeSet Product Principles**

## **Purpose**

This document defines the fundamental principles that guide the design and development of TypeSet. These principles are intentionally stable and should change only when the long-term direction of the product changes.

Every significant feature, architectural decision, workflow change, and user experience improvement should be evaluated against these principles.

When implementation and these principles conflict, the implementation should be considered incorrect until an intentional decision is made to revise the principles.

---

# **1\. TypeSet is an authoring tool.**

TypeSet exists to help authors create clear, maintainable technical documentation.

It is not intended to become a general-purpose word processor or webpage designer.

Features should improve the writing, organization, and maintenance of technical documentation rather than attempt to replicate the feature set of applications such as Microsoft Word.

---

# **2\. Semantic structure is more important than visual appearance.**

Authors work with the meaning of content, not its presentation.

TypeSet should encourage semantic structures such as headings, procedures, callouts, variables, tables, and lists rather than visual formatting choices.

Presentation belongs to CSS and downstream publishing systems.

---

# **3\. The WYSIWYG editor is the primary authoring experience.**

Authors should spend nearly all of their time working in the editor.

The editor should provide a predictable, efficient writing experience while exposing semantic authoring features through intentional tools rather than raw HTML.

---

# **4\. Lexical owns editing behavior.**

Lexical is the editing engine.

Whenever practical, TypeSet should adopt Lexical's native document model, commands, selection behavior, keyboard handling, and editing conventions.

Custom behavior should be introduced only when required to support genuine TypeSet semantics or technical writing workflows.

---

# **5\. Clean HTML is a public contract.**

Canonical HTML is not an internal implementation detail.

It is the stable, deterministic output produced by TypeSet and represents the contract between TypeSet and downstream publishing systems.

Breaking changes to exported HTML require explicit versioning, documentation updates, migration planning, and regression testing.

---

# **6\. Import and export are separate concerns.**

External content should never define the internal architecture of TypeSet.

Word documents, pasted HTML, Markdown, and future import formats are temporary inputs that are translated into TypeSet's document model.

Likewise, HTML is an exported publication format rather than the internal editing model.

---

# **7\. Predictability is more valuable than cleverness.**

The same document should always produce the same output.

Import, normalization, editing, validation, and export should behave deterministically.

When multiple reasonable behaviors exist, TypeSet should favor the behavior that is easiest for authors to understand and predict.

---

# **8\. Simplicity is a feature.**

Every new capability increases complexity.

Features should be added only when they solve real authoring problems observed through actual use.

The interface should remain focused, intentional, and approachable.

---

# **9\. Architecture should reflect responsibilities.**

Major responsibilities should remain clearly separated.

Examples include:

* Document persistence  
* Import pipelines  
* HTML normalization  
* Editor behavior  
* Export generation  
* Toolbar commands  
* Semantic nodes  
* Validation  
* User interface

A feature should be implemented within the responsibility that naturally owns it rather than introducing unnecessary coupling.

---

# **10\. Documentation defines the product.**

Architecture should not exist only in source code.

When the product changes, the governing documentation should be updated alongside the implementation.

Specifications, contracts, schemas, and migration documents together define the intended behavior of TypeSet.

---

# **11\. Preserve author trust.**

Authors must be able to trust that their work is safe.

TypeSet should prioritize:

* preserving user content  
* deterministic behavior  
* recoverable failures  
* stable editing  
* reliable undo and redo  
* transparent validation  
* predictable imports and exports

Protecting user content always takes precedence over convenience or implementation shortcuts.

---

# **12\. Build for the future without sacrificing the present.**

TypeSet should establish strong architectural foundations while remaining useful throughout development.

Large changes should be introduced through small, well-defined implementation stages with explicit acceptance criteria.

The goal is continuous progress without sacrificing stability.

---

## **Decision Filter**

When evaluating a proposed feature or architectural change, ask:

1. Does this improve technical authoring?  
2. Does it strengthen semantic structure?  
3. Does it preserve deterministic behavior?  
4. Does it respect architectural boundaries?  
5. Does it keep exported HTML stable?  
6. Does it simplify the product rather than complicate it?  
7. Does it protect user content and trust?

If the answer to several of these questions is "no," the proposal should be reconsidered or redesigned before implementation.
