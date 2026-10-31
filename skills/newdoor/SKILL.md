---
name: newdoor
description: Set up a door that was just created. Asks the owner what the door is for, how it should behave, what it owes and who its parent is, then writes STATE.md in their words, adds the door's row to the workspace README and commits. Run once, as the first message in a new door — `door new <name>` runs it for you.
argument-hint: <door name>
---

Set up this new door. Door name from the command (may be empty): $ARGUMENTS

The current directory is the door; `$ROOT` is the nearest parent containing
`.doors`. If `STATE.md` here already has content beyond the template, say so
and stop — the door is set up. Read `$ROOT/README.md` for the existing doors
and their tiers before asking anything, so you can suggest a parent.

## Ask, in two short rounds
Round one, together, as plain questions (use multiple-choice where the
options are obvious):
1. **What does this door cover?** One or two sentences in the owner's words.
2. **Where does it sit?** A project door reporting to a top door (name it from
   the README), a top door itself, or an outside door that reports to nobody.
3. **How should Claude behave here?** Tone, what to push back on, anything
   that must never happen in this door. Offer the common answers: "don't
   sugarcoat", "money figures only from documents", "never contact X without
   showing me".

Round two, after the answers:
4. **What is open right now?** Things in flight.
5. **What does it owe, and when?** Anything with a date. Turn each into a line
   with `node $ROOT/bin/obligations.mjs --propose "<their words>"` and show the
   lines.
6. **Should this door meet?** If yes, on what cadence — that becomes the
   `· review` line; the agenda itself is proposed the first time `/meet` runs.
7. **Facts a session will need** — account names, references, people, places.
   No passwords or secrets, ever; those stay in a password manager.

## Write
- `STATE.md`: fill the template's sections from the answers, in the owner's
  words where they gave them. If a parent was named, the second line is
  `**Parent:** \`<parent>\``. Put the obligation lines under `## Obligations`
  and nothing else there. Remove template placeholder text.
- `$ROOT/README.md`: add the door's row to the table under the right tier.
- If a parent was named, append to the parent's `STATE.md` under
  `## From <door> — YYYY-MM-DD`: "opened; <one line on what it covers>".
- `node $ROOT/bin/obligations.mjs --doctor` must be clean for this door.
- Commit: `git -C $ROOT add <door>/ README.md <parent>/STATE.md && git -C $ROOT commit -m "<Door> — Opened"`.

## Close
Show the finished `STATE.md` once, then: "Door open. `door <name>` opens it
with /open; `/wrap` closes a session." Then stop.
