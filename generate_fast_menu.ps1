$ErrorActionPreference = "Stop"

$jsonText = Get-Content -Raw -Path "old_menu_images.json" -Encoding UTF8
$data = $jsonText | ConvertFrom-Json

$catMap = @{
    "Starters / Appetizers" = "starters"
    "Signature Steaks" = "steaks"
    "Fresh Seafood" = "seafood"
    "Indian Classics" = "indian"
    "Global Cuisine / Chef Specials" = "global"
    "Desserts" = "desserts"
    "Beverages & Wine" = "beverages"
    "Full Meals" = "indian"
    "Half Meals" = "indian"
    "Other" = "global"
}

$out = "        const FAST_MENU_DATA = [`n"

for ($i = 0; $i -lt $data.Length; $i++) {
    $item = $data[$i]
    $cat = if ($catMap[$item.category]) { $catMap[$item.category] } else { "global" }
    $itemId = $cat.Substring(0, 2) + ($i + 1)
    
    $tags = @()
    if ($item.tags -contains "vegetarian") { $tags += '\"veg\"' }
    if ($item.tags -contains "non-veg") { $tags += '\"nonveg\"' }
    if ($item.tags -contains "chef-pick") { $tags += '\"chef\"' }
    if ($item.tags -contains "gluten-free") { $tags += '\"gf\"' }
    if ($item.tags -contains "luxury") { $tags += '\"luxury\"' }
    $tagsStr = $tags -join ", "
    
    $price = if ($item.priceINR) { $item.priceINR } else { 0 }
    $name = ($item.name -replace '"', '\"')
    $desc = ($item.descriptor -replace '"', '\"')
    
    $line = "            { id: `"$itemId`", name: `"$name`", cat: `"$cat`", catId: `"$cat`", desc: `"$desc`", tags: [$tagsStr], price: $price }"
    
    if ($i -lt ($data.Length - 1)) {
        $out += $line + ",`n"
    } else {
        $out += $line + "`n"
    }
}

$out += "        ];`n"

Set-Content -Path "fast_menu_data.txt" -Value $out -Encoding UTF8
Write-Host "Generated fast_menu_data.txt"
