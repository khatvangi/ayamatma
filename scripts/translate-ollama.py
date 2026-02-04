#!/usr/bin/env python3
"""
Translate essay using Ollama (Gemma/Qwen).
Usage: python scripts/translate-ollama.py src/content/essays/my-essay.en.mdx
"""

import os
import sys
import re
import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen3:latest"  # or gemma2:9b

def query_ollama(prompt, model=MODEL):
    """Query Ollama API."""
    resp = requests.post(OLLAMA_URL, json={
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.3}
    }, timeout=300)

    if resp.status_code != 200:
        print(f"Ollama error: {resp.status_code}")
        return None

    result = resp.json()
    return result.get("response", "")


def translate_text(text, target_lang):
    """Translate text to target language."""
    lang_name = "Hindi" if target_lang == "hi" else "Telugu"

    prompt = f"""/no_think
Translate the following English text to {lang_name}.
Keep all markdown formatting, HTML tags like <Term> and <span>, and Sanskrit terms in IAST unchanged.
Only translate the English prose. Do not add explanations.

Text to translate:
{text}

{lang_name} translation:"""

    result = query_ollama(prompt)
    if result:
        # clean up any thinking tags or extra text
        result = re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL)
        result = result.strip()
    return result


def parse_mdx(content):
    """Split MDX into frontmatter and body."""
    if not content.startswith('---'):
        return "", content

    end = content.find('---', 3)
    if end == -1:
        return "", content

    frontmatter = content[:end+3]
    body = content[end+3:].strip()
    return frontmatter, body


def update_frontmatter(frontmatter, lang, translated_title, translated_desc):
    """Update frontmatter for translated version."""
    lines = frontmatter.split('\n')
    new_lines = []

    for line in lines:
        if line.startswith('lang:'):
            new_lines.append(f'lang: "{lang}"')
        elif line.startswith('title:'):
            new_lines.append(f'title: "{translated_title}"')
        elif line.startswith('description:'):
            new_lines.append(f'description: "{translated_desc}"')
        else:
            new_lines.append(line)

    return '\n'.join(new_lines)


def translate_essay(input_path):
    """Translate essay to Hindi and Telugu."""
    print(f"Reading {input_path}...")

    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    frontmatter, body = parse_mdx(content)

    # extract title and description for translation
    title_match = re.search(r'title:\s*"([^"]+)"', frontmatter)
    desc_match = re.search(r'description:\s*"([^"]+)"', frontmatter)

    title = title_match.group(1) if title_match else ""
    desc = desc_match.group(1) if desc_match else ""

    # split body into chunks (paragraphs)
    # keep import statement and translate the rest
    import_line = ""
    if body.startswith("import"):
        first_newline = body.find('\n\n')
        import_line = body[:first_newline]
        body = body[first_newline:].strip()

    for lang in ['hi', 'te']:
        lang_name = "Hindi" if lang == "hi" else "Telugu"
        print(f"\nTranslating to {lang_name}...")

        # translate title and description
        print("  Translating title...")
        translated_title = translate_text(title, lang)
        if translated_title:
            translated_title = translated_title.replace('"', "'").strip()
        else:
            translated_title = title

        print("  Translating description...")
        translated_desc = translate_text(desc, lang)
        if translated_desc:
            translated_desc = translated_desc.replace('"', "'").strip()
        else:
            translated_desc = desc

        # translate body in chunks
        print("  Translating body...")
        paragraphs = re.split(r'\n\n+', body)
        translated_paragraphs = []

        for i, para in enumerate(paragraphs):
            # skip empty paragraphs and headers-only
            if not para.strip():
                translated_paragraphs.append(para)
                continue

            # keep markdown headers but translate text after ##
            if para.strip().startswith('#'):
                # translate header text
                match = re.match(r'^(#+\s*)(.*)', para.strip())
                if match:
                    hashes, header_text = match.groups()
                    translated_header = translate_text(header_text, lang)
                    if translated_header:
                        translated_paragraphs.append(f"{hashes}{translated_header.strip()}")
                    else:
                        translated_paragraphs.append(para)
                continue

            # translate paragraph
            print(f"    Paragraph {i+1}/{len(paragraphs)}...", end='\r')
            translated = translate_text(para, lang)
            if translated:
                translated_paragraphs.append(translated)
            else:
                translated_paragraphs.append(para)

        print(f"    Done translating {len(paragraphs)} paragraphs.")

        # rebuild
        new_frontmatter = update_frontmatter(frontmatter, lang, translated_title, translated_desc)
        new_body = '\n\n'.join(translated_paragraphs)

        output = new_frontmatter + '\n' + import_line + '\n\n' + new_body

        # write file
        output_path = input_path.replace('.en.mdx', f'.{lang}.mdx')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(output)

        print(f"Saved: {output_path}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/translate-ollama.py <essay.en.mdx>")
        sys.exit(1)

    input_path = sys.argv[1]
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        sys.exit(1)

    translate_essay(input_path)
    print("\nDone!")


if __name__ == "__main__":
    main()
