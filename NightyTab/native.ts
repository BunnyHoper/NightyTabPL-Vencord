/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addResponseHeaderHook } from "@main/csp";
import { IpcMainInvokeEvent } from "electron";

const MONTH_SECONDS = 60 * 60 * 24 * 30;
const embedHosts = new Set<string>();
let headerHooked = false;

function hostOf(url: string) {
    try {
        return new URL(url).host;
    } catch {
        return "";
    }
}

function keepEmbedCookie(cookie: string) {
    let next = cookie.replace(/;\s*samesite=[^;]*/gi, "").replace(/;\s*partitioned\b/gi, "");
    if (!/;\s*secure\b/i.test(next)) next += "; Secure";
    next += "; SameSite=None; Partitioned";
    if (!/(?:^|;)\s*(?:expires|max-age)=/i.test(next)) next += `; Max-Age=${MONTH_SECONDS}`;
    return next;
}

function allowEmbedDocument(headers: Record<string, string[]>) {
    for (const name of Object.keys(headers)) {
        const lower = name.toLowerCase();
        if (lower === "x-frame-options" || lower === "cross-origin-opener-policy" || lower === "cross-origin-resource-policy") {
            delete headers[name];
            continue;
        }
        if (lower !== "content-security-policy") continue;
        headers[name] = headers[name]
            .map(policy => policy
                .split(";")
                .map(part => part.trim())
                .filter(part => part !== "" && !/^frame-ancestors\b/i.test(part))
                .join("; "))
            .filter(policy => policy !== "");
    }
}

function hookHeaders() {
    if (headerHooked) return;
    headerHooked = true;

    addResponseHeaderHook(({ url, responseHeaders }) => {
        if (!embedHosts.has(hostOf(url))) return;

        allowEmbedDocument(responseHeaders);
        const key = Object.keys(responseHeaders).find(name => name.toLowerCase() === "set-cookie");
        const cookies = key === undefined ? undefined : responseHeaders[key];
        if (key !== undefined && cookies)
            responseHeaders[key] = cookies.map(keepEmbedCookie);
    });
}

export function allowEmbed(_event: IpcMainInvokeEvent, url: string) {
    const host = hostOf(url);
    if (host !== "") embedHosts.add(host);
    hookHeaders();
}
