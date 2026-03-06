import json, re

with open('menu_data.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Make it valid JSON: const MENU_DATA = [ ... ]; -> [ ... ]
text = text.replace('const MENU_DATA = ', '').strip().rstrip(';')

# Add quotes to keys
text = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)\s*:', r'\1"\2":', text)

try:
    json.loads(text)
    print("MENU_DATA is OK")
except Exception as e:
    print(f"MENU_DATA ERROR: {e}")

with open('fast_menu_data.txt', 'r', encoding='utf-8') as f:
    text2 = f.read()

text2 = text2.replace('const FAST_MENU_DATA = ', '').strip().rstrip(';')
text2 = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)\s*:', r'\1"\2":', text2)
try:
    json.loads(text2)
    print("FAST_MENU_DATA is OK")
except Exception as e:
    print(f"FAST_MENU_DATA ERROR: {e}")