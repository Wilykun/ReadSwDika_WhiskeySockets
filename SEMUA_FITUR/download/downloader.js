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
 *  downloader.js — Centralized download handler
 *  Re-export semua platform downloader, single entry point
 * ───────────────────────────────
 */
/**
 * ═══════════════════════════════════════════════════════════════
 *  Centralized Download Handler
 *  Re-export semua downloader platform (TikTok, YouTube,
 *  Instagram, Twitter, Facebook, dll) sebagai single entry
 *  point — memudahkan impor di message.js.
 * ═══════════════════════════════════════════════════════════════
 */
'use strict';

/**
 * Centralized download handler — re-exports semua platform downloader.
 *
 * Usage di message.js:
 *   const { handleTiktokDl, handleInstagramDl, handleFacebookDl,
 *           handlePlay, handleYtmp3, handleYtmp4 } = (await importLazy(path.resolve('./SEMUA_FITUR/downloader.js')));
 */

import { handleTiktokDl } from './tiktok-dl.js';
import { handleInstagramDl } from './instagram-dl.js';
import { handleFacebookDl } from './facebook-dl.js';
import { handlePlay, handleYtmp3, handleYtmp4 } from './youtube-dl.js';
import { handleAllUnduh } from './allunduh.js';
import { handleTwitterDl } from './twitter-dl.js';

export { handleTiktokDl, handleInstagramDl, handleFacebookDl, handlePlay, handleYtmp3, handleYtmp4, handleAllUnduh, handleTwitterDl };