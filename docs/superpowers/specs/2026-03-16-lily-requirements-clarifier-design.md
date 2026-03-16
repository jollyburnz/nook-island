# Lily — Requirements Clarifier Design

**Date:** 2026-03-16
**Status:** Approved — ready for implementation planning

---

## Context

Lily is the 🐸 Frog "Listener" archetype on Nook Island. The pipeline currently goes Maple → Zucker with no translation step — Zucker gets raw research notes and has to infer what the user actually needs. Lily fills that gap: she reads the task description and Maple's notes, then writes a concise requirements brief to the bottle so Zucker has clear signal before he drafts.

MCP (Gmail) remains deferred indefinitely. Lily's value here is entirely from her listening/synthesizing role — no external data access needed.

---

## Design

### Role

**Requirements clarifier.** Optional exec chain member. When Sherb includes Lily, she runs after Maple and before Zucker. She reads what Maple found and what the task actually asked for, then writes a focused brief: what Jackson needs, who the audience is, what success looks like, and any constraints Zucker should keep in mind.

She does NOT research. She does NOT draft. She translates.

### When Sherb summons her

Lily is optional — Sherb decides per-task. Trigger criteria (written into SHERB_PLAN_SYSTEM):
- Task is audience-specific (email to a specific person, pitch to a producer, message to a client)
- Task is ambiguous (vague scope, multiple interpretations possible)
- Task requires stakeholder perspective (what will the recipient think/feel/do?)
- Task involves persuasion or emotional tone (the "who is this for" matters as much as "what does it say")

She is NOT needed for: straightforward research summaries, factual documents, outlines with clear structure.

### Pipeline position

```
maple → [lily?] → zucker → marshal → piper → [broccolo?]
```

When present, lily always runs after maple and before zucker. Zucker's prompt is unchanged — he simply reads the bottle and notes as normal, and Lily's requirements section will be there if she ran.

**Revision loop:** If Marshal sends a revision back to Zucker, Lily does NOT re-run. Her brief is already in the bottle; Zucker re-reads it as part of the bottle and revises accordingly.

### What Lily writes

Appends `### 🐸 Lily listened` to the bottle under `## 🗺️ Journey`:

```markdown
### 🐸 Lily listened

**What Jackson actually needs:** [1-2 sentences — the real goal beneath the request]
**Audience:** [who will read/receive this — specific person or type]
**Success looks like:** [what a good outcome does for the reader]
**Constraints Zucker should know:** [tone, length, format preferences, things to avoid]
```

Writes a 1-sentence handoff note at the end (per CLAUDE.md rules). Does NOT touch `## ✉️ Final Output`. Does NOT modify Maple's section.

### Tools

`["Read", "Write"]` — reads notes file + bottle file, writes to bottle. No MCP, no web search.

---

## Canvas

### New district: `river`

A 6th canvas district added to `DISTRICT_POS` in `src/canvas/constants.ts`:

```typescript
river: { x: 2560, y: 480 },
```

Position rationale: top-center of the 5120×3200 world, north of the plaza, near the water's edge. A frog lives near water. It sits naturally above the existing district layout without crowding.

Current district layout for reference:
```
              [river: 2560, 480]
[townhall: 1120, 960]    [forest: 4000, 960]
          [plaza: 2560, 1600]
[library: 1120, 2400]    [cafe: 4000, 2400]
```

**Known gap — no RiverDistrict chunk:** Adding `river` to `DISTRICT_POS` and `VILLAGER_TO_DISTRICT` is sufficient for the positioning loop to place Lily correctly. However, no `RiverDistrict` land chunk or `districtMap` entry is created in this sprint — Lily will stand on the ocean background with no land tile beneath her, and clicking her area won't focus the camera. A future task will add the proper terrain chunk and bridge. This is an accepted visual limitation for this sprint.

### Villager registration

In `src/canvas/constants.ts`:
- `DISTRICT_POS`: `river: { x: 2560, y: 480 }`
- `VILLAGER_TO_DISTRICT`: `lily: "river"`
- `VILLAGER_EMOJI`: `lily: "🐸"`
- `COLORS`: `lily: 0x8db48e` (green — from PLANNING.md `#8DB48E`)

In `src/components/WorkflowPanel.tsx` local emoji map: `lily: "🐸"`

### Lily.ts sprite

New file: `src/canvas/villagers/Lily.ts`

Extends `Villager`, implements `drawBody()`. Green frog with:
- Round main body (green ellipse, slightly squashed)
- Smaller head resting on top of body (lighter green)
- Two large round eyes on top of head with full sclera/iris/pupil/shine layers (matching the 4-layer eye pattern from Piper/Broccolo)
- Subtle nostril dots
- Rosy cheeks
- Wide smile
- Two small front arms/hands resting at sides (darker green nubs)
- Two larger back leg nubs below body
- Pale belly patch (lighter ellipse on front of body)
- Main color: `COLORS.lily` (`0x8db48e`)
- Accent color: `0x6a9a6a` (darker green for legs/arms/outlines)
- Belly: `0xc8e6c8` (pale green)

Uses `.js` extension imports (NodeNext ESM). PIXI namespace import included (matches Piper/Broccolo pattern).

### World.ts changes

- Import `Lily` from `"../villagers/Lily.js"`
- Instantiate `const lily = new Lily()` after `const broccolo = new Broccolo()`
- Add `lily` to `this.villagers = { sherb, maple, zucker, marshal, piper, broccolo, lily }`
- No position override block needed — Lily is the sole occupant of `river`, so the for-loop places her at `DISTRICT_POS.river` center by default
- The for-loop already applies the `baseY` cast to every villager generically — no additional cast needed for Lily

---

## Orchestrator

File: `electron/orchestrator.ts`

No new imports needed. All helpers (`fs`, `path`, `getDataDir`, `JournalFile`, `JOURNAL_DIR`) already present.

### `buildLilyPrompt()`

New function added after `buildMaplePrompt()` (group with the other `buildXPrompt` functions):

```typescript
function buildLilyPrompt(paths: {
  bottle: string;
  notes: string;
}): string {
  const journalPath = path.join(JOURNAL_DIR, "lily.json");
  return `You are Lily, a gentle frog villager on Nook Island. You are the island's Listener — you hear what people really need beneath what they ask for.

Your files:
- Current bottle: ${paths.bottle}
- Maple's research notes: ${paths.notes}
- Your journal: ${journalPath}

Instructions:
1. Read the bottle to understand what task was submitted and what Maple researched.
2. Read Maple's notes file for the full research context.
3. Append your section to the bottle under "## 🗺️ Journey":
   - Heading: "### 🐸 Lily listened"
   - **What Jackson actually needs:** 1-2 sentences — the real goal beneath the request
   - **Audience:** who will read or receive this output
   - **Success looks like:** what a good outcome does for the reader
   - **Constraints Zucker should know:** tone, length, format preferences, things to avoid
   - End with a 1-sentence handoff note: "Passing this brief to Zucker."
4. Read your journal at ${journalPath}. Update the userFacts field with anything you noticed about Jackson's preferences or audience patterns, then write the COMPLETE JSON back (preserving all other fields exactly as-is, including completedTasks).
   If the file is missing or unparseable, start fresh: { villagerId: "lily", userFacts: {}, completedTasks: [], relationships: {}, baseline: null }.
5. Do NOT touch "## ✉️ Final Output" or any other villager's journey section.
`;
}
```

**Signature note:** `taskId` is NOT in the signature — Lily's prompt body doesn't use it. The call site passes `paths` directly (the `getTaskPaths()` return value: `{ bottle, notes, jsonl }`). TypeScript is happy because `paths` satisfies `{ bottle: string; notes: string }`.

### `SHERB_PLAN_SYSTEM` update

Add `lily` to the available villagers list (after maple):
```
lily (listener — include when the task is audience-specific, ambiguous in scope, or needs a clear brief before drafting)
```

Add trigger guidance after the piper/broccolo instructions:
```
Include lily between maple and zucker when the task involves a specific audience, requires persuasion or emotional tone, or has ambiguous scope where "what does Jackson actually need" isn't obvious from the request alone.
The "lily" step action should always be: "listen to what this task really needs and write a brief for Zucker".
```

Add a 5-step JSON example with lily (add alongside the existing 4-step default and 5-step broccolo examples):
```json
{
  "task": "one sentence description",
  "steps": [
    { "villager": "maple",  "action": "what maple should do" },
    { "villager": "lily",   "action": "listen to what this task really needs and write a brief for Zucker" },
    { "villager": "zucker", "action": "what zucker should do" },
    { "villager": "marshal","action": "what marshal should do" },
    { "villager": "piper",  "action": "close the task with a narrative and update her journal" }
  ]
}
```

### `SHERB_EXEC_SYSTEM` update

Add lily bullet after maple:
```
- lily: Listener — reads the task and Maple's notes, writes a clear requirements brief (audience, goal, constraints) for Zucker
```

Add to the ordering instruction:
```
When lily is in the plan, she always runs after maple and before zucker. If marshal requests a revision, lily does NOT re-run — her brief remains in the bottle for Zucker to reference.
```

### `agents` map update

Add `lily` entry after `maple`:
```typescript
lily: {
  description:
    "Use Lily when the task is audience-specific, ambiguous in scope, or needs a requirements brief before Zucker drafts. She translates Maple's research into a clear 'what does Jackson actually need' brief. Run after Maple, before Zucker.",
  tools: ["Read", "Write"],
  prompt: buildLilyPrompt(paths),
},
```

**Call site:** `buildLilyPrompt(paths)` — passes the `paths` object from `getTaskPaths()` directly. `paths` contains `{ bottle, notes, jsonl }` which satisfies the `{ bottle: string; notes: string }` signature.

No change to parent `allowedTools` — `["Agent", "Read", "Write", "WebSearch"]` already covers `Read` + `Write`.

---

## Files Changed

| File | Change |
|---|---|
| `src/canvas/constants.ts` | Add `river` to DISTRICT_POS; add `lily` to VILLAGER_TO_DISTRICT, VILLAGER_EMOJI, COLORS |
| `src/components/WorkflowPanel.tsx` | Add `lily: "🐸"` to local emoji map |
| `src/canvas/villagers/Lily.ts` | New file — green frog sprite |
| `src/canvas/world/World.ts` | Import + instantiate + add to this.villagers (no position override needed) |
| `electron/orchestrator.ts` | buildLilyPrompt(), SHERB_PLAN_SYSTEM update, SHERB_EXEC_SYSTEM update, agents map entry |

---

## Verification

```bash
npm run dev
```

1. Green 🐸 visible at top-center of canvas (river district, north of plaza) — standing on ocean water (no land chunk yet, accepted for this sprint)
2. Submit a task like "write an email to my producer about the next shoot" → Sherb's plan should include lily between maple and zucker
3. Task completes → bottle has `### 🐸 Lily listened` section with requirements brief (audience, goal, constraints)
4. Zucker's draft should reflect Lily's brief
5. Submit a factual task ("summarise the history of Kodak") → Sherb's plan should NOT include lily (4-step default)
6. TypeScript check: `npx tsc --project tsconfig.json --noEmit && npx tsc --project tsconfig.electron.json --noEmit` → zero errors on both
