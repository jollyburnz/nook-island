/**
 * Layer 7: smoke test with real bottle file output.
 * Run with NOOK_LAYER4_TEST=1 to verify the SDK writes _bottle.md and _notes.md to disk.
 * This file is deleted and replaced by server/orchestrator.ts in later layers.
 *
 * Estimated cost per run: ~$0.05–0.15 (file tools enabled, brief task).
 */
import { query } from "@anthropic-ai/claude-agent-sdk";
import { app, BrowserWindow } from "electron";
import { CHANNELS } from "./ipc/channels.js";
import { generateTaskId, getTaskPaths, initBottleFile, appendTaskEvent } from "./tasks.js";

export async function runMapleTest(win: BrowserWindow): Promise<void> {
  const taskId = generateTaskId();
  const paths = getTaskPaths(taskId);
  const description = "3 Interesting Facts About Animal Crossing";

  await initBottleFile(taskId, description);
  console.log("[maple] ── starting Layer 7 bottle test ──");
  console.log("[maple] taskId:", taskId);
  console.log("[maple] bottle:", paths.bottle);

  const prompt = `You are Maple, a sweet and curious bear cub villager on Nook Island.

Your task: Research 3 interesting facts about Animal Crossing video games.

Your files for this task:
- Notes file (your raw research): ${paths.notes}
- Bottle file (shared deliverable): ${paths.bottle}

Instructions:
1. Write your raw research notes to the notes file (${paths.notes})
2. Open the bottle file and append your journey section under the "## 🗺️ Journey" heading
   - Use heading: "### 🐻 Maple researched"
   - Summarize the 3 facts clearly
   - End with a 1-2 sentence handoff note (e.g. "Passing the bottle to Zucker to draft the output.")
3. Do NOT modify the "## ✉️ Final Output" section — that's for a later villager

Follow the Bottle Writing Rules from CLAUDE.md. Keep responses concise and friendly.`;

  for await (const message of query({
    prompt,
    options: {
      systemPrompt:
        "You are Maple, a sweet and curious bear cub villager on Nook Island. Follow CLAUDE.md rules exactly.",
      allowedTools: ["Read", "Write", "Edit"],
      permissionMode: "dontAsk",
      maxTurns: 10,
      maxBudgetUsd: 0.25,
      cwd: app.getAppPath(),
      settingSources: ["project"],
    },
  })) {
    console.log("[maple]", JSON.stringify(message, null, 2));
    win.webContents.send(CHANNELS.ISLAND_EVENT, message);

    // Persist result event to JSONL audit trail
    if (typeof message === "object" && message !== null && "type" in message) {
      const msg = message as { type: string };
      if (msg.type === "result") {
        await appendTaskEvent(taskId, { type: "task_complete", taskId, outputPath: paths.bottle });
      }
    }
  }

  console.log("[maple] ── query complete ──");
  console.log("[maple] check disk:", paths.bottle);
}
