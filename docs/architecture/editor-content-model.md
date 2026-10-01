# Editor Content Model

## Purpose

This document defines the semantic structures that may exist in a TypeSet authoring document and the parent-child relationships that govern those structures.

It describes the conceptual content model used by the editor. It does not define toolbar behavior, keyboard behavior, import cleanup, persistence format, Lexical serialization, or canonical HTML formatting. Those responsibilities belong to their respective specifications and contracts.

Implementation should preserve the structures and constraints defined here, regardless of how Lexical represents them internally.

## Relationship to other documents

This document is governed by the TypeSet Product Principles and supports the broader TypeSet Document Model.

Related documents include:

- `docs/product-principles.md`
- `docs/architecture/document-model.md`
- `docs/contracts/export-contract.md`
- `docs/specifications/callout-spec.md`
- `docs/specifications/keyboard-spec.md`

## Structural terminology

- **Document**: The root semantic container for authoring content.
- **Block structure**: A structural unit that participates in document layout and may contain other blocks or inline content.
- **Inline structure**: Content that appears within a text-bearing block.
- **Block container**: A structure that may contain one or more block children.
- **Inline container**: A structure that may contain only inline content.
- **Normalization**: A deterministic transformation that converts invalid or ambiguous input into a valid TypeSet structure without silently discarding meaningful user content.

# 1. Document root

The document root is the highest-level semantic container.

It may contain the following block structures:

- Paragraph
- Heading
- Ordered list
- Unordered list
- Callout
- Blockquote
- Code block
- Horizontal rule
- Table
- Image

The root must not contain inline content directly. Direct text at the root must normalize into a paragraph.

# 2. Block structures

## 2.1 Paragraph

**Purpose:** Standard body text.

**Allowed children:**

- Text
- Marks
- Link
- User input
- Variable
- Soft break

**Allowed parents:**

- Document root
- List item
- Callout
- Table header cell
- Table data cell
- Blockquote

**Constraints:**

- Paragraphs contain inline content only.
- Direct text inside a block container should normalize into a paragraph when that container requires block children.

## 2.2 Headings

Supported heading levels:

- Heading 1
- Heading 2
- Heading 3

**Allowed children:**

- Inline content only

**Allowed parents:**

- Document root only

**Constraints:**

- Headings must not contain block structures.
- Headings must not appear inside list items, callouts, blockquotes, tables, or table cells.
- Headings may contain links and text marks.

## 2.3 Ordered list

**Allowed children:**

- List item

**Allowed parents:**

- Document root
- List item
- Callout
- Table header cell
- Table data cell
- Blockquote

## 2.4 Unordered list

**Allowed children:**

- List item

**Allowed parents:**

- Document root
- List item
- Callout
- Table header cell
- Table data cell
- Blockquote

## 2.5 List item

A list item is a block container rather than a plain-text container.

**Allowed children:**

- Paragraph
- Ordered list
- Unordered list
- Callout
- Blockquote
- Code block
- Horizontal rule
- Image

**Constraints:**

- Direct text inside a list item must normalize into a paragraph.
- Paragraphs inside list items must be preserved during import, editing, persistence, and export.
- Nested lists must remain children of the list item they belong to.
- A list item may contain a primary step paragraph followed by supporting blocks such as a callout, image, code block, blockquote, or nested list.
- Tables inside list items remain an open structural decision.

## 2.6 Callout

Supported callout kinds:

- Note
- Example
- Warning

A callout is a semantic block container used to emphasize supporting or cautionary information.

**Allowed children:**

- Paragraph
- Ordered list
- Unordered list

**Allowed parents:**

- Document root
- List item
- Table header cell
- Table data cell

**Constraints:**

- Callouts must not contain other callouts.
- Callouts must not contain headings.
- Callouts must not contain tables.
- Blockquotes and code blocks are independent structures and are not callout variants.
- Whether images are permitted inside callouts remains an open structural decision.

Detailed creation, wrapping, labeling, selection, and caret behavior belongs to the callout behavior specification.

## 2.7 Blockquote

A blockquote is an independent semantic block structure.

**Allowed children:**

- Paragraph
- Ordered list
- Unordered list

**Allowed parents:**

- Document root
- List item
- Table header cell
- Table data cell

**Constraints:**

- Blockquotes are not callout variants.
- Blockquotes must not contain headings or callouts.
- Nested blockquotes are not supported unless intentionally added to the content model later.

## 2.8 Code block

A code block is an independent preformatted block structure.

**Allowed children:**

- Plain text
- Line breaks

**Allowed parents:**

- Document root
- List item
- Table header cell
- Table data cell

**Constraints:**

- Code blocks are not callout variants.
- Code blocks must not contain structured lists, headings, callouts, images, links, or inline text marks.
- Code content must preserve meaningful whitespace and line breaks.

## 2.9 Horizontal rule

A horizontal rule is a self-contained structural separator.

**Allowed parents:**

- Document root
- List item
- Callout
- Table header cell
- Table data cell
- Blockquote

**Constraints:**

- A horizontal rule has no children.

## 2.10 Table

A table is a block structure composed of explicit table sections and rows.

**Required children:**

- Table head, when the source or authoring structure contains header rows
- Table body

**Allowed parents:**

- Document root

**Constraints:**

- Table foot is not supported for now.
- Column groups and column definitions are not supported for now.
- Tables must not be nested inside tables.
- Tables inside list items remain an open structural decision.
- Tables inside callouts are not supported.

## 2.11 Table head

**Allowed children:**

- Table row

**Allowed parents:**

- Table only

**Constraints:**

- The table head contains header rows.
- The table head must be preserved when present.

## 2.12 Table body

**Allowed children:**

- Table row

**Allowed parents:**

- Table only

**Constraints:**

- The table body contains non-header rows.
- The table body must be preserved in the canonical table structure.

## 2.13 Table row

**Allowed children:**

- Table header cell
- Table data cell

**Allowed parents:**

- Table head
- Table body

**Constraints:**

- Rows must not contain text or block structures directly.

## 2.14 Table header cell

A table header cell is a block container rather than a plain-text container.

**Allowed children:**

- Paragraph
- Ordered list
- Unordered list
- Callout
- Blockquote
- Code block
- Horizontal rule
- Image

**Allowed parents:**

- Table row

**Constraints:**

- Direct text must normalize into a paragraph.
- Paragraphs inside header cells must be preserved.
- Nested tables are not supported.

## 2.15 Table data cell

A table data cell is a block container rather than a plain-text container.

**Allowed children:**

- Paragraph
- Ordered list
- Unordered list
- Callout
- Blockquote
- Code block
- Horizontal rule
- Image

**Allowed parents:**

- Table row

**Constraints:**

- Direct text must normalize into a paragraph.
- Paragraphs inside data cells must be preserved.
- Nested tables are not supported.

## 2.16 Image

An image is a semantic media block.

**Allowed parents:**

- Document root
- List item
- Table header cell
- Table data cell

**Required semantic properties:**

- Source
- Alternative-text state
- Image kind, when applicable

**Supported image kinds:**

- Screenshot
- Icon
- Unclassified image

**Constraints:**

- Published images require meaningful alternative text or an explicit decorative-image designation.
- The relationship between an image and its caption must be defined before captions become part of the governing content model.
- Images inside callouts remain an open structural decision.

## 2.17 Caption

Caption structure is not yet defined as part of the governing content model.

The earlier inline-caption approach is deprecated. A future caption design should define:

- Whether a caption is a block or inline structure
- How it is associated with an image or other media
- Whether it is represented as part of a media container
- Its allowed parents and export mapping

Until that design is approved, captions must not be treated as an independent semantic inline node.

# 3. Inline structures

## 3.1 Text

Text appears only inside text-bearing block structures.

## 3.2 Marks

Supported marks:

- Strong
- Emphasis
- Underline
- Strikethrough
- Subscript
- Superscript

Marks may be combined unless a more specific feature specification prohibits a combination.

## 3.3 Link

A link is an inline structure containing inline content and a destination.

Link safety and canonical attribute rules are defined by the export contract.

## 3.4 User input

User input is an inline semantic structure used to identify text that a reader should enter or select.

## 3.5 Variable

A variable is an inline semantic structure used to identify replaceable or environment-specific values.

## 3.6 Soft break

A soft break creates a line break without creating a new block.

Its keyboard behavior is defined by the keyboard specification.

# 4. Parent-child matrix

| Structure | Root | List item | Callout | Blockquote | Table cell |
|---|---:|---:|---:|---:|---:|
| Paragraph | Yes | Yes | Yes | Yes | Yes |
| Heading | Yes | No | No | No | No |
| Ordered or unordered list | Yes | Yes | Yes | Yes | Yes |
| Callout | Yes | Yes | No | No | Yes |
| Blockquote | Yes | Yes | No | No | Yes |
| Code block | Yes | Yes | No | No | Yes |
| Horizontal rule | Yes | Yes | Yes | Yes | Yes |
| Table | Yes | Open | No | No | No |
| Image | Yes | Yes | Open | Open | Yes |

# 5. Normalization rules

Normalization must be deterministic and must preserve meaningful user content whenever possible.

Required normalization rules include:

- Direct text at the document root becomes a paragraph.
- Direct text inside a list item becomes a paragraph.
- Direct text inside a table header cell becomes a paragraph.
- Direct text inside a table data cell becomes a paragraph.
- Paragraphs inside list items and table cells are preserved.
- Unsupported nested callouts are flattened or separated without silently deleting their contents.
- Blockquote and code content must not be converted into callout variants.
- Table rows must be placed inside the appropriate table section.
- Tables without explicit sections must normalize into the canonical table-head and table-body structure according to the table specification.

Detailed import and canonicalization algorithms belong to their respective implementation and contract documents.

# 6. Invalid structures

The following structures are invalid unless the content model is intentionally revised:

- Inline content directly under the document root
- Headings inside list items, callouts, blockquotes, or table cells
- Callouts inside callouts
- Tables inside callouts
- Tables inside table cells
- Rows outside a table section
- Cells outside a table row
- Structured content inside code blocks
- Blockquote or code represented as a callout kind

Invalid structures must be rejected, normalized, or recovered through explicit rules. They must not cause silent content loss.

# 7. Open structural decisions

The following decisions remain open:

- Whether tables may appear inside list items
- Whether images may appear inside callouts
- Whether images may appear inside blockquotes
- Whether callouts should remain allowed inside table cells
- The final image-caption structure
- Whether additional media or procedure-specific structures require custom semantic nodes

These decisions should be resolved through the roadmap before implementation depends on them.
