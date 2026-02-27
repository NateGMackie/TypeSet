// src/editor/InlineFormatBridgePlugin.jsx
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  $createTextNode,
  $isTextNode,
  $createRangeSelection,
  $setSelection,
} from 'lexical';

import { $createSemanticInlineNode, SemanticInlineNode } from '../../nodes/SemanticInlineNode.js';


export default function InlineFormatBridgePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    function nearestSemanticInline(node) {
  let n = node;
  while (n) {
    if (n instanceof SemanticInlineNode) return n;
    n = n.getParent?.() ?? null;
  }
  return null;
}

function isDescendantOf(node, ancestor) {
  let n = node;
  while (n) {
    if (n === ancestor) return true;
    n = n.getParent?.() ?? null;
  }
  return false;
}

// Returns the direct child of `wrapper` that contains `node`.
// If `node` is not inside wrapper, returns null.
function directChildOfWrapper(wrapper, node) {
  let n = node;
  while (n) {
    const p = n.getParent?.() ?? null;
    if (p === wrapper) return n;
    n = p;
  }
  return null;
}

function getNodeKinds(node) {
  if (typeof node.getKinds === 'function') return node.getKinds();

  const k = node.__kinds ?? node.__kind;

  // array
  if (Array.isArray(k)) return k;

  // Set
  if (k instanceof Set) return Array.from(k);

  // string
  if (typeof k === 'string') return [k];

  return [];
}


function hasKind(node, kind) {
  return getNodeKinds(node).includes(kind);
}

function getKindsOnly(node, kind) {
  const kinds = getNodeKinds(node);
  const remaining = kinds.filter((k) => k !== kind);
  return { kinds, remaining };
}

// Find a wrapper that contains BOTH endpoints, then climb upward
// through same-kind parents so we unwrap the “outermost” same-kind wrapper.
function findContainingWrapperWithKind(startNode, endNode, kind) {
  let w = nearestSemanticInline(startNode);

  // Step 1: climb until we find a wrapper that contains endNode too
  while (w && (!hasKind(w, kind) || !isDescendantOf(endNode, w))) {
    w = nearestSemanticInline(w.getParent?.() ?? null);
  }
  if (!w) return null;

  // Step 2: climb “same-kind chain” upward
  let p = w.getParent?.() ?? null;
  while (p && p instanceof SemanticInlineNode && hasKind(p, kind)) {
    w = p;
    p = w.getParent?.() ?? null;
  }

  return w;
}



function unwrapSliceFromSemanticNode({
  wrapperNode,
  kindToRemove,
  startChild,
  endChild,
}) {
  const parent = wrapperNode.getParent();
  if (!parent) return false;

  const children = wrapperNode.getChildren();
  const startIndex = children.findIndex((c) => c.getKey() === startChild.getKey());
  const endIndex = children.findIndex((c) => c.getKey() === endChild.getKey());
  if (startIndex === -1 || endIndex === -1) return false;

  const [from, to] = startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

  const existingKinds = getNodeKinds(wrapperNode);
  const remainingKinds = existingKinds.filter((k) => k !== kindToRemove);

  const beforeNodes = children.slice(0, from);
  const middleNodes = children.slice(from, to + 1);
  const afterNodes = children.slice(to + 1);

  const makeWrapper = (kinds, nodes) => {
    if (!nodes.length) return null;
    const w = $createSemanticInlineNode(kinds);
    for (const n of nodes) w.append(n); // moves nodes into w
    return w;
  };

  const beforeWrapper = makeWrapper(existingKinds, beforeNodes);

  // Middle: remove this kind; keep remaining kinds (or none)
  const middleWrapper =
    remainingKinds.length > 0 ? makeWrapper(remainingKinds, middleNodes) : null;

  const afterWrapper = makeWrapper(existingKinds, afterNodes);

  // Build replacement nodes in correct order
  const replacement = [];
  if (beforeWrapper) replacement.push(beforeWrapper);

  if (middleWrapper) {
    replacement.push(middleWrapper);
    } else {
    // We are removing this kind completely for the middle slice.
    // If the middle slice contains nested wrappers that are ONLY this kind,
    // flatten them so we don’t “remove outer but keep inner”.
    for (const n of middleNodes) {
      if (n instanceof SemanticInlineNode && hasKind(n, kindToRemove)) {
        const { remaining } = getKindsOnly(n, kindToRemove);
        if (remaining.length === 0) {
          // lift children out instead of keeping this wrapper
          const kids = n.getChildren();
          for (const kid of kids) {
            replacement.push(kid);
          }
          n.remove();
          continue;
        }
      }
      replacement.push(n);
    }
  }


  if (afterWrapper) replacement.push(afterWrapper);

  // Insert each replacement node BEFORE the wrapperNode (order is preserved)
  for (const n of replacement) {
    wrapperNode.insertBefore(n);
  }

  // Remove original wrapperNode (it should now be empty)
  wrapperNode.remove();

  // Best-effort caret placement: end of the middle area
  if (middleWrapper) {
    middleWrapper.selectEnd();
  } else if (middleNodes.length) {
    const last = middleNodes[middleNodes.length - 1];
    if (last && typeof last.selectEnd === 'function') last.selectEnd();
  }

  return true;
}

function unwrapWholeWrapperKind(wrapperNode, kindToRemove) {
  const parent = wrapperNode.getParent();
  if (!parent) return false;

  const existingKinds = getNodeKinds(wrapperNode);
  if (!existingKinds.includes(kindToRemove)) return false;

  const remainingKinds = existingKinds.filter((k) => k !== kindToRemove);
  const children = wrapperNode.getChildren();

  if (remainingKinds.length > 0) {
    // Replace with same wrapper but without the removed kind
    const replacement = $createSemanticInlineNode(remainingKinds);
    wrapperNode.insertBefore(replacement);
    for (const child of children) replacement.append(child);
    wrapperNode.remove();
    replacement.selectEnd();
    return true;
  }

  // No kinds remain: remove wrapper entirely (lift children up)
  // Insert children before wrapper in order, then remove wrapper
  for (const child of children) {
    wrapperNode.insertBefore(child);
  }
  wrapperNode.remove();
  // caret best-effort: end of last lifted node
  const last = children[children.length - 1];
  if (last && typeof last.selectEnd === 'function') last.selectEnd();
  return true;
}



function wrapSelectionAsKind(kind) {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return false;

  // Collapsed caret → insert semantic span and put caret inside
  if (selection.isCollapsed()) {
    const wrapper = $createSemanticInlineNode([kind]);
    const t = $createTextNode('\u200B'); // stable caret
    wrapper.append(t);
    selection.insertNodes([wrapper]);
    t.select(1, 1);
    return true;
  }

  // Keep predictable behavior: one top-level block only
  const anchorTop = selection.anchor.getNode().getTopLevelElementOrThrow();
  const focusTop = selection.focus.getNode().getTopLevelElementOrThrow();
  if (anchorTop !== focusTop) return false;

  // Normalize direction so start <= end
  const isBackward = selection.isBackward();
  const startPoint = isBackward ? selection.focus : selection.anchor;
  const endPoint = isBackward ? selection.anchor : selection.focus;

  let startNode = startPoint.getNode();
  let endNode = endPoint.getNode();

  if (!$isTextNode(startNode) || !$isTextNode(endNode)) {
    console.warn('[InlineFormatBridgePlugin] Selection endpoints are not both text nodes; skipping.');
    return false;
  }

  let startOffset = startPoint.offset;
  let endOffset = endPoint.offset;

  const sameTextNode = startNode.getKey() === endNode.getKey();

  // Split start text node if selection starts mid-text
  if (startOffset > 0 && startOffset < startNode.getTextContentSize()) {
    const [, right] = startNode.splitText(startOffset);
    startNode = right;

    if (sameTextNode) {
      endNode = right;
      endOffset = endOffset - startOffset;
    }
  }

  // Split end text node if selection ends mid-text
  if (endOffset > 0 && endOffset < endNode.getTextContentSize()) {
    const [left] = endNode.splitText(endOffset);
    endNode = left;
  }

  // Rebuild selection that exactly spans startNode..endNode
  const nextSelection = $createRangeSelection();
  nextSelection.anchor.set(startNode.getKey(), 0, 'text');
  nextSelection.focus.set(endNode.getKey(), endNode.getTextContentSize(), 'text');
  $setSelection(nextSelection);

  // Determine common parent at sibling level
  const parent = startNode.getParent();
  if (!parent || parent !== endNode.getParent()) {
    console.warn('[InlineFormatBridgePlugin] Selection spans different parents; skipping for safety.');
    return false;
  }

  const children = parent.getChildren();
  const startIndex = children.findIndex((c) => c.getKey() === startNode.getKey());
  const endIndex = children.findIndex((c) => c.getKey() === endNode.getKey());
  if (startIndex === -1 || endIndex === -1) return false;

  const [from, to] = startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
  const slice = children.slice(from, to + 1);
  if (slice.length === 0) return false;

  const wrapper = $createSemanticInlineNode([kind]);
  slice[0].insertBefore(wrapper);
  for (const n of slice) {
    wrapper.append(n);
  }
  wrapper.selectEnd();
  return true;
}

function toggleKindInUpdate(kind) {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;

  // ---- Collapsed caret ----
  if (selection.isCollapsed()) {
    const anchorNode = selection.anchor.getNode();
    const wrapper = nearestSemanticInline(anchorNode);

    // If inside a wrapper that already has the kind, unwrap it
    if (wrapper && hasKind(wrapper, kind)) {
      unwrapWholeWrapperKind(wrapper, kind);
      return;
    }
    
    // Otherwise, wrap it
    wrapSelectionAsKind(kind);
    return;
  }

  // ---- Range selection ----
  const isBackward = selection.isBackward();
  const startPoint = isBackward ? selection.focus : selection.anchor;
  const endPoint = isBackward ? selection.anchor : selection.focus;

  const startNode = startPoint.getNode();
  const endNode = endPoint.getNode();

  // Find the containing wrapper
  const wrapper = findContainingWrapperWithKind(startNode, endNode, kind);

  if (wrapper) {
    // If found, unwrap it
    unwrapWholeWrapperKind(wrapper, kind);
  } else {
    // Not wrapped, so wrap the selection
    wrapSelectionAsKind(kind);
  }
}


function toggleKind(kind) {
  editor.update(() => {
    toggleKindInUpdate(kind);
  });
}


function removeFormatting() {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    // Use the in-update toggle (NO nested editor.update)
    toggleKindInUpdate('user-input');
    toggleKindInUpdate('variable');

    // Clear Lexical text formatting (best-effort)
    const nodes = selection.getNodes();
    for (const n of nodes) {
      if ($isTextNode(n)) {
        n.setFormat(0);
        n.setStyle('');
      }
    }
  });
}



    const api = {
  // New “toggle” actions (wrap/unwrap/escape)
  toggleUserInput() {
    toggleKind('user-input');
  },
  toggleVariable() {
    toggleKind('variable');
  },

  // Keep old names too so KeyboardPlugin/ToolbarBridgePlugin won’t break
  wrapSelectionWithUserInput() {
    toggleKind('user-input');
  },
  wrapSelectionWithVariable() {
    toggleKind('variable');
  },

  removeFormatting() {
    removeFormatting();
  },
};


    window.tsInlineFormatBridge = api;

    return () => {
      if (window.tsInlineFormatBridge === api) {
        delete window.tsInlineFormatBridge;
      }
    };
  }, [editor]);

  return null;
}
