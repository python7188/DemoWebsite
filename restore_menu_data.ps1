$ErrorActionPreference = "Stop"
$utf8 = [System.Text.Encoding]::UTF8

$js = [System.IO.File]::ReadAllText("menu-with-images.json", $utf8)
$data = $js | ConvertFrom-Json
Write-Host "Items: $($data.Count)"

$catMap = @{
    "Starters / Appetizers" = "starters"
    "Signature Steaks"      = "steaks"
    "Fresh Seafood"         = "seafood"
    "Indian Classics"       = "indian"
}

# ID prefix by category
$catPrefix = @{ starters="sm"; steaks="st"; seafood="sf"; indian="in" }
$catCount = @{} 

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("        const MENU_DATA = [")

$idx = 0
foreach ($item in $data) {
    $idx++
    $catSlug = $catMap[$item.category]; if (-not $catSlug) { $catSlug = "other" }
    if (-not $catCount[$catSlug]) { $catCount[$catSlug] = 0 }
    $catCount[$catSlug]++
    $prefix = $catPrefix[$catSlug]
    if (-not $prefix) { $prefix = "x" }
    $itemId = "$prefix$($catCount[$catSlug])"

    $tags = [System.Collections.Generic.List[string]]::new()
    foreach ($t in $item.tags) {
        switch ($t) { "vegetarian"{$tags.Add("veg")} "non-veg"{$tags.Add("nonveg")} "chef-pick"{$tags.Add("chef")} "gluten-free"{$tags.Add("gf")} }
    }
    $tagsJs = ($tags | ForEach-Object { "`"$_`"" }) -join ", "

    $name = $item.name.Replace('"', '\"')
    $desc = $item.descriptor.Replace('"', '\"')
    $price = $item.priceINR
    $img  = $item.image.Replace('"', '\"')

    # Chef-pick and popular items get popular score
    $popular = if ($tags -contains "chef") { 85 } elseif ($price -ge 5000) { 78 } else { 60 }

    $comma = if ($idx -lt $data.Count) { "," } else { "" }
    [void]$sb.AppendLine("            { id: `"$itemId`", name: `"$name`", cat: `"$catSlug`", catId: `"$catSlug`", desc: `"$desc`", tags: [$tagsJs], price: $price, popular: $popular, image: `"$img`" }$comma")
}
[void]$sb.AppendLine("        ];")

$newMenuData = $sb.ToString()

# Replace old MENU_DATA block in menu.html
$html = [System.IO.File]::ReadAllText("menu.html", $utf8)

# Match from "const MENU_DATA = [" to "];" — find the closing block
$pattern = '(?s)        const MENU_DATA = \[.*?\n        \];'
if ($html -match $pattern) {
    $html = [regex]::Replace($html, $pattern, $newMenuData.TrimEnd())
    [System.IO.File]::WriteAllText("menu.html", $html, $utf8)
    Write-Host "SUCCESS: MENU_DATA replaced with $($data.Count) items."
} else {
    Write-Host "ERROR: MENU_DATA pattern not found."
}
