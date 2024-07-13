const { existsSync } = require('fs');
const { writeFile, readFile } = require('fs/promises');

let delay = 1500;

async function download(url, path, meta, metaPath, rl = 8) {
    if (existsSync(metaPath)) {
        // Already downloaded
        return;
    }
    console.log(`Downloading ${url} to ${path}`);
    try {
        const res = await fetch(url, {
            "headers": {
                "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                "accept-language": "en-US,en;q=0.9,ru;q=0.8,ru-UA;q=0.7",
                "priority": "i",
                "sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Linux\"",
                "sec-fetch-dest": "image",
                "sec-fetch-mode": "no-cors",
                "sec-fetch-site": "cross-site",
                "Referer": "https://desuarchive.org/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
            }
        });
        if (!res.ok) {
            if (res.status == 429) {
                console.log(`Rate limited, waiting ${rl} seconds`);
                await new Promise(r => setTimeout(r, rl * 1000));
                return download(url, path, meta, metaPath, rl * 2);
            }
            throw new Error(`HTTP ${res.status}`);
        }
        const blob = await res.blob();
        const buffer = await blob.arrayBuffer();
        await writeFile(path, Buffer.from(buffer));
    } catch (e) {
        console.error(`Failed to download ${url}: ${e}`);
        meta.error = e.toString();
    }
    await writeFile(metaPath, JSON.stringify(meta, null, 2));
    await new Promise(r => setTimeout(r, delay));
}

async function getOoosMap() {
    if (existsSync('oooMap.json')) {
        return JSON.parse(await readFile('oooMap.json', 'utf8'));
    }
    const ooorl = new URL('https://desuarchive.org/_/api/chan/search/?boards=mlp&order=asc');
    ooorl.searchParams.set('filename', 'ooo*');
    const ooosMap = {};
    let page = 1;
    while (true) {
        ooorl.searchParams.set('page', page);
        console.log(`Fetching page ${ooorl.toString()}`);
        const res = await fetch(ooorl);
        const json = await res.json();
        if (json.error == 'No results found.') {
            break;
        }
        for (const post of json[0].posts) {
            const k = post.media.media_hash;
            if (!ooosMap[k]) {
                ooosMap[k] = {
                    safeMediaHash: post.media.safe_media_hash,
                    mediaLink: post.media.media_link,
                    mediaFilenames: new Set(),
                };
            }
            ooosMap[k].mediaFilenames.add(post.media.media_filename);
        }
        page++;
    }
    await writeFile('oooMap.json', JSON.stringify(ooosMap, null, 2));
    return ooosMap;
}

async function main() {
    const ooosMap = await getOoosMap();
    for (const k in ooosMap) {
        const ooo = ooosMap[k];
        ooo.mediaFilenames = Array.from(ooosMap[k].mediaFilenames);
        const ext = ooo.mediaLink.split('.').pop();
        ooo.path = `ooos/imgs/${ooo.safeMediaHash}.${ext}`;
        await download(ooo.mediaLink, ooo.path, ooo, `ooos/jsons/${ooo.safeMediaHash}.json`);
    }
    console.log('Done');
}

main();