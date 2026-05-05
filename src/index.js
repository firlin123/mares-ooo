const oooImports = import.meta.glob('../ponies/*/*.json', { eager: true });

/** @type {Array<{ source: string, alt: string, file: string }>} */
const MARE_OOOS = [];
for (const path in oooImports) {
  const module = oooImports[path];
  const data = typeof module === 'function' ? await module() : module;
  LOADED_OOOS.push(data);
}

function createHtmlResponse(head, body, headers = {}, status = 200) {
  headers = headers || {};
  status = status || 200;
  headers['Content-Type'] = 'text/html; charset=utf-8';
  return new Response(`<!DOCTYPE html>
<html>
  <head>${head}</head>
  <body>${body}</body>
</html>`, { headers, status });
}

function redirect(url) {
  return createHtmlResponse(
    `<title>Redirecting to ${url}...</title><meta http-equiv="refresh" content="0; url="${url}">`,
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
}`;

export default {
  async fetch(request, env, ctx) {
    let url = new URL(request.url);
    if (url.pathname === '/favicon.ico') {
      return fetch('https://firlin123.github.io/mares-ooo/img/favicon.ico');
    }
    if (url.hostname === 'submit.mares.ooo' || url.hostname === 'www.submit.mares.ooo') {
      return redirect('https://github.com/firlin123/mares-ooo/issues/new');
    }
    let useOoo = null;
    if (url.pathname.startsWith('/test/') && MARE_OOOS[url.pathname.slice(6)]) {
      useOoo = MARE_OOOS[url.pathname.slice(6)];
    }
    const randomMareOoo = useOoo ? useOoo : MARE_OOOS[Math.floor(Math.random() * MARE_OOOS.length)];
    const el = randomMareOoo.file.endsWith('.webm')
      ? `<video autoplay loop muted src="https://firlin123.github.io/mares-ooo/${randomMareOoo.file}" alt="${randomMareOoo.alt}"></video>`
      : `<img src="https://firlin123.github.io/mares-ooo/${randomMareOoo.file}" alt="${randomMareOoo.alt}">`;
    return createHtmlResponse(
      `<title>Mares.ooo</title><style>${STYLE}</style>`,
      `<!-- Source: ${randomMareOoo.source} -->${el}`
    );
  }
};