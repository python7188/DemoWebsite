import json
import random

def main():
    try:
        with open('old_menu_with_images.json', 'r', encoding='utf-8') as f: 
            data = json.load(f)
    except FileNotFoundError:
        print("ERROR: old_menu_with_images.json not found")
        return

    cat_map = { 
        'Starters / Appetizers': 'starters', 
        'Signature Steaks': 'steaks', 
        'Fresh Seafood': 'seafood', 
        'Indian Classics': 'indian', 
        'Global Cuisine / Chef Specials': 'global', 
        'Desserts': 'desserts', 
        'Beverages & Wine': 'beverages', 
        'Full Meals': 'indian', 
        'Half Meals': 'indian', 
        'Other': 'global' 
    }

    out = '        const MENU_DATA = [\n'
    for i, item in enumerate(data):
        cat = cat_map.get(item.get('category', 'Other'), 'global')
        item_id = cat[:2] + str(i+1)
        
        tags = []
        if 'vegetarian' in item.get('tags', []): tags.append('\"veg\"')
        if 'non-veg' in item.get('tags', []): tags.append('\"nonveg\"')
        if 'chef-pick' in item.get('tags', []): tags.append('\"chef\"')
        if 'gluten-free' in item.get('tags', []): tags.append('\"gf\"')
        if 'luxury' in item.get('tags', []): tags.append('\"luxury\"')
        
        price = item.get('priceINR', 0)
        pop = 50 + random.randint(0, 48)
        
        desc = item.get('descriptor', '')
        image = item.get('image', '')
        
        line = f'            {{ id: "{item_id}", name: {json.dumps(item["name"])}, cat: "{cat}", catId: "{cat}", desc: {json.dumps(desc)}, tags: [{", ".join(tags)}], price: {price}, popular: {pop}, image: {json.dumps(image)} }}'
        
        out += line + (',\n' if i < len(data) - 1 else '\n')

    out += '        ];\n'
    
    with open('menu_data_array.txt', 'w', encoding='utf-8') as f: 
        f.write(out)
        
    print(f'Wrote {len(data)} items to menu_data_array.txt')

if __name__ == "__main__":
    main()
