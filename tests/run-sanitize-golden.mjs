import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { JSDOM } from "jsdom";

// Import the production HTML pipeline functions.
import { cleanHTML } from "../src/domain/html/htmlImport.js";
import {
  cleanAndNormalizeExportHtml,
} from "../src/domain/html/htmlExport.js";
import { prettyHtml } from "../src/domain/html/prettyHtml.js";

/**
 * --- DOM shim ---
 * convert.js and htmlExport.js use DOMParser/document/NodeFilter/etc.
 * JSDOM provides those in Node.
 */
function installDomShim() {
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`);
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;
  globalThis.DOMParser = dom.window.DOMParser;
  globalThis.NodeFilter = dom.window.NodeFilter;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function normalizeEol(s) {
  return (s || "").replace(/\r\n/g, "\n");
}

function decodeQuotedPrintable(s) {
  return (s || "")
    // Remove soft line breaks: "=\r\n" or "=\n"
    .replace(/=\r?\n/g, "")
    // Decode =3D, =2F, etc.
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}



function firstDiffIndex(a, b) {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : len;
}

function snippetAround(str, idx, radius = 140) {
  const start = Math.max(0, idx - radius);
  const end = Math.min(str.length, idx + radius);
  return str.slice(start, end);
}

/**
 * Mode:
 *  - "word"  => run cleanHTML() (Word → clean HTML)
 *  - "export"=> run cleanAndNormalizeExportHtml() (Lexical export cleanup)
 *
 * Default: export (because your fixtures are mostly “already HTML”, not Word cruft)
 */
const mode = (process.argv.find(a => a.startsWith("--mode=")) || "--mode=export").split("=")[1];

installDomShim();

const FIXTURES_ROOT = path.resolve(
  process.cwd(),
  mode === "word"
    ? "tests/import/word/fixtures"
    : "tests/export/html/fixtures"
);

if (!fs.existsSync(FIXTURES_ROOT)) {
  console.error(`Fixtures folder not found: ${FIXTURES_ROOT}`);
  process.exit(2);
}

const inFiles = walk(FIXTURES_ROOT).filter(p => p.endsWith(".in.html"));
if (inFiles.length === 0) {
  console.error(`No *.in.html fixtures found under: ${FIXTURES_ROOT}`);
  process.exit(2);
}

let failed = 0;

for (const inPath of inFiles) {
  const outPath = inPath.replace(/\.in\.html$/, ".out.html");
  const relIn = path.relative(process.cwd(), inPath);
  const relOut = path.relative(process.cwd(), outPath);

  if (!fs.existsSync(outPath)) {
    failed++;
    console.error(`\n❌ Missing OUT fixture for:\n  ${relIn}\n  Expected: ${relOut}`);
    continue;
  }



  const input = normalizeEol(fs.readFileSync(inPath, "utf-8"));
const expected = normalizeEol(fs.readFileSync(outPath, "utf-8")).trim();

  let raw;
  try {
const decodedInput =
  mode === "word" ? decodeQuotedPrintable(input) : input;

const result =
  mode === "word"
    ? cleanHTML(decodedInput)
    : cleanAndNormalizeExportHtml(decodedInput);

// Back-compat: cleanHTML used to return a string; Stage 5 returns { html, report }
raw =
  typeof result === "string"
    ? result
    : (result && typeof result.html === "string" ? result.html : "");

  } catch (e) {
    failed++;
    console.error(`\n❌ Pipeline threw for:\n  ${relIn}\n  mode=${mode}\n  ${String(e?.stack || e)}`);
    continue;
  }

  // Match what you actually eyeball/copy: the HTML view “Format” pretty output
const actual = normalizeEol(prettyHtml(raw)).trim();

const shouldUpdate = process.argv.includes("--update");

  if (actual !== expected) {
    failed++;
    const actualPath = outPath.replace(/\.out\.html$/, ".actual.html");
fs.writeFileSync(actualPath, actual, "utf8");

if (shouldUpdate) {
    fs.writeFileSync(outPath, actual, "utf8"); // ✅ overwrite golden
    process.stdout.write(`📝 updated ${relOut}\n`);
    failed--; // treat as pass in update mode
    continue;
  }
    const idx = firstDiffIndex(actual, expected);
    console.error(`\n❌ MISMATCH\n  IN : ${relIn}\n  OUT: ${relOut}\n  mode=${mode}`);
    console.error(`  First diff index: ${idx}`);
    console.error("\n--- expected (snippet) ---");
    console.error(snippetAround(expected, Math.max(0, idx)));
    console.error("\n--- actual (snippet) ---");
    console.error(snippetAround(actual, Math.max(0, idx)));
  } else {
    process.stdout.write(`✅ ${relIn}\n`);
  }
}

if (failed) {
  console.error(`\nFAILED: ${failed} fixture(s)`);
  process.exit(1);
}

console.log(`\nALL PASSED: ${inFiles.length} fixture(s)`);
