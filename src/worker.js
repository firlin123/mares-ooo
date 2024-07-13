const MARE_OOOS = [
    { file: 'img/linky/1.png', source: 'https://derpicdn.net/img/view/2024/6/15/3383980.png', alt: 'Linkooo' },
    { file: 'img/cloud-kicker/1.png', source: 'https://derpicdn.net/img/download/2021/8/28/2688692.png', alt: 'Cloud Kicker oooing' },
    { file: 'img/fluttershy/1.png', source: 'https://derpicdn.net/img/download/2024/5/14/3363764.png', alt: 'Flooooootershy' },
    { file: 'img/trixie/1.jpg', source: 'https://derpicdn.net/img/download/2022/2/14/2806847.jpg', alt: 'Great and Powerfoooool' },
    { file: 'img/cherry-berry/1.png', source: 'https://derpicdn.net/img/download/2021/6/18/2637961.png', alt: 'It\'s just so much to dooooo' },
    { file: 'img/carrot-top/1.png', source: 'https://derpicdn.net/img/download/2021/6/17/2637311.png', alt: 'It\'s just so much to dooooo' },
    { file: 'img/twilight-sparkle/1.gif', source: 'https://derpicdn.net/img/download/2015/12/21/1049299.gif', alt: 'Twi ooo' },
    { file: 'img/starlight-glimmer/1.png', source: 'https://desu-usergeneratedcontent.xyz/mlp/image/1673/28/1673280285649.png', alt: 'Starlight ooo' },
    // TODOOOOO: Add more
];

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

img {
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
        const randomMareOoo = MARE_OOOS[Math.floor(Math.random() * MARE_OOOS.length)];
        return createHtmlResponse(
            `<title>Mares.ooo</title><style>${STYLE}</style>`,
            `<!-- Source: ${randomMareOoo.source} --><img src="https://firlin123.github.io/mares-ooo/${randomMareOoo.file}" alt="${randomMareOoo.alt}">`
        );
    }
};