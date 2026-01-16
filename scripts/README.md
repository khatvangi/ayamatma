# Ayamatma Translation Tools

This directory contains a suite of Python-based translation tools designed to convert dictionary entries and documents (essays, notes) between Telugu, English, and Hindi.

These tools use the **NLLB-200 (No Language Left Behind)** model by Meta, optimized for Indian languages.

## 📋 Prerequisites

Before running the scripts, ensure you have the required dependencies installed:

```bash
pip install -r scripts/requirements.txt
```

*Note: The scripts automatically detect and utilize NVIDIA GPUs (CUDA) for significantly faster processing.*

## 📂 Available Scripts

### 1. Document Translator (`translate_documents.py`)
This is a general-purpose tool for translating essays, Markdown files, or text documents.

**Usage:**
```bash
# Translate a single file to both Telugu and Hindi
python3 scripts/translate_documents.py path/to/essay.md

# Translate an entire directory (recursively)
python3 scripts/translate_documents.py ./docs

# Translate to a specific language only
python3 scripts/translate_documents.py essay.md --langs hindi
```

**Features:**
- Preserves paragraph structure and formatting.
- Automatically handles `.md` and `.txt` files.
- Generates new files with suffixes: `_telugu.md` and `_hindi.md`.

---

### 2. Dictionary Translators
These scripts are specifically designed for the split JSON files in `src/data/dictionary_split/`.

- **`translate_dictionary.py`**: Translates missing English fields from Telugu source text.
- **`translate_dictionary_hindi.py`**: Translates missing Hindi fields from Telugu source text.

**Usage:**
```bash
# Process all files in the dictionary_split directory
python3 scripts/translate_dictionary.py
python3 scripts/translate_dictionary_hindi.py
```

---

### 3. Maintenance Tools
- **`fix_repetitions.py`**: A specialized script that scans the dictionary for "repetition loops" (hallucinations) and re-translates them using higher-quality beam search settings.

**Usage:**
```bash
python3 scripts/fix_repetitions.py
```

## ⚙️ Model Configuration

The scripts use the following optimized generation parameters to ensure high-quality output:
- `no_repeat_ngram_size=3`: Prevents the model from getting stuck in loops.
- `repetition_penalty=1.5`: Heavily discourages repeating words.
- `num_beams=4`: Uses beam search for more accurate translations than standard greedy decoding.

## 🛠️ Customization

If you need to change the translation model (e.g., to a larger version for better quality), edit the `MODEL_NAME` constant in the scripts:
- Default: `facebook/nllb-200-distilled-600M` (Balanced speed/quality)
- Higher Quality: `facebook/nllb-200-1.3B` (Requires more GPU memory)
