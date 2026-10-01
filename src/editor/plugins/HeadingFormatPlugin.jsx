import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode } from "@lexical/rich-text";
import { TextNode } from "lexical";

export default function HeadingFormatPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(TextNode, (textNode) => {
      let parent = textNode.getParent();

      // A TextNode may be wrapped by an inline node such as a link.
      // Walk upward until we reach the containing block node.
      while (parent && parent.isInline()) {
        parent = parent.getParent();
      }

      if (!$isHeadingNode(parent)) {
        return;
      }

      // Headings are structural. Their visual weight comes from CSS,
      // so remove any inline formatting stored on their text nodes.
      if (textNode.getFormat() !== 0) {
        textNode.setFormat(0);
      }
    });
  }, [editor]);

  return null;
}