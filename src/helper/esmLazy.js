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
 *  esmLazy.js — Pengganti require() lazy di era full-ESM
 *  Semantik identik dengan require.cache CJS:
 *   - file yang belum berubah  → modul dari cache (cepat)
 *   - file yang berubah (mtime beda) → import ulang fresh dari disk
 *  Dipakai di semua titik yang dulu memakai require()/ _require()
 *  di dalam fungsi (case handler message.js, dsb).
 * ───────────────────────────────
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// absPath -> { mtimeMs, mod }
const _cache = new Map();

export async function importLazy(absPath) {
    const abs = path.resolve(absPath);
    let mtimeMs = 0;
    try {
        mtimeMs = fs.statSync(abs).mtimeMs;
    } catch {
        // file tidak ada / tidak bisa di-stat: biarkan import() yang melempar error
    }
    const hit = _cache.get(abs);
    if (hit && hit.mtimeMs === mtimeMs) return hit.mod;
    const mod = await import(pathToFileURL(abs).href + `?t=${mtimeMs}`);
    _cache.set(abs, { mtimeMs, mod });
    return mod;
}

// Hapus cache untuk satu path (paritas dengan delete require.cache[...]).
export function clearLazyCache(absPath) {
    const abs = path.resolve(absPath);
    return _cache.delete(abs);
}
