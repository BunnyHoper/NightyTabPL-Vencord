/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings, migratePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { classNameFactory } from "@utils/css";
import { sendMessage } from "@utils/discord";
import { classes } from "@utils/misc";
import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { Message } from "@vencord/discord-types";
import { findByCodeLazy, findComponentByCodeLazy } from "@webpack";
import { ChannelStore, Menu, MessageActions, useEffect, useRef } from "@webpack/common";
import type { ReactElement } from "react";

const Native = IS_DISCORD_DESKTOP
    ? VencordNative.pluginHelpers["Nighty Tab"] as PluginNative<typeof import("./native")>
    : null;

const NIGHTY_ROUTE = "/nighty";
const NIGHTY_ITEM_ID = "nighty";
const cl = classNameFactory("vc-extraHomeTab-");

const settings = definePluginSettings({
    url: {
        type: OptionType.STRING,
        description: "URL the Nighty tab opens in the page beside the home sidebar.",
        placeholder: "http://127.0.0.1/",
        default: "http://127.0.0.1/",
        isValid(value: string) {
            const trimmed = value.trim();
            if (trimmed === "") return true;
            try {
                const url = new URL(trimmed);
                if (url.protocol === "https:" || url.protocol === "http:") return true;
            } catch { /* invalid URL */ }
            return "Use an http or https URL";
        }
    },
    scriptUtils: {
        type: OptionType.BOOLEAN,
        description: "Shows Download Script when you right-click a message with an attachment.",
        displayName: "Script Utils functions",
        default: false
    },
    nightyPrefix: {
        type: OptionType.STRING,
        description: "One character placed before dls.",
        displayName: "Nighty Prefix",
        default: "",
        placeholder: ".",
        componentProps: { maxLength: 1 },
        hidden() {
            return !this.store.scriptUtils;
        },
        isValid(value: string) {
            if (!this.store.scriptUtils) return true;
            if (value.length === 1) return true;
            return "Use one character.";
        }
    }
});

migratePluginSettings("Nighty Tab", "ExtraHomeTab");

function pageUrl(value: string | undefined): string | null {
    const trimmed = (value ?? "").trim();
    if (trimmed === "") return null;
    try {
        const url = new URL(trimmed);
        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        return url.href;
    } catch {
        return null;
    }
}

const NIGHTY_ICON = "data:image/png;base64,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";

interface LinkIconProps {
    className?: string;
    size?: string;
    color?: string;
}

interface PrivateChannelLinkProps {
    selected: boolean;
    route: string;
    icon: (props: LinkIconProps) => ReactElement;
    text: string;
    className?: string;
    role?: "listitem";
    tabIndex?: number;
    onFocus?: () => void;
    "data-nighty-tab"?: string;
}

interface PrivateChannelListItem {
    role: "listitem";
    tabIndex: number;
    onFocus: () => void;
    [dataAttribute: `data-${string}`]: string;
}

const PrivateChannelLink = findComponentByCodeLazy<PrivateChannelLinkProps>(
    "nitroHoverGradient",
    "refresh_sm",
    "listItemRef"
);

const usePrivateChannelListItem: (id: string) => PrivateChannelListItem = findByCodeLazy(
    'role:"listitem"',
    "setFocus",
    "useState(-1)"
);

function NightyIcon({ className }: LinkIconProps) {
    return (
        <img
            alt=""
            aria-hidden="true"
            className={classes(className, cl("icon"))}
            draggable={false}
            height={20}
            src={NIGHTY_ICON}
            width={20}
        />
    );
}

function NightyMenuIcon({ className, height = 20, width = 20 }: { className?: string; height?: number | string; width?: number | string; }) {
    return (
        <svg aria-hidden="true" className={className} height={height} viewBox="0 0 24 24" width={width}>
            <image height="18" href={NIGHTY_ICON} width="18" x="3" y="3" />
        </svg>
    );
}

function sendDownloadScript(message: Message) {
    const channel = ChannelStore.getChannel(message.channel_id);
    if (!channel) return;
    const options = MessageActions.getSendMessageOptionsForReply({
        channel,
        message,
        shouldMention: false,
        showMentionToggle: false
    });
    void sendMessage(channel.id, { content: `${settings.store.nightyPrefix.slice(0, 1)}dls` }, true, options);
}

const messageContextMenuPatch: NavContextMenuPatchCallback = (children, { message }: { message?: Message; }) => {
    if (!settings.store.scriptUtils || !message || message.attachments.length === 0) return;

    children.push(
        <Menu.MenuItem
            id="vc-nighty-dls"
            label="Download Script"
            icon={NightyMenuIcon}
            leadingAccessory={{ type: "icon", icon: NightyMenuIcon }}
            action={() => sendDownloadScript(message)}
        />
    );
};

const NightyPage = ErrorBoundary.wrap(function NightyPage() {
    const { url } = settings.use(["url"]);
    const src = pageUrl(url);
    const hostRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host || src === null) return;

        let cancelled = false;
        let frame: HTMLIFrameElement | undefined;

        void (async () => {
            if (Native) await Native.allowEmbed(src);
            if (cancelled) return;
            frame = document.createElement("iframe");
            frame.className = cl("frame");
            frame.src = src;
            frame.title = "Nighty";
            host.replaceChildren(frame);
        })();

        return () => {
            cancelled = true;
            frame?.remove();
        };
    }, [src]);

    return <div className={cl("page")} ref={hostRef} />;
}, { noop: true });

const NightyTab = ErrorBoundary.wrap(function NightyTab() {
    const listItem = usePrivateChannelListItem(NIGHTY_ITEM_ID);

    return (
        <PrivateChannelLink
            {...listItem}
            data-nighty-tab="true"
            icon={NightyIcon}
            route={NIGHTY_ROUTE}
            selected={window.location.pathname.startsWith(NIGHTY_ROUTE)}
            text="Nighty Tab"
        />
    );
}, { noop: true });

export default definePlugin({
    name: "Nighty Tab",
    description: "Adds a Nighty tab on the home sidebar.",
    authors: [
        {
            name: "Mime | N0_.q3",
            id: 123456789012345678n
        }
	],
    enabledByDefault: true,
    dependencies: ["MessagePopoverAPI"],
    settings,
    contextMenus: {
        message: messageContextMenuPatch
    },
    messagePopoverButton: {
        icon: NightyMenuIcon,
        render(message) {
            if (!settings.store.scriptUtils || message.attachments.length === 0) return null;
            const channel = ChannelStore.getChannel(message.channel_id);
            if (!channel) return null;
            return {
                label: "Download Script",
                icon: NightyMenuIcon,
                message,
                channel,
                onClick: () => sendDownloadScript(message)
            };
        }
    },

    start() {
        const src = pageUrl(settings.store.url);
        if (Native && src !== null) void Native.allowEmbed(src);
    },

    patches: [
        {
            find: '"section-divider-top"',
            replacement: {
                match: /\(0,\i\.jsx\)\(\i,\{\},"section-divider-top"\)/,
                replace: "$self.renderExtraTab(),$&"
            }
        },
        {
            find: ".QUEST_HOME,render:",
            replacement: {
                match: /\(0,(\i)\.jsx\)\((\i\.\i),\{path:\i\.BVt\.QUEST_HOME,render:\i,impressionName:\i\.ImpressionNames\.QUEST_HOME,disableTrack:!0\}\)/,
                replace: '$&,(0,$1.jsx)($2,{path:"/nighty",render:$self.renderPage})'
            }
        },
        {
            find: "isChatRoute:!0",
            replacement: {
                match: /F\.BVt\.FAMILY_CENTER\],render:(\i),isChatRoute:!0\}/,
                replace: 'F.BVt.FAMILY_CENTER],render:$1,isChatRoute:!0},{path:["/nighty"],render:$1}'
            }
        }
    ],

    renderExtraTab() {
        return <NightyTab />;
    },

    renderPage() {
        return <NightyPage />;
    }
});
