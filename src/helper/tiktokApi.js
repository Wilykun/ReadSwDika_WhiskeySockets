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
 *  tiktokApi.js — Pengganti @tobyg74/tiktok-api-dl
 *  Package tersebut di-block oleh security policy Replit
 *  (Socket: AI-detected potential malware) sehingga `npm ci`
 *  selalu gagal. Helper ini memakai API publik tikwm.com
 *  langsung via axios (sudah jadi dependency) — tanpa
 *  package tambahan, tanpa API key.
 *
 *  Return dinormalisasi ke bentuk yang sama seperti
 *  @tobyg74/tiktok-api-dl agar pemanggil tidak perlu diubah:
 *    { status: 'success', result: {
 *        videoHD, videoSD, videoWatermark,
 *        images[], author{nickname,username,unique_id},
 *        description, statistics{playCount,likeCount,commentCount,shareCount}
 *    } }
 * ───────────────────────────────
 */
'use strict';

import axios from 'axios';

const TIKWM_API = 'https://www.tikwm.com/api/';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

/**
 * Download info + media TikTok tanpa watermark.
 * @param {string} url - URL TikTok (tiktok.com / vt.tiktok.com / vm.tiktok.com)
 * @param {object} [opts] - { retries: number, timeout: ms }
 * @returns {Promise<{status: string, result: object}>}
 */
export async function tiktokDl(url, opts = {}) {
    const retries = opts.retries ?? 2;
    const timeout = opts.timeout ?? 30000;
    let lastError = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const { data } = await axios.get(TIKWM_API, {
                params: { url: String(url).trim(), hd: 1 },
                timeout,
                headers: { 'User-Agent': UA },
            });
            if (data?.code !== 0 || !data?.data) {
                throw new Error(data?.msg || `TikTok API error (code ${data?.code})`);
            }
            const d = data.data;
            const author = d.author || {};
            return {
                status: 'success',
                result: {
                    videoHD:        d.hdplay || null,
                    videoSD:        d.play || null,
                    videoWatermark: d.wmplay || null,
                    images:         Array.isArray(d.images) ? d.images : [],
                    author: {
                        nickname:  author.nickname || null,
                        username:  author.unique_id || null,
                        unique_id: author.unique_id || null,
                    },
                    description: d.title || d.desc || '',
                    statistics: {
                        playCount:    d.play_count ?? null,
                        likeCount:    d.digg_count ?? null,
                        commentCount: d.comment_count ?? null,
                        shareCount:   d.share_count ?? null,
                    },
                },
            };
        } catch (e) {
            lastError = e;
            if (attempt < retries) await new Promise(r => setTimeout(r, 1500));
        }
    }
    throw lastError || new Error('Gagal menghubungi TikTok API');
}

export default tiktokDl;
