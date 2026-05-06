// @ts-check
/// <reference types="@cloudflare/workers-types" />

/** @typedef {import('./index').AppEnv} AppEnv */

/** @type {ExportedHandler<AppEnv>} */
export default {
    async fetch(request, env, ctx) {
        return new Response("<h1>Admin Panel is not implemented yet.</h1>", {
            headers: {
                "Content-Type": "text/html",
            },
        });
    },
};