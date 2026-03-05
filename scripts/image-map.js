/**
 * scripts/image-map.js
 * TajHotel — Menu Image Mapper
 *
 * Usage:
 *   node scripts/image-map.js
 *
 * Requires: npm install sharp
 * Reads menuItems from data/menu-items.js,
 * scans the workspace root for slug-matching images,
 * picks highest-resolution file when duplicates exist,
 * and writes menu-with-images.json.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── CONFIG ──────────────────────────────────────────────────
const IMAGES_DIR = path.resolve(__dirname, '..'); // all images are in workspace root
const OUT_FILE = path.resolve(__dirname, '..', 'menu-with-images.json');
const EXTS = ['.jpeg', '.jpg', '.webp', '.avif', '.png'];

// ── SLUG HELPER ─────────────────────────────────────────────
function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ── LOAD SHARP (optional — only needed for area comparison) ─
let sharp;
try { sharp = require('sharp'); } catch (_) {
    console.warn('[WARN] sharp not installed. Will use file size as resolution proxy.');
    console.warn('       Install with: npm install sharp');
}

// ── LOAD MENU ITEMS ─────────────────────────────────────────
// Either require from a data file or paste inline:
let menuItems;
try {
    menuItems = require('../data/menu-items.js');
} catch (_) {
    // Fallback: load from the already-generated menu-with-images.json
    menuItems = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
}

// ── SCAN IMAGE FILES ─────────────────────────────────────────
function getImageFiles() {
    return fs.readdirSync(IMAGES_DIR).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return EXTS.includes(ext);
    });
}

// ── PICK BEST CANDIDATE ──────────────────────────────────────
async function pickBest(candidates) {
    if (candidates.length === 1) return candidates[0];
    if (!sharp) {
        // Fall back to largest file size as proxy for resolution
        let best = candidates[0];
        let bestSize = 0;
        for (const c of candidates) {
            const size = fs.statSync(path.join(IMAGES_DIR, c)).size;
            if (size > bestSize) { bestSize = size; best = c; }
        }
        return best;
    }
    // Use sharp metadata to compare pixel area
    let best = candidates[0];
    let bestArea = 0;
    for (const c of candidates) {
        try {
            const meta = await sharp(path.join(IMAGES_DIR, c)).metadata();
            const area = (meta.width || 0) * (meta.height || 0);
            if (area > bestArea) { bestArea = area; best = c; }
        } catch (_) { /* skip unreadable files */ }
    }
    return best;
}

// ── MAIN ─────────────────────────────────────────────────────
async function run() {
    const imageFiles = getImageFiles();
    console.log(`Found ${imageFiles.length} image files in ${IMAGES_DIR}`);

    // Build slug → [filenames] index
    const slugIndex = {};
    for (const f of imageFiles) {
        const base = path.basename(f, path.extname(f));
        const s = slugify(base);
        if (!slugIndex[s]) slugIndex[s] = [];
        slugIndex[s].push(f);
    }

    const results = [];
    let matched = 0, missing = 0;

    for (const item of menuItems) {
        const slug = slugify(item.name);
        // Exact match first
        let candidates = slugIndex[slug] || [];
        // Variant match: e.g. slug + '-2', slug + '-in-crystal-bowl' etc.
        if (candidates.length === 0) {
            candidates = Object.keys(slugIndex)
                .filter(s => s.startsWith(slug + '-'))
                .flatMap(s => slugIndex[s]);
        }

        if (candidates.length === 0) {
            results.push({ ...item, image: null });
            missing++;
            console.log(`  [NO IMAGE] ${item.name}`);
        } else {
            const best = await pickBest(candidates);
            results.push({ ...item, image: best });
            matched++;
            if (candidates.length > 1) {
                console.log(`  [MULTI→${best}] ${item.name} (${candidates.length} candidates)`);
            }
        }
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2), 'utf8');
    console.log(`\n✅ Done! Written to: ${OUT_FILE}`);
    console.log(`   Matched: ${matched}  |  Missing: ${missing}`);
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
