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
 *  validate-esm.js — Dev tool: bulk validation semua file .js (full-ESM)
 *  Coba import semua .js di proyek (dinamis, tanpa mengeksekusi entry point),
 *  laporkan yang gagal. Pengganti validate-cjs.js di era full-ESM.
 * ───────────────────────────────
 */
import { execSync } from 'child_process';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// File/direktori yang DIKECUALIKAN dari bulk import:
//  - index.js / message.js : entry point dengan side-effect (startup bot)
//  - scratch/              : skrip simulasi yang jalan saat di-import
//  - scripts/              : dev tools (divalidasi via node --check di CI)
const EXCLUDE_RES = [
    /^index\.js$/,
    /^message\.js$/,
    /^scratch\//,
    /^scripts\//,
];

function getJsFiles() {
    const output = execSync(
        'find . -name "*.js" -not -path "./node_modules/*" -not -path "./.git/*"',
        { cwd: ROOT, encoding: 'utf8' }
    );
    return output.trim().split('\n')
        .filter(Boolean)
        .map(f => f.replace(/^\.\//, ''))
        .filter(f => !EXCLUDE_RES.some(rx => rx.test(f)))
        .sort();
}

async function tryImport(filePath) {
    const abs = path.resolve(ROOT, filePath);
    try {
        await import(pathToFileURL(abs).href + `?v=${Date.now()}`);
        return { ok: true, error: null };
    } catch (err) {
        return { ok: false, error: err };
    }
}

function formatError(err) {
    const lines = (err.message || String(err)).split('\n');
    return lines[0].trim();
}

async function main() {
    const files = getJsFiles();
    const total = files.length;

    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║          WILY-BOT  —  Bulk ESM Validator             ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`  Total file .js ditemukan : ${total}`);
    console.log(`  Root project              : ${ROOT}`);
    console.log('');

    const passed = [];
    const failed = [];

    for (const file of files) {
        const result = await tryImport(file);
        if (result.ok) {
            passed.push(file);
            console.log(`  ✅  ${file}`);
        } else {
            failed.push({ file, error: result.error });
            console.log(`  ❌  ${file}`);
            console.log(`       └─ ${formatError(result.error)}`);
        }
    }

    console.log('');
    console.log('══════════════════════════════════════════════════════');
    console.log(`  ✅ Lulus  : ${passed.length} / ${total}`);
    console.log(`  ❌ Error  : ${failed.length} / ${total}`);
    console.log('══════════════════════════════════════════════════════');

    if (failed.length === 0) {
        console.log('');
        console.log('  🎉 Semua file .js berhasil di-import! Tidak ada error.');
        console.log('');
    } else {
        console.log('');
        console.log('  ⚠️  File yang GAGAL di-import:');
        for (const { file, error } of failed) {
            console.log('');
            console.log(`  📄 ${file}`);
            console.log(`     Tipe  : ${error.code || error.name || 'Error'}`);
            console.log(`     Pesan : ${formatError(error)}`);
            if (error.stack) {
                const stackLines = error.stack
                    .split('\n')
                    .filter(l => l.includes('    at ') && !l.includes('node_modules') && !l.includes('validate-esm'))
                    .slice(0, 3);
                if (stackLines.length > 0) {
                    console.log('     Stack :');
                    for (const line of stackLines) {
                        console.log(`       ${line.trim()}`);
                    }
                }
            }
        }
        console.log('');
    }

    // Exit code 1 kalau ada yang gagal (berguna untuk CI/pre-deploy)
    process.exit(failed.length > 0 ? 1 : 0);
}

main();
