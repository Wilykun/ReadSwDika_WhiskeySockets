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
 *  handler.js — Pintu masuk sistem plugin (ala Bot-dj-V3).
 *  Implementasi lengkap ada di src/helper/pluginLoader.js;
 *  file ini hanya re-export agar strukturnya familiar:
 *    handler.js  → pemuat & pencocok plugin (setara handler.js contoh)
 *    SEMUA_FITUR/<kategori>/*.js → plugin (setara plugins/*.js contoh)
 *    message.js  → dispatcher pesan (memakai handler.js ini)
 * ───────────────────────────────
 */
'use strict';

export {
    loadPlugins,
    findPlugin,
    resolvePluginHandler,
    getPluginCommandNames,
    invalidatePlugins,
} from './src/helper/pluginLoader.js';
