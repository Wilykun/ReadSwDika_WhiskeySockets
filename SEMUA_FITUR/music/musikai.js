/**
 * ───────────────────────────────
 *  Base Script : Bang Dika Ardnt
 *  Recode By   : Bang Wilykun
 *  WhatsApp    : 6289688206739
 *  Telegram    : @Wilykun1994
 * ───────────────────────────────
 *  Script ini khusus donasi/VIP — dilarang menjual ulang.
 * ───────────────────────────────
 */
'use strict';


/**
 * ── Plugin ESM (auto-migrasi dari switch-case message.js) ──
 */
export const command = /^(musikai|aimusik|musikai2|aimusik2)$/i;
export const tags = ['music'];
export const help = ['musikai'];
async function runMusikai(ctx) {
    const { hisoka, m, tolak } = ctx;
    await tolak(hisoka, m, `❌ *Fitur ${m.command} dihentikan sementara*\n\nBackend API ChatMusicPro sudah tidak lagi gratis dan memerlukan pembayaran.\n\nFitur ini akan diaktifkan kembali jika ada alternatif backend yang gratis.`);
}
export default runMusikai;
// (handler diambil dari ctx._handleCekautoFn — singleton factory message.js)
