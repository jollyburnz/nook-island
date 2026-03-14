import { runTwoStepSherb } from "./orchestrator.js";
export async function runSherbTest(win) {
    await runTwoStepSherb(win, "Research 3 interesting facts about Animal Crossing video games", async (plan) => {
        console.log("[smoke-test] plan proposed:", JSON.stringify(plan, null, 2));
        console.log("[smoke-test] auto-approving plan...");
        return true; // Layer 11 replaces this with IPC wait
    });
}
//# sourceMappingURL=agentTest.js.map