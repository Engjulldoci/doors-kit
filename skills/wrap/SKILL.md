---
name: wrap
description: Round off the current session before closing it. Updates the door's STATE.md, reconciles its obligations, regenerates the calendar, writes a handoff note, reports one line up to the parent door, commits to main, and reports what it wrote. Run as the last message of a session.
argument-hint: [optional note, e.g. "skip handoff" or "also remember X"]
---

Round off this session. Extra instruction from the user (may be empty): $ARGUMENTS

Do this in order. Read before writing. Edit in place; never rewrite a file from
scratch when it already exists. Do not ask questions unless a step is genuinely
ambiguous; make the call and say what you chose in the report.

## 1. Find the door
The door is the directory the session was started from. The workspace root
`$ROOT` is the nearest parent containing `.doors`. If the session started
somewhere with no `STATE.md`, work out from the conversation which door it
belongs to and use that. Only write to that one door (plus a note appended to
another door, and the parent's report line, as below).

Re-read `STATE.md` before editing: another session may share this door and the
file may have changed under you.

## 2. Update the door's STATE.md
Apply only what this conversation changed:
- Mark open items resolved, or remove them, when the chat settled them.
- Add new open items and decisions taken, dated.
- Add new durable facts under an existing heading; add a heading only if none
  fits.
- Convert relative dates ("tomorrow", "next week") to absolute dates.
- Reference files created this session by path.
Keep the file's tone and structure. If nothing changed, leave it alone and say so.

## 3. Reconcile the obligations
The `## Obligations` block is read by the calendar, so a stale line produces a
wrong reminder — worse than none.

- `- [ ]` → `- [x]` for anything this session settled. **Never tick a
  `repeats:` line**; move its date or leave it.
- Add a line for any dated commitment the session created or discovered.
- Correct the date or wording where the session moved the situation on.
- A deferral is `from: YYYY-MM-DD` with the date the constraint lifts. If you
  cannot name that date, it is not deferred and stays due.
- A date the world set goes in `deadline:`.

Format in `$ROOT/docs/obligations-format.md`:
`- [ ] YYYY-MM-DD · what is owed[ · repeats: r][ · lead: Nd][ · deadline: D][ · from: D][ · review]`

Use `node $ROOT/bin/obligations.mjs --propose "<loose words>"` rather than
typing the format by hand. **Check this session made no commitment it left in
prose** — a paragraph saying the door will chase, ring, post or decide
something is an obligation whether or not it was written as one.

Then:
```sh
node $ROOT/bin/obligations.mjs --doctor | grep -i "<door>"
node $ROOT/bin/obligations.mjs --calendar
```
Fix anything the doctor refuses in this door before moving on.

## 4. Write the handoff note
Path: `$ROOT/handoffs/<door>-YYYY-MM-DD.md` (today's date, from `date`). If
one exists for today, append a dated section rather than overwriting. No
longer than about 15 lines:
- Title: `# <door> — handoff, D Mon YYYY`
- `Resume: door <door>`
- **Done**: what this session produced, with paths.
- **Open**: what is unfinished or awaiting the owner.
- **Next**: the single most useful next step.
- **Elsewhere**: other doors this touches, if any.

Skip only if the session produced nothing durable or $ARGUMENTS says so, and
say which. The handoff is also how the calendar knows the door was wrapped.

## 5. Report upward
If `STATE.md` has a `**Parent:** \`<door>\`` line near the top, append one
line to the **Reports from the doors** list in the parent's `STATE.md`, newest
first:

`- D Mon YYYY · \`<door>\` · <one sentence the parent should know>`

If nothing would change the parent's view, write nothing and say so. Never
edit anything else in the parent.

## 6. Save memory
Save to Claude Code memory only what a future session cannot derive from the
files or git: corrections the owner gave and why; confirmed ways of working;
preferences. Check the memory index for a note that already covers it and
update that instead. Do not save what `STATE.md` already records.

## 7. Commit
```sh
git -C $ROOT add <door>/ handoffs/<door>-YYYY-MM-DD.md CALENDAR.md   # plus the parent's STATE.md only if step 5 wrote to it
git -C $ROOT commit -m "<Door> — <what changed>"                      # Title Case, past tense
```
Stage only this door's paths — **never `add -A`**: another door may be
mid-edit. If a remote is configured, `git pull --rebase --autostash` then
`git push`; if the push fails, say so and move on — the commit is what matters.

## 8. Report
Reply with at most eight lines:
- Door identified.
- STATE.md: what changed, or "unchanged".
- Obligations: lines added, closed or corrected, or "none"; doctor clean or not.
- Handoff: path, or "skipped" with reason.
- Upward: the line written to the parent, or "nothing for the parent".
- Memory: notes created or updated, or "nothing new".
- Git: committed (hash) and pushed, or why not.
- Anything you chose not to save and why, if it matters.

Then stop. Do not start new work.
