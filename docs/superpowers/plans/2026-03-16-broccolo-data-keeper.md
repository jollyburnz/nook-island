# Broccolo Data Keeper Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Broccolo (🐛 caterpillar) as the island's 6th active villager — a yellow canvas sprite at the plaza and a two-layer data keeper: the orchestrator auto-logs every task to `broccolo.json`, and when Sherb invites Broccolo as an agent, he reads past bottles to surface patterns.

**Architecture:** Tasks 1–3 wire up Broccolo's canvas presence (constants, sprite, world positioning) using the exact same patterns as the Piper villager added in the previous sprint. Task 4 updates `electron/orchestrator.ts` with four new elements: a `TASKS_DIR` constant + `getPastBottles()` helper for pre-computing past bottle paths; `buildBroccoloPrompt()` + an entry in the exec agents map for Broccolo's optional analytical role; and `updateBroccoloLog()` called in the task_complete handler for guaranteed per-task logging with no AI call.

**Tech Stack:** TypeScript (NodeNext ESM), PixiJS v8 Graphics API, Electron main process, Claude Agent SDK (`query()` with `agents: {}`), `node:fs/promises`

---

## Chunk 1: Canvas — Constants, Sprite, World

---

### Task 1: Constants + WorkflowPanel

**Files:**
- Modify: `src/canvas/constants.ts`
- Modify: `src/components/WorkflowPanel.tsx`

- [ ] **Step 1: Add broccolo to `VILLAGER_TO_DISTRICT` in `src/canvas/constants.ts`**

  The map already has `sherb`, `maple`, `zucker`, `marshal`, `piper`. Add:
  ```typescript
  broccolo: "plaza",
  ```
  Broccolo shares the plaza district with Piper — two villagers can share a district (the World.ts position loop and subsequent override handle them independently).

- [ ] **Step 2: Add broccolo to `VILLAGER_EMOJI` in `src/canvas/constants.ts`**

  ```typescript
  broccolo: "🐛",
  ```

- [ ] **Step 3: Add broccolo to `COLORS` in `src/canvas/constants.ts`**

  The `COLORS` object uses `as const`. Add inside the object literal (before the closing `} as const`):
  ```typescript
  broccolo: 0xf5c842,
  ```
  `0xf5c842` is yellow — from PLANNING.md `#F5C842`.

- [ ] **Step 4: Add broccolo to the local `VILLAGER_EMOJI` map in `src/components/WorkflowPanel.tsx`**

  WorkflowPanel maintains its own local emoji map (separate from constants.ts). Find the `VILLAGER_EMOJI` Record in this file and add:
  ```typescript
  broccolo: "🐛",
  ```

- [ ] **Step 5: TypeScript check**

  ```bash
  cd /Users/jacksonlin/Documents/nook-island
  npx tsc --project tsconfig.json --noEmit
  ```
  Expected: zero errors.

- [ ] **Step 6: Commit**

  ```bash
  git add src/canvas/constants.ts src/components/WorkflowPanel.tsx
  git commit -m "feat: add broccolo canvas constants (emoji, district, color)"
  ```

---

### Task 2: Broccolo.ts Sprite

**Files:**
- Create: `src/canvas/villagers/Broccolo.ts`

- [ ] **Step 1: Create `src/canvas/villagers/Broccolo.ts`**

  Yellow caterpillar. Follows the exact same structure as `Piper.ts` — extends `Villager`, implements `drawBody()` using PixiJS v8 Graphics API (method-chained `.fill()` and `.stroke()` after each shape call):

  ```typescript
  import * as PIXI from "pixi.js";
  import { Villager } from "./Villager.js";
  import { COLORS } from "../constants.js";

  export class Broccolo extends Villager {
    drawBody(): void {
      const g = this.body;

      // Three body segments
      g.ellipse(-14, 0, 10, 9).fill(COLORS.broccolo);
      g.ellipse(0, 2, 11, 10).fill(COLORS.broccolo);
      g.ellipse(14, 0, 10, 9).fill(COLORS.broccolo);

      // Segment dividers
      g.moveTo(-5, -7).lineTo(-5, 7).stroke({ color: 0xd4a820, width: 1.2 });
      g.moveTo(5, -7).lineTo(5, 7).stroke({ color: 0xd4a820, width: 1.2 });

      // Legs (nubs below each segment)
      g.ellipse(-14, 9, 3, 2).fill(0xd4a820);
      g.ellipse(0, 11, 3, 2).fill(0xd4a820);
      g.ellipse(14, 9, 3, 2).fill(0xd4a820);

      // Head (leftmost, slightly larger and raised)
      g.circle(-22, -6, 11).fill(COLORS.broccolo);
      g.ellipse(-24, -10, 5, 3).fill({ color: 0xffee99, alpha: 0.5 });

      // Antennas
      g.moveTo(-26, -16).lineTo(-30, -23).stroke({ color: 0xd4a820, width: 1.5 });
      g.moveTo(-18, -16).lineTo(-15, -23).stroke({ color: 0xd4a820, width: 1.5 });
      g.circle(-30, -24, 2).fill(0xd4a820);
      g.circle(-15, -24, 2).fill(0xd4a820);

      // Left eye: sclera → iris → pupil → shine
      g.circle(-25, -7, 3.5).fill(0xffffff);
      g.circle(-25, -7, 2.4).fill(0x3a2800);
      g.circle(-25.5, -7.5, 1.3).fill(0x100800);
      g.circle(-26.2, -8.5, 0.8).fill({ color: 0xffffff, alpha: 0.9 });

      // Right eye
      g.circle(-19, -7, 3.5).fill(0xffffff);
      g.circle(-19, -7, 2.4).fill(0x3a2800);
      g.circle(-19.5, -7.5, 1.3).fill(0x100800);
      g.circle(-20.2, -8.5, 0.8).fill({ color: 0xffffff, alpha: 0.9 });

      // Cheeks
      g.ellipse(-28, -4, 4, 3).fill({ color: 0xffaa44, alpha: 0.38 });
      g.ellipse(-16, -4, 4, 3).fill({ color: 0xffaa44, alpha: 0.38 });

      // Smile
      g.moveTo(-24, -2).quadraticCurveTo(-22, 0, -20, -2).stroke({ color: 0xd4a820, width: 1.2 });
    }
  }
  ```

  **PixiJS v8 note:** All draw calls chain `.fill(color)` or `.stroke({ color, width })` directly after the shape method. `COLORS.broccolo` resolves to `0xf5c842` (the `as const` literal added in Task 1).

- [ ] **Step 2: TypeScript check (renderer)**

  ```bash
  npx tsc --project tsconfig.json --noEmit
  ```
  Expected: zero errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/canvas/villagers/Broccolo.ts
  git commit -m "feat: add Broccolo caterpillar sprite"
  ```

---

### Task 3: World.ts — Instantiate and Position Broccolo

**Files:**
- Modify: `src/canvas/world/World.ts`

- [ ] **Step 1: Add Broccolo import**

  Find the existing `import { Piper } from "../villagers/Piper.js"` line. Add directly after it:
  ```typescript
  import { Broccolo } from "../villagers/Broccolo.js";
  ```
  Note: `.js` extension is required — this is a NodeNext ESM project.

- [ ] **Step 2: Instantiate Broccolo**

  Find `const piper = new Piper()`. Add directly after it (before the `this.villagers = { ... }` assignment):
  ```typescript
  const broccolo = new Broccolo();
  ```

- [ ] **Step 3: Add broccolo to `this.villagers`**

  The current assignment looks like:
  ```typescript
  this.villagers = { sherb, maple, zucker, marshal, piper };
  ```
  Change to:
  ```typescript
  this.villagers = { sherb, maple, zucker, marshal, piper, broccolo };
  ```
  `this.villagers` is typed as `Record<string, Villager>` — adding a new key is valid.

- [ ] **Step 4: Add position override after the positioning loop**

  The world constructor has a `for ... of Object.entries(this.villagers)` loop that sets default positions, then (after the loop) individually overrides Piper's position. Add Broccolo's override directly after Piper's override block:

  ```typescript
  broccolo.x = DISTRICT_POS.plaza.x + 28;
  broccolo.y = DISTRICT_POS.plaza.y - 5;
  (broccolo as unknown as { baseY: number }).baseY = broccolo.y;
  ```

  **Why the cast:** `baseY` is `protected` in the `Villager` base class. The existing Piper override uses the identical cast pattern (`(piper as unknown as { baseY: number }).baseY`). This positions Broccolo at plaza, 28px right of center — mirroring Piper who sits 28px left of center.

  **Why after the loop:** The loop overwrites all positions. The override must come after or it will be clobbered.

- [ ] **Step 5: TypeScript check (both)**

  ```bash
  npx tsc --project tsconfig.json --noEmit && npx tsc --project tsconfig.electron.json --noEmit
  ```
  Expected: zero errors on both.

- [ ] **Step 6: Commit**

  ```bash
  git add src/canvas/world/World.ts
  git commit -m "feat: instantiate and position Broccolo at plaza"
  ```

---

## Chunk 2: Orchestrator — Data Keeper Logic

---

### Task 4: orchestrator.ts — Full Broccolo Integration

**Files:**
- Modify: `electron/orchestrator.ts`

No new imports are needed. `fs`, `path`, `getDataDir`, and `JournalFile` are already imported from the Piper work in the previous sprint. `JOURNAL_DIR` is already declared at module scope.

---

- [ ] **Step 1: Add `TASKS_DIR` constant**

  Find `const JOURNAL_DIR = path.join(getDataDir(), "journals")` near the top of the file. Add directly after it:
  ```typescript
  const TASKS_DIR = path.join(getDataDir(), "tasks");
  ```

---

- [ ] **Step 2: Add `getPastBottles()` helper**

  Add after `TASKS_DIR` (still at module scope, before the Types section):
  ```typescript
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
  ```

  **How it works:** `fs.readdir` returns bare filenames. The filter selects `*_bottle.md` files while excluding the current task (which is still in progress). Lexicographic sort equals chronological order because all taskIds share the `task_` prefix followed by a fixed-width 13-digit ms timestamp. The catch returns `[]` gracefully on first-ever run when the tasks directory is empty.

---

- [ ] **Step 3: Add `updateBroccoloLog()` helper**

  Add directly after `getPastBottles`:
  ```typescript
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
  ```

  **Ordering note:** This runs AFTER Broccolo's agent subagent (if summoned) has already written `userFacts` to the journal, because `updateBroccoloLog` is called in the `result` handler which fires after all subagents finish. So the write sequence is: Broccolo agent writes `userFacts` → orchestrator reads that file → appends `completedTasks` → writes back. Sequential, no race.

---

- [ ] **Step 4: Update `SHERB_PLAN_SYSTEM`**

  Find the `SHERB_PLAN_SYSTEM` constant. It currently ends with something like:
  ```
  Available villagers for this session: maple (research), zucker (writing/drafting), marshal (critique/review), piper (narrator).
  For writing tasks: always include maple → zucker → marshal → piper in that order.
  The "piper" step action should always be: "close the task with a narrative and update her journal".
  ```

  Replace that trailing block with:
  ```
  Available villagers for this session: maple (research), zucker (writing/drafting), marshal (critique/review), piper (narrator), broccolo (tracker — include when the task involves patterns, history, or repeated work).
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
  ```

  **Why the example:** Without a concrete 5-step schema example, the LLM will never produce a plan with Broccolo — it only has a 4-step template to follow. The 5-step example gives Sherb a template to work from.

---

- [ ] **Step 5: Update `SHERB_EXEC_SYSTEM`**

  Find the `SHERB_EXEC_SYSTEM` constant. Make two changes:

  **Add Broccolo to the available villagers list** (after the piper bullet):
  ```
  - broccolo: Tracker — reads the completed bottle + recent task history, appends pattern insights, updates his journal
  ```

  **Update the terminal instruction.** Current last line:
  ```
  After marshal approves (or after zucker's second revision), always summon piper last to close the task.
  ```
  Replace with:
  ```
  After marshal approves (or after zucker's second revision), always summon piper to close the task.
  If the plan includes broccolo, summon broccolo after piper — broccolo always runs last when present.
  ```

---

- [ ] **Step 6: Add `buildBroccoloPrompt()` function**

  Add after `buildPiperPrompt()` and before `parsePlan()`:
  ```typescript
  function buildBroccoloPrompt(paths: {
    bottle: string;
    taskId: string;
    pastBottles: string[];
  }): string {
    const journalPath = path.join(JOURNAL_DIR, "broccolo.json");
    const pastList = paths.pastBottles.length > 0
      ? paths.pastBottles.map(p => `- ${p}`).join("\n")
      : "(no past tasks yet)";
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
  4. Read your journal at ${journalPath}. Update the userFacts field with any new patterns you noticed, then write the full JSON back.
     - DO NOT modify completedTasks — the island system already logged this task automatically.
     - Only update userFacts and relationships.
     If the file is missing or unparseable, start fresh with the JournalFile schema (villagerId, userFacts, completedTasks, relationships, baseline: null).
  5. Do NOT touch "## ✉️ Final Output" or any other villager's journey section.
  `;
  }
  ```

---

- [ ] **Step 7: Update `agentPaths` and add Broccolo to agents map**

  Find the `agentPaths` declaration in `runTwoStepSherb()` (currently just before the exec `for await` query):
  ```typescript
  const agentPaths = { ...paths, taskId };
  ```
  Replace with:
  ```typescript
  const pastBottlePaths = await getPastBottles(taskId, 10);
  const agentPaths = { ...paths, taskId, pastBottles: pastBottlePaths };
  ```

  Then in the `agents: {}` map (inside the exec `query()` call), add the Broccolo entry after the `piper` entry:
  ```typescript
  broccolo: {
    description:
      "Use Broccolo to archive the completed task and identify patterns from recent task history. Summon after Piper when the task is analytical, recurring, or when historical patterns would add value.",
    tools: ["Read", "Write"],
    prompt: buildBroccoloPrompt(agentPaths),
  },
  ```

  No change to parent `allowedTools` — `["Agent", "Read", "Write", "WebSearch"]` already covers Broccolo's `Read` + `Write` needs.

---

- [ ] **Step 8: Call `updateBroccoloLog()` in the task_complete handler**

  Find the `if (msg.type === "result" && !msg.is_error)` block inside the exec `for await` loop. It currently ends with `await shell.openPath(paths.bottle)`. Add one line INSIDE this block, after `shell.openPath`:

  ```typescript
  if (msg.type === "result" && !msg.is_error) {
    const completeEvent = {
      type: "task_complete" as const,
      taskId,
      outputPath: paths.bottle,
      cost_usd: msg.total_cost_usd ?? 0,
    };
    await appendTaskEvent(taskId, completeEvent);
    win.webContents.send(CHANNELS.ISLAND_EVENT, completeEvent);
    await shell.openPath(paths.bottle);
    await updateBroccoloLog(taskId, description); // ← add this line, inside the if block
  }                                               // ← closing brace stays here
  ```

  **⚠️ Critical:** This MUST be inside the `if` block. Placing it outside would call `updateBroccoloLog` on every SDK message (errors, partial results, etc.), not just on successful task completion.

  `description` is the `runTwoStepSherb` function parameter — it's in scope throughout the function body as a closure variable.

---

- [ ] **Step 9: TypeScript check (both configs)**

  ```bash
  npx tsc --project tsconfig.electron.json --noEmit && npx tsc --project tsconfig.json --noEmit
  ```
  Expected: zero errors on both.

- [ ] **Step 10: Commit**

  ```bash
  git add electron/orchestrator.ts
  git commit -m "feat: add Broccolo agent — data keeper with auto-log + optional pattern analysis"
  ```

---

## Verification

After all tasks are committed:

```bash
npm run dev
```

**Checklist:**
1. Yellow caterpillar 🐛 visible at plaza (right of Piper, near mailbox)
2. Submit a standard task → Sherb's plan has 4 steps (no Broccolo — correct)
3. Task completes → `~/Library/Application Support/NookIsland/journals/broccolo.json` has a `completedTasks` entry (Layer 1 auto-log)
4. Submit an analytical task (e.g., "what patterns do you see in my recent tasks?") → Sherb's plan should include broccolo as step 5
5. If Broccolo runs → WorkflowPanel shows `🐛` node; bottle has `### 🐛 Broccolo tracked` section; `broccolo.json` has updated `userFacts`
6. After 2+ tasks, run an analytical task → Broccolo's bottle section references both past tasks
