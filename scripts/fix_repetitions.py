import os
import json
import re
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from tqdm import tqdm

# Check for GPU
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

model_name = "facebook/nllb-200-distilled-600M"

def load_model():
    print(f"Loading model {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(device)
    return tokenizer, model

def detect_repetition(text):
    if not text:
        return False
    
    # Check for immediate word repetition (word word word word)
    if re.search(r'(\b\w+\b[\s\r\n]*)\1{3,}', text):
        return True
        
    # Check for phrase repetition
    words = text.split()
    if len(words) > 20:
        if len(set(words)) / len(words) < 0.2: 
            return True
            
    return False

def translate_single(text, tokenizer, model, src_lang="tel_Telu", tgt_lang="eng_Latn"):
    tokenizer.src_lang = src_lang
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512).to(device)
    
    with torch.no_grad():
        generated_tokens = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.convert_tokens_to_ids(tgt_lang),
            max_length=512,
            no_repeat_ngram_size=3,  # Prevent 3-gram repetition
            repetition_penalty=1.5,   # Penalize repetition
            num_beams=4,             # Use beam search for better quality
            early_stopping=True
        )
        
    return tokenizer.decode(generated_tokens[0], skip_special_tokens=True)

def process_files(directory, tokenizer, model):
    files = [f for f in os.listdir(directory) if f.endswith('.json')]
    files.sort()
    
    total_fixed = 0
    
    for filename in files:
        file_path = os.path.join(directory, filename)
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        modified = False
        entries = data.get('entries', [])
        
        for entry in tqdm(entries, desc=f"Checking {filename}", leave=False):
            telugu = entry.get('telugu', '')
            if not telugu:
                continue
                
            # Check English
            if detect_repetition(entry.get('english', '')):
                # print(f"Fixing English for {entry['id']} in {filename}")
                new_english = translate_single(telugu, tokenizer, model, tgt_lang="eng_Latn")
                if new_english != entry['english']:
                    entry['english'] = new_english
                    modified = True
                    total_fixed += 1

            # Check Hindi
            if detect_repetition(entry.get('hindi', '')):
                # print(f"Fixing Hindi for {entry['id']} in {filename}")
                new_hindi = translate_single(telugu, tokenizer, model, tgt_lang="hin_Deva")
                if new_hindi != entry['hindi']:
                    entry['hindi'] = new_hindi
                    modified = True
                    total_fixed += 1
                    
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Updated {filename}")
            
    print(f"Total entries fixed: {total_fixed}")

def main():
    directory = '/storage/ayamatma/src/data/dictionary_split'
    tokenizer, model = load_model()
    process_files(directory, tokenizer, model)

if __name__ == "__main__":
    main()
