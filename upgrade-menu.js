const fs = require('fs');

const raw = fs.readFileSync('menu-with-images.json', 'utf8');
const data = JSON.parse(raw);

const upgrades = {
    "Smoked Salmon Carpaccio": "Delicately cured Scottish Highlands salmon, sliced micro-thin and adorned with Meyer lemon-infused olive oil, hand-foraged capers, and a delicate dusting of fresh micro-herbs. A bright, oceanic awakening.",
    "Truffle Arancini": "Golden-crisp Sicilian risotto spheres giving way to a molten core of aged Parmigiano-Reggiano and earthy Umbrian black truffle, resting on a vibrant saffron-threaded aioli.",
    "King Prawn Cocktail": "Gently poached wild-caught tiger prawns from the Andaman Sea, chilled to perfection and nestled in a modern, cognac-spiked Marie Rose sauce with hand-smashed Hass avocado cream.",
    "Oysters Rockefeller": "Plump, briny Atlantic oysters baked under a decadent, herbaceous crust of wilted baby spinach, crisped artisanal pancetta, and a rich Pernod-infused butter. A timeless indulgence.",
    "Foie Gras Terrine": "An impossibly silky, slow-cooked duck liver terrine from the Périgord region, paired with a house-made mission fig chutney and served alongside warm, butter-toasted brioche.",
    "Tuna Tartare": "Sustainably line-caught Pacific bluefin tuna, hand-diced and dressed in a bright sesame-yuzu ponzu, layered with creamy Hass avocado and topped with delicate, popping tobiko caviar.",
    "Caviar with Blinis": "The ultimate luxury: an ounce of pristine, pearl-like Beluga caviar served over warm, pillowy Russian blinis, accompanied by rich crème fraîche and finely minced chives.",
    "Burrata & Heirloom Tomatoes": "A cloud-like sphere of fresh Puglian burrata torn over sun-ripened, multi-hued heirloom tomatoes, finished with a drizzle of 12-year aged Modena balsamic and bright basil oil.",
    "Amuse Bouche Selection": "A curated, ever-evolving trio of the Chef's most innovative bite-sized morsels. Designed to awaken the palate with surprising textures, bright acidity, and concentrated seasonal flavors.",
    "Paneer Royale Tikka": "Velvety cottage cheese marinated overnight in Iranian saffron and aromatic spices, roasted over charcoal and dressed in a rich, silken cashew sauce studded with ruby pomegranate arils.",
    "Chicken Lollipops": "Frenched chicken drumettes rendered remarkably crisp, tossed in a sticky, sweet-and-spicy glaze of wild mountain honey and artisanal sriracha. The perfect balance of heat and crunch.",
    "Scallop Ceviche": "Pristine, hand-dived Hokkaido sea scallops swiftly cured in a vibrant, citrus-driven 'tiger's milk', balanced by the subtle heat of fresh jalapeño and sweet, charred corn kernels.",
    "Grilled Vegetable Terrine": "A visually stunning mosaic of slow-roasted Mediterranean vegetables—eggplant, sweet bell peppers, and zucchini—pressed into a delicate terrine and brightened by a cold-pressed finishing herb oil.",
    "Stuffed Squash Blossoms": "Delicate, golden-hued zucchini flowers lightly crisped and filled with a decadent, whipped mixture of fresh artisanal ricotta and shaved summer truffles, finished with bright lemon zest.",
    "Lobster Bisque": "A masterclass in classical French technique: a deep, velvety reduction of Atlantic lobster shells, fortified with aged cognac and dry sherry, crowned with an airy tarragon foam.",
    "Crab Cakes": "Gently pan-fried patties composed almost entirely of sweet Dungeness lump crab meat, served alongside a piquant, house-made remoulade and a crisp salad of peppery microgreens.",
    "Seared Tuna Bite": "A single, perfect cube of sashimi-grade yellowfin tuna, kissed by high heat and topped with a delicate rosette of fiery wasabi crème and house-pickled ginger.",
    "Filet Mignon": "A 250-gram, center-cut prime tenderloin, characterized by its fork-tender texture and buttery finish. Paired with a classical, tarragon-rich Béarnaise sauce and a deeply savory black truffle jus.",
    "Ribeye Steak 350g": "A deeply marbled, 350-gram grass-fed ribeye, dry-aged for maximum flavor concentration. Finished with a melting medallion of herbaceous compound butter and a rich bone-marrow jus.",
    "New York Strip": "A structured, full-flavored 300-gram New York strip steak, expertly charred to medium-rare. Cut by the sharp, herbaceous acidity of traditional Argentine chimichurri and served with confit garlic potatoes.",
    "Wagyu Ribeye": "The pinnacle of beef: authentic Japanese A5 Wagyu ribeye. Intensely marbled and meltingly tender, kissed with finishing truffle salt and paired with an aged Bordeaux red wine reduction.",
    "Charcoal-Grilled Tomahawk 1kg": "A theatrical, bone-in 1-kilogram tomahawk steak, aggressively charred over hardwood embers. Carved tableside to reveal a perfectly pink interior, accompanied by a robust, slow-simmered au jus.",
    "Sirloin Steak 300g": "A 300-gram cut of extensively dry-aged sirloin, boasting a deep, concentrated beef flavor. Blanketed in a sharp, creamy Madagascar green peppercorn sauce and served with vibrant sautéed seasonal greens.",
    "Porterhouse Steak 400g": "The ultimate carnivore's cut: a 400-gram dry-aged porterhouse offering both the tender filet and the robust strip. Char-grilled and accompanied by a medley of seasonal heirloom vegetables.",
    "Ribeye Surf & Turf": "A decadent pairing of land and sea: a 300-gram prime ribeye steak crowned with a butter-poached half lobster tail, tied together by an indulgent, earthy black truffle butter.",
    "Herb-Crusted Lamb Rack": "A pristine rack of grass-fed New Zealand lamb, coated in a sharp Dijon mustard and provencal herb crust, roasted pink and resting on a sweet, vibrant minted pea purée.",
    "Tomahawk Steak": "A massive, long-bone tomahawk steak, salt-aged in-house to concentrate its natural savory notes. Served alongside a rich red wine demi-glace and an indulgent portion of loaded artisanal fries.",
    "Beef Wellington": "A triumph of classical cuisine: a seared prime beef filet enveloped in an earthy woodland mushroom duxelles, encased in buttery, golden-flaky puff pastry. Sliced to reveal a perfect medium-rare.",
    "Beef Tenderloin Medallions": "Twin cuts of meltingly soft prime beef tenderloin, draped in a sharp, peppery reduction. Accompanied by a classic, cream-layered potato gratin Dauphinois.",
    "Seared Venison Loin": "Wild-foraged venison loin, seared hard and fast to preserve its delicate, gamey sweetness. Beautifully offset by a tart, aromatic juniper berry sauce and a silky, earthy celery root purée.",
    "Grilled Lobster Tail": "A succulent, whole Atlantic lobster tail, gently kissed by the grill to enhance its natural sweetness. Served simply with bubbling clarified butter, charred lemon halves, and soft herbs.",
    "Lobster Thermidor": "An opulent Parisian classic: a half-lobster baked in its shell with a rich, mustard-laced cognac cream sauce, crowned with a bubbling, golden crust of aged Gruyère cheese.",
    "King Crab Legs": "Colossal, sweet red king crab legs harvested from the icy waters of Alaska. Steamed to perfect tenderness and served alongside drawn artisanal butter and a bright, herbaceous dill oil.",
    "Black Tiger Prawns": "Jumbo black tiger prawns, seared in a fiery, aromatic bath of roasted garlic and red chili butter, textured with the sharp, briny pop of crisped Mediterranean capers.",
    "Grilled King Prawns": "A platter of deeply charred, sweet king prawns bathed in a vibrant lemon-herb infusion. Piled high atop a fresh, peppery wild rocket salad for the perfect contrast.",
    "Seared Scallops": "Plump, sweet diver scallops caramelized to a deep mahogany. Nestled in a vibrant sweet pea purée, punctuated by salty, crispy pancetta shards and a bright lemon beurre blanc.",
    "Black Cod Miso": "A modern luxury icon: buttery black cod marinated for 72 hours in sweet Saikyo miso. Broiled to a caramelized finish and offset by crisp pickled daikon and charred edamame.",
    "Miso-Glazed Salmon": "A thick, jewel-toned fillet of Atlantic salmon, lacquered in a sticky, savory-sweet miso glaze. Served over sesame-wilted baby bok choy and finished with a bright, citrus-driven ponzu.",
    "Pan-Seared Red Snapper": "A fillet of red snapper, seared skin-side-down for shattering crispness. Resting in an aromatic, saffron-scented bouillabaisse broth alongside tender, butter-poached heirloom potatoes.",
    "Chargrilled Octopus": "Incredibly tender Spanish octopus, aggressively charred over open flame. Served with a vibrant, herbaceous chimichurri and an aromatic drizzle of smoked paprika-infused olive oil.",
    "Tuna Tataki": "Ruby-red sashimi-grade tuna, briefly seared on the exterior while remaining cool and raw inside. Dressed in a tart citrus ponzu, adorned with fresh shiso leaves and toasted sesame.",
    "Seared Sea Bass": "A pristine fillet of line-caught seabass with an irresistibly crispy skin. Paired with a sweet, slow-cooked fennel confit and bound by an opulent, golden saffron and mussel emulsion.",
    "Grilled Sea Scallops with Truffle Oil": "Jumbo, sweet sea scallops kissed by the grill and laced with the intoxicating aroma of black truffle oil. Resting on a silky cauliflower cream and garnished with delicate chervil.",
    "Seared Halibut with Citrus Beurre Blanc": "A thick, snow-white fillet of Atlantic halibut, prized for its firm, flaky texture. Enrobed in a bright, luxurious citrus butter sauce and served alongside gently wilted baby spinach.",
    "Tandoori Prawns": "Colossal, Maharaja-sized prawns, steeped in a fiery crimson yogurt marinade and flash-roasted in the intense heat of a traditional clay tandoor. Served with cooling mint chutney and sharp chaat masala.",
    "Butter Chicken": "The definitive classic: tender, yogurt-marinated chicken simmered to yielding softness in an impossibly rich, velvety tomato and butter gravy, redolent with the earthiness of dried fenugreek leaves.",
    "Dal Makhani": "A labor of love: whole black lentils slow-simmered for 24 hours over charcoal. Enriched with heavy cream and churned butter, then layered with deeply tempered, aromatic Indian spices.",
    "Paneer Butter Masala": "Soft, house-made cubes of fresh cottage cheese suspended in a deeply savory, rich tomato-cream masala. Finished with a heady dusting of aromatic roasted kasuri methi (fenugreek).",
    "Chicken Tikka Masala": "Succulent cubes of tandoor-smoked chicken breast, folded into a vibrant, complex masala gravy. A harmonious balance of smoke, spice, and cream, served alongside fragrant, long-grain basmati rice.",
    "Lamb Rogan Josh": "A masterpiece of Kashmiri cuisine: tender, bone-in lamb slow-braised to perfection. Colored vibrantly by ratanjot (alkanet root) and infused with a complex, warming blend of traditional aromatic spices."
};

data.forEach(item => {
    if (upgrades[item.name]) {
        item.descriptor = upgrades[item.name];
    }
    if (item.image && item.image.endsWith('.jpeg')) {
        item.image = item.image.replace('.jpeg', '.webp');
    }
});

const fileOut = `// This file is auto-generated by the build script. DO NOT EDIT MANUALLY.
// Contains 2026 Luxury Sensory Copywriting and .webp Image Formatting.

const MENU_DATA = ${JSON.stringify(data, null, 4)};
`;

fs.writeFileSync('menu-data.js', fileOut);
console.log("Successfully generated menu-data.js");
