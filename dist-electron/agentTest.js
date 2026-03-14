import { runTwoStepSherb } from "./orchestrator.js";
export async function runSherbTest(win) {
    await runTwoStepSherb(win, "Write a short pitch (3-4 sentences) for a documentary about the history of Animal Crossing", async (plan) => {
        console.log("[smoke-test] plan proposed:", JSON.stringify(plan, null, 2));
        console.log("[smoke-test] auto-approving plan...");
        return true; // Layer 11 replaces this with IPC wait
    });
}
//# sourceMappingURL=agentTest.js.map