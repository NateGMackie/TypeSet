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



import { $createSemanticInlineNode } from '../nodes/SemanticInlineNode.js';

export default function InlineFormatBridgePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    function applyKindToSelection(kind) {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        // Collapsed caret → insert semantic span and put caret inside
        if (selection.isCollapsed()) {
          const wrapper = $createSemanticInlineNode([kind]);
          const t = $createTextNode('\u200B'); // stable caret

          wrapper.append(t);
          selection.insertNodes([wrapper]);

          if (wrapper.getParent() != null) {
            t.select(1, 1);
          }
          return;
        }

        // Keep predictable behavior: one top-level block only
const anchorTop = selection.anchor.getNode().getTopLevelElementOrThrow();
const focusTop = selection.focus.getNode().getTopLevelElementOrThrow();
if (anchorTop !== focusTop) return;

// Normalize direction so start <= end
const isBackward = selection.isBackward();
const startPoint = isBackward ? selection.focus : selection.anchor;
const endPoint = isBackward ? selection.anchor : selection.focus;

let startNode = startPoint.getNode();
let endNode = endPoint.getNode();

if (!$isTextNode(startNode) || !$isTextNode(endNode)) {
  console.warn('[InlineFormatBridgePlugin] Selection endpoints are not both text nodes; skipping.');
  return;
}

let startOffset = startPoint.offset;
let endOffset = endPoint.offset;

// IMPORTANT: selection may be within the SAME TextNode
const sameTextNode = startNode.getKey() === endNode.getKey();

// Split start text node if selection starts mid-text
if (startOffset > 0 && startOffset < startNode.getTextContentSize()) {
  const [, right] = startNode.splitText(startOffset);
  startNode = right;

  // If start & end were in the same original node, end is now in `right`
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

// Now rebuild a fresh selection that exactly spans full startNode..endNode
const nextSelection = $createRangeSelection();
nextSelection.anchor.set(startNode.getKey(), 0, 'text');
nextSelection.focus.set(endNode.getKey(), endNode.getTextContentSize(), 'text');
$setSelection(nextSelection);

// Determine a stable common parent at the "sibling" level we will wrap
const parent = startNode.getParent();
if (!parent || parent !== endNode.getParent()) {
  console.warn('[InlineFormatBridgePlugin] Selection spans different parents; skipping for safety.');
  return;
}

// Wrap only the direct children between startNode and endNode (inclusive)
const children = parent.getChildren();
const startIndex = children.findIndex((c) => c.getKey() === startNode.getKey());
const endIndex = children.findIndex((c) => c.getKey() === endNode.getKey());

if (startIndex === -1 || endIndex === -1) return;

const [from, to] = startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
const slice = children.slice(from, to + 1);
if (slice.length === 0) return;

const wrapper = $createSemanticInlineNode([kind]);
slice[0].insertBefore(wrapper);

for (const n of slice) {
  wrapper.append(n);
}

wrapper.selectEnd();

});
    }

    const api = {
      wrapSelectionWithUserInput() {
        applyKindToSelection('user-input');
      },
      wrapSelectionWithVariable() {
        applyKindToSelection('variable');
      },
    };

    window.w2hInlineFormatBridge = api;

    return () => {
      if (window.w2hInlineFormatBridge === api) {
        delete window.w2hInlineFormatBridge;
      }
    };
  }, [editor]);

  return null;
}
