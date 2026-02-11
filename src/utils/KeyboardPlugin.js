// src/utils/KeyboardPlugin.js
import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  KEY_DOWN_COMMAND,
  FORMAT_TEXT_COMMAND,
  COMMAND_PRIORITY_LOW,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $createParagraphNode,
} from 'lexical';

import { $isListItemNode, $isListNode } from '@lexical/list';

import { $isCalloutNode } from '../nodes/CalloutNode.js';

/**
 * Stage 8.6.1 — Inline keyboard shortcuts
 * - Ctrl/Cmd+B → bold (existing)
 * - Ctrl/Cmd+I → italic (existing)
 * - Ctrl/Cmd+Shift+K → user input
 * - Ctrl/Cmd+Shift+M → variable
 *
 * Rules:
 * - Selection → wrap/toggle selection
 * - Collapsed caret → insert empty inline wrapper and place caret inside
 * - No auto-wrapping surrounding text
 */
export function KeyboardPlugin() {
  const [editor] = useLexicalComposerContext();

  React.useEffect(() => {

    // LOW priority: Enter → cleanup "two empty lis at end of list inside callout"
    const unregisterEnterCleanup = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        if (!event) return false;

        // Only care about *plain* Enter (no modifiers)
        if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
          return false;
        }

        let handled = false;

        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          if (!selection.isCollapsed()) return;

          // Find enclosing ListItemNode, if any
          let node = selection.anchor.getNode();
          let listItem = null;

          while (node && !$isRootOrShadowRoot(node)) {
            if ($isListItemNode(node)) {
              listItem = node;
              break;
            }
            node = node.getParent();
          }

          if (!listItem) return;

          // Current list item must be empty
          if (listItem.getTextContent().trim() !== '') return;

          const listNode = listItem.getParent();
          if (!listNode || !$isListNode(listNode)) return;

          // Only care when we're at the *end* of the list
          if (listItem.getNextSibling() !== null) return;

          const prevItem = listItem.getPreviousSibling();
          if (!prevItem || !$isListItemNode(prevItem)) return;

          if (prevItem.getTextContent().trim() !== '') return;

          // Ensure this list is inside a CalloutNode
          let ancestor = listNode.getParent();
          let inCallout = false;

          while (ancestor && !$isRootOrShadowRoot(ancestor)) {
            if ($isCalloutNode(ancestor)) {
              inCallout = true;
              break;
            }
            ancestor = ancestor.getParent();
          }

          if (!inCallout) return;

          event.preventDefault();

          // Remove both empty list items
          prevItem.remove();
          listItem.remove();

          // Insert a new paragraph AFTER the list, still inside the callout
          const paragraph = $createParagraphNode();
          listNode.insertAfter(paragraph);
          paragraph.select();

          handled = true;
        });

        return handled;
      },
      COMMAND_PRIORITY_LOW,
    );

    // LOW priority: Tab / Shift+Tab → delegate to Lexical indent/outdent
    const unregisterTabIndent = editor.registerCommand(
      KEY_TAB_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        event.preventDefault();

        if (event.shiftKey) {
          editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        } else {
          editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        }

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );

    
    // LOW priority: modifier shortcuts (inline formats + callout escape)
const unregisterModifierShortcuts = editor.registerCommand(
  KEY_DOWN_COMMAND,
  (event) => {
    if (!event) return false;

    const hasPrimaryMod = event.ctrlKey || event.metaKey;
    if (!hasPrimaryMod || event.altKey) return false;

    const keyLower = (event.key || '').toLowerCase();

    // 1) Plain inline formatting: handle OUTSIDE editor.update
    if (!event.shiftKey) {
      if (keyLower === 'b') {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        return true;
      }
      if (keyLower === 'i') {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        return true;
      }
      if (keyLower === 'u') {
        event.preventDefault();
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        return true;
      }
    }

    // 2) Custom semantic inlines + callout escape: do INSIDE editor.update
    let handled = false;

// Ctrl/Cmd + Shift + K → user-input
if (event.shiftKey && keyLower === 'k') {
  event.preventDefault();

  const api = window.w2hInlineFormatBridge;
  if (api && typeof api.wrapSelectionWithUserInput === 'function') {
    api.wrapSelectionWithUserInput();
    return true;
  }

  console.warn('[KeyboardPlugin] InlineFormatBridge not available for user-input.');
  return false;
}


// Ctrl/Cmd + Shift + M → variable
if (event.shiftKey && keyLower === 'm') {
  event.preventDefault();

  const api = window.w2hInlineFormatBridge;
  if (api && typeof api.wrapSelectionWithVariable === 'function') {
    api.wrapSelectionWithVariable();
    return true;
  }

  console.warn('[KeyboardPlugin] InlineFormatBridge not available for variable.');
  return false;
}


    editor.update(() => {
      


      // --- Callout escape ---
      if (event.shiftKey) return;

      const isUp = event.key === 'ArrowUp';
      const isDown = event.key === 'ArrowDown';
      if (!isUp && !isDown) return;

      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (!selection.isCollapsed()) return;

      let node = selection.anchor.getNode();
      let calloutNode = null;

      while (node && !$isRootOrShadowRoot(node)) {
        if ($isCalloutNode(node)) {
          calloutNode = node;
          break;
        }
        node = node.getParent();
      }

      if (!calloutNode) return;

      event.preventDefault();

      const targetSibling = isUp
        ? calloutNode.getPreviousSibling()
        : calloutNode.getNextSibling();

      if (targetSibling) {
        targetSibling.select();
        handled = true;
        return;
      }

      const paragraph = $createParagraphNode();
      if (isUp) {
        calloutNode.insertBefore(paragraph);
      } else {
        calloutNode.insertAfter(paragraph);
      }
      paragraph.select();
      handled = true;
    });

    return handled;
  },
  COMMAND_PRIORITY_LOW,
);




    return () => {
      unregisterEnterCleanup();
      unregisterTabIndent();
      unregisterModifierShortcuts();
    };
  }, [editor]);

  return null;
}
