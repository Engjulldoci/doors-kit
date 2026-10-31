---
name: meet
description: Hold this door's meeting. Reads the door's agenda (meeting.md), its STATE.md, obligations and latest minutes, then runs the agenda as a conversation with the owner — last time's decisions, the measures with their sources, what moved, what went well and did not, decisions, next period — and ends by writing dated minutes into STATE.md and one line up to the parent door. In a top door it is the board: it reads every child door's latest minutes. Run on the cadence the door's `· review` line sets.
argument-hint: [optional focus, e.g. "just the numbers" or "skip to decisions"]
---

Hold this door's meeting. Extra instruction from the user (may be empty): $ARGUMENTS

A meeting is a conversation, not a report. **The door leads it.** You bring the
agenda, the facts, and on every question a recommendation with its reasons,
drawn from the door's own records. The owner brings the judgement and makes the
decision. Nothing is decided by you. Nothing is sent. Figures come from
documents or the door's records, never from memory — a number you cannot trace
is said as "not traced", not guessed.

## 0. Find the door and its agenda
The current directory is the door; `$ROOT` is the nearest parent containing
`.doors`. If there is no `STATE.md`, say so and stop.

If there is no `meeting.md`, this door has never met. **Propose one** from the
door's own words — its purpose line, its obligations, the numbers it already
tracks — in the format in `$ROOT/docs/meeting-format.md`. Show the whole file
in chat, plus the `· review` obligation line you would add (with `repeats:` for
the cadence the owner picks). Wait for a yes. On a yes write `meeting.md`, add
the review line, and continue. On a no, stop.

## 1. Read, in this order
1. `meeting.md` — the measures and standing questions.
2. `STATE.md` in full, and its newest `## Minutes — YYYY-MM-DD` section: last
   time's decisions and goals are the first thing to check against.
3. Notes left since the last minutes: every `## From <door> — <date>` newer
   than the last minutes' date.
4. `node $ROOT/bin/obligations.mjs --all --door <door>` — what is due,
   overdue, blocked; and the `[x]` lines in `STATE.md` ticked since the last
   minutes.
5. Each measure in `meeting.md` names its source. Read that source. If it
   cannot be read from here, report the measure as "not checked: <why>", never
   as last time's number.

**In a door that other doors name as `Parent:`** also read the newest
`## Minutes` section of each child door. Those are the reports to the board. Do
not re-read the whole of each child.

## 2. Run the agenda, one item at a time
Put each item to the owner as a short brief and a question, then wait. Do not
run the whole agenda in one message. The order is fixed:

1. **Last time's decisions** — each: done, not done, or overtaken. One line
   each. A goal not met gets a **why** from the records and a **recommended
   action**, never just "missed"; the owner accepts or corrects the action.
2. **The measures** — a table: measure, now, last, source.
3. **What moved** — since the last minutes. At most five lines.
4. **What went well / what did not** — your reading in two or three lines each,
   then ask for the owner's. Theirs goes in the minutes; yours is a prompt.
5. **The standing questions**, each asked plainly.
6. **Decisions needed** — numbered, with the options. The owner answers; you
   record. A deferred decision is recorded as deferred with the date it returns.
7. **Next period** — up to three goals with dates. Each becomes an obligation
   line, proposed with `--propose` and shown before it is written.

If $ARGUMENTS narrows the meeting, run only those items and say which were
skipped.

## 3. Write the minutes
Append to `STATE.md`, above the first `## From` note if there is one, else at
the end:

```
## Minutes — YYYY-MM-DD
**Present:** owner, <door>
**Last time:** <decision> — done | not done | overtaken, one line each
**Why missed, and the action:** <goal> — <why> → <action agreed>
**Measures:** | measure | now | last | source |
**Moved:** …
**Went well:** <owner's words>
**Did not:** <owner's words>
**Decided:**
1. <decision> — <one line of why>
**Deferred:** <what> — back on <date>
**Next period, by <date>:**
- <goal>
```

The owner's words are quoted as theirs. Then add the goal lines to the
Obligations block and tick or edit any line the meeting settled — now, not later.

## 4. Minutes to other doors
A decision that changes what another door should do is appended to that door's
`STATE.md` under `## From <this door> — YYYY-MM-DD`, one line per decision, in
the shape "<decision>, decided at the <door> meeting on <date>". Append only.

## 5. Report upward and commit
If this door has a `Parent:`, append one line to the parent's **Reports from
the doors**: `- D Mon YYYY · \`<door>\` · met; <the one thing the parent should
know>`. Then commit this door, any doors you appended notes to, and the parent
line: `git -C $ROOT add <paths> && git -C $ROOT commit -m "<Door> — Minutes <date>"`.
Never `add -A`.

## 6. Close
Three lines: the decisions, the goals with dates, the doors written to. Then
stop; a meeting does not start work. The owner opens the door for that.
