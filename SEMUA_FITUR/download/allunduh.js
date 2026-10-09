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
 *  allunduh.js — Universal downloader (.allunduh)
 *  Auto-detect platform dari URL: TT/IG/FB/YT/Twitter
 * ───────────────────────────────
 */
'use strict';

import { importLazy } from '../../src/helper/esmLazy.js';
/**
 * Handler untuk command .allunduh
 * Universal downloader — auto-detect platform dari URL
 * Supported: Instagram, TikTok, YouTube, Facebook, Twitter/X
 *
 * @param {object} hisoka - bot socket
 * @param {object} m       - pesan
 * @param {string} query   - URL apapun
 * @param {object} ctx     - semua ctx dari message.js
 */

import path from 'path';

function detectPlatform(url) {
    try {
        const u = new URL(url);
        const host = u.hostname.replace(/^www\./, '').toLowerCase();
        if (host === 'instagram.com' || host === 'instagr.am') return 'instagram';
        if (host === 'tiktok.com' || host === 'vm.tiktok.com' || host === 'vt.tiktok.com') return 'tiktok';
        if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com') return 'youtube';
        if (host === 'facebook.com' || host === 'fb.watch' || host === 'm.facebook.com' || host === 'fb.com') return 'facebook';
        if (host === 'twitter.com' || host === 'x.com' || host === 't.co') return 'twitter';
        if (host === 'pinterest.com' || host === 'pin.it') return 'pinterest';
        return 'unknown';
    } catch {
        return 'unknown';
    }
}

async function fetchInstagram(url) {
    const vdrawRes = await fetch('https://vdraw.ai/api/v1/instagram/ins-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type: 'video' }),
        signal: AbortSignal.timeout(18000),
    }).then(r => r.json()).catch(() => null);

    if (vdrawRes?.code === 100000 && vdrawRes?.data?.info?.length) {
        return vdrawRes.data;
    }

    const archiveRes = await fetch(
        `https://archive.lick.eu.org/api/download/instagram?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(15000) }
    ).then(r => r.json()).catch(() => null);

    if (archiveRes?.status && archiveRes?.result) {
        const r = archiveRes.result;
        return {
            media_type: r.isVideo ? 'reel' : 'photo',
            info: (r.url || []).map(u => ({
                url: typeof u === 'object' ? (u.url || u.src) : u,
                media_format: r.isVideo ? 'video' : 'image',
            })),
        };
    }

    return null;
}

async function fetchTwitter(url) {
    const archiveRes = await fetch(
        `https://archive.lick.eu.org/api/download/twitter?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(15000) }
    ).then(r => r.json()).catch(() => null);

    if (archiveRes?.status && archiveRes?.result) {
        return archiveRes.result;
    }
    return null;
}

async function fetchPinterest(url) {
    const archiveRes = await fetch(
        `https://archive.lick.eu.org/api/download/pinterest?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(15000) }
    ).then(r => r.json()).catch(() => null);

    if (archiveRes?.status && archiveRes?.result) {
        return archiveRes.result;
    }
    return null;
}

async function handleAllUnduh(hisoka, m, query, ctx) {
    const {
        tolak, logCommand, gemini,
        buildVideoDownloadCaptionPrompt,
        buildIgVisionPrompt, buildIgCaptionPrompt, buildIgFallbackCaption, parseIgMetaHtml, formatIgCount,
        buildFbVisionPrompt, buildFbCaptionPrompt, buildFbFallbackCaption, parseFbMetaHtml, formatFbCount,
        exec, util,
    } = ctx;

    const pfx = m.prefix || '.';

    if (!query || !query.trim()) {
        await tolak(hisoka, m,
            `╭═══『 🌐 *ALL DOWNLOADER* 』═══╮\n│\n` +
            `│ Download video/foto dari berbagai\n` +
            `│ platform secara otomatis.\n│\n` +
            `│ *Cara Pakai:*\n` +
            `│ ${pfx}allunduh [link]\n│\n` +
            `│ *Platform Supported:*\n` +
            `│ ▸ Instagram (Reel, Feed, Story)\n` +
            `│ ▸ TikTok (Video, Slide)\n` +
            `│ ▸ YouTube (Video)\n` +
            `│ ▸ Facebook (Video, Reel)\n` +
            `│ ▸ Twitter / X (Video)\n` +
            `│ ▸ Pinterest (Foto/Video)\n│\n` +
            `│ *Contoh:*\n` +
            `│ ${pfx}allunduh https://www.instagram.com/reel/xxx\n` +
            `│ ${pfx}allunduh https://vt.tiktok.com/xxx\n` +
            `│ ${pfx}allunduh https://youtu.be/xxx\n` +
            `│ ${pfx}allunduh https://twitter.com/xxx\n` +
            `╰══════════════════════╯`
        );
        return;
    }

    const rawUrl = query.trim().split(/\s+/)[0];
    let normalUrl = rawUrl;
    try {
        const parsed = new URL(rawUrl);
        normalUrl = parsed.origin + parsed.pathname.replace(/\/$/, '') + '/';
    } catch {
        await tolak(hisoka, m, '❌ URL tidak valid. Pastikan link benar dan lengkap.');
        return;
    }

    const platform = detectPlatform(rawUrl);

    if (platform === 'unknown') {
        await tolak(hisoka, m,
            `❌ Platform tidak dikenali.\n\n` +
            `Platform yang didukung:\n` +
            `• Instagram, TikTok, YouTube\n` +
            `• Facebook, Twitter/X, Pinterest`
        );
        return;
    }

    const platformEmoji = {
        instagram: '📸 Instagram',
        tiktok: '🎵 TikTok',
        youtube: '▶️ YouTube',
        facebook: '📘 Facebook',
        twitter: '🐦 Twitter/X',
        pinterest: '📌 Pinterest',
    };

    const loadingMsg = await tolak(hisoka, m, `⏳ Mengunduh dari ${platformEmoji[platform] || platform}...`);

    try {
        if (platform === 'instagram') {
            const { handleInstagramDl } = (await importLazy(path.resolve('./SEMUA_FITUR/download/instagram-dl.js')));
            await handleInstagramDl(hisoka, m, rawUrl, {
                gemini, tolak: async (s, msg, text) => {
                    await m.reply({ edit: loadingMsg.key, text }).catch(() => {});
                    return { key: loadingMsg.key };
                },
                logCommand, exec, util,
                buildIgVisionPrompt, buildIgCaptionPrompt, buildIgFallbackCaption,
                parseIgMetaHtml, formatIgCount,
            });
            return;
        }

        if (platform === 'tiktok') {
            const { handleTiktokDl } = (await importLazy(path.resolve('./SEMUA_FITUR/download/tiktok-dl.js')));
            await handleTiktokDl(hisoka, m, rawUrl, {
                gemini, tolak: async (s, msg, text) => {
                    await m.reply({ edit: loadingMsg.key, text }).catch(() => {});
                    return { key: loadingMsg.key };
                },
                logCommand, buildVideoDownloadCaptionPrompt,
            });
            return;
        }

        if (platform === 'youtube') {
            const { handleYtmp4 } = (await importLazy(path.resolve('./SEMUA_FITUR/download/youtube-dl.js')));
            await handleYtmp4(hisoka, m, rawUrl, {
                gemini, tolak: async (s, msg, text) => {
                    await m.reply({ edit: loadingMsg.key, text }).catch(() => {});
                    return { key: loadingMsg.key };
                },
                logCommand,
            });
            return;
        }

        if (platform === 'facebook') {
            const { handleFacebookDl } = (await importLazy(path.resolve('./SEMUA_FITUR/download/facebook-dl.js')));
            await handleFacebookDl(hisoka, m, rawUrl, {
                gemini, tolak: async (s, msg, text) => {
                    await m.reply({ edit: loadingMsg.key, text }).catch(() => {});
                    return { key: loadingMsg.key };
                },
                logCommand,
                buildFbVisionPrompt, buildFbCaptionPrompt, buildFbFallbackCaption,
                parseFbMetaHtml, formatFbCount,
            });
            return;
        }

        if (platform === 'twitter') {
            const { handleTwitterDl } = (await importLazy(path.resolve('./SEMUA_FITUR/download/twitter-dl.js')));
            await handleTwitterDl(hisoka, m, rawUrl, {
                tolak: async (s, msg, text) => {
                    await m.reply({ edit: loadingMsg.key, text }).catch(() => {});
                    return { key: loadingMsg.key };
                },
                logCommand,
            });
            return;
        }

        if (platform === 'pinterest') {
            await m.reply({ edit: loadingMsg.key, text: '⏳ Mengambil konten Pinterest...' }).catch(() => {});

            const pinData = await fetchPinterest(rawUrl);
            if (!pinData) {
                await m.reply({ edit: loadingMsg.key, text: '❌ Gagal mengunduh dari Pinterest.' }).catch(() => {});
                return;
            }

            const mediaUrl = pinData.url || pinData.video_url || pinData.image_url;
            const isVideo = !!(pinData.url?.includes('.mp4') || pinData.video_url);

            await m.reply({ edit: loadingMsg.key, text: '📥 Mengirim konten Pinterest...' }).catch(() => {});

            if (isVideo) {
                await hisoka.sendMessage(m.chat, {
                    video: { url: mediaUrl },
                    caption: `📌 *Pinterest Download*\n\n🔗 ${rawUrl}`,
                    mimetype: 'video/mp4',
                }, { quoted: m });
            } else {
                await hisoka.sendMessage(m.chat, {
                    image: { url: mediaUrl },
                    caption: `📌 *Pinterest Download*\n\n🔗 ${rawUrl}`,
                }, { quoted: m });
            }

            logCommand && logCommand(m, hisoka, 'allunduh-pinterest');
            return;
        }

    } catch (err) {
        console.error('[AllUnduh] Error:', err.message);
        await m.reply({
            edit: loadingMsg.key,
            text: `❌ Gagal mengunduh.\n\n• Coba link spesifik: ${m.prefix || '.'}ig / ${m.prefix || '.'}tt / ${m.prefix || '.'}fb\n• Pastikan link benar dan konten tidak privat`,
        }).catch(() => {});
    }
}

export { handleAllUnduh, detectPlatform };
/**
 * ── Plugin ESM (auto-migrasi dari switch-case message.js) ──
 */
export const command = /^(allunduh|unduhsemua|dl)$/i;
export const tags = ['download'];
export const help = ['allunduh'];
async function runHandleAllUnduh(ctx) {
    const { buildFbCaptionPrompt, buildFbFallbackCaption, buildFbVisionPrompt, buildIgCaptionPrompt, buildIgFallbackCaption, buildIgVisionPrompt, buildVideoDownloadCaptionPrompt, exec, formatFbCount, formatIgCount, gemini, hisoka, logCommand, m, parseFbMetaHtml, parseIgMetaHtml, query, tolak, util } = ctx;
    try {
                                            await handleAllUnduh(hisoka, m, query, {
                                                    gemini, tolak, logCommand, exec, util,
                                                    buildVideoDownloadCaptionPrompt,
                                                    buildIgVisionPrompt, buildIgCaptionPrompt, buildIgFallbackCaption, parseIgMetaHtml, formatIgCount,
                                                    buildFbVisionPrompt, buildFbCaptionPrompt, buildFbFallbackCaption, parseFbMetaHtml, formatFbCount,
                                            });
                                    } catch (error) {
                                            console.error('\x1b[31m[AllUnduh] Error:\x1b[39m', error.message);
                                            await tolak(hisoka, m, `❌ Error: ${error.message}`);
                                    }
}
export default runHandleAllUnduh;
