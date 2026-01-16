import os
import json
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from tqdm import tqdm
import argparse

# Check for GPU
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

model_name = "facebook/nllb-200-distilled-600M"

def load_model():
    print(f"Loading model {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(device)
    return tokenizer, model

def translate_batch(texts, tokenizer, model, src_lang="tel_Telu", tgt_lang="eng_Latn", batch_size=16):
    # NLLB uses specific language codes. 
    # Ensure source language is set correctly for tokenizer
    tokenizer.src_lang = src_lang
    
    translated_texts = []
    
    # Process in batches
    for i in tqdm(range(0, len(texts), batch_size), desc="Translating batches"):
        batch = texts[i:i+batch_size]
        
        # Tokenize
        inputs = tokenizer(batch, return_tensors="pt", padding=True, truncation=True, max_length=512).to(device)
        
        # Generate translation
        with torch.no_grad():
            generated_tokens = model.generate(
                **inputs,
                forced_bos_token_id=tokenizer.convert_tokens_to_ids(tgt_lang),
                max_length=512,
                no_repeat_ngram_size=3,
                repetition_penalty=1.5,
                num_beams=4,
                early_stopping=True
            )
            
        # Decode
        decoded = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
        translated_texts.extend(decoded)
        
    return translated_texts

def process_file(file_path, tokenizer, model):
    print(f"Processing {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return
    
    entries = data.get('entries', [])
    modified = False
    
    entries_to_translate = []
    indices = []
    
    for i, entry in enumerate(entries):
        telugu_text = entry.get('telugu', '').strip()
        english_text = entry.get('english', '').strip()
        
        # Only translate if telugu exists and english is empty
        if telugu_text and not english_text:
            entries_to_translate.append(telugu_text)
            indices.append(i)
    
    if entries_to_translate:
        print(f"Found {len(entries_to_translate)} entries to translate in {file_path}")
        translations = translate_batch(entries_to_translate, tokenizer, model)
        
        for idx, translation in zip(indices, translations):
            entries[idx]['english'] = translation
            
        modified = True
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Saved updates to {file_path}")
    else:
        print(f"No new translations needed for {file_path}")

def main():
    parser = argparse.ArgumentParser(description="Translate dictionary entries.")
    parser.add_argument("--dir", default=None, help="Directory containing split json files. Defaults to ../src/data/dictionary_split relative to script")
    parser.add_argument("--file", help="Specific file to translate")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size for translation")
    args = parser.parse_args()
    
    # Determine directory
    if args.dir is None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        target_dir = os.path.join(script_dir, '..', 'src', 'data', 'dictionary_split')
    else:
        target_dir = args.dir

    tokenizer, model = load_model()
    
    if args.file:
        process_file(args.file, tokenizer, model)
    else:
        # Process directory
        if not os.path.exists(target_dir):
            print(f"Directory {target_dir} does not exist.")
            return
            
        files = [f for f in os.listdir(target_dir) if f.endswith('.json')]
        files.sort()
        
        print(f"Found {len(files)} JSON files in {target_dir}")
        for filename in files:
            file_path = os.path.join(target_dir, filename)
            process_file(file_path, tokenizer, model)

if __name__ == "__main__":
    main()
