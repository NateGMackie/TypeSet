// src/views/word.js
import { cleanHTML } from "../import/htmlImport.js";

export function initWordView({
  elements,
  docState,
  setActiveView,
  loadHtmlIntoEditor,
}) {

  const {
    wordInput,
    btnPaste,
    btnClean,
    btnClearAll,
    htmlEditor,
    wysiwyg,
  } = elements;

  if (!wordInput) return;

  function getWordStatusEl() {
  let el = document.getElementById('wordStatus');
  if (el) return el;

  el = document.createElement('div');
  el.id = 'wordStatus';
  el.setAttribute('role', 'status');
  el.style.marginTop = '8px';
  el.style.fontSize = '12px';
  el.style.opacity = '0.9';

  // Put it near the Clean button area if possible
  if (btnClean?.parentElement) btnClean.parentElement.appendChild(el);
  else wordInput?.insertAdjacentElement('afterend', el);

  return el;
}

function setWordStatus(message, kind = 'info') {
  const el = getWordStatusEl();
  el.textContent = message || '';
  el.style.color =
    kind === 'error' ? 'crimson' :
    kind === 'warn' ? 'darkgoldenrod' :
    '';
}

  // Clean: run Word → Clean HTML pipeline, then push into state and go to WYSIWYG
  btnClean?.addEventListener('click', () => {
  try {
    const html = wordInput.innerHTML || '';
    const { html: cleaned, report } = cleanHTML(html);

    docState.setCleanHtml(cleaned, { from: 'word' });

    // Load into editor
    loadHtmlIntoEditor?.(cleaned);
    setActiveView?.('wysiwyg');

    const removed = report?.removedTags ? Array.from(report.removedTags) : [];
    if (removed.length) {
      setWordStatus(`Cleaned. Removed tags: ${removed.join(', ')}`, 'warn');
    } else {
      setWordStatus('Cleaned successfully.', 'info');
    }
  } catch (err) {
    console.error('[word] clean failed:', err);

    // 8.5d: keep user input intact; do not switch views
    setWordStatus(
      `Could not clean. Your content is still here. Fix the source or try again. (${err?.message || 'Unknown error'})`,
      'error'
    );
  }
});


  btnClearAll?.addEventListener("click", () => {
  // Word Reset is *not* "New document" — it just clears the Word paste area.
  wordInput.innerHTML = "";
  wordInput.focus?.();
});

  // Paste button: try HTML from clipboard, fallback to text
  btnPaste?.addEventListener("click", async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes("text/html")) {
          const html = await (await item.getType("text/html")).text();
          wordInput.innerHTML = html;
          return;
        }
      }
      const text = await navigator.clipboard.readText();
      wordInput.textContent = text;
    } catch {
      // Silent fail – clipboard APIs can be blocked
    }
  });

  // When pasting directly into the editable div, keep Word’s HTML
  wordInput.addEventListener("paste", (e) => {
    const html = e.clipboardData.getData("text/html");
    if (html) {
      e.preventDefault();
      document.execCommand("insertHTML", false, html);
    }
  });
}
