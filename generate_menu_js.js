const fs = require('fs');
const doc = JSON.parse(fs.readFileSync('old_menu_with_images.json', 'utf8'));
const catMap = {
    "Starters / Appetizers": "starters",
    "Signature Steaks": "steaks",
    "Fresh Seafood": "seafood",
    "Indian Classics": "indian",
    "Global Cuisine / Chef Specials": "global",
    "Desserts": "desserts",
    "Beverages & Wine": "beverages",
    "Full Meals": "indian",
    "Half Meals": "indian",
    "Other": "global"
};

let out = "        const MENU_DATA = [\n";
doc.forEach((item, i) => {
    const cat = catMap[item.category] || "global";
    const id = cat.substring(0, 2) + (i + 1);
    const tags = [];
    if (item.tags.includes("vegetarian")) tags.push('"veg"');
    if (item.tags.includes("non-veg")) tags.push('"nonveg"');
    if (item.tags.includes("chef-pick")) tags.push('"chef"');
    if (item.tags.includes("gluten-free")) tags.push('"gf"');
    if (item.tags.includes("luxury")) tags.push('"luxury"');
    const price = item.priceINR;
    const pop = 50 + Math.floor(Math.random() * 48);
    const line = `            { id: "${id}", name: ${JSON.stringify(item.name)}, cat: "${cat}", catId: "${cat}", desc: ${JSON.stringify(item.descriptor)}, tags: [${tags.join(", ")}], price: ${price}, popular: ${pop}, image: ${JSON.stringify(item.image)} }`;
    out += line + (i < doc.length - 1 ? ",\n" : "\n");
});
out += "        ];\n";
fs.writeFileSync('menu_data_array.txt', out);
console.log("Wrote " + doc.length + " items");
