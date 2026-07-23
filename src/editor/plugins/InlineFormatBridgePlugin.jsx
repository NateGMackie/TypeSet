// src/editor/plugins/InlineFormatBridgePlugin.jsx
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $isTextNode } from 'lexical';
import {
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from '@lexical/selection';

// Style-marker properties stored on TextNode.style
const USER_INPUT_PROP = '--ts-user-input';
const VARIABLE_PROP = '--ts-variable';

function toggleStyleProp(editor, prop) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const current = $getSelectionStyleValueForProperty(selection, prop, '');
    const isOn = current !== '' && current != null;

    if (isOn) {
      $patchStyleText(selection, { [prop]: null }); // remove prop
    } else {
      $patchStyleText(selection, { [prop]: '1' }); // apply prop
    }
  });
}

function removeAllInlineFormatting(editor) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    // Remove our semantic markers
    $patchStyleText(selection, {
      [USER_INPUT_PROP]: null,
      [VARIABLE_PROP]: null,
    });

    // Clear Lexical formatting (best effort)
    const nodes = selection.getNodes();
    for (const n of nodes) {
      if ($isTextNode(n)) {
        n.setFormat(0);

        // If you want removeFormatting() to only remove bold/italic etc but KEEP our markers,
        // don’t clear style here. For now this matches your current “nuke it” behavior.
        n.setStyle('');
      }
    }
  });
}

export default function InlineFormatBridgePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const api = {
      toggleUserInput() {
        toggleStyleProp(editor, USER_INPUT_PROP);
      },
      toggleVariable() {
        toggleStyleProp(editor, VARIABLE_PROP);
      },

      // Back-compat so other code calling the old names keeps working
      wrapSelectionWithUserInput() {
        toggleStyleProp(editor, USER_INPUT_PROP);
      },
      wrapSelectionWithVariable() {
        toggleStyleProp(editor, VARIABLE_PROP);
      },

      removeFormatting() {
        removeAllInlineFormatting(editor);
      },
    };

    window.tsInlineFormatBridge = api;

    return () => {
      if (window.tsInlineFormatBridge === api) delete window.tsInlineFormatBridge;
    };
  }, [editor]);

  return null;
}
