#!/usr/bin/env node
/**
 * Essay Pipeline - Convert raw text to formatted MDX
 *
 * Usage: node scripts/essay-pipeline.cjs <input.txt> [output-slug]
 *
 * Prompts for metadata, auto-wraps Sanskrit terms, outputs MDX.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// common Sanskrit terms to auto-wrap with <Term> component
const SANSKRIT_TERMS = {
  // core concepts
  'ātmā': 'ātmā',
  'ātman': 'ātman',
  'ātmanaḥ': 'ātmanaḥ',
  'ātmanā': 'ātmanā',
  'brahman': 'brahman',
  'paramātman': 'paramātman',
  'jīva': 'jīva',
  'māyā': 'māyā',
  'avidyā': 'avidyā',
  'vidyā': 'vidyā',
  'mokṣa': 'mokṣa',
  'saṃsāra': 'saṃsāra',
  'karma': 'karma',
  'dharma': 'dharma',
  'sākṣī': 'sākṣī',
  'sākṣin': 'sākṣin',

  // texts
  'vedānta': 'vedānta',
  'upaniṣad': 'upaniṣad',
  'upaniṣads': 'upaniṣads',
  'gītā': 'gītā',
  'bhagavad gītā': 'bhagavad gītā',

  // qualities
  'sat': 'sat',
  'cit': 'cit',
  'ānanda': 'ānanda',
  'satya': 'satya',
  'jñāna': 'jñāna',
  'bhakti': 'bhakti',
  'yoga': 'yoga',
  'dhyāna': 'dhyāna',

  // teachers
  'śaṅkara': 'śaṅkara',
  'śaṅkarācārya': 'śaṅkarācārya',

  // other common terms
  'ahaṅkāra': 'ahaṅkāra',
  'manas': 'manas',
  'buddhi': 'buddhi',
  'citta': 'citta',
  'prāṇa': 'prāṇa',
  'guṇa': 'guṇa',
  'sattva': 'sattva',
  'rajas': 'rajas',
  'tamas': 'tamas',
  'jita': 'jita',
  'jitaḥ': 'jitaḥ',
  'bandhu': 'bandhu',
  'śatru': 'śatru',
  'mahāvākya': 'mahāvākya',
  'vāda': 'vāda',
  'pramāṇa': 'pramāṇa',
  'hiṃsā': 'hiṃsā',
  'ahiṃsā': 'ahiṃsā',
  'dṛk': 'dṛk',
  'dṛśya': 'dṛśya',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question, defaultVal = '') {
  const prompt = defaultVal ? `${question} [${defaultVal}]: ` : `${question}: `;
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      resolve(answer.trim() || defaultVal);
    });
  });
}

function askMultiline(question) {
  console.log(`${question} (enter empty line to finish):`);
  return new Promise(resolve => {
    const lines = [];
    const handler = (line) => {
      if (line === '') {
        rl.removeListener('line', handler);
        resolve(lines.join('\n'));
      } else {
        lines.push(line);
      }
    };
    rl.on('line', handler);
  });
}

function wrapSanskritTerms(text) {
  let result = text;

  // sort by length descending to match longer terms first
  const sortedTerms = Object.keys(SANSKRIT_TERMS).sort((a, b) => b.length - a.length);

  for (const term of sortedTerms) {
    const iast = SANSKRIT_TERMS[term];
    // match term with word boundaries, case insensitive
    // but don't match if already inside a <Term> tag
    const regex = new RegExp(`(?<!<Term[^>]*>)\\b(${term})\\b(?![^<]*<\\/Term>)`, 'gi');
    result = result.replace(regex, (match) => {
      // preserve original case in display
      return `<Term iast="${iast}">${match}</Term>`;
    });
  }

  return result;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

function cleanContent(text) {
  // remove common web scraping artifacts
  const artifacts = [
    /Your browser does not support the HTML5 Audio element\./gi,
    /^\s*Translation\s*$/gm,
    /^BG \d+\.\d+:/gm,
  ];

  let result = text;
  for (const pattern of artifacts) {
    result = result.replace(pattern, '');
  }

  // normalize whitespace
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

function formatAsMarkdown(content) {
  const lines = content.split('\n');
  const formatted = [];
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // detect Sanskrit verses (lines with lots of diacritics)
    const diacriticCount = (line.match(/[āīūṛṝḷḹṃḥṅñṭḍṇśṣ]/gi) || []).length;
    if (diacriticCount > 5 && line.length < 200) {
      // likely a verse - make it a blockquote
      if (!inBlockquote) {
        formatted.push('');
        formatted.push(`> *${line.trim()}*`);
        inBlockquote = true;
      } else {
        formatted.push(`> *${line.trim()}*`);
      }
    } else {
      inBlockquote = false;
      formatted.push(line);
    }
  }

  return formatted.join('\n');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: node scripts/essay-pipeline.cjs <input.txt> [output-slug]');
    console.log('');
    console.log('Example: node scripts/essay-pipeline.cjs bg6.6.txt self-as-friend-and-enemy');
    process.exit(1);
  }

  const inputFile = args[0];

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
  }

  console.log('\n📝 Essay Pipeline - Convert text to MDX\n');
  console.log('─'.repeat(50));

  // read and clean input
  let content = fs.readFileSync(inputFile, 'utf-8');
  content = cleanContent(content);

  // show preview
  console.log('\n📄 Content preview (first 500 chars):');
  console.log('─'.repeat(50));
  console.log(content.substring(0, 500) + '...\n');

  // gather metadata
  console.log('─'.repeat(50));
  console.log('📋 Enter essay metadata:\n');

  const title = await ask('Title');
  const slug = args[1] || await ask('Slug (URL path)', slugify(title));
  const description = await ask('Description (1-2 sentences)');
  const readingTime = await ask('Reading time (minutes)', '8');
  const tagsInput = await ask('Tags (comma-separated)', 'Gita, Consciousness');
  const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

  console.log('\n📜 Protocols (for manifesto compliance):\n');

  const claim = await ask('Central claim (1 sentence)');
  const termsInput = await ask('Key Sanskrit terms (comma-separated)');
  const terms = termsInput.split(',').map(t => t.trim()).filter(Boolean);
  const fallacy = await ask('Common fallacy this corrects');
  const steelMan = await ask('Steel man (best counter-argument)');
  const practice = await ask('Practice implication');

  // process content
  console.log('\n⚙️  Processing content...');

  // format and wrap terms
  let processedContent = formatAsMarkdown(content);
  processedContent = wrapSanskritTerms(processedContent);

  // generate frontmatter
  const today = new Date().toISOString().split('T')[0];

  const frontmatter = `---
id: "${slug}"
lang: "en"
title: "${title}"
description: "${description}"
date: "${today}"
version: "v1.0"
reading_time: ${readingTime}
protocols:
  claim: "${claim}"
  terms: ${JSON.stringify(terms)}
  fallacy: "${fallacy}"
  steel_man: "${steelMan}"
  practice: "${practice}"
paths:
  en: "/essays/${slug}"
tags: ${JSON.stringify(tags)}
featured: true
---
import Term from '../../components/Term.astro';

`;

  // combine
  const output = frontmatter + processedContent;

  // write output
  const outputPath = path.join('src/content/essays', `${slug}.en.mdx`);
  fs.writeFileSync(outputPath, output);

  console.log(`\n✅ Essay created: ${outputPath}`);
  console.log('\n📌 Next steps:');
  console.log('   1. Review and edit the generated file');
  console.log('   2. Add section headers (## Heading)');
  console.log('   3. Add pullquotes: <span class="pullquote">...</span>');
  console.log('   4. Verify <Term> wrapping is correct');
  console.log('   5. git add && git commit && git push');

  rl.close();
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
