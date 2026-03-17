# MCP Setup Guide — Nook Island

MCP (Model Context Protocol) gives villagers real-world data access. All MCP features are **off by default** — activate them with `NOOK_MCP_ENABLED=1`.

## What each villager gets

| Villager | MCP server | What it does |
|---|---|---|
| **Sherb** 🐐 | Google Calendar | Checks upcoming deadlines/shoots before proposing a plan |
| **Lily** 🐸 | Gmail | Searches inbox for relevant emails/briefs before writing requirements |
| **Stitches** 🧸 | Web fetch | Fetches a reference URL from the task description to seed ideation |
| **Broccolo** 🐛 | Google Sheets | Appends a task log row to a live tracking spreadsheet |

Maple 🐻, Zucker 🐙, Marshal 🐿️, and Piper 🦜 are unchanged — their existing tools cover their needs.

---

## Credential files

All credentials live in:
```
~/Library/Application Support/NookIsland/credentials/
```

Create the directory if it doesn't exist:
```bash
mkdir -p ~/Library/Application\ Support/NookIsland/credentials/
```

---

## Pre-Auth Setup (run once from terminal — required for Calendar and Gmail)

> **Why this is necessary:** When Nook Island spawns Google Calendar or Gmail MCP servers during a task, the Claude Agent SDK expects the MCP protocol handshake to complete within seconds. If no cached OAuth token exists, the package blocks on the browser login flow first — the SDK times out before auth completes, the villager gracefully falls back to `⚠️ unavailable`, and **the token is never saved**. You must authenticate once from a terminal so the token is on disk before the app ever spawns the server.
>
> This is **only** required for Calendar and Gmail. Sheets uses a Service Account key (no browser, no timeout risk). Fetch has no auth at all.

### 1. Authenticate Calendar (one-time)

Place your `calendar-oauth.json` credentials file first (see step 3 of the Calendar section below), then run from terminal:

```bash
GOOGLE_OAUTH_CREDENTIALS=~/Library/Application\ Support/NookIsland/credentials/calendar-oauth.json \
GOOGLE_CALENDAR_MCP_TOKEN_PATH=~/Library/Application\ Support/NookIsland/credentials/calendar-tokens.json \
  npx -y @cocal/google-calendar-mcp
```

A browser opens → sign in with your Google account → grant Calendar access → press `Ctrl+C` when done.
Tokens are cached at `credentials/calendar-tokens.json` and reused on every subsequent launch.

### 2. Authenticate Gmail (one-time)

Place your `gmail-oauth.keys.json` credentials file first (see step 3 of the Gmail section below), then run from terminal:

```bash
GMAIL_OAUTH_PATH=~/Library/Application\ Support/NookIsland/credentials/gmail-oauth.keys.json \
GMAIL_CREDENTIALS_PATH=~/Library/Application\ Support/NookIsland/credentials/gmail-credentials.json \
  npx -y @gongrzhe/server-gmail-autoauth-mcp
```

A browser opens → sign in → grant Gmail read access → press `Ctrl+C` when done.
Credentials are written to `gmail-credentials.json` and reused on every subsequent launch.

---

## 1. Google Calendar (Sherb)

**Package:** `@cocal/google-calendar-mcp`

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a project
2. Enable **Google Calendar API**
3. Create **OAuth 2.0 credentials** → Desktop app → download JSON
4. Save as:
   ```
   ~/Library/Application Support/NookIsland/credentials/calendar-oauth.json
   ```
5. Run the one-time terminal pre-auth step in the **Pre-Auth Setup** section above before using the app.

---

## 2. Gmail (Lily)

**Package:** `@gongrzhe/server-gmail-autoauth-mcp`

**Setup:**
1. Same Google Cloud project → enable **Gmail API**
2. Create another OAuth 2.0 credential (or reuse the same one) → Desktop app → download JSON
3. Save as:
   ```
   ~/Library/Application Support/NookIsland/credentials/gmail-oauth.keys.json
   ```
4. Credentials are cached at:
   ```
   ~/Library/Application Support/NookIsland/credentials/gmail-credentials.json
   ```
   (this file is auto-created on first auth)
5. Run the one-time terminal pre-auth step in the **Pre-Auth Setup** section above before using the app.

---

## 3. Google Sheets (Broccolo)

**Package:** `mcp-gsheets`

**Setup (uses a Service Account — no browser auth needed):**
1. Same Google Cloud project → enable **Google Sheets API**
2. Create a **Service Account** → create a JSON key → download it
3. Save as:
   ```
   ~/Library/Application Support/NookIsland/credentials/sheets-service-account.json
   ```
4. Create a Google Sheet for your task log → share it with the Service Account email (from the JSON key, field `client_email`)
5. Set the Sheet ID env var (found in the Google Sheets URL):
   ```bash
   export NOOK_SHEETS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
   ```
   Add this to your shell profile or set it in the Electron launch command.

**Expected sheet structure (Broccolo auto-creates rows):**

| ISO Date | Task ID | Description (≤50 chars) | Villagers Used |
|---|---|---|---|
| 2026-03-17T14:22:00Z | task_1710684120000 | Write pitch deck for client X | stitches,maple,lily,zucker,marshal,piper |

---

## 4. Web Fetch (Stitches)

**Package:** `mcp-server-fetch` (Python — runs via `uvx`)

**Setup:**
1. Install [uv](https://docs.astral.sh/uv/getting-started/installation/):
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```
2. That's it — `uvx mcp-server-fetch` runs on demand, no further config.

---

## Activating MCP

### Development
```bash
NOOK_MCP_ENABLED=1 npm run dev
```

### With Sheets ID
```bash
NOOK_MCP_ENABLED=1 NOOK_SHEETS_ID=<your-sheet-id> npm run dev
```

### Permanent (add to your shell profile)
```bash
echo 'export NOOK_MCP_ENABLED=1' >> ~/.zshrc
echo 'export NOOK_SHEETS_ID=<your-sheet-id>' >> ~/.zshrc
```

---

## Graceful degradation

If any MCP server is unavailable (not installed, auth expired, network issue), the villager continues without it and notes `⚠️ [service] unavailable` in their bottle journey section. The pipeline never blocks on MCP failures.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Calendar or Gmail shows `⚠️ unavailable` on first run | OAuth must be pre-authenticated from terminal | Complete the **Pre-Auth Setup** steps above before running the app with `NOOK_MCP_ENABLED=1` |
| `uvx: command not found` | uv not installed | Run the uv install script above |
| Sheets write fails | Service account not shared on the sheet | Share the sheet with the `client_email` from your service account JSON |
| Lily searches Gmail but finds nothing | Search terms too broad/specific | Lily uses keywords from the task description — be specific in the task prompt |
