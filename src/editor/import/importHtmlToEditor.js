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

function applySemanticMarkersToText(doc) {
  function walk(node, inUserInput, inVariable) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node;
      const isSpan = el.tagName && el.tagName.toLowerCase() === "span";
      const cls = isSpan ? (el.getAttribute("class") || "") : "";

      const nextInUserInput = inUserInput || /\buser-input\b/.test(cls);
      const nextInVariable = inVariable || /\bvariable\b/.test(cls);

      // Recurse children (copy to array because we may replace nodes)
      Array.from(el.childNodes).forEach((child) =>
        walk(child, nextInUserInput, nextInVariable)
      );

      // After processing children, remove semantic class wrappers
      // (we've already wrapped affected text nodes with marker spans)
      if (isSpan && (/\buser-input\b/.test(cls) || /\bvariable\b/.test(cls))) {
        // unwrap this span but keep its children
        const parent = el.parentNode;
        if (!parent) return;

        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      }

      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue || "";
      if (!text.trim()) return; // ignore whitespace-only nodes

      if (!inUserInput && !inVariable) return;

      const markerSpan = doc.createElement("span");
      const parts = [];
      if (inUserInput) parts.push("--ts-user-input:1;");
      if (inVariable) parts.push("--ts-variable:1;");
      markerSpan.setAttribute("style", parts.join(" "));

      markerSpan.textContent = text;

      node.parentNode.replaceChild(markerSpan, node);
    }
  }

  walk(doc.body, false, false);
}

export function importHtmlToEditor(editor, htmlLike) {
  const html = coerceHtml(htmlLike).trim();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '<p></p>', 'text/html');

    applySemanticMarkersToText(doc);


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
