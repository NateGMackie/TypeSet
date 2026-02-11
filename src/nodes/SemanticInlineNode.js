// src/nodes/SemanticInlineNode.js
import { ElementNode, $applyNodeReplacement } from 'lexical';

const ALLOWED_KINDS = new Set(['user-input', 'variable']);

export class SemanticInlineNode extends ElementNode {
  __kinds;

  static getType() {
    return 'semantic-inline';
  }

  static clone(node) {
    const next = new SemanticInlineNode(node.__key);
    next.__kinds = new Set(node.__kinds);
    return next;
  }

  constructor(key) {
    super(key);
    this.__kinds = new Set();
  }

  isInline() {
    return true;
  }

  // --- kinds helpers ---
  getKinds() {
    return Array.from(this.__kinds);
  }

  hasKind(kind) {
    return this.__kinds.has(kind);
  }

  addKind(kind) {
    if (ALLOWED_KINDS.has(kind)) this.__kinds.add(kind);
  }

  removeKind(kind) {
    this.__kinds.delete(kind);
  }

  // --- serialization ---
  static importJSON(serializedNode) {
    const node = $applyNodeReplacement(new SemanticInlineNode());
    const kinds = Array.isArray(serializedNode.kinds) ? serializedNode.kinds : [];
    for (const k of kinds) node.addKind(k);
    return node;
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'semantic-inline',
      version: 1,
      kinds: this.getKinds(),
    };
  }

  // --- HTML import/export ---
  static importDOM() {
    return {
      span: (domNode) => {
        if (!(domNode instanceof HTMLSpanElement)) return null;
        const classes = (domNode.getAttribute('class') || '')
          .split(/\s+/)
          .map((c) => c.trim().toLowerCase())
          .filter(Boolean);

        const kinds = classes.filter((c) => ALLOWED_KINDS.has(c));
        if (kinds.length === 0) return null;

        return {
          conversion: () => {
            const node = new SemanticInlineNode();
            for (const k of kinds) node.addKind(k);
            return { node };
          },
          priority: 2,
        };
      },
    };
  }

  createDOM() {
    const span = document.createElement('span');
    span.className = this.getKinds().join(' ');
    return span;
  }

  updateDOM(prevNode, dom) {
    const prev = prevNode.getKinds().join(' ');
    const next = this.getKinds().join(' ');
    if (prev !== next) {
      dom.className = next;
    }
    return false;
  }

  exportDOM() {
    const span = document.createElement('span');
    span.className = this.getKinds().join(' ');
    return { element: span };
  }
}

export function $createSemanticInlineNode(kinds = []) {
  const node = new SemanticInlineNode();
  for (const k of kinds) node.addKind(k);
  return node;
}
