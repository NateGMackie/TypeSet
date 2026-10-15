import { JSDOM } from 'jsdom';
import { createEditor } from 'lexical';

import {
  cleanAndNormalizeExportHtml,
  exportHtmlFromEditor,
} from '../../src/domain/html/htmlExport.js';
import { editorConfig } from '../../src/editor/lexical/lexicalConfig.js';

function installDomShim() {
  const dom = new JSDOM(
    '<!doctype html><html><body></body></html>'
  );

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;
  globalThis.Element = dom.window.Element;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.DocumentFragment = dom.window.DocumentFragment;
  globalThis.Text = dom.window.Text;
  globalThis.DOMParser = dom.window.DOMParser;
  globalThis.NodeFilter = dom.window.NodeFilter;
  globalThis.MutationObserver = dom.window.MutationObserver;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.getComputedStyle = dom.window.getComputedStyle;
}

let failed = 0;

function test(name, callback) {
  try {
    callback();
    console.log(`✅ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`❌ ${name}`);
    console.error(error);
  }
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(
      `Expected:\n${expected}\n\nReceived:\n${actual}`
    );
  }
}

installDomShim();

test('export normalization removes editor-only strong attributes', () => {
  const actualHtml = cleanAndNormalizeExportHtml(
    '<p><strong class="ts-text-bold" ' +
      'style="white-space: pre-wrap;">Bold text</strong></p>'
  );

  assertEqual(
    actualHtml,
    '<p><strong>Bold text</strong></p>'
  );
});

test('serialized Lexical state exports through the production pipeline', () => {
  const editor = createEditor({
    ...editorConfig,
    namespace: 'typeset-editor-export-test',
  });

  const serializedEditorState = {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Integration export',
              type: 'text',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'heading',
          version: 1,
          tag: 'h1',
        },
        {
          children: [
            {
              detail: 0,
              format: 1,
              mode: 'normal',
              style: '',
              text: 'Bold text',
              type: 'text',
              version: 1,
            },
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: ' and plain text.',
              type: 'text',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
          textFormat: 0,
          textStyle: '',
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  };

  const editorState = editor.parseEditorState(
    JSON.stringify(serializedEditorState)
  );

  editor.setEditorState(editorState);

  let actualHtml = '';

editorState.read(() => {
  actualHtml = exportHtmlFromEditor(editor);
});

  assertEqual(
    actualHtml,
    '<h1>Integration export</h1>' +
      '<p><strong>Bold text</strong> and plain text.</p>'
  );
});

if (failed > 0) {
  console.error(`\nFAILED: ${failed} editor export test(s)`);
  process.exit(1);
}

console.log('\nALL PASSED: editor export tests');