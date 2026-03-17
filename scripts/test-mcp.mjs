#!/usr/bin/env node
// scripts/test-mcp.mjs — MCP server smoke test
// Run: node scripts/test-mcp.mjs
// Purpose: verify each MCP server starts and reveal exact tool names exposed.
// Compare printed tool names against orchestrator.ts allowedTools.

import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const CREDENTIALS = path.join(
  os.homedir(),
  "Library",
  "Application Support",
  "NookIsland",
  "credentials",
);

const SERVERS = {
  gmail: {
    command: "npx",
    args: ["-y", "@gongrzhe/server-gmail-autoauth-mcp"],
    env: {
      GMAIL_OAUTH_PATH: path.join(CREDENTIALS, "gmail-oauth.keys.json"),
      GMAIL_CREDENTIALS_PATH: path.join(CREDENTIALS, "gmail-credentials.json"),
    },
  },
  sheets: {
    command: "npx",
    args: ["-y", "mcp-gsheets"],
    env: (() => {
      const keyPath = path.join(CREDENTIALS, "sheets-service-account.json");
      let projectId = "";
      try {
        const sa = JSON.parse(readFileSync(keyPath, "utf-8"));
        projectId = sa.project_id ?? "";
      } catch {}
      return {
        GOOGLE_APPLICATION_CREDENTIALS: keyPath,
        ...(projectId ? { GOOGLE_PROJECT_ID: projectId } : {}),
      };
    })(),
  },
};

async function testServer(name, config) {
  return new Promise((resolve) => {
    const proc = spawn(config.command, config.args, {
      env: { ...process.env, ...config.env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    const rl = createInterface({ input: proc.stdout });
    const stderrLines = [];

    const send = (obj) => {
      proc.stdin.write(JSON.stringify(obj) + "\n");
    };

    const timeout = setTimeout(() => {
      proc.kill();
      resolve({
        name,
        ok: false,
        error: `timeout (5s) — server never responded\n   stderr: ${stderrLines.slice(-3).join(" | ") || "(none)"}`,
      });
    }, 5000);

    rl.on("line", (line) => {
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        return;
      }

      // Step 1: got initialize response → send initialized notification + tools/list
      if (msg.id === 1 && msg.result) {
        send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
        send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
      }

      // Step 2: got tools/list response → done
      if (msg.id === 2) {
        clearTimeout(timeout);
        proc.kill();
        if (msg.error) {
          resolve({ name, ok: false, error: `tools/list error: ${JSON.stringify(msg.error)}` });
        } else {
          const tools = msg.result?.tools ?? [];
          resolve({ name, ok: true, tools: tools.map((t) => t.name) });
        }
      }

      // Error response on initialize
      if (msg.id === 1 && msg.error) {
        clearTimeout(timeout);
        proc.kill();
        resolve({ name, ok: false, error: `initialize error: ${JSON.stringify(msg.error)}` });
      }
    });

    proc.stderr.on("data", (d) => {
      stderrLines.push(d.toString().trim());
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      resolve({ name, ok: false, error: err.message });
    });

    proc.on("close", (code) => {
      // Only matters if timeout hasn't fired yet
    });

    // Kick off the initialize handshake
    send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "nook-smoke-test", version: "1.0" },
      },
    });
  });
}

console.log("🏝️  Nook Island MCP Smoke Test\n");
console.log(`Credentials dir: ${CREDENTIALS}\n`);

const results = [];
for (const [name, config] of Object.entries(SERVERS)) {
  process.stdout.write(`Testing ${name}... `);
  const result = await testServer(name, config);
  results.push(result);
  if (result.ok) {
    console.log(`✅ PASS`);
    console.log(`   Tools: ${result.tools.join(", ")}`);
  } else {
    console.log(`❌ FAIL`);
    console.log(`   Error: ${result.error}`);
  }
}

console.log("\n── What orchestrator.ts expects ──────────────────────────");
console.log("gmail  allowedTools: mcp__gmail__search_emails, mcp__gmail__read_email");
console.log("sheets allowedTools: mcp__sheets__sheets_get_values, mcp__sheets__sheets_append_values");
console.log("\nIf the tool names printed above don't match, update orchestrator.ts allowedTools.");

const allPassed = results.every((r) => r.ok);
process.exit(allPassed ? 0 : 1);
