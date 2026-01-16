#!/usr/bin/env python3
"""
Merge split dictionary files back into main dictionary.json
Also populate missing IAST and Devanagari from Telugu terms
"""

import json
import os
import re
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

SPLIT_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'dictionary_split')
MAIN_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'dictionary.json')

def clean_term(term):
    """extract just the base term (before colon or slash)"""
    # take first part before colon, slash, or space-slash
    term = term.split(':')[0].strip()
    term = term.split(' / ')[0].strip()
    term = term.split('/')[0].strip()
    return term

def telugu_to_iast(telugu_text):
    """convert Telugu script to IAST"""
    try:
        clean = clean_term(telugu_text)
        if not clean:
            return ""
        iast = transliterate(clean, sanscript.TELUGU, sanscript.IAST)
        return iast.lower()
    except Exception as e:
        print(f"Error converting '{telugu_text}': {e}")
        return ""

def telugu_to_devanagari(telugu_text):
    """convert Telugu script to Devanagari"""
    try:
        clean = clean_term(telugu_text)
        if not clean:
            return ""
        deva = transliterate(clean, sanscript.TELUGU, sanscript.DEVANAGARI)
        return deva
    except Exception as e:
        print(f"Error converting '{telugu_text}': {e}")
        return ""

def merge_dictionaries():
    """merge all split files and populate missing fields"""

    # load existing main file to get sources
    with open(MAIN_FILE, 'r', encoding='utf-8') as f:
        main_data = json.load(f)

    sources = main_data.get('sources', {})
    all_entries = []

    # process each split file
    split_files = sorted([f for f in os.listdir(SPLIT_DIR) if f.endswith('.json')])

    for filename in split_files:
        filepath = os.path.join(SPLIT_DIR, filename)
        print(f"Processing {filename}...")

        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        entries = data.get('entries', [])

        for entry in entries:
            term = entry.get('term', '')

            # populate missing IAST
            if not entry.get('iast', '').strip():
                entry['iast'] = telugu_to_iast(term)

            # populate missing devanagari
            if not entry.get('devanagari', '').strip():
                entry['devanagari'] = telugu_to_devanagari(term)

            all_entries.append(entry)

    # build final dictionary
    final_dict = {
        'sources': sources,
        'entries': all_entries
    }

    # stats
    total = len(all_entries)
    with_iast = sum(1 for e in all_entries if e.get('iast', '').strip())
    with_hindi = sum(1 for e in all_entries if e.get('hindi', '').strip())
    with_english = sum(1 for e in all_entries if e.get('english', '').strip())

    print(f"\n=== Merge Complete ===")
    print(f"Total entries: {total}")
    print(f"With IAST: {with_iast} ({100*with_iast/total:.1f}%)")
    print(f"With Hindi: {with_hindi} ({100*with_hindi/total:.1f}%)")
    print(f"With English: {with_english} ({100*with_english/total:.1f}%)")

    # save
    with open(MAIN_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_dict, f, ensure_ascii=False, indent=2)

    print(f"\nSaved to {MAIN_FILE}")

if __name__ == "__main__":
    merge_dictionaries()
