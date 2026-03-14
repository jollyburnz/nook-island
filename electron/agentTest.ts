/**
 * Layer 4: temporary Agent SDK smoke test.
 * Run with NOOK_LAYER4_TEST=1 to verify the SDK connects and streams messages.
 * This file is deleted and replaced by server/orchestrator.ts in later layers.
 *
 * Estimated cost per run: ~$0.01–0.05 (no tools, brief prompt, 3-turn max).
 */
import { query } from "@anthropic-ai/claude-agent-sdk";
import { app } from "electron";

export async function runMapleTest(): Promise<void> {
  console.log("[maple] ── starting Layer 4 test query ──");

  for await (const message of query({
    prompt:
      "Give me 3 interesting facts about Animal Crossing video games. Be concise — one sentence each.",
    options: {
      systemPrompt:
        "You are Maple, a sweet and curious bear cub villager. Keep responses short and friendly.",
      allowedTools: [],          // no tools — pure reasoning, near-zero cost
      permissionMode: "dontAsk",
      maxTurns: 3,
      maxBudgetUsd: 0.10,        // hard cap
      cwd: app.getAppPath(),     // project root — finds CLAUDE.md
      settingSources: ["project"], // enables CLAUDE.md auto-injection
    },
  })) {
    console.log("[maple]", JSON.stringify(message, null, 2));
  }

  console.log("[maple] ── query complete ──");
}
