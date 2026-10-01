# **Validation Architecture**

**Version:** 1.0  
 **Status:** Adopted

**Related Documents**

* System Architecture  
* Lexical Architecture  
* Import / Export Architecture  
* Persistence  
* Document Model  
* Export Contract  
* Editor Content Model

---

# **Purpose**

This document defines how TypeSet protects document integrity throughout the authoring lifecycle.

Validation is responsible for ensuring that documents remain structurally correct, semantically meaningful, and compatible with the contracts that govern the system.

Unlike import, export, persistence, or editing, validation is not an independent subsystem. Instead, it is an architectural capability used throughout TypeSet to maintain consistency and protect both the author's work and the application's internal assumptions.

Validation exists to answer a single question:

> **Can this document continue through the system without violating its architectural contracts?**

---

# **Governing Principle**

> **Validation protects document integrity without silently changing document meaning.**

Protecting document integrity is more important than preserving an exact representation of imported content.

However, preserving document meaning is more important than preserving formatting.

Every validation decision should balance these priorities.

---

# **The Role of Validation**

Validation is not responsible for creating documents.

It is not responsible for editing documents.

It is not responsible for publishing documents.

Validation exists to ensure that every subsystem receives data that satisfies the expectations defined by the system architecture.

Rather than owning content, validation protects content.

---

# **Validation Throughout the System**

Validation is a cross-cutting architectural concern.

It occurs at multiple boundaries throughout the application.

            External Content  
                    │  
             Import Validation  
                    │  
                    ▼  
          Lexical Editor State  
                    │  
          Editor Validation  
                    │  
                    ▼  
          TypeSet Document  
                    │  
      Persistence Validation  
                    │  
                    ▼  
           Reopened Document  
                    │  
          Export Validation  
                    │  
                    ▼  
           Canonical HTML

Each stage validates different assumptions while sharing the same philosophy.

---

# **Validation Versus Normalization**

Validation and normalization are complementary but fundamentally different operations.

## **Normalization**

Normalization converts equivalent representations into a single canonical representation.

For example:

* adjacent text nodes may be merged  
* direct text inside a table cell may become a paragraph  
* lists may be restructured into the canonical content model

Normalization assumes that the document is already valid.

Its goal is consistency.

---

## **Validation**

Validation determines whether a document satisfies the rules required by the current stage of processing.

Examples include:

* unsupported nesting  
* missing required structures  
* invalid custom nodes  
* malformed document envelopes  
* unsupported schema versions

Validation answers whether the document can safely continue.

---

## **Why the Distinction Matters**

Normalization simplifies documents.

Validation protects documents.

Treating these as separate responsibilities makes the behavior of the system predictable and easier to reason about.

---

# **Validation Boundaries**

Every major subsystem performs validation appropriate to its responsibilities.

---

## **Import Validation**

Import verifies that external content can be translated into the TypeSet content model.

Examples include:

* unsupported HTML  
* malformed lists  
* invalid table structures  
* unsupported Word artifacts

Import may repair many recoverable issues because external documents are inherently inconsistent.

---

## **Editor Validation**

The editor validates structures required for interactive editing.

Examples include:

* valid node hierarchies  
* required parent-child relationships  
* supported custom nodes  
* selection safety

Editor validation should prioritize preserving a stable editing experience.

---

## **Persistence Validation**

Persistence validates stored documents before loading them.

Examples include:

* schema version  
* document envelope  
* required metadata  
* serialized editor state integrity

Persistence should never silently load corrupted documents.

---

## **Export Validation**

Export validates that the document satisfies the publishing contract.

Examples include:

* semantic HTML structure  
* supported elements  
* valid nesting  
* export contract compliance

Export validation guarantees predictable published output.

---

# **Validation Outcomes**

Validation may produce four outcomes.

## **Accept**

The document satisfies all required rules.

Processing continues normally.

---

## **Normalize**

The document is valid but may be simplified into a canonical representation.

Normalization should not change document meaning.

---

## **Repair**

The document contains recoverable issues.

The system repairs the structure while preserving meaning whenever possible.

Repairs should be deterministic and documented.

---

## **Reject**

The document cannot safely continue.

Processing stops and the user is informed of the problem.

Rejection should occur only when repair would compromise document meaning or system integrity.

---

# **Silent Repair**

Silent repair should be used cautiously.

Repairs that simply canonicalize equivalent structures may occur without user interaction.

Examples include:

* merging adjacent formatting  
* wrapping orphan text in paragraphs  
* canonical list normalization

Repairs that discard information should never occur silently.

Whenever meaningful information is removed, the user should receive an appropriate warning.

---

# **Warnings**

Warnings communicate that the document was successfully processed but required intervention.

Examples include:

* unsupported HTML removed  
* unsupported formatting discarded  
* deprecated structures updated  
* unknown attributes ignored

Warnings improve transparency while avoiding unnecessary interruption.

---

# **Error Reporting**

Validation messages should be written for authors rather than developers.

Good validation messages explain:

* what happened  
* why it happened  
* what was done  
* what the user can do next

For example:

> Unsupported nested tables were removed because TypeSet does not support nested tables.

is preferable to:

> Validation Error 1047\.

---

# **Contract Enforcement**

Validation does not invent rules.

Validation enforces contracts.

Examples include:

* Export Contract  
* Editor Content Model  
* Document Model  
* future feature contracts

By separating rules from enforcement, contracts remain reusable across multiple subsystems.

---

# **Document Integrity**

Validation should preserve document integrity above all else.

Whenever possible:

* preserve meaning  
* preserve structure  
* preserve editability

Presentation details should never take precedence over semantic correctness.

---

# **Fail Safely**

When validation encounters unexpected situations, the preferred behavior is to fail safely.

Examples include:

* refusing to load unsupported schema versions  
* preventing invalid exports  
* preserving recovery data after an unexpected error  
* isolating unsupported editor nodes

Safe failure protects the author's work even when processing cannot continue.

---

# **Future Linting**

Validation currently focuses on structural correctness.

Future versions of TypeSet may include document quality analysis.

Examples include:

* skipped heading levels  
* empty callouts  
* empty table cells  
* missing image descriptions  
* inconsistent terminology  
* incomplete procedures

These issues do not make a document invalid.

Instead, they help authors improve document quality.

Linting should complement validation without replacing it.

---

# **Responsibilities**

Validation is responsible for:

* structural correctness  
* contract enforcement  
* document integrity  
* safe repair  
* meaningful warnings  
* clear error reporting

Validation is not responsible for:

* editing  
* importing  
* exporting  
* publishing  
* persistence  
* document presentation

---

# **Design Philosophy**

Validation exists to protect the author's work while preserving the architectural boundaries of TypeSet.

Whenever documents move between subsystems, validation ensures that each subsystem receives information it can safely understand.

Rather than attempting to preserve every possible formatting choice, validation focuses on preserving semantic meaning, maintaining predictable behavior, and preventing corruption from spreading throughout the system.

---

# **Architectural Summary**

Validation is a cross-cutting architectural capability used throughout TypeSet.

Every subsystem relies upon validation to protect its assumptions without assuming responsibility for other parts of the system.

Normalization simplifies equivalent structures.

Validation enforces architectural contracts.

Repair preserves meaning whenever possible.

Warnings communicate recoverable issues.

Rejection protects the integrity of the document when no safe alternative exists.

By separating validation from individual subsystems, TypeSet maintains a consistent philosophy for handling errors, enforcing contracts, and preserving document integrity throughout the entire authoring lifecycle.

