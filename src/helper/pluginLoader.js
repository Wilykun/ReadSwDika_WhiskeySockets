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
 *  pluginLoader.js — Sistem plugin ESM ala Bot-dj-V3
 *  Tiap file di SEMUA_FITUR/<kategori>/ mendeklarasikan command-nya sendiri:
 *
 *    // satu command per file (seperti contoh maker-tobersama.js):
 *    export const command = /^(sticker|s)$/i;
 *    export const tags = ['media'];
 *    export const help = ['sticker'];
 *    export default async function (ctx) { ... };
 *
 *    // atau multi-command per file:
 *    export const plugins = [
 *      { command: /^(info)$/i, tags: ['info'], help: ['info'], handler: 'handleInfo' },
 *    ];
 *
 *  Loader memindai SEMUA_FITUR, membangun tabel dispatch + daftar nama
 *  command (pengganti getCaseName atas message.js). Tidak ada lagi
 *  switch-case raksasa di message.js — tambah fitur cukup tambah file.
 * ───────────────────────────────
 */
'use strict';

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const PLUGIN_ROOT = path.resolve('./SEMUA_FITUR');

let _table = null; // [{ file, command: RegExp, tags: string[], help: string[], handlerName: string|null }]

function isValidDescriptor(d, file) {
    if (!(d.command instanceof RegExp)) return false;
    if (typeof d.handlerName !== 'string' || !d.handlerName) return false;
    return true;
}

function normalizeFileDescriptors(mod, file, category) {
    const out = [];
    // Bentuk 1: single plugin ala contoh (command + default export)
    if (mod.command instanceof RegExp && typeof mod.default === 'function') {
        out.push({
            file,
            command: mod.command,
            tags: Array.isArray(mod.tags) && mod.tags.length ? mod.tags : [category],
            help: Array.isArray(mod.help) ? mod.help : [],
            handlerName: null, // pakai mod.default
        });
    }
    // Bentuk 2: multi plugin per file
    if (Array.isArray(mod.plugins)) {
        for (const p of mod.plugins) {
            if (!p || !(p.command instanceof RegExp) || typeof p.handler !== 'string' || !p.handler) {
                console.error(`\x1b[31m[Plugin] descriptor tidak valid di ${file}, dilewati.\x1b[39m`);
                continue;
            }
            out.push({
                file,
                command: p.command,
                tags: Array.isArray(p.tags) && p.tags.length ? p.tags : [category],
                help: Array.isArray(p.help) ? p.help : [],
                handlerName: p.handler,
            });
        }
    }
    return out;
}

/**
 * Pindai SEMUA_FITUR dan bangun tabel plugin. Hasil di-cache;
 * panggil invalidatePlugins() setelah ada file plugin berubah (hot reload).
 */
export async function loadPlugins() {
    if (_table) return _table;
    const table = [];
    if (!fs.existsSync(PLUGIN_ROOT)) {
        _table = table;
        return table;
    }
    const categories = fs.readdirSync(PLUGIN_ROOT, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .sort();
    for (const category of categories) {
        const dir = path.join(PLUGIN_ROOT, category);
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
        for (const f of files) {
            const abs = path.join(dir, f);
            const rel = `./SEMUA_FITUR/${category}/${f}`;
            let mod;
            try {
                mod = await import(pathToFileURL(abs).href);
            } catch (e) {
                console.error(`\x1b[31m[Plugin] gagal import ${rel}: ${e.message}\x1b[39m`);
                continue;
            }
            for (const d of normalizeFileDescriptors(mod, rel, category)) {
                table.push(d);
            }
        }
    }
    _table = table;
    return table;
}

/** Kosongkan cache tabel plugin (dipanggil saat hot reload file SEMUA_FITUR). */
export function invalidatePlugins() {
    _table = null;
}

/**
 * Urai nama-nama command dari regex bentuk ketat /^(a|b|c)$/i
 * yang dihasilkan codemod. Format lain ditolak dengan error jelas.
 */
function namesFromRegex(re, file) {
    const m = /^\^\(\s*(.+?)\s*\)\$$/.exec(re.source);
    if (!m) {
        throw new Error(`[Plugin] format command tidak didukung di ${file}: ${re} (harus /^(a|b|c)$/i)`);
    }
    return m[1].split('|').map(s => s.replace(/\\(.)/g, '$1'));
}

/** Daftar semua nama command (pengganti getCaseName atas message.js). */
export async function getPluginCommandNames() {
    const table = await loadPlugins();
    const names = [];
    for (const p of table) {
        names.push(...namesFromRegex(p.command, p.file));
    }
    return [...new Set(names)];
}

/** Cari plugin yang cocok untuk sebuah command (sudah di-lowercase oleh inject.js). */
export async function findPlugin(command) {
    if (!command) return null;
    const table = await loadPlugins();
    return table.find(p => p.command.test(command)) || null;
}

/**
 * Ambil fungsi handler dari modul yang sudah di-load via importLazy.
 * Bentuk 1 → mod.default ; Bentuk 2 → mod[handlerName].
 */
export function resolvePluginHandler(mod, descriptor) {
    const fn = descriptor.handlerName ? mod[descriptor.handlerName] : mod.default;
    if (typeof fn !== 'function') {
        throw new Error(`[Plugin] handler bukan fungsi di ${descriptor.file} (${descriptor.handlerName || 'default'})`);
    }
    return fn;
}
