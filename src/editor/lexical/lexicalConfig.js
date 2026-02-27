// src/editor/lexicalConfig.js
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode /*, CodeHighlightNode */ } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListNode, ListItemNode, } from '@lexical/list';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';

// custom nodes 
import { CalloutNode } from '../../nodes/CalloutNode.js';
import { SemanticInlineNode } from '../../nodes/SemanticInlineNode.js';


// Basic theme classes. We can align these to your CSS later.
export const editorConfig = {
  namespace: 'typeset-editor',
  theme: {
    // Paragraphs will just inherit normal styles under #wysiwyg
    paragraph: 'ts-paragraph',

    text: {
      bold: 'ts-text-bold',
      italic: 'ts-text-italic',
      underline: 'ts-text-underline',
      strikethrough: 'ts-text-strike',
      subscript: 'ts-text-sub',
      superscript: 'ts-text-super',
      code: 'ts-text-code',
    },

    table: 'ts-table',
tableRow: 'ts-table-row',
tableCell: 'ts-table-cell',
tableCellHeader: 'ts-table-cell-header',


    link: 'ts-link',
    userInput: 'user-input',
    variable: 'variable',
  },
  onError(error) {
  // 8.5d: never hard-crash the session because of a Lexical internal error.
  console.error('[lexical] editor error:', error);

  // Optional: broadcast so main.js can show a UI banner later
  window.dispatchEvent(new CustomEvent('ts:editor-error', { detail: error }));
},

  nodes: [
    HeadingNode,
    QuoteNode,
    // Lists
    ListNode,
    ListItemNode,

    // Links
    LinkNode,
    // AutoLinkNode, // uncomment if/when you add the AutoLinkPlugin

    // Code
    CodeNode,
    // CodeHighlightNode, // optional, if you later wire in a code highlight plugin

    // Tables
    TableNode,
TableRowNode,
TableCellNode,


    // Custom blocks
    CalloutNode,

    // User input
    SemanticInlineNode,

  ],
};
