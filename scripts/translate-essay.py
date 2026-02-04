#!/usr/bin/env python3
"""
Translate an English MDX essay to Hindi and Telugu.

Usage: python scripts/translate-essay.py src/content/essays/my-essay.en.mdx
"""

import os
import sys
import re
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from tqdm import tqdm

MODEL_NAME = "facebook/nllb-200-distilled-600M"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
BATCH_SIZE = 8

LANG_CODES = {
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "te": "tel_Telu",
}

# frontmatter fields to translate
TRANSLATE_FIELDS = ['title', 'description', 'claim']

class Translator:
    def __init__(self):
        print(f"Loading model on {DEVICE}...")
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(DEVICE)
        self.model.eval()
        print("Model loaded.")

    def translate(self, texts, tgt_lang):
        if not texts:
            return []

        self.tokenizer.src_lang = LANG_CODES["en"]
        tgt_code = LANG_CODES[tgt_lang]

        results = []
        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i:i+BATCH_SIZE]

            inputs = self.tokenizer(
                batch,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512
            ).to(DEVICE)

            with torch.no_grad():
                generated = self.model.generate(
                    **inputs,
                    forced_bos_token_id=self.tokenizer.convert_tokens_to_ids(tgt_code),
                    max_length=512,
                    num_beams=4,
                    early_stopping=True
                )

            decoded = self.tokenizer.batch_decode(generated, skip_special_tokens=True)
            results.extend(decoded)

        return results


def parse_mdx(content):
    """Split MDX into frontmatter and body."""
    if not content.startswith('---'):
        return {}, content

    # find closing ---
    end = content.find('---', 3)
    if end == -1:
        return {}, content

    frontmatter_raw = content[3:end].strip()
    body = content[end+3:].strip()

    # parse frontmatter (simple yaml-like)
    frontmatter = {}
    current_key = None
    current_indent = 0

    for line in frontmatter_raw.split('\n'):
        if not line.strip():
            continue

        # check for nested (protocols:, paths:, etc.)
        if line.endswith(':') and not ':' in line[:-1]:
            current_key = line[:-1].strip()
            frontmatter[current_key] = {}
            continue

        match = re.match(r'^(\s*)(\w+):\s*(.*)$', line)
        if match:
            indent, key, value = match.groups()
            indent_level = len(indent)

            # clean value
            value = value.strip().strip('"').strip("'")

            if indent_level > 0 and current_key and isinstance(frontmatter.get(current_key), dict):
                frontmatter[current_key][key] = value
            else:
                frontmatter[key] = value
                current_key = None

    return frontmatter, body


def extract_translatable_content(body):
    """Extract text segments to translate, preserving structure."""
    # skip: import statements, HTML tags, markdown syntax
    lines = body.split('\n')
    segments = []
    indices = []

    for i, line in enumerate(lines):
        stripped = line.strip()

        # skip empty, imports, pure HTML, headers (keep ## but translate text after)
        if not stripped:
            continue
        if stripped.startswith('import '):
            continue
        if stripped.startswith('<') and stripped.endswith('>'):
            continue
        if stripped.startswith('```'):
            continue

        # for headers, extract text after ##
        if stripped.startswith('#'):
            # keep the hashes, translate the text
            match = re.match(r'^(#+\s*)(.*)', stripped)
            if match:
                segments.append(match.group(2))
                indices.append((i, 'header', match.group(1)))
            continue

        # for blockquotes, extract text after >
        if stripped.startswith('>'):
            text = stripped.lstrip('> ').strip()
            if text:
                segments.append(text)
                indices.append((i, 'quote', '> '))
            continue

        # for pullquotes, extract inner text
        if '<span class="pullquote">' in stripped:
            match = re.search(r'<span class="pullquote">([^<]+)</span>', stripped)
            if match:
                segments.append(match.group(1))
                indices.append((i, 'pullquote', None))
            continue

        # regular paragraph
        if stripped and not stripped.startswith('<Term'):
            segments.append(stripped)
            indices.append((i, 'paragraph', None))

    return segments, indices, lines


def rebuild_body(lines, indices, translated):
    """Rebuild body with translated content."""
    new_lines = lines.copy()

    for (i, seg_type, prefix), trans in zip(indices, translated):
        if seg_type == 'header':
            new_lines[i] = prefix + trans
        elif seg_type == 'quote':
            new_lines[i] = '> ' + trans
        elif seg_type == 'pullquote':
            new_lines[i] = f'<span class="pullquote">{trans}</span>'
        else:
            new_lines[i] = trans

    return '\n'.join(new_lines)


def create_translated_frontmatter(fm, lang, slug):
    """Create frontmatter for translated version."""
    lines = ['---']
    lines.append(f'id: "{slug}"')
    lines.append(f'lang: "{lang}"')

    # title and description (will be replaced with translated versions)
    lines.append(f'title: "{fm.get("title", "")}"')
    lines.append(f'description: "{fm.get("description", "")}"')

    # copy date, version, reading_time
    if 'date' in fm:
        lines.append(f'date: "{fm["date"]}"')
    if 'version' in fm:
        lines.append(f'version: "{fm["version"]}"')
    if 'reading_time' in fm:
        lines.append(f'reading_time: {fm["reading_time"]}')

    # protocols if present
    if 'protocols' in fm and isinstance(fm['protocols'], dict):
        lines.append('protocols:')
        for k, v in fm['protocols'].items():
            if isinstance(v, list):
                lines.append(f'  {k}: {v}')
            else:
                lines.append(f'  {k}: "{v}"')

    # paths
    lines.append('paths:')
    lines.append(f'  en: "/essays/{slug}"')
    lines.append(f'  hi: "/hi/essays/{slug}"')
    lines.append(f'  te: "/te/essays/{slug}"')

    # tags
    if 'tags' in fm:
        lines.append(f'tags: {fm["tags"]}')

    # featured
    if 'featured' in fm:
        lines.append(f'featured: {fm["featured"]}')

    lines.append('---')
    return '\n'.join(lines)


def translate_essay(input_path, translator):
    """Translate an English MDX essay to Hindi and Telugu."""

    print(f"\nReading {input_path}...")
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    frontmatter, body = parse_mdx(content)
    slug = frontmatter.get('id', os.path.basename(input_path).replace('.en.mdx', ''))

    # extract translatable segments
    segments, indices, lines = extract_translatable_content(body)

    # also translate frontmatter fields
    fm_to_translate = []
    for field in TRANSLATE_FIELDS:
        if field in frontmatter:
            fm_to_translate.append(frontmatter[field])
        elif 'protocols' in frontmatter and field in frontmatter['protocols']:
            fm_to_translate.append(frontmatter['protocols'][field])

    all_segments = fm_to_translate + segments

    print(f"Found {len(segments)} content segments + {len(fm_to_translate)} frontmatter fields")

    for lang in ['hi', 'te']:
        print(f"\nTranslating to {lang}...")

        translated = translator.translate(all_segments, lang)

        # split back
        fm_translated = translated[:len(fm_to_translate)]
        content_translated = translated[len(fm_to_translate):]

        # rebuild frontmatter with translations
        new_fm = create_translated_frontmatter(frontmatter, lang, slug)

        # update translated fields in frontmatter
        fm_lines = new_fm.split('\n')
        fm_idx = 0
        for i, line in enumerate(fm_lines):
            for field in TRANSLATE_FIELDS:
                if line.startswith(f'{field}:') or line.startswith(f'  {field}:'):
                    if fm_idx < len(fm_translated):
                        indent = '  ' if line.startswith('  ') else ''
                        fm_lines[i] = f'{indent}{field}: "{fm_translated[fm_idx]}"'
                        fm_idx += 1
                    break
        new_fm = '\n'.join(fm_lines)

        # rebuild body
        new_body = rebuild_body(lines, indices, content_translated)

        # combine
        output = new_fm + '\n' + new_body

        # write file
        output_path = input_path.replace('.en.mdx', f'.{lang}.mdx')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(output)

        print(f"Saved: {output_path}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/translate-essay.py <essay.en.mdx>")
        sys.exit(1)

    input_path = sys.argv[1]
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        sys.exit(1)

    translator = Translator()
    translate_essay(input_path, translator)
    print("\nDone!")


if __name__ == "__main__":
    main()
