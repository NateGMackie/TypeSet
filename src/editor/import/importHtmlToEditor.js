// src/editor/importHtmlToEditor.js
import { $getRoot, $createParagraphNode } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';

function coerceHtml(input) {
  if (typeof input === 'string') return input;
  if (input && typeof input === 'object') {
    if (typeof input.html === 'string') return input.html;
    if (typeof input.cleanHtml === 'string') return input.cleanHtml;
    if (typeof input.cleanHTML === 'string') return input.cleanHTML;
  }
  if (input == null) return '';
  return String(input);
}

function isRootAllowedLexicalNode(n) {
  if (!n || typeof n.is !== 'function') return false;
  return n.is('element') || n.is('decorator');
}

export function importHtmlToEditor(editor, htmlLike) {
  const html = coerceHtml(htmlLike).trim();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '<p></p>', 'text/html');

  // Extra safety: ensure body contains at least one block
  if (!doc.body || doc.body.childNodes.length === 0) {
    doc.body.innerHTML = '<p></p>';
  }

  editor.update(() => {
    const root = $getRoot();
    root.clear();

    const body = doc.body;

// Collapse multiple empty paragraphs
const emptyParas = body.querySelectorAll('p');
if (
  emptyParas.length > 1 &&
  Array.from(emptyParas).every(
    p => p.innerHTML === '<br>' || p.textContent.trim() === ''
  )
) {
  // Keep one, remove the rest
  for (let i = 1; i < emptyParas.length; i++) {
    emptyParas[i].remove();
  }
}


    const nodes = $generateNodesFromDOM(editor, doc) || [];

    const topLevel = [];
    let para = null;

    const flushPara = () => {
      if (para && para.getChildrenSize() > 0) {
        topLevel.push(para);
      }
      para = null;
    };

    for (const n of nodes) {
      if (isRootAllowedLexicalNode(n)) {
        flushPara();
        topLevel.push(n);
      } else {
        if (!para) para = $createParagraphNode();
        // If n is null/undefined for some reason, skip it.
        if (n) para.append(n);
      }
    }

    flushPara();

    if (topLevel.length === 0) {
      root.append($createParagraphNode());
      return;
    }

    root.append(...topLevel);
  });
}
