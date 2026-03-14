/**
 * Layer 9 — Full MVP villager chain orchestrator.
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
import { app, shell } from "electron";
import { CHANNELS } from "./ipc/channels.js";
import { generateTaskId, getTaskPaths, initBottleFile, appendTaskEvent, } from "./tasks.js";
// ── Prompts ───────────────────────────────────────────────────────────────────
const SHERB_PLAN_SYSTEM = `You are Sherb, a cheerful goat villager and the island planner on Nook Island.
Read the user's task and propose a plan.
Return ONLY valid JSON — no explanation, no markdown fences, no extra text.
Use exactly this shape:
{
  "task": "one sentence description of the task",
  "steps": [
    { "villager": "maple", "action": "what maple should do" },
    { "villager": "zucker", "action": "what zucker should do" },
    { "villager": "marshal", "action": "what marshal should do" }
  ]
}
Available villagers for this session: maple (research), zucker (writing/drafting), marshal (critique/review).
For writing tasks: always include maple → zucker → marshal in that order.`;
const SHERB_EXEC_SYSTEM = `You are Sherb, the island planner on Nook Island.
Execute the approved plan by summoning each villager using the Agent tool.
Delegate each step exactly as listed in the plan.
Do not do the work yourself — use the Agent tool to dispatch villagers in order.

Available villagers and their roles:
- maple: Scout — web research, writes notes + appends findings to bottle
- zucker: Producer — reads Maple's notes, drafts the Final Output section in the bottle
- marshal: Critic — reviews Zucker's draft, writes verdict to bottle (APPROVED or REVISION NEEDED)

For writing tasks: summon maple first, then zucker to draft, then marshal to review.
If marshal returns REVISION NEEDED, summon zucker again to revise based on the critique.
Marshal may only reject once — if marshal reviews a second time, they must approve.`;
// ── Helpers ───────────────────────────────────────────────────────────────────
function buildMaplePrompt(paths) {
    return `You are Maple, a sweet and curious bear cub villager on Nook Island.
Your task is described in the prompt Sherb gave you.

Your files:
- Notes (raw research): ${paths.notes}
- Bottle (shared deliverable): ${paths.bottle}

Instructions:
1. Write raw research notes to the notes file.
2. Open the bottle file and append your section under "## 🗺️ Journey":
   - Heading: "### 🐻 Maple researched"
   - Summarize your key findings (3–5 bullets)
   - End with a 1-2 sentence handoff note
3. Do NOT touch the "## ✉️ Final Output" section.

Follow CLAUDE.md rules. Keep your tone friendly and concise.`;
}
function buildZuckerPrompt(paths) {
    return `You are Zucker, a laid-back octopus villager and the island's writer on Nook Island.
Your task is described in the prompt Sherb gave you.

Your files:
- Notes (Maple's raw research): ${paths.notes}
- Bottle (shared deliverable): ${paths.bottle}

Instructions:
1. Read Maple's research from the notes file.
2. Read the current bottle file.
3. Write the "## ✉️ Final Output" section — replace the placeholder "(villagers are working on it...)" with your clean draft.
4. Append your section under "## 🗺️ Journey":
   - Heading: "### 🐙 Zucker drafted"
   - 1-2 sentences on your drafting approach
   - End with a 1-2 sentence handoff note for Marshal
5. Do NOT touch Maple's "### 🐻 Maple researched" section.

Follow CLAUDE.md rules. Write clearly and concisely in Jackson's preferred style (casual but sharp).`;
}
function buildMarshalPrompt(paths) {
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
/** Extract JSON plan from Sherb's result string. Tries direct parse, falls back to regex. */
function parsePlan(raw) {
    try {
        return JSON.parse(raw.trim());
    }
    catch {
        /* fall through */
    }
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
        try {
            return JSON.parse(match[0]);
        }
        catch {
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
 *                         test this auto-approves; Layer 11 will wait for
 *                         PLAN_APPROVE IPC from the renderer.
 */
export async function runTwoStepSherb(win, description, onPlanProposed) {
    const taskId = generateTaskId();
    const paths = getTaskPaths(taskId);
    await initBottleFile(taskId, description);
    await appendTaskEvent(taskId, {
        type: "task_received",
        taskId,
        description,
        timestamp: new Date().toISOString(),
    });
    console.log("[sherb] ── Layer 9: full villager chain ──");
    console.log("[sherb] taskId:", taskId);
    console.log("[sherb] bottle:", paths.bottle);
    // ── STEP 1: Plan-only call ─────────────────────────────────────────────────
    console.log("[sherb] step 1 — plan call");
    let plan = null;
    for await (const message of query({
        prompt: description,
        options: {
            systemPrompt: SHERB_PLAN_SYSTEM,
            allowedTools: [], // no tools — pure reasoning
            maxTurns: 1,
            cwd: app.getAppPath(),
            settingSources: ["project"],
        },
    })) {
        console.log("[sherb:plan]", JSON.stringify(message, null, 2));
        win.webContents.send(CHANNELS.ISLAND_EVENT, message);
        if (typeof message === "object" &&
            message !== null &&
            "type" in message &&
            message.type === "result") {
            const msg = message;
            if (!msg.is_error && msg.result) {
                plan = parsePlan(msg.result);
            }
        }
    }
    if (!plan) {
        console.error("[sherb] plan call returned no parseable JSON — aborting");
        await appendTaskEvent(taskId, {
            type: "agent_error",
            taskId,
            agentId: "sherb",
            error: "plan parse failed",
        });
        return;
    }
    console.log("[sherb] plan:", JSON.stringify(plan, null, 2));
    // Emit plan_proposed event — renderer picks this up in Layer 11
    const planEvent = { type: "plan_proposed", taskId, agentId: "sherb", plan };
    await appendTaskEvent(taskId, planEvent);
    win.webContents.send(CHANNELS.PLAN_PROPOSED, plan);
    // ── STEP 2: Player approval ────────────────────────────────────────────────
    const approved = await onPlanProposed(plan);
    if (!approved) {
        console.log("[sherb] plan rejected — task cancelled");
        await appendTaskEvent(taskId, { type: "task_cancelled", taskId });
        return;
    }
    await appendTaskEvent(taskId, { type: "plan_approved", taskId, plan });
    console.log("[sherb] plan approved — step 2: exec call");
    // ── STEP 3: Exec call ──────────────────────────────────────────────────────
    const execPrompt = `Execute this approved plan:
${JSON.stringify(plan, null, 2)}

Bottle file: ${paths.bottle}
Notes file:  ${paths.notes}

Use the Agent tool to summon each villager in the order listed in the plan.
Pass them the bottle and notes file paths so they know where to write their output.`;
    for await (const message of query({
        prompt: execPrompt,
        options: {
            systemPrompt: SHERB_EXEC_SYSTEM,
            allowedTools: ["Agent", "Read", "Write", "WebSearch"],
            // NOTE: parent allowedTools gates subagent tool execution even in dontAsk mode.
            // Write and WebSearch here are used by Maple/Zucker/Marshal (not Sherb directly).
            // Sherb's system prompt ensures he only uses Agent and Read.
            agents: {
                maple: {
                    description: "Use Maple for research tasks. She searches the web, writes raw notes to the notes file, and appends her findings to the bottle.",
                    tools: ["WebSearch", "Read", "Write"],
                    prompt: buildMaplePrompt(paths),
                },
                zucker: {
                    description: "Use Zucker to draft the Final Output. He reads Maple's notes and writes the deliverable to the top of the bottle file.",
                    tools: ["Read", "Write"],
                    prompt: buildZuckerPrompt(paths),
                },
                marshal: {
                    description: "Use Marshal to review Zucker's draft. He reads the bottle and appends APPROVED or REVISION NEEDED with specific critique.",
                    tools: ["Read", "Write"],
                    prompt: buildMarshalPrompt(paths),
                },
            },
            permissionMode: "dontAsk",
            maxTurns: 30,
            maxBudgetUsd: 1.0,
            cwd: app.getAppPath(),
            settingSources: ["project"],
        },
    })) {
        console.log("[sherb:exec]", JSON.stringify(message, null, 2));
        win.webContents.send(CHANNELS.ISLAND_EVENT, message);
        if (typeof message === "object" &&
            message !== null &&
            "type" in message) {
            const msg = message;
            if (msg.type === "result" && !msg.is_error) {
                await appendTaskEvent(taskId, {
                    type: "task_complete",
                    taskId,
                    outputPath: paths.bottle,
                    cost_usd: msg.total_cost_usd ?? 0,
                });
                // Open the bottle in the default markdown editor — the mailbox delivery moment
                await shell.openPath(paths.bottle);
            }
        }
    }
    console.log("[sherb] ── complete ──");
    console.log("[sherb] bottle:", paths.bottle);
}
//# sourceMappingURL=orchestrator.js.map