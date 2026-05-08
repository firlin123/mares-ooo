// @ts-check
/// <reference types="@cloudflare/workers-types" />
/// <reference types="vite/client" />

/**
 * @typedef {Object} MareOoo
 * @property {string} source - The source of the image/video (e.g., link or episode name).
 * @property {string} alt - The alt text for the image/video
 * @property {string} file - The file path to the image/video.
 * @property {boolean} [video] - Whether the file is a video (optional, defaults to false).
 */

/**
 * @typedef {Object} MareOooModuleDefaultExport
 * @property {MareOoo} default - The default export containing the MareOoo data.
 */

/** @typedef {MareOoo & MareOooModuleDefaultExport} MareOooModule */

/** @type {Record<string, MareOooModule | (() => Promise<MareOooModule>)>} */
const oooImports = import.meta.glob('../ponies/*/*.json', { eager: true });

/** @type {MareOoo[]} */
const MARE_OOOS = [];
for (const path in oooImports) {
  const module = oooImports[path];
  const data = typeof module === 'function' ? await module() : module;
  if (data && data.default &&
    typeof data.default.file === 'string' &&
    typeof data.default.alt === 'string' &&
    typeof data.default.source === 'string'
  ) {
    MARE_OOOS.push(data.default);
  } else {
    console.warn(`Invalid MareOoo data in file ${path}:`, data);
  }
}

/**
 * Creates an HTML response with the given head and body content.
 * 
 * @param {string} head - The content to be placed inside the <head> tag.
 * @param {string} body - The content to be placed inside the <body> tag.
 * @param {HeadersInit} [headers={}] - Optional additional headers to include in the response.
 * @param {number} [status=200] - The HTTP status code for the response.
 * @return {Response} A Response object containing the generated HTML content.
 */
function createHtmlResponse(head, body, headers = {}, status = 200) {
  const realHeaders = new Headers(headers);
  status = typeof status === 'number' && status >= 100 && status <= 599 ? status : 200;
  realHeaders.set('Content-Type', 'text/html; charset=utf-8');
  return new Response(
    '<!DOCTYPE html>' +
    '<html>' +
    `<head>${head}</head>` +
    `<body>${body}</body>` +
    '</html>',
    { headers: realHeaders, status }
  );
}

/**
 * Creates a redirect response to the specified URL.
 * 
 * @param {string} url - The URL to redirect to.
 * @return {Response} A Response object that redirects the client to the specified URL.
 */
function redirect(url) {
  return createHtmlResponse(
    `<title>Redirecting to ${url}...</title>` +
    `<meta http-equiv="refresh" content="0; url="${url}">`,
    `<p>Redirecting to <a href="${url}">${url}</a></p>`,
    { Location: url },
    302
  );
}

const STYLE = `html {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

body {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  margin: 0;
}

img, video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: black;
}`.replace(/\s+/g, ' ').replace(/;}/g, '}');

/**
 * @typedef {Object} AppEnv
 */

/** @type {ExportedHandler<AppEnv>} */
export default {
  async fetch(request, env, ctx) {
    let url = new URL(request.url);
    if (url.pathname === '/favicon.ico') {
      return redirect('https://firlin123.github.io/mares-ooo/img/favicon.ico');
    }
    if (
      url.hostname === 'submit.mares.ooo' || url.hostname === 'www.submit.mares.ooo' ||
      url.hostname === 'submit.localhost' || url.hostname === 'www.submit.localhost'
    ) {
      return redirect('https://github.com/firlin123/mares-ooo/issues/new');
    }
    if (url.pathname === '/ponies.json') {
      return new Response(JSON.stringify(MARE_OOOS), { headers: { 'Content-Type': 'application/json' } });
    }
    /** @type {MareOoo | undefined} */
    let useOoo = /** @type {any} */ (undefined);
    if (url.pathname.startsWith('/test/')) {
      const testOOO = parseInt(url.pathname.slice(6));
      if (!isNaN(testOOO) && testOOO >= 0 && testOOO < MARE_OOOS.length) {
        useOoo = MARE_OOOS[testOOO];
      }
    }
    const randomMareOoo = useOoo ? useOoo : MARE_OOOS[Math.floor(Math.random() * MARE_OOOS.length)];
    const el = randomMareOoo.video
      ? `<video autoplay loop muted src="https://firlin123.github.io/mares-ooo/${randomMareOoo.file}" alt="${randomMareOoo.alt}"></video>`
      : `<img src="https://firlin123.github.io/mares-ooo/${randomMareOoo.file}" alt="${randomMareOoo.alt}">`;
    return createHtmlResponse(
      `<title>Mares.ooo</title><style>${STYLE}</style>`,
      `<!-- Source: ${randomMareOoo.source} -->${el}`
    );
  }
};
