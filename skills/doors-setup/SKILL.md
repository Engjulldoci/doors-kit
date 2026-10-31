---
name: doors-setup
description: First-run conversation for a new doors workspace. Walks the owner through naming their doors, choosing a top door, writing their own standing rules into CLAUDE.md, and creating the first doors with STATE.md files. Run once, from the workspace root, right after install.sh. Interactive — asks, proposes, writes on a yes.
argument-hint: [optional: a list of door names to start from]
---

Set up this workspace. Hint from the command (may be empty): $ARGUMENTS

The current directory must be the workspace root: it contains `.doors`,
`README.md`, `CLAUDE.md`, `bin/`, `docs/` and `.templates/`. If it does not,
say so and stop. Read `README.md`, `CLAUDE.md` and `docs/how-doors-work.md`
first; they describe the system you are about to tailor. Keep each message
short; the owner is deciding things, not reading a manual.

## 1. Explain the shape in five lines
What a door is (one directory, one `STATE.md`, one project), the seat above
them, `/open` and `/wrap`, obligations as the calendar, notes between doors.
Then ask the first question.

## 2. Ask, one round at a time
Use multiple-choice where it helps; always allow free text.

1. **What are you running?** Ask for the list of projects, ventures, areas of
   life — anything that deserves its own door. Suggest shapes: a business and
   its parts; a job; money; housing; a side project; legal admin. Aim for
   three to eight doors to start. Fewer is fine. Propose names: short,
   lowercase, one word where possible.
2. **Is there a top door?** One that reads the others and asks "where is this
   going" — the owner's own board. Usually yes for ventures, no for a purely
   personal set. Which doors report to it, and which are outside (personal,
   private, report to nobody)?
3. **Your rules.** The agreement ships with the standing rules every workspace
   has needed: never estimate a figure, show every draft before it is sent, do
   the work and bring only the final step, if it can be done now do it now, an
   unchecked source is not a quiet one. Read them back in one line each and
   ask: which of these do you want **stronger**, which do you want **dropped**,
   and what rule of your own should be added? Offer examples: "never contact a
   buyer without showing me", "no personal-life facts in work doors", "commit
   messages in Title Case".
4. **How do you want to be addressed** in files, and what should sessions call
   you? Pronouns if they want to give them; otherwise the files say "the owner".
5. **Model and cost.** Ask whether they want a note in the README on which
   model each door runs, and remind them in one line that short sessions and
   `/wrap` are the saving, not the model.

## 3. Propose, then write on a yes
Show, in one message:
- The doors table for `README.md` (tier, door, one line each).
- The edits to `CLAUDE.md`: the owner's rules added under a dated heading,
  any dropped rules removed, the `## The owner` section filled in.
- For each door, a three-line `STATE.md` summary: purpose, parent, first
  obligation if any.

Wait for a yes. Then:
- Create each door: `mkdir <door>` and `STATE.md` from `.templates/STATE.md`
  with the purpose line and parent filled in, a `## Obligations` block with a
  weekly `· review` line unless the owner said no meetings.
- Write `README.md` and `CLAUDE.md`.
- Write `handoffs/.keep` so the directory exists.
- `node bin/obligations.mjs --doctor` must be clean.
- `node bin/obligations.mjs --calendar`.
- Commit: `git add -A && git commit -m "Workspace — Opened With <N> Doors"`.
  (This is the one time `add -A` is right: the workspace is new and nothing
  else is mid-edit.)

## 4. Close
Print, as pastable commands:
- `door` — list and pick
- `door <first door>` — open the first door, which runs `/open`
- `door new <name>` — add a door later
- `door cal` — the calendar

Then one line: "In each door, start with `/open`, end with `/wrap`." Then stop.
If the owner wants to open a door now, tell them to start a new session from
it with `door <name>` rather than continuing here — the seat above the doors
does no door's work.
