/**
 * Layer 9 smoke test — full villager chain (Maple → Zucker → Marshal).
 * Run with NOOK_LAYER4_TEST=1.
 *
 * Calls runTwoStepSherb with an auto-approve callback (simulates player click).
 * Layer 11 replaces the callback with an IPC round-trip to the renderer.
 *
 * Done when:
 *   1. Plan JSON logged with maple → zucker → marshal steps
 *   2. Bottle has three ### sections (Maple researched, Zucker drafted, Marshal reviewed)
 *   3. Final Output section contains Zucker's actual draft (not placeholder)
 *   4. JSONL contains: task_received → plan_proposed → plan_approved → task_complete
 *   5. Bottle file opens in default markdown editor on completion
 */
import { BrowserWindow } from "electron";
import { runTwoStepSherb } from "./orchestrator.js";

export async function runSherbTest(win: BrowserWindow): Promise<void> {
  await runTwoStepSherb(
    win,
    "Write a short pitch (3-4 sentences) for a documentary about the history of Animal Crossing",
    async (plan) => {
      console.log("[smoke-test] plan proposed:", JSON.stringify(plan, null, 2));
      console.log("[smoke-test] auto-approving plan...");
      return true; // Layer 11 replaces this with IPC wait
    },
  );
}
