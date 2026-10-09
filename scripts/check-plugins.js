#!/usr/bin/env node
/**
 * ───────────────────────────────
 *  Base Script : Bang Dika Ardnt
 *  Recode By   : Bang Wilykun
 *  WhatsApp    : 6289688206739
 *  Telegram    : @Wilykun1994
 * ───────────────────────────────
 *  Script ini khusus donasi/VIP
 *  Support dari kalian bikin saya
 *  makin semangat update fitur,
 *  fix bug, dan rawat script ini.
 *
 *  Dilarang menjual ulang script ini
 *  Tanpa izin resmi dari developer.
 *  Jika ketahuan = NO UPDATE / NO FIX
 *
 *  Hargai karya, gunakan dengan bijak.
 *  Terima kasih sudah support.
 * ───────────────────────────────
 *
 *  check-plugins.js — Validasi sistem plugin ESM (pengganti switch-case).
 *  - Tiap file SEMUA_FITUR dengan metadata `command` harus pakai format ketat
 *    /^(a|b|c)$/i agar bisa diurai jadi daftar nama command.
 *  - Tidak boleh ada nama command duplikat antar plugin.
 *  - Tiap handler (default / plugins[].handler) harus resolve ke fungsi.
 *  - Daftar command harus sama persis dengan snapshot
 *    (scripts/plugin-commands.snapshot.json). Tambah command baru?
 *    jalankan: node scripts/check-plugins.js --update-snapshot
 * ───────────────────────────────
 */
'use strict';

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLUGIN_ROOT = path.join(ROOT, 'SEMUA_FITUR');
const SNAPSHOT = path.join(ROOT, 'scripts', 'plugin-commands.snapshot.json');

const errors = [];
const plugins = []; // { file, command, tags, help, handlerName }

function collectFiles(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) collectFiles(p, out);
        else if (e.name.endsWith('.js')) out.push(p);
    }
    return out;
}

function checkRegex(re, file) {
    if (!(re instanceof RegExp)) { errors.push(`${file}: command bukan RegExp`); return null; }
    const m = /^\^\(\s*(.+?)\s*\)\$$/.exec(re.source);
    if (!m) { errors.push(`${file}: format command harus /^(a|b|c)$/i, dapat ${re}`); return null; }
    if (!re.flags.includes('i')) { errors.push(`${file}: command harus pakai flag i: ${re}`); return null; }
    return m[1].split('|').map(s => s.replace(/\\(.)/g, '$1'));
}

const names = new Map(); // name -> file (deteksi duplikat)

// Parse statis (tanpa import) — fallback bila node_modules belum terinstal.
function staticParse(abs, rel) {
    const src = fs.readFileSync(abs, 'utf8');
    const defs = [];
    const cmdM = src.match(/export\s+const\s+command\s*=\s*(\/[^;\n]+\/i)\s*;/);
    const hasDefault = /export\s+default\b/.test(src);
    if (cmdM) {
        if (!hasDefault) {
            errors.push(`${rel}: ada export command tapi tidak ada default export`);
        } else {
            let re = null;
            try { re = eval(cmdM[1]); } catch {}
            if (!(re instanceof RegExp)) errors.push(`${rel}: command tidak bisa diurai sebagai RegExp`);
            else defs.push({ command: re, handlerName: null, static: true });
        }
    }
    const plugM = src.match(/export\s+const\s+plugins\s*=\s*\[([\s\S]*?)\];/);
    if (plugM) {
        const entryRe = /\{\s*command\s*:\s*(\/[^,]+\/i)\s*,[^}]*?handler\s*:\s*'([^']+)'/g;
        let m, found = false;
        while ((m = entryRe.exec(plugM[1])) !== null) {
            found = true;
            let re = null;
            try { re = eval(m[1]); } catch {}
            if (!(re instanceof RegExp)) { errors.push(`${rel}: entri plugins command tidak bisa diurai`); continue; }
            const hname = m[2];
            if (!new RegExp(`(function\\s+${hname}\\b|export\\s*\\{[^}]*\\b${hname}\\b|const\\s+${hname}\\s*=)`).test(src)) {
                errors.push(`${rel}: handler '${hname}' tidak ditemukan di file`);
            }
            defs.push({ command: re, handlerName: hname, static: true });
        }
        if (!found) errors.push(`${rel}: plugins[] tidak punya entri valid`);
    }
    return defs;
}

function registerDescriptor(d, rel, mod) {
    const list = checkRegex(d.command, rel);
    if (!list) return;
    if (!d.static) {
        if (!Array.isArray(d.tags) || !d.tags.length) errors.push(`${rel}: tags harus array non-kosong`);
        const fn = d.handlerName ? mod[d.handlerName] : mod.default;
        if (typeof fn !== 'function') {
            errors.push(`${rel}: handler '${d.handlerName || 'default'}' bukan fungsi`);
        }
    }
    for (const n of list) {
        if (names.has(n)) {
            errors.push(`duplikat command '${n}': ${rel} vs ${names.get(n)}`);
        } else {
            names.set(n, rel);
        }
    }
    plugins.push({ file: rel, names: list });
}

for (const abs of collectFiles(PLUGIN_ROOT)) {
    const rel = './' + path.relative(ROOT, abs).replace(/\\/g, '/');
    let mod = null;
    try {
        mod = await import(pathToFileURL(abs).href);
    } catch (e) {
        if (/Cannot find package/.test(e.message)) {
            for (const d of staticParse(abs, rel)) registerDescriptor(d, rel, null);
            continue;
        }
        errors.push(`${rel}: gagal import (${e.message})`);
        continue;
    }
    const defs = [];
    if (mod.command instanceof RegExp && typeof mod.default === 'function') {
        defs.push({ command: mod.command, tags: mod.tags, help: mod.help, handlerName: null });
    } else if (mod.command instanceof RegExp) {
        // ada command tapi default export bukan fungsi → metadata rusak
        errors.push(`${rel}: export command ada tapi default export bukan fungsi`);
    }
    // file tanpa metadata command/plugins sama sekali = bukan plugin (helper, event, dll) → lewati diam-diam
    if (Array.isArray(mod.plugins)) {
        for (const p of mod.plugins) {
            if (!p || !(p.command instanceof RegExp) || typeof p.handler !== 'string') {
                errors.push(`${rel}: entri plugins[] tidak valid`);
                continue;
            }
            defs.push({ command: p.command, tags: p.tags, help: p.help, handlerName: p.handler });
        }
    }
    for (const d of defs) registerDescriptor(d, rel, mod);
}

const sorted = [...names.keys()].sort();

if (process.argv.includes('--update-snapshot')) {
    fs.writeFileSync(SNAPSHOT, JSON.stringify(sorted, null, 1) + '\n');
    console.log(`✓ Snapshot ditulis: ${sorted.length} command → ${SNAPSHOT}`);
    process.exit(errors.length ? 1 : 0);
}

if (!fs.existsSync(SNAPSHOT)) {
    errors.push(`snapshot tidak ada: ${SNAPSHOT} (buat dengan --update-snapshot)`);
} else {
    const expected = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
    const missing = expected.filter(n => !names.has(n));
    const extra = sorted.filter(n => !expected.includes(n));
    if (missing.length) errors.push(`command hilang dari plugin (${missing.length}): ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? '...' : ''}`);
    if (extra.length) errors.push(`command baru belum masuk snapshot (${extra.length}): ${extra.slice(0, 10).join(', ')}${extra.length > 10 ? '...' : ''} — jalankan --update-snapshot bila disengaja`);
}

console.log(`✓ Plugin: ${plugins.length} descriptor dari SEMUA_FITUR, ${sorted.length} nama command unik.`);
if (errors.length) {
    console.error(`\n❌ ${errors.length} masalah:`);
    for (const e of errors.slice(0, 20)) console.error('  - ' + e);
    process.exit(1);
}
console.log('✓ check-plugins BERSIH.');
