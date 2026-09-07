// src/main.js
import { createDocState } from '../domain/doc/docState.js';
import { initWordView } from '../views/word.js';
import { initHtmlView } from '../views/html.js';
import { importHtmlToEditor } from '../editor/import/importHtmlToEditor.js';
import { mountWysiwygEditor } from '../editor/mountWysiwyg.js';
import { cleanHTML } from '../domain/html/htmlImport.js';
import {
  parseDocument,
  serializeDocument,
} from '../persistence/documentPersistence.ts';
import {
  openDocumentFile,
  saveDocumentFile,
} from '../persistence/browserDocumentFile.ts';
import { exportHtmlFromEditor } from '../domain/html/htmlExport.js';
import { prettyHtml } from '../domain/html/prettyHtml.js';
import { createDocument } from '../document/createDocument.ts';
import {
  clearRecoverySnapshot,
  writeRecoverySnapshot,
} from '../persistence/recoveryStorage.ts';

const $ = (id) => document.getElementById(id);

window.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // 1) DOM ELEMENTS (declare everything up front)
  // ============================================================
  // Core elements
  const wordInput = $('wordInput');
  const htmlEditor = $('htmlEditor');
  const wysiwyg = $('wysiwygEditor');

  const statDocumentName = $('statDocumentName');
  const statBytes = $('statBytes');
  const statWords = $('statWords');
  const badgeActive = $('badgeActive');

  // Global buttons
  const btnCopy = $('btnCopy');
  const btnSave = $('btnSave');

  const btnThemeToggle = $('btnThemeToggle');
  const body = document.body;

  // Word/HTML tools
  const btnPaste = $('btnPaste');
  const btnClean = $('btnClean');
  const btnClearAll = $('btnClearAll');
  const btnFormatHtml = $('btnFormatHtml');

  // Menu
  const btnMenu = $('btnMenu');
  const menuPanel = $('menuPanel');
  const menuNew = $('menuNew');
  const menuImport = $('menuImport');
  const menuSave = $('menuSave');
  const menuSaveAs = $('menuSaveAs');
  const menuOpenDocument = $('menuOpenDocument');
  const menuExportHtml = $('menuExportHtml');

  // Toolbars
  const toolsWord = $('toolsWord');
  const toolsHtml = $('toolsHtml');
  const toolsWysiwyg = $('toolsWysiwyg');

  // Views
  const viewWord = $('viewWord');
  const viewHtml = $('viewHtml');
  const viewWysiwyg = $('viewWysiwyg');

  // Navigation
  const navWord = $('navWord');
  const navHtml = $('navHtml');
  const navWysiwyg = $('navWysiwyg');

  // WYSIWYG toolbar buttons
  const stylesSelect = $('stylesSelect');
  const btnScreenshot = $('btnScreenshot');
  const btnNormalizeTable = $('btnNormalizeTable');
  const btnUserInput = $('btnUserInput');
  const btnVariable = $('btnVariable');
  const btnHr = $('btnHr');

  const btnUl = $('btnUl');
  const btnOl = $('btnOl');
  const btnIndent = $('btnIndent');
  const btnOutdent = $('btnOutdent');
  const btnAlignLeft = $('btnAlignLeft');
  const btnAlignCenter = $('btnAlignCenter');
  const btnAlignRight = $('btnAlignRight');
  const btnAlignJustify = $('btnAlignJustify');

  // Export CSS
  const exportCssTemplate = $('export-css');
const cssForExport = exportCssTemplate
  ? (exportCssTemplate.content?.textContent || exportCssTemplate.textContent || '').trim()
  : '';

if (!cssForExport) {
  console.warn('[export] No export CSS found. Check <template id="export-css"> in index.html');
}

  // ============================================================
  // 2) STATE
  // ============================================================
  let lexicalEditor = null;
  let suppressWysiwygToHtml = false;

  const docState = createDocState({ htmlEditor, wysiwyg, statBytes, statWords });

  let activeView = 'wysiwyg';

  let htmlViewApi = null; // will be set after initHtmlView()

  // TypeSet document session
  let currentDocument = createDocument();
  let currentDocumentFilename = null;
  let currentDocumentHandle = null;
  const RECOVERY_DEBOUNCE_MS = 2000;

let recoveryTimer = null;
let unregisterRecoveryListener = null;


function updateDocumentFooterName() {
  if (!statDocumentName) return;

  const name =
    currentDocumentFilename &&
    String(currentDocumentFilename).trim()
      ? currentDocumentFilename
      : 'Untitled';

  statDocumentName.textContent = name;
}

  function getActiveView() {
    return activeView;
  }
  

  function setActiveView(view) {
    activeView = view;

    // Panel visibility
    viewWord?.classList.toggle('hidden', view !== 'word');
    viewHtml?.classList.toggle('hidden', view !== 'html');
    viewWysiwyg?.classList.toggle('hidden', view !== 'wysiwyg');

    // Toolbar visibility
    toolsWord?.classList.toggle('hidden', view !== 'word');
    toolsHtml?.classList.toggle('hidden', view !== 'html');
    toolsWysiwyg?.classList.toggle('hidden', view !== 'wysiwyg');

    if (view === 'html' && htmlEditor) {
  htmlViewApi?.onEnter?.();
}


    // Rail highlight
    ['navWord', 'navHtml', 'navWysiwyg'].forEach((id) => {
      const el = $(id);
      if (el) el.classList.remove('rail-active');
    });
    const map = { word: navWord, html: navHtml, wysiwyg: navWysiwyg };
    map[view]?.classList.add('rail-active');

    // Badge
    if (badgeActive) {
      const label = view === 'word' ? 'Word' : view === 'html' ? 'HTML' : 'WYSIWYG';
      badgeActive.textContent = `View: ${label}`;
    }
  }

  // ============================================================
  // 3) HELPERS (download/export, timestamps)
  // ============================================================
  function downloadBlob({ bytes, mime, filename }) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([bytes], { type: mime }));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 0);
  }

  function makeTimestampSlug(d = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}${mm}${dd}-${hh}${mi}`;
  }

    function htmlToText(html) {
    try {
      const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
      return (doc.body?.textContent || '').trim();
    } catch {
      return String(html || '').trim();
    }
  }

  function extractTitleFromHtml(html) {
    const source = String(html || '').trim();
    if (!source) return '';

    try {
      const doc = new DOMParser().parseFromString(source, 'text/html');

      // Prefer first heading as "title"
      const heading = doc.querySelector('h1,h2,h3,h4,h5,h6');
      if (heading) {
        const t = (heading.textContent || '').trim();
        if (t) return t;
      }

      // Fallback: first non-empty line of visible text
      const text = (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
      return text;
    } catch {
      // Fallback: treat input as plain text, take first line-ish chunk
      return source.replace(/\s+/g, ' ').trim();
    }
  }

  function slugifyFilename(input, { maxLen = 60 } = {}) {
    const raw = String(input || '').trim();
    if (!raw) return 'blank';

    // Normalize and strip diacritics
    const normalized = raw.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

    // Replace anything that’s not filename-friendly with spaces
    const cleaned = normalized
      .replace(/['"]/g, '')           // drop quotes
      .replace(/[^a-zA-Z0-9]+/g, ' ')  // non-alnum -> space
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase();

    const clipped = cleaned.slice(0, maxLen).replace(/-+$/g, '');
    return clipped || 'blank';
  }

  function getDocBaseName() {
    // Prefer canonical clean HTML, fallback to current WYSIWYG DOM
    const html = docState.getCleanHtml() || (wysiwyg?.innerHTML || '');
    const title = extractTitleFromHtml(html);

    // Use only a portion (slugify handles truncation)
    return slugifyFilename(title || htmlToText(html) || 'blank');
  }

    function getInitialDocumentFilename() {
  return `${getDocBaseName()}.typeset`;
}


  // ============================================================
  // 4) CLIPBOARD
  // ============================================================
  async function copyExportFragment() {
    if (htmlViewApi?.hasPendingEdits?.()) {
  htmlViewApi.showUsedLastAppliedMessage?.();
}

    try {
      const fragment = getExportFragmentHtml();
      if (!ensureExportIsValidOrAlert(fragment)) return;

      const data = [
        new ClipboardItem({
          'text/html': new Blob([fragment], { type: 'text/html' }),
'text/plain': new Blob([fragment], { type: 'text/plain' }),
        }),
      ];
      await navigator.clipboard.write(data);

    } catch {
      // Clipboard blocked or unsupported — silently fail for now
    }
  }


  // ============================================================
  // 5) EXPORT + DOCUMENT SAVE/OPEN
  // ============================================================
    function getExportFragmentHtml() {
      
    // Stage 7: export is always the canonical clean HTML fragment
    return String(docState.getCleanHtml() || '').trim();
  }

  function validateExportFragmentAgainstContract(html) {
    const source = String(html || '').trim();

    // Basic “gate” (expand later as contract hardens)
    if (!source) return { ok: false, message: 'Nothing to export yet.' };

    // Block full-document exports from slipping into fragment export
    const forbidden = [
      '<!doctype',
      '<html',
      '<head',
      '<body',
      '<script',
      '<style',
    ];

    const lower = source.toLowerCase();
    const hit = forbidden.find((t) => lower.includes(t));
    if (hit) {
      return {
        ok: false,
        message: `Export must be an HTML fragment (no ${hit}...). Use Publish for a full standalone HTML page.`,
      };
    }

    return { ok: true };
  }

  function ensureExportIsValidOrAlert(html) {
    const result = validateExportFragmentAgainstContract(html);
    if (!result.ok) {
      alert(result.message || 'Export blocked: content does not match the contract.');
      return false;
    }
    return true;
  }
  
    function exportFragmentFile() {
  if (htmlViewApi?.hasPendingEdits?.()) {
    htmlViewApi.showUsedLastAppliedMessage?.();
  }

  const fragment = getExportFragmentHtml();
  if (!ensureExportIsValidOrAlert(fragment)) return;

  downloadBlob({
    bytes: fragment,
    mime: 'text/html;charset=utf-8',
    filename: `${getDocBaseName()}-${makeTimestampSlug()}.html`,
  });
}


  function publishStandaloneHtmlFile() {
    const content = getExportFragmentHtml(); // publish uses the same canonical fragment
    if (!ensureExportIsValidOrAlert(content)) return;

    const doc = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${extractTitleFromHtml(content) || 'Document'}</title>
<style>${cssForExport}</style></head><body>${content}</body></html>`;

    downloadBlob({
      bytes: doc,
      mime: 'text/html;charset=utf-8',
      filename: `${getDocBaseName()}-${makeTimestampSlug()}.html`,
    });
  }

    async function saveDocument({ forceSaveAs = false } = {}) {
  if (!lexicalEditor) {
    alert('The document editor is not ready yet.');
    return;
  }

  let editorState;

  try {
    editorState = lexicalEditor.getEditorState().toJSON();
  } catch (error) {
    console.error('Document save could not serialize the editor state:', error);
    alert('TypeSet could not prepare this document for saving.');
    return;
  }

  const cleanHtml = docState.getCleanHtml() || '';
  const now = new Date().toISOString();

  currentDocument = {
    ...currentDocument,
    document: {
      ...currentDocument.document,
      title: extractTitleFromHtml(cleanHtml),
      updatedAt: now,
    },
    editorState,
  };

  if (!currentDocumentFilename) {
    currentDocumentFilename = getInitialDocumentFilename();
  }

  const text = serializeDocument(currentDocument);
  const handleToUse = forceSaveAs ? null : currentDocumentHandle;

  try {
    const result = await saveDocumentFile({
      text,
      suggestedName: currentDocumentFilename,
      existingHandle: handleToUse,
    });

    if (result.ok) {
  currentDocumentHandle = result.handle;
  currentDocumentFilename = result.fileName;
  updateDocumentFooterName();
  clearRecoveryAfterSuccessfulSave();
  return;
}
  } catch (error) {
    if (error?.name === 'AbortError') {
      return;
    }

    console.warn(
      'Browser document save failed; using download fallback:',
      error
    );
  }

  downloadBlob({
  bytes: text,
  mime: 'application/json;charset=utf-8',
  filename: currentDocumentFilename,
});

updateDocumentFooterName();
clearRecoveryAfterSuccessfulSave();
}

function captureRecoverySnapshot() {
  recoveryTimer = null;

  if (!lexicalEditor) {
    return;
  }

  let editorState;

  try {
    editorState = lexicalEditor.getEditorState().toJSON();
  } catch (error) {
    console.error(
      'Recovery could not serialize the editor state:',
      error
    );
    return;
  }

  const cleanHtml = docState.getCleanHtml() || '';
  const now = new Date().toISOString();

  const recoveryDocument = {
    ...currentDocument,
    document: {
      ...currentDocument.document,
      title: extractTitleFromHtml(cleanHtml),
      updatedAt: now,
    },
    editorState,
  };

  const result = writeRecoverySnapshot(recoveryDocument);

  if (!result.ok) {
    console.warn(result.message);
    return;
  }

  currentDocument = recoveryDocument;
}

function scheduleRecoverySnapshot() {
  if (recoveryTimer !== null) {
    clearTimeout(recoveryTimer);
  }

  recoveryTimer = window.setTimeout(
    captureRecoverySnapshot,
    RECOVERY_DEBOUNCE_MS
  );
}

function clearRecoveryAfterSuccessfulSave() {
  if (recoveryTimer !== null) {
    clearTimeout(recoveryTimer);
    recoveryTimer = null;
  }

  const result = clearRecoverySnapshot();

  if (!result.ok) {
    console.warn(result.message);
  }
}

function loadDocumentFromText(
  text,
  { handle = null, fileName = null } = {}
) {
  if (!lexicalEditor) {
    throw new Error('The document editor is not ready yet.');
  }

  const result = parseDocument(text);

  if (!result.valid) {
    throw new Error(result.message);
  }

  let parsedEditorState;

  try {
    parsedEditorState = lexicalEditor.parseEditorState(
      JSON.stringify(result.document.editorState)
    );
  } catch (error) {
    console.error('Document editor state could not be parsed:', error);
    throw new Error('The document contains an editor state that TypeSet cannot load.');
  }

  // Validation and Lexical parsing have succeeded. It is now safe to
  // replace the current document session and editor content.
  currentDocument = result.document;
  currentDocumentFilename =
    fileName ||
    `${slugifyFilename(result.document.document.title || 'untitled')}.typeset`;
  currentDocumentHandle = handle;

  suppressWysiwygToHtml = true;

  try {
    lexicalEditor.setEditorState(parsedEditorState);

    const exportedHtml = parsedEditorState.read(() =>
      exportHtmlFromEditor(lexicalEditor)
    );

    const { html: cleanedHtml } = cleanHTML(exportedHtml);
    docState.setCleanHtml(cleanedHtml, { from: 'wysiwyg' });
  } finally {
    suppressWysiwygToHtml = false;
  }

  if (wordInput) {
    wordInput.innerHTML = '';
  }

  setActiveView('wysiwyg');
  updateDocumentFooterName();
}

function ensureHiddenDocumentInput() {
  let input = document.getElementById('documentFileInput');

  if (input) {
    return input;
  }

  input = document.createElement('input');
  input.id = 'documentFileInput';
  input.type = 'file';
  input.accept = '.typeset,application/json';
  input.style.display = 'none';
  document.body.appendChild(input);

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    try {
      const text = await file.text();

      loadDocumentFromText(text, {
        handle: null,
        fileName: file.name,
      });
    } catch (error) {
      console.error('Open document failed:', error);
      alert(`Could not open document. ${error?.message || 'Unknown error'}`);
    }
  });

  return input;
}

async function openDocumentPicker() {
  let opened;

  try {
    opened = await openDocumentFile();
  } catch (error) {
    if (error?.name === 'AbortError') {
      return;
    }

    console.warn(
      'Browser document picker failed; using file-input fallback:',
      error
    );
  }

  if (opened?.ok) {
    try {
      loadDocumentFromText(opened.text, {
        handle: opened.handle,
        fileName: opened.fileName,
      });
    } catch (error) {
      console.error('Open document failed:', error);
      alert(`Could not open document. ${error?.message || 'Unknown error'}`);
    }

    return;
  }

  ensureHiddenDocumentInput().click();
}


  // ============================================================
  // 6) VIEWS INIT
  // ============================================================
  const sharedElements = {
    wordInput,
    htmlEditor,
    wysiwyg,

    btnPaste,
    btnClean,
    btnClearAll,
    btnFormatHtml,

    btnUl,
    btnOl,
    btnIndent,
    btnOutdent,
    btnAlignLeft,
    btnAlignCenter,
    btnAlignRight,
    btnAlignJustify,

    stylesSelect,
    btnScreenshot,
    btnNormalizeTable,
    btnUserInput,
    btnVariable,
    btnHr,
  };

  initWordView({
  elements: sharedElements,
  docState,
  setActiveView,
  loadHtmlIntoEditor: (html) => {
    if (!lexicalEditor) return;

    suppressWysiwygToHtml = true;

    try {
      importHtmlToEditor(lexicalEditor, String(html ?? ''));
    } finally {
      setTimeout(() => {
        suppressWysiwygToHtml = false;
      }, 0);
    }
  },
});


  htmlViewApi = initHtmlView({
  elements: sharedElements,
  docState,
  loadHtmlIntoEditor: (html) => {
    if (!lexicalEditor) return;

    suppressWysiwygToHtml = true;
    try {
      importHtmlToEditor(lexicalEditor, String(html ?? ''));
    } finally {
      setTimeout(() => (suppressWysiwygToHtml = false), 0);
    }
  },
});


  // ============================================================
  // 7) EVENT WIRING (one place, after all declarations)
  // ============================================================
  // Theme
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      body.classList.toggle('theme-light');
      btnThemeToggle.textContent = body.classList.contains('theme-light') ? 'LIGHT' : 'DARK';
    });
  }

  // Nav
  navWord?.addEventListener('click', () => setActiveView('word'));
  navHtml?.addEventListener('click', () => setActiveView('html'));
  navWysiwyg?.addEventListener('click', () => setActiveView('wysiwyg'));

  // Global buttons
  btnCopy?.addEventListener('click', copyExportFragment);
  btnSave?.addEventListener('click', exportFragmentFile);

  // Menu toggle
  btnMenu?.addEventListener('click', () => {
    menuPanel?.classList.toggle('hidden');
  });

  // INVARIANT (8.5c):
// - Word view uses a contenteditable DIV => clear with innerHTML, not .value
// - HTML view is a TEXTAREA => clear with .value
// - Lexical state is derived => clear via importHtmlToEditor(editor, '')

function clearWysiwygToEmpty() {
  if (!lexicalEditor) return;

  suppressWysiwygToHtml = true;
  try {
    importHtmlToEditor(lexicalEditor, ''); // empty doc
  } finally {
    setTimeout(() => (suppressWysiwygToHtml = false), 0);
  }
}

// Menu: New
menuNew?.addEventListener('click', () => {
  // 1) Clear canonical HTML
  docState.setCleanHtml('', { from: 'system' });

  // 2) Clear editors/views
  if (wordInput) wordInput.innerHTML = '';
  if (htmlEditor) htmlEditor.value = '';
  clearWysiwygToEmpty();

  // 3) Start a new TypeSet document session
currentDocument = createDocument();
currentDocumentFilename = null;
currentDocumentHandle = null;

  // 4) UI refresh
  updateDocumentFooterName();
  setActiveView('wysiwyg');

  menuPanel?.classList.add('hidden');
});




  // Menu: Import (switch to Word view)
  menuImport?.addEventListener('click', async () => {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.htm';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) return;


      const text = await file.text();

// 1) Scrub through contract first
// NOTE: you need to import cleanHTML at top of main.js (see below)
const { html } = cleanHTML(text);

// 2) Store canonical clean HTML
docState.setCleanHtml(html, { from: 'import' });
if (htmlEditor) htmlEditor.value = html;

// 3) Prep: load into editor
if (lexicalEditor) {
  suppressWysiwygToHtml = true;
  try {
    importHtmlToEditor(lexicalEditor, html);
  } finally {
    setTimeout(() => (suppressWysiwygToHtml = false), 0);
  }
}

setActiveView('wysiwyg');

    });

    input.click();
  } finally {
    menuPanel?.classList.add('hidden');
  }
});

  // Menu: Save TypeSet document
menuSave?.addEventListener('click', async () => {
  await saveDocument();
  menuPanel?.classList.add('hidden');
});

menuSaveAs?.addEventListener('click', async () => {
  await saveDocument({ forceSaveAs: true });
  menuPanel?.classList.add('hidden');
});



  // Menu: Open TypeSet document
menuOpenDocument?.addEventListener('click', async () => {
  await openDocumentPicker();
  menuPanel?.classList.add('hidden');
});

  // Menu: Publish HTML
    menuExportHtml?.addEventListener('click', () => {
    publishStandaloneHtmlFile();
    menuPanel?.classList.add('hidden');
  });

    // Keep export fragment in sync with HTML view edits
  // htmlEditor?.addEventListener('input', () => {
  //   if (getActiveView() !== 'html') return;
  //   docState.setCleanHtml(htmlEditor.value || '', { from: 'html' });
  // });



  // ============================================================
  // 8) INIT DEFAULT STATE
  // ============================================================
  docState.setCleanHtml('', { from: 'system' });
  setActiveView('wysiwyg');
  updateDocumentFooterName();

  // ============================================================
  // 9) MOUNT LEXICAL (last)
  // ============================================================
  mountWysiwygEditor({
    onEditorReady: (editor) => {
  lexicalEditor = editor;

  // Wait until initial editor setup finishes so the automatically
  // created empty paragraph is not treated as unsaved author work.
  window.setTimeout(() => {
    unregisterRecoveryListener?.();

    unregisterRecoveryListener = editor.registerUpdateListener(({ tags }) => {
  if (
    suppressWysiwygToHtml ||
    tags.has('typeset-initialization')
  ) {
    return;
  }

  scheduleRecoverySnapshot();
});
  }, 0);
},
    onHtmlChange: (html) => {
  if (suppressWysiwygToHtml) return;

  const { html: cleaned } = cleanHTML(html);
  docState.setCleanHtml(cleaned, { from: 'wysiwyg' });
},

  });
});
