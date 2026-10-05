# 🌙 ɴɪɢʜᴛʏ ᴛᴀʙ - ᴠᴇɴᴄᴏʀᴅ ᴘʟᴜɢɪɴ
[![GitHub repo](https://img.shields.io/badge/github-BunnyHoper-blue?style=for-the-badge&logo=github)](https://github.com/BunnyHoper)
[![Client Mod](https://img.shields.io/badge/Client%20Mod-Vencord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://github.com/Vendicated/Vencord)
[![Version](https://img.shields.io/badge/ver-1.0.0-red?style=for-the-badge)](https://github.com/BunnyHoper/Nighty-Tab-Plugin)
[![Donate](https://img.shields.io/badge/Support%20Me-paypal.me/AritzGonzalez7-yellowgreen?style=for-the-badge&logo=paypal)](https://paypal.me/AritzGonzalez7)

> **Your Nighty panel, inside Discord (no extra window).** Adds a **Nighty Tab** right under the Quests tab and loads Nighty's Web Version in the page beside it.

---

## ✨ ɪɴᴛʀᴏᴅᴜᴄᴛɪᴏɴ

Stop alt-tabbing between Discord and Nighty (it's a waste of time). **Nighty Tab** embeds Nighty's own Web Version straight into Discord's home sidebar. It works out of the box with `http://127.0.0.1/`, and you can point it at any other URL (another PC, another port) from the plugin settings.

---

## 🛠️ ᴄᴏʀᴇ ᴄᴀᴘᴀʙɪʟɪᴛɪᴇѕ

*   **Home Sidebar Tab:** A native-looking **Nighty Tab** entry under Quests, with its own `/nighty` route.
*   **Ready by Default:** Default URL is `http://127.0.0.1/` — works as soon as Nighty Web is on. Change it whenever you want.
*   **Stays Loaded:** Leave the tab and the panel keeps running in the background — come back and it's exactly where you left it (no reload, no re-login). Toggle in settings.
*   **Embed Unlocker:** Allows the page in Discord's CSP (`frame-src`) and strips `X-Frame-Options` / `frame-ancestors` only for the URL you set, so the panel isn't blocked.
*   **Session Keeper:** Rewrites the panel's cookies so your Nighty Web login survives inside the embed.
*   **Script Utils (optional):** Right-click a message with an attachment → **Download Script** sends `<prefix>dls` as a reply.

---

## 📂 ᴀʀᴄʜɪᴛᴇᴄᴛᴜʀᴇ -- ʀᴏᴏᴛ

| Folder/File | Type | Action |
| :--- | :---: | :--- |
| `index.tsx` | **Core** | The plugin: settings, sidebar tab, `/nighty` page, Script Utils. |
| `native.ts` | **Native** | Main-process side: CSP `frame-src`, header and cookie fixes for the embed. |
| `style.css` | **Style** | Layout of the tab icon and the embedded page. |
| `vencord-csp.patch` | **Patch** | Small patch for Vencord's `src/main/csp/index.ts` that lets the plugin hook response headers. **Required.** |

---

## ⚙️ ǫᴜɪᴄᴋ ѕᴛᴀʀᴛ ɢᴜɪᴅᴇ

1.  **Enable Nighty Web:** In Nighty's home screen click **Web Version** → **Continue** → set username, IP (`0.0.0.0`) and port (`80`) → **Switch to Web Version**. Check it opens at `http://127.0.0.1/` in your browser.
    > `0.0.0.0` is only the listen address — browsers can't open it. Use `127.0.0.1` / `localhost`, or your PC's LAN IP from another device.

2.  **Get a Vencord build from source** (needs [Git](https://git-scm.com), [Node.js](https://nodejs.org) and [pnpm](https://pnpm.io)):
    ```bash
    git clone https://github.com/Vendicated/Vencord
    cd Vencord
    pnpm install --frozen-lockfile
    ```

3.  **Add the plugin:** Copy `index.tsx`, `native.ts` and `style.css` into `src/userplugins/nightyTab/`.

4.  **Apply the CSP patch** (from the Vencord folder, with `vencord-csp.patch` copied there):
    ```bash
    git apply vencord-csp.patch
    ```

5.  **Build & inject:**
    ```bash
    pnpm build
    pnpm inject
    ```

6.  **Fully restart Discord:** System tray → right-click Discord → **Quit Discord**, then open it again. A `Ctrl+R` is **not** enough the first time (the native side only loads on start).

7.  **Open it:** Home → **Nighty Tab**. Done.

---

## 🔧 ѕᴇᴛᴛɪɴɢѕ

| Setting | Default | Action |
| :--- | :---: | :--- |
| `Url` | `http://127.0.0.1/` | Page loaded in the tab. Any `http`/`https` URL. After changing it, press `Ctrl+R` once. |
| `Keep loaded in background` | `on` | Keeps the page alive when you leave the tab. Off = it unloads and reloads on every visit. |
| `Script Utils functions` | `off` | Shows **Download Script** on messages with attachments. |
| `Nighty Prefix` | — | One character sent before `dls` (e.g. `.`). Only visible with Script Utils on. |

---

## 🩺 ᴛʀᴏᴜʙʟᴇѕʜᴏᴏᴛɪɴɢ

| Symptom | Fix |
| :--- | :--- |
| Tab is black/empty | Nighty Web isn't running — open `http://127.0.0.1/` in a browser to check. |
| Still empty after enabling Web | Discord wasn't fully restarted. Quit it from the tray and reopen. |
| `ERR_ADDRESS_INVALID` in browser | You opened `0.0.0.0`. Use `127.0.0.1`. |
| Custom URL doesn't load | Press `Ctrl+R` after saving the new URL. |
| Can't close Discord to restart | Discord is running as administrator — close it from the tray or Task Manager. |

---

## 🤝 ᴄᴏɴᴛʀɪʙᴜᴛɪᴏɴ ᴀɴᴅ ѕᴜᴘᴘᴏʀᴛ

Contributions are welcome. If you find a bug or the tab stops loading after a Discord update:

1.  Fork the repository.
2.  Create a feature branch.
3.  Commit your improvements.
4.  Open a **Pull Request**.

---

## 📜 ʟɪᴄᴇɴѕᴇ

Feel free to do any u want with my scripts. God bless.

***
*Built with ❤️ by Bunny.*
