// src/views/html.js
import { cleanHTML } from '../import/htmlImport.js';
import { prettyHtml } from '../utils/prettyHtml.js';

export function initHtmlView({ elements, docState, loadHtmlIntoEditor }) {
  const { htmlEditor, btnFormatHtml } = elements;
  if (!htmlEditor) return null;

  let dirty = false;
  let baseRev = docState.getMeta?.().rev ?? 0;

  function getStatusEl() {
    let el = document.getElementById('htmlApplyStatus');
    if (el) return el;

    el = document.createElement('div');
    el.id = 'htmlApplyStatus';
    el.setAttribute('role', 'status');
    el.style.marginTop = '8px';
    el.style.fontSize = '12px';
    el.style.opacity = '0.9';

    if (btnFormatHtml?.parentElement) {
      btnFormatHtml.parentElement.appendChild(el);
    } else {
      htmlEditor?.insertAdjacentElement('afterend', el);
    }
    return el;
  }

  let lastAppliedHtml = docState.getCleanHtml() || '';

function snapshotLastApplied() {
  lastAppliedHtml = docState.getCleanHtml() || '';
}

function revertToLastApplied() {
  htmlEditor.value = lastAppliedHtml;
  // Don’t load into editor automatically unless you want revert to be “apply” too.
}

  function setStatus(message, kind = 'info', { actionText, onAction } = {}) {
  const el = getStatusEl();
  el.innerHTML = ''; // clear previous

  const msg = document.createElement('span');
  msg.textContent = message;
  el.appendChild(msg);

  if (actionText && typeof onAction === 'function') {
    const spacer = document.createTextNode(' ');
    el.appendChild(spacer);

    const a = document.createElement('button');
    a.type = 'button';
    a.textContent = actionText;
    a.style.marginLeft = '8px';
    a.style.fontSize = '12px';
    a.addEventListener('click', onAction);
    el.appendChild(a);
  }

  el.style.color =
    kind === 'error' ? 'crimson' :
    kind === 'warn' ? 'darkgoldenrod' :
    '';
}

  function clearStatus() {
    const el = document.getElementById('htmlApplyStatus');
    if (el) el.textContent = '';
  }

  function onEnter() {
    // HTML view always starts from canonical (last applied) HTML
    const canonical = docState.getCleanHtml?.() || '';
    htmlEditor.value = prettyHtml(canonical);

    snapshotLastApplied();

    dirty = false;
    baseRev = docState.getMeta?.().rev ?? baseRev;
    clearStatus();
    
  }

  function hasPendingEdits() {
    return !!dirty;
  }

  function showUsedLastAppliedMessage() {
    if (!dirty) return;
    setStatus(
      'Used last applied HTML. Click Update and try again to include pending edits.',
      'warn'
    );
  }

  btnFormatHtml?.addEventListener('click', () => {
    const input = (htmlEditor.value || '').trim();

    try {
      const { html, report } = cleanHTML(input);
      const pretty = prettyHtml(html);

      // Commit canonical
      docState.setCleanHtml(pretty, { from: 'html' });

      // Update buffer (what you see) and apply to editor
      htmlEditor.value = pretty;
      loadHtmlIntoEditor?.(pretty);

      snapshotLastApplied();

      dirty = false;
      baseRev = docState.getMeta?.().rev ?? baseRev;

      const removedTags = report?.removedTags ? Array.from(report.removedTags) : [];
const removedAttrs = report?.removedAttrs ? Array.from(report.removedAttrs) : [];
const normalized = Array.isArray(report?.normalized) ? report.normalized : [];

const changed =
  !!report?.changed ||
  removedTags.length > 0 ||
  removedAttrs.length > 0 ||
  normalized.length > 0;

if (changed) {
  const bits = [];
  if (removedTags.length) bits.push(`Removed tags: ${removedTags.join(', ')}`);
  if (removedAttrs.length) bits.push(`Removed attrs: ${removedAttrs.join(', ')}`);
  if (normalized.length) bits.push(`Normalized: ${normalized.join(', ')}`);
  setStatus(`Applied with changes. ${bits.join(' • ')}`, 'warn');
} else {
  setStatus('Applied. No contract violations detected.', 'info');
}

    } catch (err) {
  console.error('HTML Apply failed:', err);
  setStatus(
    `Could not apply HTML. Fix the markup and try again. (${err?.message || 'Unknown error'})`,
    'error',
    { actionText: 'Revert to last applied', onAction: revertToLastApplied }
  );
}
  });

  htmlEditor.addEventListener('input', () => {
    dirty = true;

    // Optional divergence warning: canonical changed since you entered HTML view
    const nowRev = docState.getMeta?.().rev ?? baseRev;
    if (nowRev !== baseRev) {
      setStatus(
        'Edits not applied yet. (Note: the document changed since you entered HTML view.) Click Update to apply changes.',
        'warn'
      );
    } else {
      setStatus('Edits not applied yet. Click Update to apply changes.', 'warn');
    }
  });

  return {
    onEnter,
    hasPendingEdits,
    showUsedLastAppliedMessage,
    setStatus, // optional, but handy
  };
}
