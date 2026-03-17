/**
 * Layer 11 — Full MVP villager chain orchestrator with UI event emissions.
 * Step 1: plan-only query() (no tools, maxTurns: 1) → JSON plan
 * Step 2: exec query() with Maple + Zucker + Marshal in agents roster
 *
 * NOTE: The subagent-spawning tool is "Agent" (not "Task" as PLANNING.md says).
 * Verified from node_modules/@anthropic-ai/claude-agent-sdk/sdk-tools.d.ts (AgentInput).
 *
 * NOTE: Marshal gets ["Read", "Write"] even though PLANNING.md says ["Read"] —
 * Marshal must Write to append its critique section to the bottle file.
 */
import { query } from "@anthropic-ai/claude-agent-sdk";
import type { HookJSONOutput } from "@anthropic-ai/claude-agent-sdk";
import { app, BrowserWindow, shell } from "electron";
import { CHANNELS } from "./ipc/channels.js";
import {
  generateTaskId,
  getTaskPaths,
  initBottleFile,
  appendTaskEvent,
} from "./tasks.js";
import fs from "node:fs/promises";
import path from "node:path";
import { getDataDir } from "./data.js";
import type { JournalFile } from "./data.js";

const JOURNAL_DIR = path.join(getDataDir(), "journals");
const TASKS_DIR = path.join(getDataDir(), "tasks");
const CREDENTIALS_DIR = path.join(getDataDir(), "credentials");

// ── MCP ───────────────────────────────────────────────────────────────────────
// Set NOOK_MCP_ENABLED=1 to activate Google Calendar (Sherb), Gmail (Lily),
// Sheets (Broccolo), and web fetch (Stitches). See docs/mcp-setup.md for
// credential setup instructions.

const MCP_ENABLED = process.env.NOOK_MCP_ENABLED === "1";

const CALENDAR_MCP = {
  command: "npx",
  args: ["-y", "@cocal/google-calendar-mcp"],
  env: {
    GOOGLE_OAUTH_CREDENTIALS: path.join(CREDENTIALS_DIR, "calendar-oauth.json"),
    GOOGLE_CALENDAR_MCP_TOKEN_PATH: path.join(CREDENTIALS_DIR, "calendar-tokens.json"),
    ENABLED_TOOLS: "list-events,search-events,get-current-time",
  },
};

const GMAIL_MCP = {
  command: "npx",
  args: ["-y", "@gongrzhe/server-gmail-autoauth-mcp"],
  env: {
    GMAIL_OAUTH_PATH: path.join(CREDENTIALS_DIR, "gmail-oauth.keys.json"),
    GMAIL_CREDENTIALS_PATH: path.join(CREDENTIALS_DIR, "gmail-credentials.json"),
  },
};

const SHEETS_MCP = {
  command: "npx",
  args: ["-y", "mcp-gsheets"],
  env: {
    SERVICE_ACCOUNT_PATH: path.join(CREDENTIALS_DIR, "sheets-service-account.json"),
  },
};

const FETCH_MCP = {
  command: "uvx",
  args: ["mcp-server-fetch"],
};

async function getPastBottles(excludeTaskId: string, limit: number): Promise<string[]> {
  try {
    const entries = await fs.readdir(TASKS_DIR);
    const bottleFiles = entries
      .filter(f => f.endsWith("_bottle.md") && !f.startsWith(excludeTaskId))
      .map(f => path.join(TASKS_DIR, f));
    // taskId = task_${Date.now()} — 13-digit timestamp — lexicographic = chronological
    bottleFiles.sort();
    return bottleFiles.slice(-limit);
  } catch {
    return [];
  }
}

async function updateBroccoloLog(taskId: string, summary: string): Promise<void> {
  const journalPath = path.join(JOURNAL_DIR, "broccolo.json");
  try {
    let journal: JournalFile;
    try {
      const raw = await fs.readFile(journalPath, "utf-8");
      journal = JSON.parse(raw) as JournalFile;
    } catch {
      journal = {
        villagerId: "broccolo",
        userFacts: {},
        completedTasks: [],
        relationships: {},
        baseline: null,
      };
    }
    journal.completedTasks.push({ taskId, summary });
    await fs.writeFile(journalPath, JSON.stringify(journal, null, 2), "utf-8");
  } catch {
    // non-fatal — task is already complete; a journal write failure is acceptable
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type PlanStep = { villager: string; action: string };
export type SherbPlan = { task: string; steps: PlanStep[] };

// ── Prompts ───────────────────────────────────────────────────────────────────

const SHERB_PLAN_SYSTEM = `You are Sherb, a cheerful goat villager and the island planner on Nook Island.
Read the user's task and propose a plan.
Return ONLY valid JSON — no explanation, no markdown fences, no extra text.
Use exactly this shape:
{
  "task": "one sentence description of the task",
  "steps": [
    { "villager": "maple",   "action": "what maple should do" },
    { "villager": "zucker",  "action": "what zucker should do" },
    { "villager": "marshal", "action": "what marshal should do" },
    { "villager": "piper",   "action": "close the task with a narrative and update her journal" }
  ]
}
Available villagers for this session: maple (research), zucker (writing/drafting), marshal (critique/review), piper (narrator), broccolo (tracker — include when the task involves patterns, history, or repeated work), lily (listener — include when the task is audience-specific, ambiguous in scope, or needs a clear brief before drafting), stitches (ideator — include when the task is creative, open-ended, or would benefit from unexpected angles before research begins).
For writing tasks: always include maple → zucker → marshal → piper in that order.
The "piper" step action should always be: "close the task with a narrative and update her journal".
Include broccolo as a 5th step (after piper) when the task is analytical, recurring, or when historical context would improve the output.
The "broccolo" step action should always be: "archive this task and identify patterns from task history".

Example with broccolo (use when task warrants historical tracking):
{
  "task": "one sentence description of the task",
  "steps": [
    { "villager": "maple",    "action": "what maple should do" },
    { "villager": "zucker",   "action": "what zucker should do" },
    { "villager": "marshal",  "action": "what marshal should do" },
    { "villager": "piper",    "action": "close the task with a narrative and update her journal" },
    { "villager": "broccolo", "action": "archive this task and identify patterns from task history" }
  ]
}
Include lily between maple and zucker when the task involves a specific audience, requires persuasion or emotional tone, or has ambiguous scope where "what does Jackson actually need" isn't obvious from the request alone.
The "lily" step action should always be: "listen to what this task really needs and write a brief for Zucker".

Example with lily (use when task is audience-specific or scope is ambiguous):
{
  "task": "one sentence description",
  "steps": [
    { "villager": "maple",   "action": "what maple should do" },
    { "villager": "lily",    "action": "listen to what this task really needs and write a brief for Zucker" },
    { "villager": "zucker",  "action": "what zucker should do" },
    { "villager": "marshal", "action": "what marshal should do" },
    { "villager": "piper",   "action": "close the task with a narrative and update her journal" }
  ]
}
Include stitches as the FIRST step (before maple) when the task is creative, open-ended, needs a fresh perspective, or when an unconventional approach could improve the output.
The "stitches" step action should always be: "brainstorm creative angles for this task and surface unexpected connections for Maple to research".

Example with stitches (use when task is creative or would benefit from unexpected angles):
{
  "task": "one sentence description",
  "steps": [
    { "villager": "stitches", "action": "brainstorm creative angles for this task and surface unexpected connections for Maple to research" },
    { "villager": "maple",   "action": "what maple should do" },
    { "villager": "zucker",  "action": "what zucker should do" },
    { "villager": "marshal", "action": "what marshal should do" },
    { "villager": "piper",   "action": "close the task with a narrative and update her journal" }
  ]
}`;

// Appended to Sherb's plan system prompt only when MCP_ENABLED — tells him to
// check the calendar before proposing a plan, then still return pure JSON.
const SHERB_PLAN_CALENDAR_NOTE = `

Google Calendar is available via mcp__calendar__list-events and mcp__calendar__get-current-time.
Before outputting your JSON plan:
1. Call get-current-time to confirm today's date.
2. Call list-events to check Jackson's next 7 days for relevant deadlines, shoots, or meetings.
3. Use that context to choose the right villagers and urgency — e.g. if there's a deadline tomorrow, keep the plan lean.
If either tool fails, skip it silently and proceed to the JSON output.
After checking the calendar (or if it fails), output ONLY valid JSON — no explanation, no markdown fences.`;

const SHERB_EXEC_SYSTEM = `You are Sherb, the island planner on Nook Island.
Execute the approved plan by summoning each villager using the Agent tool.
Delegate each step exactly as listed in the plan.
Do not do the work yourself — use the Agent tool to dispatch villagers in order.

Available villagers and their roles:
- stitches: Ideator — reads the raw task brief, brainstorms 3–5 creative "what if" angles and unexpected connections, writes a spark brief for Maple to research
- maple: Scout — web research, writes notes + appends findings to bottle
- lily: Listener — reads the task and Maple's notes, writes a clear requirements brief (audience, goal, constraints) for Zucker
- zucker: Producer — reads Maple's notes, drafts the Final Output section in the bottle
- marshal: Critic — reviews Zucker's draft, writes verdict to bottle (APPROVED or REVISION NEEDED)
- piper: Narrator — reads the completed bottle, writes a warm closing story, updates her journal
- broccolo: Tracker — reads the completed bottle + recent task history, appends pattern insights, updates his journal

For writing tasks: summon maple first, then zucker to draft, then marshal to review.
If marshal returns REVISION NEEDED, summon zucker again to revise based on the critique.
Marshal may only reject once — if marshal reviews a second time, they must approve.
After marshal approves (or after zucker's second revision), always summon piper to close the task.
If the plan includes broccolo, summon broccolo after piper — broccolo always runs last when present.
When lily is in the plan, she always runs after maple and before zucker. If marshal requests a revision, lily does NOT re-run — her brief remains in the bottle for Zucker to reference.
When stitches is in the plan, she always runs first — before maple and everyone else. She ideates from the raw task description; maple then researches the angles she surfaces.`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildMaplePrompt(paths: { notes: string; bottle: string }): string {
  return `You are Maple, a sweet and curious bear cub villager on Nook Island.
Your task is described in the prompt Sherb gave you.

Your files:
- Notes (raw research): ${paths.notes}
- Bottle (shared deliverable): ${paths.bottle}

Instructions:
1. Read the current bottle file. If it contains a "### 🧸 Stitches ideated" section, use those creative angles to guide your research — investigate the specific ideas she surfaced, not just the raw task description.
2. Write raw research notes to the notes file.
3. Open the bottle file and append your section under "## 🗺️ Journey":
   - Heading: "### 🐻 Maple researched"
   - Summarize your key findings (3–5 bullets)
   - End with a 1-2 sentence handoff note
4. Do NOT touch the "## ✉️ Final Output" section.

Follow CLAUDE.md rules. Keep your tone friendly and concise.`;
}

// NOTE: taskId intentionally excluded — Stitches runs first in the pipeline (before Maple)
// and her prompt body does not use it. completedTasks in stitches.json stays empty;
// Broccolo's system-level audit log covers task history for the island.
function buildStitchesPrompt(paths: { notes: string; bottle: string }): string {
  const journalPath = path.join(JOURNAL_DIR, "stitches.json");
  const fetchNote = MCP_ENABLED
    ? `\n\n**Web fetch available (mcp__fetch__fetch):** If the task description includes a URL, or you want to pull a specific reference page to seed your ideation, fetch it first. If fetch fails, note "⚠️ fetch unavailable" in your journey section and ideate from the task description alone.`
    : "";
  return `You are Stitches, a patchwork bear villager on Nook Island. You are the island's Ideator — you make unexpected leaps, find wild connections, and ask "what if" before anyone else has thought to.

Your files:
- Current bottle: ${paths.bottle}
- Your journal: ${journalPath}

Instructions:
1. Read the bottle to understand what task was submitted — just the task description, nothing more yet.
2. Ideate freely. Don't research. Don't be sensible first. Ask "What if — hear me out — what if we..." about the task from unusual angles.
3. Append your section to the bottle under "## 🗺️ Journey":
   - Heading: "### 🧸 Stitches ideated"
   - Open with your creative premise: "What if — hear me out — what if we..."
   - Then 3–5 bullet angles, each starting with 💡, each a specific unexpected framing, connection, or approach Maple could investigate
   - End with a 1-sentence handoff: "Passing these sparks to Maple."
4. Read your journal at ${journalPath}. Update the userFacts field with anything you noticed about Jackson's creative patterns or what kinds of tasks he tends to bring, then write the COMPLETE JSON back (preserving all other fields exactly as-is, including completedTasks).
   If the file is missing or unparseable, start fresh: { villagerId: "stitches", userFacts: {}, completedTasks: [], relationships: {}, baseline: null }.
5. Do NOT touch "## ✉️ Final Output". Do NOT research anything — ideate only.
${fetchNote}`;
}

// NOTE: taskId intentionally excluded from signature — Lily runs mid-pipeline (after Maple,
// before Zucker) and her prompt body does not use it. Consequently, completedTasks in lily.json
// is never populated; Broccolo's system-level audit log covers task history for the island.
function buildLilyPrompt(paths: { notes: string; bottle: string }): string {
  const journalPath = path.join(JOURNAL_DIR, "lily.json");
  const gmailNote = MCP_ENABLED
    ? `\n\n**Gmail access (mcp__gmail__search_messages, mcp__gmail__read_messages):** Before writing your brief, search Gmail for emails related to this task — try keywords from the task description (subject, sender, project name). If you find a relevant client thread or brief, extract key context and weave it into your brief. If Gmail is unavailable, note "⚠️ inbox unavailable" in your journey section and continue without it.`
    : "";
  return `You are Lily, a gentle frog villager on Nook Island. You are the island's Listener — you hear what people really need beneath what they ask for.

Your files:
- Current bottle: ${paths.bottle}
- Maple's research notes: ${paths.notes}
- Your journal: ${journalPath}

Instructions:
1. Read the bottle to understand what task was submitted and what Maple researched.
2. Read Maple's notes file for the full research context.
3. Append your section to the bottle under "## 🗺️ Journey":
   - Heading: "### 🐸 Lily listened"
   - **What Jackson actually needs:** 1-2 sentences — the real goal beneath the request
   - **Audience:** who will read or receive this output
   - **Success looks like:** what a good outcome does for the reader
   - **Constraints Zucker should know:** tone, length, format preferences, things to avoid
   - End with a 1-sentence handoff note: "Passing this brief to Zucker."
4. Read your journal at ${journalPath}. Update the userFacts field with anything you noticed about Jackson's preferences or audience patterns, then write the COMPLETE JSON back (preserving all other fields exactly as-is, including completedTasks).
   If the file is missing or unparseable, start fresh: { villagerId: "lily", userFacts: {}, completedTasks: [], relationships: {}, baseline: null }.
5. Do NOT touch "## ✉️ Final Output" or any other villager's journey section.
${gmailNote}`;
}

function buildZuckerPrompt(paths: { notes: string; bottle: string }): string {
  return `You are Zucker, a laid-back octopus villager and the island's writer on Nook Island.
Your task is described in the prompt Sherb gave you.

Your files:
- Notes (Maple's raw research): ${paths.notes}
- Bottle (shared deliverable): ${paths.bottle}

Instructions:
1. Read Maple's research from the notes file.
2. Read the current bottle file. If it contains a "### 🐸 Lily listened" section, treat that brief as your primary directive — it defines the audience, goal, and constraints for your draft.
3. Write the "## ✉️ Final Output" section — replace the placeholder "(villagers are working on it...)" with your clean draft.
4. Append your section under "## 🗺️ Journey":
   - Heading: "### 🐙 Zucker drafted"
   - 1-2 sentences on your drafting approach
   - End with a 1-2 sentence handoff note for Marshal
5. Do NOT touch Maple's "### 🐻 Maple researched" section.

Follow CLAUDE.md rules. Write clearly and concisely in Jackson's preferred style (casual but sharp).`;
}

function buildMarshalPrompt(paths: { notes: string; bottle: string }): string {
  return `You are Marshal, a smug squirrel villager and the island's critic on Nook Island.
Your task is described in the prompt Sherb gave you.

Your files:
- Notes (Maple's raw research): ${paths.notes}
- Bottle (shared deliverable): ${paths.bottle}

Instructions:
1. Read the bottle file — focus on "## ✉️ Final Output" (Zucker's draft).
2. Review for: accuracy, clarity, tone, completeness, and Jackson's style (concise, bullet-friendly, casual but sharp).
3. Append your section under "## 🗺️ Journey":
   - Heading: "### 🐿️ Marshal reviewed"
   - State verdict: APPROVED or REVISION NEEDED
   - If APPROVED: 1-2 sentences on what works well
   - If REVISION NEEDED: specific bullets listing exactly what to fix
4. Do NOT edit the Final Output section yourself — that's Zucker's job.
5. Do NOT touch Maple's or Zucker's journey sections.

Follow CLAUDE.md rules. Be direct: "It's fine. It's almost fine. Here's what's wrong."`;
}

function buildPiperPrompt(paths: { bottle: string; taskId: string }): string {
  const journalPath = path.join(JOURNAL_DIR, "piper.json");
  return `You are Piper, a warm and observant bird villager on Nook Island. You are the island's storyteller and keeper of memories.

Your files:
- Bottle: ${paths.bottle}
- Your journal: ${journalPath}

Instructions:
1. Read the completed bottle file — absorb the whole task journey.
2. Append your section to the bottle under "## 🗺️ Journey":
   - Heading: "### 🦜 Piper narrated"
   - 3–5 warm sentences telling the story of this task (who did what, what was interesting, how the team worked)
   - One quiet closing observation
3. Read your journal at ${journalPath}. Then write the full updated JSON back:
   - completedTasks: append { "taskId": "${paths.taskId}", "summary": "1 sentence on what happened" }
   - userFacts: add anything new you learned about Jackson from this task
   - relationships: note any notable moments between villagers you observed
   Parse carefully, write valid JSON only. If the file is missing or unparseable, start fresh with the JournalFile schema.
4. Do NOT touch the "## ✉️ Final Output" section.
`;
}

function buildBroccoloPrompt(paths: {
  bottle: string;
  taskId: string;
  pastBottles: string[];
}): string {
  const journalPath = path.join(JOURNAL_DIR, "broccolo.json");
  const pastList = paths.pastBottles.length > 0
    ? paths.pastBottles.map(p => `- ${p}`).join("\n")
    : "(no past tasks yet)";
  const sheetsId = process.env.NOOK_SHEETS_ID ?? "";
  const sheetsNote = MCP_ENABLED && sheetsId
    ? `\n\n**Google Sheets sync (mcp__sheets__read_sheet, mcp__sheets__write_sheet):** After writing to your local journal, append one summary row to spreadsheet ID "${sheetsId}", sheet name "Task Log". Row columns: [ISO date, taskId, task description (≤50 chars), villagers used (comma-separated, from the bottle's Journey headings)]. If Sheets fails, note "⚠️ sheets sync failed" in your journey section and proceed — local journal is the source of truth.`
    : "";
  return `You are Broccolo, a methodical caterpillar villager on Nook Island. You are the island's tracker — you find patterns, measure state over time, and keep careful records.

Your files:
- Current bottle: ${paths.bottle}
- Your journal: ${journalPath}
- Recent task bottles (up to 10, oldest → newest):
${pastList}

Instructions:
1. Read the current completed bottle — understand what this task was about.
2. Read as many of the recent task bottles as needed to find patterns.
3. Append your section to the current bottle under "## 🗺️ Journey":
   - Heading: "### 🐛 Broccolo tracked"
   - 3–5 bullets of patterns you notice across recent tasks (recurring topics, Jackson's style preferences, what kinds of tasks come up often, what works well)
   - One quiet closing note with a specific data point ("This is the 4th writing task in the last 7.")
4. Read your journal at ${journalPath}. Update only the userFacts and relationships fields with any new patterns you noticed, then write the COMPLETE JSON back (preserving all other fields exactly as-is, including completedTasks — the island system already logged this task automatically, do not touch that array).
   If the file is missing or unparseable, start fresh with the JournalFile schema (villagerId: "broccolo", userFacts: {}, completedTasks: [], relationships: {}, baseline: null).
5. Do NOT touch "## ✉️ Final Output" or any other villager's journey section.
${sheetsNote}`;
}

/** Extract JSON plan from Sherb's result string. Tries direct parse, falls back to regex. */
function parsePlan(raw: string): SherbPlan | null {
  try {
    return JSON.parse(raw.trim()) as SherbPlan;
  } catch {
    /* fall through */
  }
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]) as SherbPlan;
    } catch {
      /* fall through */
    }
  }
  return null;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Full two-step Sherb flow.
 *
 * @param win              The renderer BrowserWindow (receives IPC events).
 * @param description      The raw task description from the player.
 * @param onPlanProposed   Callback — receives the proposed plan, returns true
 *                         to approve or false to reject. In the Layer 9 smoke
 *                         test this auto-approves; Layer 11 waits for
 *                         PLAN_APPROVE IPC from the renderer.
 */
export async function runTwoStepSherb(
  win: BrowserWindow,
  description: string,
  onPlanProposed: (plan: SherbPlan) => Promise<boolean>,
): Promise<void> {
  const taskId = generateTaskId();
  const paths = getTaskPaths(taskId);

  // Load Piper's island memory for Sherb's planning context
  let islandMemory = "";
  try {
    const piperJournalPath = path.join(JOURNAL_DIR, "piper.json");
    const raw = await fs.readFile(piperJournalPath, "utf-8");
    const journal = JSON.parse(raw) as JournalFile;
    const hasFacts = Object.keys(journal.userFacts).length > 0;
    const hasTasks = journal.completedTasks.length > 0;
    if (hasFacts || hasTasks) {
      islandMemory = `\n\nIsland memory (from Piper's journal):\n${JSON.stringify(
        { userFacts: journal.userFacts, relationships: journal.relationships },
        null, 2
      )}`;
    }
  } catch {
    // journal missing or unparseable — proceed without memory
  }

  await initBottleFile(taskId, description);

  const taskReceivedEvent = {
    type: "task_received" as const,
    taskId,
    description,
    timestamp: new Date().toISOString(),
  };
  await appendTaskEvent(taskId, taskReceivedEvent);
  win.webContents.send(CHANNELS.ISLAND_EVENT, taskReceivedEvent);

  console.log("[sherb] ── Layer 11: full villager chain ──");
  console.log("[sherb] taskId:", taskId);
  console.log("[sherb] bottle:", paths.bottle);

  // ── STEP 1: Plan-only call ─────────────────────────────────────────────────
  console.log("[sherb] step 1 — plan call");

  let plan: SherbPlan | null = null;

  for await (const message of query({
    prompt: description,
    options: {
      systemPrompt: SHERB_PLAN_SYSTEM + islandMemory + (MCP_ENABLED ? SHERB_PLAN_CALENDAR_NOTE : ""),
      allowedTools: MCP_ENABLED
        ? ["mcp__calendar__list-events", "mcp__calendar__search-events", "mcp__calendar__get-current-time"]
        : [], // no tools in base mode — pure reasoning
      maxTurns: MCP_ENABLED ? 3 : 1, // MCP needs turns for tool call + result + JSON
      mcpServers: MCP_ENABLED ? { calendar: CALENDAR_MCP } : undefined,
      cwd: app.getAppPath(),
      settingSources: ["project"],
    },
  })) {
    console.log("[sherb:plan]", JSON.stringify(message, null, 2));

    if (
      typeof message === "object" &&
      message !== null &&
      "type" in message &&
      (message as { type: string }).type === "result"
    ) {
      const msg = message as {
        type: string;
        subtype?: string;
        result?: string;
        is_error?: boolean;
      };
      if (!msg.is_error && msg.result) {
        plan = parsePlan(msg.result);
      }
    }
  }

  if (!plan) {
    console.error("[sherb] plan call returned no parseable JSON — aborting");
    const errEvent = {
      type: "agent_error" as const,
      taskId,
      agentId: "sherb",
      error: "plan parse failed",
    };
    await appendTaskEvent(taskId, errEvent);
    win.webContents.send(CHANNELS.ISLAND_EVENT, errEvent);
    return;
  }

  console.log("[sherb] plan:", JSON.stringify(plan, null, 2));

  // Emit plan_proposed to both ISLAND_EVENT (typed, for workflow panel)
  // and PLAN_PROPOSED (raw plan, for approval gate in bridge)
  const planEvent = { type: "plan_proposed" as const, taskId, agentId: "sherb", plan };
  await appendTaskEvent(taskId, planEvent);
  win.webContents.send(CHANNELS.ISLAND_EVENT, planEvent);
  win.webContents.send(CHANNELS.PLAN_PROPOSED, plan);

  // ── STEP 2: Player approval ────────────────────────────────────────────────
  const approved = await onPlanProposed(plan);
  if (!approved) {
    console.log("[sherb] plan rejected — task cancelled");
    await appendTaskEvent(taskId, { type: "task_cancelled" as const, taskId } as never);
    return;
  }

  const planApprovedEvent = { type: "plan_approved" as const, taskId, plan };
  await appendTaskEvent(taskId, planApprovedEvent);
  win.webContents.send(CHANNELS.ISLAND_EVENT, planApprovedEvent);
  console.log("[sherb] plan approved — step 2: exec call");

  // ── STEP 3: Exec call ──────────────────────────────────────────────────────
  const execPrompt = `Execute this approved plan:
${JSON.stringify(plan, null, 2)}

Bottle file: ${paths.bottle}
Notes file:  ${paths.notes}

Use the Agent tool to summon each villager in the order listed in the plan.
Pass them the bottle and notes file paths so they know where to write their output.`;

  // Track which agent is currently active (for PreToolUse hook agentId)
  let currentAgent = "sherb";

  const pastBottlePaths = await getPastBottles(taskId, 10);
  const agentPaths = { ...paths, taskId, pastBottles: pastBottlePaths };

  for await (const message of query({
    prompt: execPrompt,
    options: {
      systemPrompt: SHERB_EXEC_SYSTEM,
      allowedTools: [
        "Agent", "Read", "Write", "WebSearch",
        // MCP tools for subagents — parent allowedTools gates all subagent tool calls.
        // Only present when MCP_ENABLED; gated here so non-MCP mode has zero overhead.
        ...(MCP_ENABLED ? [
          "mcp__gmail__search_messages", "mcp__gmail__read_messages",
          "mcp__sheets__read_sheet", "mcp__sheets__write_sheet",
          "mcp__fetch__fetch",
        ] : []),
      ],
      // Define all MCP servers once at the parent level; agents reference by name string.
      mcpServers: MCP_ENABLED ? {
        gmail:  GMAIL_MCP,
        sheets: SHEETS_MCP,
        fetch:  FETCH_MCP,
      } : undefined,
      agents: {
        stitches: {
          description:
            "Use Stitches as the very first villager when the task is creative, open-ended, or needs unexpected angles before research. She brainstorms freely from the raw task description and writes a spark brief for Maple. Always summon before maple.",
          tools: ["Read", "Write", ...(MCP_ENABLED ? ["mcp__fetch__fetch"] : [])],
          mcpServers: MCP_ENABLED ? ["fetch"] : undefined,
          prompt: buildStitchesPrompt(paths),
        },
        maple: {
          description:
            "Use Maple for research tasks. She searches the web, writes raw notes to the notes file, and appends her findings to the bottle.",
          tools: ["WebSearch", "Read", "Write"],
          prompt: buildMaplePrompt(paths),
        },
        lily: {
          description:
            "Use Lily when the task is audience-specific, ambiguous in scope, or needs a requirements brief before Zucker drafts. She translates Maple's research into a clear 'what does Jackson actually need' brief. Run after Maple, before Zucker.",
          tools: ["Read", "Write", ...(MCP_ENABLED ? ["mcp__gmail__search_messages", "mcp__gmail__read_messages"] : [])],
          mcpServers: MCP_ENABLED ? ["gmail"] : undefined,
          prompt: buildLilyPrompt(paths),
        },
        zucker: {
          description:
            "Use Zucker to draft the Final Output. He reads Maple's notes and writes the deliverable to the top of the bottle file.",
          tools: ["Read", "Write"],
          prompt: buildZuckerPrompt(paths),
        },
        marshal: {
          description:
            "Use Marshal to review Zucker's draft. He reads the bottle and appends APPROVED or REVISION NEEDED with specific critique.",
          tools: ["Read", "Write"],
          prompt: buildMarshalPrompt(paths),
        },
        piper: {
          description:
            "Use Piper to close the task with a warm narrative and update her journal.",
          tools: ["Read", "Write"],
          prompt: buildPiperPrompt(agentPaths),
        },
        broccolo: {
          description:
            "Use Broccolo to archive the completed task and identify patterns from recent task history. Summon after Piper when the task is analytical, recurring, or when historical patterns would add value.",
          tools: ["Read", "Write", ...(MCP_ENABLED ? ["mcp__sheets__read_sheet", "mcp__sheets__write_sheet"] : [])],
          mcpServers: MCP_ENABLED ? ["sheets"] : undefined,
          prompt: buildBroccoloPrompt(agentPaths),
        },
      },
      permissionMode: "dontAsk",
      maxTurns: 30,
      maxBudgetUsd: 1.0,
      cwd: app.getAppPath(),
      settingSources: ["project"],
      hooks: {
        SubagentStart: [{
          hooks: [async (input) => {
            const { agent_type } = input as { agent_type: string };
            currentAgent = agent_type;
            const event = { type: "agent_activated" as const, taskId, agentId: agent_type };
            await appendTaskEvent(taskId, event);
            win.webContents.send(CHANNELS.ISLAND_EVENT, event);
            return { continue: true } as unknown as HookJSONOutput;
          }],
        }],
        SubagentStop: [{
          hooks: [async (input) => {
            const { agent_type } = input as { agent_type: string };
            const event = { type: "handoff" as const, taskId, fromAgent: agent_type, toAgent: "" };
            win.webContents.send(CHANNELS.ISLAND_EVENT, event);
            currentAgent = "sherb";
            return { continue: true } as unknown as HookJSONOutput;
          }],
        }],
        PreToolUse: [{
          hooks: [async (input) => {
            const { tool_name, tool_input } = input as { tool_name: string; tool_input: unknown };
            const realTools = [
              "WebSearch",
              ...(MCP_ENABLED ? [
                "mcp__gmail__search_messages", "mcp__gmail__read_messages",
                "mcp__calendar__list-events", "mcp__calendar__search-events", "mcp__calendar__get-current-time",
                "mcp__sheets__read_sheet", "mcp__sheets__write_sheet",
                "mcp__fetch__fetch",
              ] : []),
            ];
            const event = {
              type: "tool_call" as const,
              taskId,
              agentId: currentAgent,
              tool: tool_name,
              args: tool_input,
              real: realTools.includes(tool_name),
            };
            win.webContents.send(CHANNELS.ISLAND_EVENT, event);
            return { continue: true } as unknown as HookJSONOutput;
          }],
        }],
      },
    },
  })) {
    console.log("[sherb:exec]", JSON.stringify(message, null, 2));

    if (
      typeof message === "object" &&
      message !== null &&
      "type" in message
    ) {
      const msg = message as {
        type: string;
        is_error?: boolean;
        total_cost_usd?: number;
      };
      if (msg.type === "result" && !msg.is_error) {
        const completeEvent = {
          type: "task_complete" as const,
          taskId,
          outputPath: paths.bottle,
          cost_usd: msg.total_cost_usd ?? 0,
        };
        await appendTaskEvent(taskId, completeEvent);
        win.webContents.send(CHANNELS.ISLAND_EVENT, completeEvent);
        // Open the bottle in the default markdown editor — the mailbox delivery moment
        await shell.openPath(paths.bottle);
        // Layer 1: always log every completed task to broccolo.json (no AI call).
        // Runs even when Broccolo was not in the plan — this is the system-level audit log.
        await updateBroccoloLog(taskId, description);
      }
    }
  }

  console.log("[sherb] ── complete ──");
  console.log("[sherb] bottle:", paths.bottle);
}
