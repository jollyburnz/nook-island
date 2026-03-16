# Nook Island — Planning Document

> A cozy Animal Crossing-style productivity tool powered by AI agents.
> Every decision made in the planning phase is recorded here.
> This is the source of truth — not the chat history.
> Last updated: 2026-03-16 — Broccolo (data keeper) + Piper (narrator) shipped; all 12 build layers complete

---

## App Identity

```
App name:       Nook Island
Repo folder:    nook-island/
Bundle ID:      com.jackson.nookisland
Data path:      ~/Library/Application Support/NookIsland/
CLAUDE.md path: nook-island/CLAUDE.md  (auto-read by every subprocess)
Dock name:      Nook Island
Target user:    Jackson — personal tool, not shared
Platform:       macOS first (Electron, DMG)
```

---

## Vision

Nook Island is a productivity tool with a game skin. Villagers are autonomous AI agents powered by the Claude Agent SDK — they have real tools, real filesystem access, and real MCP connections to your actual Gmail and Google Calendar. Like n8n workflows, each villager runs a pipeline: **Perceive → Think → Plan → Act → Memory**. The Animal Crossing aesthetic is the engagement layer that makes it feel less like staring at a terminal.

The core loop: you drop a task into the Town Hall and watch agents genuinely collaborate. The JSONL stream is their nervous system and your live audit trail. Final outputs are real `.md` files on your disk, openable in any editor.

---

## Player Role

**Hybrid, skewed toward Director.**

- Drop a task into the Town Hall
- Sherb (Planner) proposes which villagers to summon and in what order
- You review and approve the plan — nothing executes until you say go
- Watch the workflow panel as agents execute in real time
- Final output lands in your mailbox as a real `.md` file
- Output opens in your default markdown editor with one click

---

## The Bottle Mechanic

**Each task gets a fresh agent context.** The game metaphor is a **message in a bottle**.

When you drop a task, it washes up on the beach as a bottle. Each villager picks it up, reads it fresh, does their work, then seals their response and passes it down the beach to the next agent.

| Game Element | Technical Reality |
|---|---|
| 🍶 Message in a bottle | Fresh subagent context per villager |
| 📖 Villager's journal at home | Long-term file-based memory |
| 🏖️ Bottle washing up on shore | Player dropping a new task |
| 🤝 Passing bottle down the beach | Subagent result summary returned to Sherb |
| 📬 Bottle reaching the mailbox | `_bottle.md` — the complete deliverable |

**The bottle IS the output.** A single `_bottle.md` file accumulates content as it travels between villagers. When it reaches the mailbox, that exact file is what the player receives and uses. Like a physical letter passed between people — final output at the top for immediate use, full journey below for curiosity or auditing.

**Key SDK behavior:** Each subagent runs in its own fresh context window. Intermediate tool calls stay inside the subagent — only the final summary returns to Sherb. Maple's full web search never pollutes Zucker's context. The bottle mechanic works natively.

**Evolved analogy:** The bottle is a living document, not a data structure. Each villager appends their contribution in their own voice. The player unfolds it and the whole story is there — output and journey together.

**Game inspiration:** Stardew Valley's new-day reset — the world refreshes but memory crystallizes into permanent progress.

### The Bottle File Format

```markdown
# 🍶 [Task Title]
> Completed · [N] villagers · $[cost] · [date]

---

## ✉️ Final Output

[clean, immediately usable output here — top of file]

---

## 🗺️ Journey

### 🐻 Maple researched
[key findings, sources, what she found]

### 🐙 Zucker drafted
[original draft]

### 🐿️ Marshal reviewed
Critique: [what Marshal flagged]
Revision requested.

### 🐙 Zucker revised
[revised draft]

### 🐦 Piper formatted
[formatting notes — tone adjusted, length trimmed, etc.]
```

The final output is always at the top — player copies and uses it immediately. The journey section below is optional reading but always present. Sherb's surprise choices and Marshal's critique trail are all visible.

### Complementary Files

The bottle file is human-readable. The JSONL stream is machine-readable. Both always written. Neither replaces the other.

```
tasks/{taskId}_bottle.md     ← THE deliverable — human-readable journey + output
tasks/{taskId}_notes.md      ← Maple's raw research (lean, separate from bottle)
tasks/{taskId}.jsonl         ← machine-readable event stream (audit trail)
```

No separate `outputs/` folder needed. The bottle file is what the mailbox opens.

---

## Bottle State Machine

Every state the bottle can be in at any given moment:

```
FORMING     → Lily validating task, bottle not yet created
PLANNING    → Sherb reading task, proposing plan
WAITING     → Player reviewing plan, nothing running
TRAVELING   → Active villager working on bottle
REVERSING   → Marshal sent it back for revision
FROZEN      → Budget cap or max turns hit, awaiting player decision
DRIFTING    → Error state, bottle returning to shore
DELIVERED   → Final output in mailbox
CANCELLED   → Player stopped task, bottle washed out to sea
INCOMPLETE  → Player accepted partial output, bottle retired
```

Each state has a distinct visual in both the beach animation and the workflow panel node colors.

---

## Bottle Scenarios — Every Path

### Scenario 1 — The Happy Path

```
1. Bottle washes up on beach          → bottle bobs in from water
2. Sherb walks to beach, reads it     → thought bubble appears
3. Sherb seals plan, passes forward   → lavender wax seal
4. Each villager picks up, contributes, reseals with their color
5. Final bottle reaches mailbox       → flag goes up, bell rings
6. Player opens mailbox               → _final.md opens in editor
```

Visual: bottle physically travels the beach path connecting each villager's home location. Wax seal color changes with each handoff, leaving a visible trail of who touched it.

---

### Scenario 2 — Marshal Sends It Back (Revision Loop)

The only planned direction reversal. Marshal can reject once — never twice.

```
1. Marshal reads Zucker's draft
2. Marshal adds critique, reseals with RED wax
3. Bottle travels BACKWARD on beach toward library dock
4. Workflow panel: "Marshal returned the bottle ↩"
5. Zucker receives it, sees critique, rewrites
6. Zucker reseals with teal wax, passes forward again
7. Marshal reviews revised draft — must approve this time
   (hard rule: Marshal cannot send back twice)
```

Visual distinction: bottle traveling backward vs. forward on beach path. Red wax = rejection. Only scenario with reverse motion.

---

### Scenario 3 — Listener Rejects Task (Output Type)

Happens before any bottle forms. Lily intercepts at the waterline.

```
1. Player submits: "Make me a cooking video"
2. Lily appears at water's edge before bottle forms
3. Lily speaks: "I want to make sure I understand what you mean by..."
4. Workflow panel toast: "Lily flagged this — needs a reframe"
5. Lily proposes: "I can't produce a video file, but I can produce
   a full production package — script, shot list, hook, captions"
6. Player sees: [Accept Reframe] [Cancel]
7. Accept → bottle forms with new description, journey begins
8. Cancel → bottle never forms, Lily returns to river bend
```

Visual: Lily standing at the waterline holding up her hand. Bottle outline fades before reaching shore.

---

### Scenario 4 — Agent Error (API failure, timeout)

Bottle drifts back. Amber state — not a failure, a setback.

```
1. Maple is mid-search when API errors
2. Maple's thought stream stops mid-sentence in workflow panel
3. Bottle slowly drifts back down beach toward shore
4. Maple's in-character note on returned bottle:
   "Ooh... something went wrong. I was right in the middle of
    finding something good too. Want me to try again?"
5. Sherb walks to beach, stands beside bottle
6. Player sees: [Retry] [Cancel task]
7. Retry → Maple picks up bottle again, notes file preserved
8. Cancel → bottle washes out to sea
```

Visual: amber wax drip appears on seal. Bottle drift animation (not wash — gentle return). Workflow node turns amber, not red.

---

### Scenario 5 — Budget Cap Hit ($2.00)

Hard stop. Treated as a signal, not a failure. Only scenario showing mid-task cost.

```
1. Bottle is mid-journey — e.g. Zucker is writing
2. Budget cap hit — SDK stops cleanly
3. Bottle freezes mid-beach
4. Sherb walks out, examines frozen bottle
5. Sherb's note: "Hmm... this task got quite expensive.
   We spent $2.00 and Zucker was still working."
6. Player sees:
   - Partial output so far
   - Cost breakdown: "$0.34 Maple · $0.89 Zucker (partial)"
   - [Continue — raise limit to $5] [Take what we have] [Cancel]
7. "Take what we have" → partial `_bottle.md` in mailbox, marked "⚠️ incomplete" at top
8. "Continue" → new query() call with raised maxBudgetUsd, resumes from bottle file
```

Visual: bottle freezes mid-animation with a glowing amber outline. Cost breakdown appears in workflow panel.

---

### Scenario 6 — Max Turns Hit (Stuck Agent)

Similar to budget cap but signals a looping agent.

```
1. A villager has exceeded maxTurns: 20
2. Bottle freezes, shakes slightly (suggesting spinning)
3. Sherb's note: "Hmm... [villager name] seems to be going in circles.
   This sometimes happens with complex tasks."
4. Player sees: [Retry with clearer instructions] [Skip this villager] [Cancel]
5. "Skip this villager" → bottle passes forward without that step
   downstream villagers work with whatever exists in the notes file so far
```

Visual distinction from budget cap: bottle shakes before freezing vs. clean freeze.

---

### Scenario 7 — Player Cancels Mid-Task

Clean player-initiated stop at any point during TRAVELING state.

```
1. Player clicks [Cancel] in workflow panel
2. Current villager subprocess receives abort signal
3. Work done so far preserved in notes/output files on disk
4. Bottle washes out to sea — small gentle animation
5. Workflow panel: "Task cancelled · $0.22 spent · notes saved"
6. Notes file remains in tasks/ folder, accessible anytime
```

The work is never thrown away on cancel. Notes file is always preserved.

---

### Scenario 8 — Unexpected Villager Choice (Surprise Surfacing)

Sherb exercises autonomy, surfaces it visually.

```
1. Player submitted a straightforward writing task
2. Sherb decides Stitches should ideate before Zucker drafts
   (Sherb saw a creative opportunity)
3. Workflow panel toast: "🐐 Sherb had a thought — summoned Stitches first"
4. Stitches' pink node appears before Zucker's teal in workflow panel
5. Task continues normally
6. On completion, mailbox note:
   "Sherb brought in Stitches for a creative angle —
    check the notes file for the ideation trail"
```

Makes Claude's autonomy legible and delightful rather than surprising or confusing.

---

### Scenario 9 — Bottle Too Heavy (Context Compaction)

Maple's research notes grow too large. SDK auto-compaction fires.

```
1. Maple finishes research — notes file very large (8000+ tokens)
2. Before passing to Zucker, SDK compaction triggers
3. Workflow panel: "🍶 Bottle getting heavy — Maple is summarizing her notes"
4. Maple compresses research into clean summary
5. Bottle passes to Zucker lighter, with summary not raw research
6. Full original notes still on disk — nothing lost
```

Visual: bottle appears to sink slightly in water, then bobs up lighter after compression.

---

### Scenario 10 — MCP Connection Failure (v2 only)

Gmail or Calendar MCP unreachable. Degrades gracefully.

```
1. Lily tries to search Gmail — MCP server unreachable
2. Workflow panel: "Lily couldn't reach your inbox — working without it"
3. Lily continues with task description alone
4. Small warning badge on Lily's workflow node: "⚠️ inbox unavailable"
5. Task continues — never blocks the whole pipeline
```

MCP failures always degrade gracefully. The bottle keeps moving.

---

## JSONL as Nervous System

JSONL is the event bus the whole app runs on. Every agent action, tool call, and handoff emits a JSONL line. The workflow panel visualizes these lines in real time via Electron IPC. Every line is also written to disk as a permanent audit trail.

### Event Schema

```jsonl
{"type":"task_received",  "taskId":"...", "description":"...", "timestamp":"..."}
{"type":"plan_proposed",  "taskId":"...", "agentId":"sherb",   "plan":[...]}
{"type":"plan_approved",  "taskId":"...", "plan":[...]}
{"type":"agent_activated","taskId":"...", "agentId":"maple"}
{"type":"thought",        "taskId":"...", "agentId":"maple",   "text":"..."}
{"type":"tool_call",      "taskId":"...", "agentId":"maple",   "tool":"WebSearch", "real":true}
{"type":"tool_result",    "taskId":"...", "agentId":"maple",   "result":"...",     "real":true}
{"type":"handoff",        "taskId":"...", "fromAgent":"maple",  "toAgent":"zucker", "summary":"..."}
{"type":"task_complete",  "taskId":"...", "outputPath":"...",   "cost_usd": 0.34}
{"type":"agent_error",    "taskId":"...", "agentId":"...",      "error":"..."}
```

### JSONL Persistence

```javascript
// Every event appended to disk
await appendFile(join(PATHS.tasks, `${taskId}.jsonl`), JSON.stringify(event) + "\n")

// Reveal in Finder
shell.showItemInFolder(join(PATHS.tasks, `${taskId}.jsonl`))
```

---

## Memory Architecture

Inspired by Manus AI's context engineering. Four distinct layers:

| Layer | Scope | Storage | Notes |
|---|---|---|---|
| Working memory | Current subagent only | In-memory (subagent context) | Isolated per villager — doesn't bleed |
| File context | Current task | Disk (notes + output .md files) | Villagers read/write shared files |
| Short-term | App session | In-memory (React state) | Lost when app closes |
| Long-term | Across sessions | Disk (JSON journals) | Structured facts, task summaries |

### Journal Schema

```javascript
// ~/Library/Application Support/NookIsland/journals/maple.json
{
  villagerId: "maple",
  userFacts: { "output_format": "bullet points", "tone": "casual", "industry": "filmmaking" },
  completedTasks: [
    { taskId: "abc123", summary: "Researched NYC film festivals, user wanted concise bullets" }
  ],
  relationships: { "zucker": "writes well from my notes when I use clear headers" },
  baseline: null
}
```

### CLAUDE.md — Auto-Injected Into Every Subprocess

Claude Agent SDK reads `CLAUDE.md` in the `cwd` automatically. Injected into every villager call without appearing in any prompt:

```markdown
# CLAUDE.md — Nook Island Agent Context

You are a villager on Nook Island, a personal productivity island.
Your specific role and personality are given in the system prompt.

## Rules
- Stay in character as your villager persona at all times
- Only use the tools assigned to your role
- Write all outputs to the file paths specified in your prompt
- End every session with a 2-sentence handoff summary appended to the notes file
- Never break character

## Island File Structure
Bottle: ~/Library/Application Support/NookIsland/tasks/{taskId}_bottle.md
Notes:  ~/Library/Application Support/NookIsland/tasks/{taskId}_notes.md
Journal:~/Library/Application Support/NookIsland/journals/{villagerId}.json

## Bottle Writing Rules
- Final output goes at the TOP of the bottle file under "## ✉️ Final Output"
- Your journey section goes BELOW under "## 🗺️ Journey" with your name + emoji as heading
- Maple writes raw research to notes file, summarizes key findings into bottle
- Never overwrite another villager's section — only append your own
- Always include 1-2 sentence handoff note at end of your journey section

## User Context
Name:             Jackson
Primary work:     Filmmaking and creative technology
Preferred format: Concise, bullet-friendly when appropriate
Tone:             Casual but sharp
```

---

## Authentication — How Nook Island Connects to Claude

No API key. No BYOK. No additional configuration.

When you ran `claude login` in your terminal, credentials were stored at:

```
~/.claude/credentials.json
```

The Claude Agent SDK reads this file automatically when it spawns a subprocess. Nook Island inherits your existing Claude account exactly the same way Claude Code does in your terminal. The island is a visual layer on top of the CLI you already have.

```typescript
// No auth config needed — SDK finds ~/.claude/credentials.json automatically
import { query } from "@anthropic-ai/claude-agent-sdk"

for await (const message of query({
  prompt: "You are Maple...",
  options: { allowedTools: ["WebSearch"] }
})) {
  // Already authenticated
}
```

### One Required Fix — Electron PATH

Electron doesn't inherit your shell's PATH by default, so it can't find the `claude` binary. One line in `main.js` fixes this:

```javascript
// electron/main.js — add before createWindow()
process.env.PATH = `/usr/local/bin:/opt/homebrew/bin:${process.env.PATH}`
```

This is the only auth-related code in the entire app. Everything else is automatic.

### What Gets Inherited Automatically

```
~/.claude/credentials.json     ← Claude account auth
~/.claude/config.json          ← Claude Code settings
~/.config/claude/...           ← MCP server configuration (Gmail, Calendar)
nook-island/CLAUDE.md          ← island context (via cwd option)
```

MCP tools (Gmail, Calendar) are available to villagers for free — no extra wiring. The SDK reads your existing MCP config the same way Claude Code does.

---

## Bottle Shareability

### v1 — Footer (current)

The orchestrator appends a single footer line when the bottle is finalized:

```markdown
---
*Made on Nook Island · 3 AI villagers · $0.34*
```

One line. Adds identity without changing the file. Anyone receiving it understands it's AI-assisted and roughly what it cost. No visual changes, no extra files, zero complexity.

```javascript
// server/journal.js — appended by orchestrator on task completion
async function addBottleFooter(taskId, villagerCount, cost) {
  const bottlePath = join(PATHS.tasks, `${taskId}_bottle.md`)
  const footer = `\n---\n*Made on Nook Island · ${villagerCount} AI villagers · $${cost.toFixed(2)}*\n`
  await appendFile(bottlePath, footer)
}
```

### v2 — Clean Export (planned)

Piper writes a second file stripping the journey section — output only, ready to paste or share directly. Player sees both in the mailbox.

```
{taskId}_bottle.md    ← full journey (personal, stays local)
{taskId}_share.md     ← clean output only (shareable)
```

### v3 — Public URL (future)

Share button generates a link — `nookisland.app/b/abc123` — that renders the bottle in a browser. Anyone with the link can read the journey. No account needed to view.

### Important: SDK Renamed

The Claude Code SDK was renamed to the **Claude Agent SDK** in September 2025.

```
Old:  @anthropic-ai/claude-code
New:  @anthropic-ai/claude-agent-sdk
```

All references in code use the new package name.

### Connection — query()

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk"

for await (const message of query({
  prompt: taskPrompt,
  options: {
    systemPrompt: buildVillagerPrompt(villager, memorySnapshot),
    allowedTools: ["Task", ...VILLAGER_TOOL_SCOPES[villager.id].allowedTools],
    agents: SUBAGENT_DEFINITIONS,    // villager roster
    permissionMode: "dontAsk",       // fully autonomous
    maxBudgetUsd: 2.00,              // hard cost cap per task
    maxTurns: 20,                    // hard turn cap
    cwd: app.getAppPath(),           // so CLAUDE.md is found
  }
})) {
  // Typed message objects — no raw parsing needed
}
```

### The Agent Loop — What Happens

Every villager session follows: receive prompt → evaluate → tool calls → repeat → return result.

Five message types yielded:
- `SystemMessage` — session init
- `AssistantMessage` — Claude's text + tool calls each turn
- `UserMessage` — tool results fed back
- `StreamEvent` — real-time partial tokens (if enabled)
- `ResultMessage` — final output, token usage, cost, session ID

### Villager Selection — How Subagents Work

**`Task` must be in Sherb's `allowedTools`.** This is what enables subagent spawning.

```typescript
// Sherb's query — has Task tool + full villager roster
const result = await query({
  prompt: `Execute this approved plan: ${plan}`,
  options: {
    systemPrompt: sherbPrompt,
    allowedTools: ["Task", "Read"],    // Task enables spawning
    agents: {
      maple:    { description: "Use for web research",        tools: ["WebSearch", "Read"], prompt: maplePrompt },
      zucker:   { description: "Use for writing and drafting", tools: ["Read", "Write"],     prompt: zuckerPrompt },
      marshal:  { description: "Use for critique and review",  tools: ["Read"],              prompt: marshalPrompt },
      lily:     { description: "Use to read Gmail for context",tools: ["Read", "mcp__gmail__search_emails"], prompt: lilyPrompt },
      broccolo: { description: "Use for memory and tracking",  tools: ["Read", "Write"],     prompt: broccoloPrompt },
      piper:    { description: "Use for final formatting",     tools: ["Read", "Write"],     prompt: piperPrompt },
      stitches: { description: "Use for creative ideation",    tools: ["Read", "Write"],     prompt: stitchesPrompt },
    },
    permissionMode: "dontAsk"
  }
})
```

Sherb reads each agent's `description` and decides autonomously which villager to invoke for each subtask. We don't drive the selection — we observe it through hooks.

**Critical rule:** Never put `Task` in any villager's own tools. Subagents cannot spawn sub-subagents. This prevents recursive spawning and cost explosions.

```typescript
// CORRECT — Task only on Sherb
sherb: { allowedTools: ["Task", "Read"] }

// WRONG — would allow recursive spawning
maple: { allowedTools: ["Task", "WebSearch", "Read"] }  // ❌ never do this
```

### Two-Step Plan Approval

Plan approval happens before execution, using a separate Sherb call with no agents:

```typescript
// Step 1 — Sherb plans (no agents, no tools, just reasoning)
const planResult = await query({
  prompt: task,
  options: {
    systemPrompt: "You are Sherb. Propose a plan as JSON. Do not execute.",
    allowedTools: [],     // literally nothing — pure reasoning
    agents: {},           // no subagents available yet
    maxTurns: 1,
  }
})
// Parse plan from planResult → show in UI → player approves/edits

// Step 2 — Sherb executes with full villager roster
const execResult = await query({
  prompt: `Execute this approved plan: ${JSON.stringify(approvedPlan)}
  
  Bottle file: ${PATHS.tasks}/${taskId}_bottle.md
  Notes file: ${PATHS.tasks}/${taskId}_notes.md
  
  Each villager appends their section to the bottle file in order.
  Final output must be at the TOP of the bottle file.
  Journey sections go below the output.`,
  options: {
    allowedTools: ["Task", "Read"],
    agents: SUBAGENT_DEFINITIONS,
    permissionMode: "dontAsk",
    maxBudgetUsd: 2.00,
    hooks: ISLAND_HOOKS
  }
})
```

### Hooks — The Workflow Panel Source

All hooks run in the application process — zero token cost.

```typescript
const ISLAND_HOOKS = {

  // Fires when Sherb spawns a villager
  SubagentStart: [{
    hooks: [async (input) => {
      const event = { type: "agent_activated", agentId: input.agent_type, taskId }
      await appendTaskEvent(taskId, event)
      mainWindow.webContents.send(CHANNELS.ISLAND_EVENT, event)
      return { continue: true }
    }]
  }],

  // Fires when a villager finishes
  SubagentStop: [{
    hooks: [async (input) => {
      const event = { type: "handoff", agentId: input.agent_type, taskId }
      await appendTaskEvent(taskId, event)
      mainWindow.webContents.send(CHANNELS.ISLAND_EVENT, event)
      return { continue: true }
    }]
  }],

  // Fires before every tool call — workflow panel visualization
  PreToolUse: [{
    hooks: [async (input) => {
      const isReal = ["WebSearch", "mcp__gmail__search_emails",
                      "mcp__google_calendar__list_events"].includes(input.tool_name)
      const event = { type: "tool_call", tool: input.tool_name,
                      args: input.tool_input, real: isReal, taskId }
      await appendTaskEvent(taskId, event)
      mainWindow.webContents.send(CHANNELS.ISLAND_EVENT, event)
      return { continue: true }
    }]
  }],

  // Fires after every tool result
  PostToolUse: [{
    hooks: [async (input) => {
      const event = { type: "tool_result", tool: input.tool_name,
                      result: input.tool_response, taskId }
      await appendTaskEvent(taskId, event)
      mainWindow.webContents.send(CHANNELS.ISLAND_EVENT, event)
      return { continue: true }
    }]
  }]
}
```

### Permission Scoping Per Villager

```typescript
const SUBAGENT_DEFINITIONS = {
  sherb:    { tools: ["Task", "Read", "mcp__google_calendar__list_events"] },
  maple:    { tools: ["WebSearch", "Read"] },
  zucker:   { tools: ["Read", "Write"] },
  marshal:  { tools: ["Read"] },
  stitches: { tools: ["Read", "Write"] },
  lily:     { tools: ["Read", "mcp__gmail__search_emails", "mcp__gmail__get_email"] },
  broccolo: { tools: ["Read", "Write"] },
  piper:    { tools: ["Read", "Write"] },
}
// permissionMode: "dontAsk" + explicit tools = hard cap on what each villager can do
```

---

## Token Cost Strategy

### The Real Numbers

Each villager subprocess has its own full context window. Sequential villagers (our design) use approximately 7x more tokens than a single Claude conversation. This is the cost of the multi-agent architecture and it's worth it — but it must be managed consciously.

**Estimated cost per typical task (5 villagers, sequential):**

| Villager | Approx tokens | Notes |
|---|---|---|
| Sherb (plan) | ~2K | Pure reasoning, no tools |
| Lily (listen) | ~8K | Gmail fetch adds bulk |
| Maple (scout) | ~15K | Web searches are token-heavy |
| Zucker (produce) | ~10K | Reads summary, writes draft |
| Marshal (critic) | ~6K | Read-only |
| Piper (narrate) | ~5K | Trim and reformat |
| **Total** | **~46K** | **~$0.15–$0.40 per task** |

For daily use (5 tasks/day): approximately **$1–$10/day** depending on complexity.

### Four Cost Guards — All Required

**Guard 1 — Hard budget cap per task**
```typescript
options: { maxBudgetUsd: 2.00 }
// Task stops immediately if this is hit
// ResultMessage always includes actual total_cost_usd regardless of outcome
```

**Guard 2 — Hard turn cap**
```typescript
options: { maxTurns: 20 }
// Prevents runaway loops if an agent gets stuck
```

**Guard 3 — Effort level per villager**
```typescript
// Marshal just reads and critiques — doesn't need deep reasoning
// Piper just reformats — lightweight task
options: { effort: "low" }    // reduces tokens per turn significantly
// Only Sherb (planning) warrants effort: "high"
```

**Guard 4 — MCP tool scoping**
```typescript
// Each MCP server adds ALL its tool schemas to every request
// Only give villagers the exact MCP tools they need
// Marshal gets no MCP — just Read. No schema overhead.
marshal: { tools: ["Read"] }
lily:    { tools: ["Read", "mcp__gmail__search_emails", "mcp__gmail__get_email"] }
// Don't give lily calendar. Don't give sherb gmail.
```

### Automatic Prompt Caching

The SDK automatically caches repeated content — system prompts, CLAUDE.md, tool definitions. No configuration needed. The more Nook Island is used, the cheaper repeat calls become as the cache warms up.

### Cost Visibility in UI

Every task shows its cost in the mailbox when complete:

```typescript
// ResultMessage always includes cost
if (message instanceof ResultMessage) {
  mainWindow.webContents.send(CHANNELS.TASK_COMPLETE, {
    output: message.result,
    cost: message.total_cost_usd,    // always present
    turns: message.num_turns,
  })
}
// UI shows: "Task complete · $0.34 · 12 turns"
```

### The One Critical Danger — Recursive Spawning

Never put `Task` in a subagent's tools. If Maple could spawn sub-subagents, one web search could recursively spawn agents and burn through budget in seconds. The `maxBudgetUsd` guard is your last line of defense if this somehow happens accidentally.

```typescript
// SAFE
agents: {
  maple: { tools: ["WebSearch", "Read"] }   // ✅ no Task
}

// DANGEROUS — never do this
agents: {
  maple: { tools: ["Task", "WebSearch", "Read"] }   // ❌ recursive spawning possible
}
```

---

## Electron Architecture

### Process Structure

```
Electron Main Process (Node.js)
├── Runs Claude Agent SDK query() calls
├── Manages ~/Library/.../NookIsland/ file system
├── Handles IPC from renderer
└── Sends events to renderer via IPC

Electron Renderer Process (React + Canvas)
├── Island UI, workflow panel, mailbox
├── Communicates via window.nookIsland IPC API
└── Never touches Node.js directly (contextIsolation: true)
```

### IPC Channel Map

```typescript
export const CHANNELS = {
  // Renderer → Main
  TASK_SUBMIT:    "island:task:submit",
  PLAN_APPROVE:   "island:plan:approve",
  PLAN_REJECT:    "island:plan:reject",
  TASK_CANCEL:    "island:task:cancel",
  JOURNAL_READ:   "island:journal:read",
  OUTPUT_OPEN:    "island:output:open",

  // Main → Renderer
  ISLAND_EVENT:   "island:event",
  PLAN_PROPOSED:  "island:plan:proposed",
  TASK_COMPLETE:  "island:task:complete",
  AGENT_ERROR:    "island:agent:error",
  NOTIFICATION:   "island:notification",
}
```

### Preload Bridge

```typescript
contextBridge.exposeInMainWorld("nookIsland", {
  submitTask:   (desc)   => ipcRenderer.invoke(CHANNELS.TASK_SUBMIT, desc),
  approvePlan:  (plan)   => ipcRenderer.invoke(CHANNELS.PLAN_APPROVE, plan),
  rejectPlan:   (reason) => ipcRenderer.invoke(CHANNELS.PLAN_REJECT, reason),
  cancelTask:   (id)     => ipcRenderer.invoke(CHANNELS.TASK_CANCEL, id),
  readJournal:  (id)     => ipcRenderer.invoke(CHANNELS.JOURNAL_READ, id),
  openOutput:   (id)     => ipcRenderer.invoke(CHANNELS.OUTPUT_OPEN, id),
  onEvent:         (cb) => ipcRenderer.on(CHANNELS.ISLAND_EVENT,  (_, e) => cb(e)),
  onPlanProposed:  (cb) => ipcRenderer.on(CHANNELS.PLAN_PROPOSED, (_, p) => cb(p)),
  onTaskComplete:  (cb) => ipcRenderer.on(CHANNELS.TASK_COMPLETE, (_, o) => cb(o)),
  onAgentError:    (cb) => ipcRenderer.on(CHANNELS.AGENT_ERROR,   (_, e) => cb(e)),
  removeAllListeners: () =>
    Object.values(CHANNELS).forEach(ch => ipcRenderer.removeAllListeners(ch))
})
```

### Packaging

```javascript
// electron-builder.config.js
export default {
  appId:       "com.jackson.nookisland",
  productName: "Nook Island",
  mac: {
    category: "public.app-category.productivity",
    icon:     "assets/icon.icns",
    target:   [{ target: "dmg", arch: ["arm64", "x64"] }]
  },
  files: ["dist/**/*", "electron/**/*", "server/**/*", "assets/**/*"],
  extraResources: [{ from: "CLAUDE.md", to: "CLAUDE.md" }]
}
```

---

## Agent Architecture

### The 8 Archetypes

| # | Archetype | Villager | Core Function | Always Present? |
|---|---|---|---|---|
| 1 | 🗂️ Planner | Sherb | Structures and sequences work | **Always** |
| 2 | 🔍 Scout | Maple | Finds raw information | Often |
| 3 | ✍️ Producer | Zucker | Creates the primary output | Often |
| 4 | ⚖️ Critic | Marshal | Evaluates against a standard | Often |
| 5 | 💡 Ideator | Stitches | Generates novel connections | Sometimes |
| 6 | 👂 Listener | Lily | Models human/stakeholder needs | Sometimes |
| 7 | 📊 Tracker | Broccolo | Measures state over time | Sometimes |
| 8 | 🗣️ Narrator | Piper | Translates output for audience | Sometimes |

**Sherb is the only permanent villager.** All others summoned dynamically by Sherb based on agent descriptions.

### Engineering Guards

- `maxBudgetUsd: 2.00` — hard cost cap per task
- `maxTurns: 20` — hard turn cap
- `Task` never in subagent tools — prevents recursive spawning
- MCP tools scoped per villager — prevents schema bloat
- `effort: "low"` for simple villagers (Marshal, Piper)
- Sequential only — never parallel villagers in MVP

---

## Tool Definitions (Stress Tested — 4 tasks)

```javascript
const VILLAGER_TOOLS = {
  planner:  [ build_plan, reorder_steps ],
  scout:    [ WebSearch, summarize, write_notes ],
  producer: [ draft, read_notes, rewrite_section, incorporate_feedback ],
  critic:   [ critique, approve, request_revision, evaluate_against_audience ],
  ideator:  [ brainstorm, add_angle ],
  listener: [ validate_output_type, ask_clarifying_question, extract_requirements,
              model_stakeholder, flag_ambiguity ],
  tracker:  [ read_journal, establish_baseline, measure_progress,
              surface_pattern, set_milestone, write_journal ],
  narrator: [ reformat, adjust_tone, trim, add_hook, localize ],
}
```

### Tool Boundaries

| Archetype | Reads From | Writes To |
|---|---|---|
| Planner | Task input + Calendar MCP | Bottle plan |
| Scout | Web + notes file | Notes file + bottle journey section |
| Producer | Notes file | Bottle final output (top) + journey section |
| Critic | Bottle output section | Critique in bottle journey section |
| Ideator | Notes + bottle | Bottle journey section |
| Listener | Player + Gmail MCP | Bottle requirements section |
| Tracker | All journal files + bottle | Journal files + bottle milestones |
| Narrator | Bottle output section | Rewrites bottle final output (top) |

### Output Type Boundary

```
✅ Documents, emails, scripts, plans, outlines
✅ Research summaries, shot lists, proposals
✅ Structured frameworks, feedback, strategies
❌ Video files, audio, images, code execution
```

---

## Villager Identity — Cozy Island Theme

### The Roster

| Name | Animal | Archetype | Personality | Spot | Color |
|---|---|---|---|---|---|
| **Sherb** | 🐐 Blue goat | Planner | Dreamy but quietly wise | Town Hall steps | `#C3B1E1` |
| **Maple** | 🐻 Tan bear cub | Scout | Curious, always has mud on boots | Forest edge | `#E8A87C` |
| **Zucker** | 🐙 Octopus | Producer | Warm and focused, quiet when writing | Library dock | `#5BA4A4` |
| **Marshal** | 🐿️ Squirrel | Critic | Dry wit, secretly most caring | Coffee shop | `#9BA7B0` |
| **Stitches** | 🧸 Patchwork bear | Ideator | Childlike wonder, unexpected leaps | Art shed | `#F4A7B9` |
| **Lily** | 🐸 Frog | Listener | Gentle, unhurried, makes everyone feel heard | River bend | `#8DB48E` |
| **Broccolo** | 🐛 Caterpillar | Tracker | Methodical, loves patterns | Central Plaza (right of mailbox) | `#F5C842` |
| **Piper** | 🐦 Bird | Narrator | Theatrical, loves a good ending | Café stage | `#F4845F` |

### Speech Patterns

```
Sherb     — "Hmm... I think what this really needs is..."
Maple     — "Ooh ooh! I found something — look at this!"
Zucker    — "Okay. I've got it. Give me a moment..."
Marshal   — "It's fine. It's almost fine. Here's what's wrong."
Stitches  — "What if — and hear me out — what if we tried..."
Lily      — "I want to make sure I understand what you mean by..."
Broccolo  — "According to the last 3 tasks, the pattern suggests..."
Piper     — "And HERE is where it gets good — the ending needs to sing."
```

### Personality Under Pressure

```
Sherb     — gets very still and stares at the horizon before replying
Maple     — immediately wants to go search for more information
Zucker    — goes quiet, stares at blank page, then starts over completely
Marshal   — says "I told you" but then immediately helps fix it
Stitches  — gets excited, treats the failure as an interesting new constraint
Lily      — asks everyone how they're feeling before problem-solving
Broccolo  — pulls up the historical data and traces exactly where it went wrong
Piper     — reframes the failure as "a plot twist, not an ending"
```

### Bottle Wax Seals

```
Sherb     — lavender wax, neat handwriting
Maple     — amber wax, slightly smudged
Zucker    — teal wax, small octopus stamp
Marshal   — plain grey wax, no stamp
Stitches  — pink wax with a hand-drawn star
Lily      — green wax, always includes a pressed flower
Broccolo  — yellow wax, numbered precisely
Piper     — coral wax, theatrical flourish on the seal
```

---

## Delivery Stack

| Layer | Choice | Reason |
|---|---|---|
| Desktop framework | Electron | Single installable .app |
| Frontend | Vite + React | Runs inside Electron renderer |
| Styling | Tailwind CSS | Utility-first |
| Canvas | Native HTML5 Canvas | Tile map + villager rendering |
| Agent brain | `@anthropic-ai/claude-agent-sdk` | Native tools, MCP, filesystem |
| IPC | Electron IPC | Replaces WebSocket entirely |
| State | React useState + useRef + event bus | Full control |
| Storage | Disk files in NookIsland data dir | Real persistence, inspectable |
| MCP tools | Inherited from Claude Agent SDK config | Gmail + Calendar free |
| Auth | Claude subscription (Jackson's own) | No BYOK needed |
| Packaging | electron-builder → DMG | macOS arm64 + x64 |

---

## File System Structure

```
~/Library/Application Support/NookIsland/
├── journals/
│   ├── sherb.json
│   ├── maple.json
│   ├── zucker.json
│   ├── marshal.json
│   ├── stitches.json
│   ├── lily.json
│   ├── broccolo.json
│   └── piper.json
└── tasks/
    ├── {taskId}_bottle.md   ← THE deliverable — journey + final output
    ├── {taskId}_notes.md    ← Maple's raw research (separate, lean)
    └── {taskId}.jsonl       ← machine-readable event stream
```

No `outputs/` folder. The bottle IS the output. The mailbox opens `_bottle.md` directly.

---

## Repo Structure

```
nook-island/
├── CLAUDE.md                              ← auto-injected into every agent subprocess
├── PLANNING.md                            ← this file
│
├── electron/                              ← Electron main process (NodeNext ESM, .ts)
│   ├── main.ts                            ← BrowserWindow, PATH fix, createWindow()
│   ├── preload.cts                        ← .cts → compiles to .cjs (Electron requires CJS preload)
│   ├── data.ts                            ← getDataDir(), initDataDir(), VILLAGERS, JournalFile
│   ├── orchestrator.ts                    ← two-step Sherb, full villager pipeline, IPC events
│   ├── agentTest.ts                       ← Layer 4/8 smoke test (NOOK_LAYER4_TEST=1)
│   └── ipc/
│       ├── handlers.ts                    ← TASK_SUBMIT → runTwoStepSherb; PLAN_APPROVE/REJECT
│       └── channels.ts                    ← all IPC channel string constants
│
├── src/                                   ← Vite renderer (React + PixiJS, ESNext bundler)
│   ├── index.html                         ← Vite root
│   ├── main.tsx
│   ├── App.tsx                            ← phase state machine (idle→plan→executing→complete)
│   │
│   ├── core/
│   │   ├── types.ts                       ← IslandEvent union type
│   │   ├── eventBus.ts                    ← typed mitt event bus
│   │   └── bridge.ts                      ← IPC → eventBus adapter
│   │
│   ├── components/
│   │   ├── TownHall.tsx                   ← task input form → submitTask()
│   │   ├── PlanApproval.tsx               ← plan step list + Approve/Reject buttons
│   │   └── WorkflowPanel.tsx              ← live agent nodes, ⚡ tool calls, cost badge
│   │
│   └── canvas/
│       ├── constants.ts                   ← TILE, WORLD_W/H, DISTRICT_POS, VILLAGER_TO_DISTRICT,
│       │                                     VILLAGER_EMOJI, COLORS
│       ├── NookCanvas.tsx                 ← PixiJS app lifecycle, eventBus wiring
│       │
│       ├── camera/
│       │   └── Camera.ts                  ← lerp pan, focusOn(key), screenPos(), isOnScreen()
│       │
│       ├── hud/
│       │   └── IslandHUD.tsx              ← glass-card React overlay (zIndex 10)
│       │
│       ├── world/
│       │   ├── World.ts                   ← root PIXI.Container; all districts + villagers
│       │   ├── WaterTiles.ts              ← TilingSprite + shimmer
│       │   └── CloudLayer.ts             ← 7 drifting clouds
│       │
│       ├── objects/
│       │   ├── Bottle.ts                  ← district-to-district travel, cork-pop bounce
│       │   ├── Mailbox.ts                 ← flag raise, gold glow, cost float
│       │   └── OffscreenIndicator.ts      ← viewport-fixed arrow + emoji pill
│       │
│       └── villagers/
│           ├── Villager.ts                ← abstract base: body Graphics, bob animation, baseY
│           ├── Sherb.ts                   ← 🐐 blue goat (Town Hall)
│           ├── Maple.ts                   ← 🐻 tan bear cub (forest)
│           ├── Zucker.ts                  ← 🐙 octopus (library dock)
│           ├── Marshal.ts                 ← 🐿️ squirrel (coffee shop)
│           ├── Piper.ts                   ← 🐦 bird (plaza left of mailbox)
│           └── Broccolo.ts                ← 🐛 caterpillar (plaza right of mailbox)
│
├── docs/
│   └── superpowers/
│       └── plans/                         ← implementation plan docs (one per sprint)
│
├── tsconfig.json                          ← renderer: ESNext/bundler, noEmit (Vite handles)
├── tsconfig.electron.json                 ← main process: NodeNext/nodenext → dist-electron/
├── vite.config.ts                         ← root: src/, port 5173, outDir: ../dist
├── electron-builder.config.ts             ← appId, mac DMG arm64+x64
└── package.json                           ← "type": "module" (ESM), concurrently dev scripts
```

---

## Build Order (Inside-Out, Final)

All 12 core layers are ✅ COMPLETE. Layer 10 (MCP) explicitly skipped for v1 — deferred to v2.

| Layer | What | Status |
|---|---|---|
| 1 | Electron shell | ✅ `main.ts` creates window, loads Vite dev server |
| 2 | Preload + IPC bridge | ✅ `window.nookIsland` exposed via contextBridge |
| 3 | Data directory init | ✅ `~/Library/.../NookIsland/` + 8 journal JSON files seeded |
| 4 | Agent SDK single call | ✅ `query()` smoke test — Maple streams OK |
| 5 | IPC event forwarding | ✅ SDK messages → `ISLAND_EVENT` → renderer |
| 6 | Event bus + message mapper | ✅ `src/core/{types,eventBus,bridge}.ts` |
| 7 | Bottle + file system | ✅ Real `.md` file paths; notes + bottle written by SDK |
| 8 | Two-step Sherb | ✅ Plan-only call → player approves → exec with subagents |
| 9 | Full villager chain | ✅ Maple → Zucker → Marshal; revision loop; bottle opens in editor |
| 10 | MCP verification | ⏭️ SKIPPED — no MCP config on this machine; Gmail/Calendar deferred to v2 |
| 11 | React UI + workflow panel | ✅ TownHall → PlanApproval → WorkflowPanel; live events; cost badge |
| 12 | Canvas world + polish | ✅ PixiJS v8: 5 districts, villager sprites, bottle travel, mailbox, water shimmer |

### Post-Launch Additions (v2 sprint)

| Addition | What | Status |
|---|---|---|
| Piper (Narrator) | 🐦 Bird sprite at plaza; closes every task with narrative + updates journal | ✅ Shipped |
| Broccolo (Data Keeper) | 🐛 Caterpillar sprite at plaza; two-layer tracking (see below) | ✅ Shipped |

**Broccolo's two-layer tracking:**
- **Layer 1 (always-on, no AI):** Orchestrator auto-appends `{ taskId, summary }` to `broccolo.json` after every successful task_complete — runs even when Broccolo wasn't in the plan
- **Layer 2 (when Sherb invites him):** Broccolo agent reads up to 10 past bottles, appends `### 🐛 Broccolo tracked` pattern analysis to the bottle, updates `userFacts`/`relationships` in his journal (does NOT touch `completedTasks` — Layer 1 already wrote it)

---

## Resolved Decisions

### Error UX ✅

**The bottle washes back to shore.**

One pattern covers all failure types. When any agent fails — API error, budget cap, timeout, max turns — the bottle returns to the beach with a short in-character note from the failing villager using their "under pressure" speech pattern. Sherb always appears beside the returned bottle and offers recovery options.

Rules:
- API error / timeout → amber wax drip on seal, bottle drifts back, [Retry] [Cancel]
- Budget cap hit → bottle freezes mid-beach, cost breakdown shown, [Continue] [Take partial] [Cancel]
- Max turns hit → bottle shakes before freezing, [Retry with clearer instructions] [Skip villager] [Cancel]
- Player cancel → clean wash-out animation, notes always preserved on disk
- Workflow panel node color: amber = setback (not player's fault), red = only for hard cancellation

Sherb's presence at the returned bottle is non-negotiable — he is the permanent villager and always handles recovery. The other villagers never speak about errors directly to the player.

---

### MVP Scope ✅

**v1 — The Core Trio (all complete)**

```
✅ Sherb (always present — planner)
✅ Maple (Scout) — web search
✅ Zucker (Producer) — drafts output
✅ Marshal (Critic) — one revision pass allowed
✅ File-based journals — userFacts + completedTasks only
✅ Workflow panel — live events, cost shown on completion
✅ Two-step plan approval — Sherb proposes, player approves
✅ Mailbox opens _bottle.md in default markdown editor
✅ maxBudgetUsd: $2.00 hard cap
✅ All 10 bottle scenarios handled (happy path + failures)
✅ Bottle state machine implemented
```

**v2 — Shipped additions**

```
✅ Piper (Narrator) — closes every task with in-character narrative; updates her own journal
✅ Broccolo (Tracker) — canvas sprite at plaza; two-layer data keeper (auto-log + optional pattern analysis)
✅ PixiJS v8 canvas world — 5 districts, all active villager sprites, bottle travel animation
```

**Still remaining**

```
❌ Gmail / Calendar MCP — no MCP config on this machine; deferred indefinitely
❌ Stitches (Ideator) — not yet implemented
❌ Lily (Listener) — not yet implemented
❌ Memory relationships between villagers — no cross-journal reads yet
❌ Parallel villagers — sequential pipeline only
❌ Broccolo at lighthouse — moved to plaza; lighthouse district has no villager yet
```

Rationale for skipping MCP in v1: adds setup complexity and token overhead before the core pipeline is validated. Get the loop feeling right first.

---

### Surprise Surfacing ✅

**Surface it — one line, no interruption.**

When Sherb summons a villager the player didn't expect, a small toast appears in the workflow panel:

```
🐐 Sherb had a thought — summoned Stitches first
```

On task completion, the mailbox note mentions it:

```
"Sherb brought in Stitches for a creative angle —
 check the notes file for the ideation trail"
```

The unpredictability is legible but never interrupts flow. Over time the player learns Sherb's tendencies and it feels like working with someone who has genuine opinions.

---

## Decisions Log

| Decision | Choice |
|---|---|
| Player role | Director/Hybrid |
| Workflow shape | n8n-style agent pipeline |
| Task mechanic | Drop task → plan → approve → execute |
| Memory model | Manus-inspired 4-layer |
| Task context metaphor | Message in a bottle / shared workshop |
| Filesystem as bottle | `_bottle.md` IS the deliverable — journey + output in one file |
| JSONL role | Event bus + permanent disk audit trail |
| Villager roster | 8 archetypes, Sherb permanent |
| Villager selection | Emergent from Sherb's reasoning via agents: {} |
| Theming | Cozy Island |
| Villager identity | All 8 named, voiced, located, colored |
| Output tools | Agent SDK — real tools natively |
| Delivery | Electron desktop app |
| App name | Nook Island |
| Bundle ID | com.jackson.nookisland |
| Data path | `~/Library/Application Support/NookIsland/` |
| IPC | Electron IPC replaces WebSocket |
| Agent brain | `@anthropic-ai/claude-agent-sdk` (renamed from claude-code) |
| MCP tools | Inherited from SDK config (Gmail + Calendar) |
| Auth | Claude subscription — no BYOK |
| Target user | Jackson — personal tool only |
| Plan approval | Two-step Sherb (plan call → approve → execute call) |
| Token strategy | maxBudgetUsd + maxTurns + effort scoping + MCP scoping |
| Cost visibility | Show total_cost_usd in mailbox on every task completion |
| Recursive spawning | Blocked — Task never in subagent tools |
| Parallel vs sequential | Sequential only in MVP |
| Build order | Inside-out, 12 layers |
| Unpredictability | Lean into it — agents decide, we observe via hooks |
| Error UX | Bottle washes back — in-character note, Sherb handles recovery |
| Error node color | Amber = setback, red = hard cancel only |
| Budget cap UX | Bottle freezes, cost breakdown shown, player chooses |
| Max turns UX | Bottle shakes before freezing, skip villager option |
| Cancel UX | Clean wash-out, notes always preserved on disk |
| MVP villagers | Sherb + Maple + Zucker + Marshal (core trio) |
| MVP MCP | Skipped — v2 (Gmail + Calendar) |
| MVP animations | Skipped — workflow panel only in v1 |
| Surprise surfacing | One-line toast in workflow panel, mention in mailbox note |
| Authentication | Automatic via `~/.claude/credentials.json` — no config needed |
| Electron PATH fix | `process.env.PATH` set in `main.js` before `createWindow()` |
| Bottle shareability v1 | Option B — one-line footer appended by orchestrator |
| Bottle shareability v2 | Option C — Piper exports `_share.md` clean copy |
| Bottle shareability v3 | Option E — public URL rendering (future) |
| Bottle file format | Final output at top, villager journey sections below |
| Mailbox action | Opens `_bottle.md` in default markdown editor |
| Complementary files | `_notes.md` (raw research) + `.jsonl` (event stream) |
| outputs/ folder | Removed — not needed |
| Piper role | Narrator — always runs last; in-character closing narrative + updates her own journal |
| Piper position | Plaza, 28px left of mailbox center |
| Broccolo role | Data keeper — two layers: orchestrator auto-log (Layer 1) + optional agent analytics (Layer 2) |
| Broccolo position | Plaza, 28px right of mailbox center (mirrors Piper) |
| Broccolo spot | Changed from Lighthouse → Central Plaza — closer to mailbox; tracking is most relevant here |
| Broccolo Layer 1 | Orchestrator writes `{ taskId, summary }` to `broccolo.json.completedTasks` after every `task_complete`, no AI |
| Broccolo Layer 2 | When Sherb invites him: reads past 10 bottles, appends `### 🐛 Broccolo tracked` to bottle, updates `userFacts`/`relationships` only |
| Broccolo optional | Sherb decides when to include Broccolo; triggered for analytical, recurring, or history-dependent tasks |
| Broccolo + Piper ordering | Piper always closes the task; Broccolo always runs last when both are present |
| Canvas engine | PixiJS v8 (upgraded from HTML5 Canvas plan); `unsafe-eval` CSP required for shader uniform generation |
| ESM main process | `"type":"module"` — all electron/ imports use `.js` extensions; `__dirname` → `fileURLToPath` |
| Preload CJS | `preload.cts` (not `.ts`) — compiles to `.cjs` regardless of package type; Electron requires CJS preload |
