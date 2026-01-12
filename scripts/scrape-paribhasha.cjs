#!/usr/bin/env node

/**
 * Scrape Vedanta Paribhasha Vivarana dictionary from advaitavedanta.in
 * Uses curl subprocess since the server blocks Node.js fetch
 *
 * Usage: node scripts/scrape-paribhasha.cjs
 * Output: src/data/dictionary.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_URL = 'https://www.advaitavedanta.in/vedanta_paribasha_vivarana_';
const TOTAL_PAGES = 34;
const OUTPUT_FILE = path.join(__dirname, '../src/data/dictionary.json');

// extract entries from HTML using regex
function extractEntries(html, pageNum) {
  const entries = [];

  // find buttons: <button ... id="myBtn" or id="myBtn2" etc>TERM</button>
  const buttonRegex = /<button[^>]*id="myBtn(\d*)"[^>]*>([^<]+)<\/button>/gi;

  // find modal content: <div id="myModal" class="modal">...<p class="big">CONTENT</p>...</div>
  const modalRegex = /<div[^>]*id="myModal(\d*)"[^>]*class="modal"[\s\S]*?<p[^>]*class="big"[^>]*>([\s\S]*?)<\/p>/gi;

  const buttons = {};
  const modals = {};

  let match;
  while ((match = buttonRegex.exec(html)) !== null) {
    const id = match[1] || '';
    const term = match[2].trim();
    buttons[id] = term;
  }

  while ((match = modalRegex.exec(html)) !== null) {
    const id = match[1] || '';
    let content = match[2].trim()
      .replace(/<br\s*\/?>/gi, ' ')  // replace <br> with space
      .replace(/<[^>]+>/g, '')       // strip HTML tags
      .replace(/&nbsp;/g, ' ')       // replace &nbsp;
      .replace(/\s+/g, ' ')          // normalize whitespace
      .trim();
    modals[id] = content;
  }

  // match buttons with modals
  for (const id of Object.keys(buttons)) {
    if (modals[id]) {
      const term = buttons[id];
      const telugu = modals[id];

      const entryId = `p${pageNum}-${id || '0'}`;

      entries.push({
        id: entryId,
        term: term,
        devanagari: '',
        iast: '',
        source: 'paribhasha',
        telugu: telugu,
        english: '',
        seeAlso: []
      });
    }
  }

  return entries;
}

function fetchPage(pageNum) {
  const url = `${BASE_URL}${pageNum}.html`;
  process.stdout.write(`Fetching page ${pageNum}...`);

  try {
    const html = execSync(
      `curl -s -A "Mozilla/5.0 (compatible)" "${url}"`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );

    const entries = extractEntries(html, pageNum);
    console.log(` ${entries.length} entries`);
    return entries;

  } catch (error) {
    console.log(` Error: ${error.message}`);
    return [];
  }
}

function main() {
  console.log('Scraping Vedanta Paribhasha Vivarana...\n');

  const allEntries = [];

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const entries = fetchPage(page);
    allEntries.push(...entries);
  }

  console.log(`\nTotal entries: ${allEntries.length}`);

  // read existing dictionary to preserve translations
  let dictionary = {
    sources: {
      paribhasha: {
        name: 'Vedānta Paribhāṣā Vivaraṇa',
        description: 'Traditional glossary of Advaita terminology',
        sourceUrl: 'https://www.advaitavedanta.in/vedanta_paribasha_vivarana_index.html'
      }
    },
    entries: []
  };

  // merge: keep existing English translations if any
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      const existingMap = new Map(existing.entries.map(e => [e.id, e]));

      for (const entry of allEntries) {
        const existingEntry = existingMap.get(entry.id);
        if (existingEntry) {
          if (existingEntry.english) entry.english = existingEntry.english;
          if (existingEntry.devanagari) entry.devanagari = existingEntry.devanagari;
          if (existingEntry.iast) entry.iast = existingEntry.iast;
        }
      }

      dictionary.sources = { ...existing.sources, ...dictionary.sources };
    } catch (e) {
      // ignore parse errors
    }
  }

  dictionary.entries = allEntries;

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dictionary, null, 2));
  console.log(`Written to: ${OUTPUT_FILE}`);
}

main();
