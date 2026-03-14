/**
 * Layer 8 smoke test — two-step Sherb.
 * Run with NOOK_LAYER4_TEST=1.
 *
 * Calls runTwoStepSherb with an auto-approve callback (simulates player click).
 * Layer 11 replaces the callback with an IPC round-trip to the renderer.
 *
 * Done when:
 *   1. Plan JSON logged after step 1
 *   2. PLAN_PROPOSED event visible in DevTools
 *   3. Maple writes _notes.md and appends to _bottle.md after step 2
 *   4. JSONL contains: task_received → plan_proposed → plan_approved → task_complete
 */
import { BrowserWindow } from "electron";
import { runTwoStepSherb } from "./orchestrator.js";

export async function runSherbTest(win: BrowserWindow): Promise<void> {
  await runTwoStepSherb(
    win,
    "Research 3 interesting facts about Animal Crossing video games",
    async (plan) => {
      console.log("[smoke-test] plan proposed:", JSON.stringify(plan, null, 2));
      console.log("[smoke-test] auto-approving plan...");
      return true; // Layer 11 replaces this with IPC wait
    },
  );
}
