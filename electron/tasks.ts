// Task-scoped file operations for Nook Island.
// All three task files share the same {taskId} prefix:
//   {taskId}_bottle.md  — human-readable journey + final output
//   {taskId}_notes.md   — Maple's raw research (lean, separate)
//   {taskId}.jsonl      — machine-readable event audit trail

import fs from "fs/promises";
import path from "path";
import { getDataDir } from "./data.js";

export function generateTaskId(): string {
  // Simple timestamp-based ID — readable in filenames, unique enough for personal tool
  return `task_${Date.now()}`;
}

export function getTaskPaths(taskId: string) {
  const tasksDir = path.join(getDataDir(), "tasks");
  return {
    bottle: path.join(tasksDir, `${taskId}_bottle.md`),
    notes:  path.join(tasksDir, `${taskId}_notes.md`),
    jsonl:  path.join(tasksDir, `${taskId}.jsonl`),
  };
}

export async function initBottleFile(taskId: string, description: string): Promise<void> {
  const { bottle } = getTaskPaths(taskId);
  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const header = [
    `# 🍶 ${description}`,
    `> In progress · ${now}`,
    ``,
    `---`,
    ``,
    `## ✉️ Final Output`,
    ``,
    `*(villagers are working on it...)*`,
    ``,
    `---`,
    ``,
    `## 🗺️ Journey`,
    ``,
  ].join("\n");
  await fs.writeFile(bottle, header, "utf8");
  console.log(`[tasks] bottle created: ${bottle}`);
}

export async function appendTaskEvent(taskId: string, event: unknown): Promise<void> {
  const { jsonl } = getTaskPaths(taskId);
  await fs.appendFile(jsonl, JSON.stringify(event) + "\n", "utf8");
}
