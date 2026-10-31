---
name: open
description: Open a door and work it. Reads the door's STATE.md, notes other doors left, what is due, the last handoff, and any watcher output; gives a short brief; then does every piece of work it can without the owner and ends with one list of the final steps only the owner can take. Run as the first message of a session. The mirror of /wrap.
argument-hint: [optional focus, e.g. "brief only" or "just the inbox"]
---

Open this door. Extra instruction from the user (may be empty): $ARGUMENTS

Open and work: steps 1 to 6 read and brief, step 7 does the work without
waiting to be told. Keep the brief short. If the extra instruction narrows the
session ("brief only"), do only that.

## 1. Find the door and the workspace
The door is the current working directory. The workspace root is the nearest
parent directory containing a `.doors` file. If there is no `STATE.md` here,
say so and stop — there is nothing to open. Call the root `$ROOT` and the
door's directory name `<door>` below.

Check `git -C $ROOT rev-parse --abbrev-ref HEAD` is `main`; if not, say so in
the brief, since notes committed on a branch are invisible to other doors.

## 2. Read, in this order
1. `STATE.md` in full. Its `## Obligations` block is the calendar; everything
   under `## From <door> — <date>` is a note another session left — the newest
   truth in the file.
2. The newest `$ROOT/handoffs/<door>-YYYY-MM-DD.md` — its **Open** and **Next**
   are where the last session stopped.
3. Notes newer than that handoff's date are **unread**: list them first.
4. `$ROOT/CLAUDE.md` if the session has not already loaded it: the standing
   rules hold in every door.

## 3. What is due
```sh
node $ROOT/bin/obligations.mjs --all --door <door>
node $ROOT/bin/obligations.mjs --doctor | grep -i "<door>"
```
Group: overdue · today · within 3 days · blocked. A line carrying `from:` that
has not arrived is **blocked**, not due — say what it waits for and on what
date, never as something the owner is behind on. Report any doctor finding for
this door verbatim: a line the doctor refuses is a reminder that will never
fire.

## 4. What came in
If the door has an executable `watch.sh`, run it and report **exactly** what it
prints, including anything saying a source could not be opened. Treat a source
that could not be opened as **unchecked, not quiet**. If there is no watcher,
say "no watcher; nothing checked" rather than implying a quiet day.

If this session has a mail or calendar connector and the door's obligations
name senders, dates or references, look for anything from them newer than the
last handoff. One line each: who, what, when.

## 5. What is waiting to go
List files in `drafts/` and `outbox/` that are not marked sent — date, who it
is to, one line on what it says. These need the owner's yes; do not send.

## 6. The brief
Print this, short, then go straight on to step 7:

**Unread notes** — from which door, one line each (or "none")
**Came in** — what the watcher or connector found (or "unchecked: <why>")
**Due** — overdue / today / within 3 days, one line each; blocked lines with their date
**Waiting to send** — drafts, one line each
**Where we stopped** — the handoff's Next, one line
**Working on** — what step 7 is about to do, one line

## 7. Do the work
Work through everything due or overdue in this door, most pressing deadline
first, then anything that came in. Do not ask permission for a step you can
take, and do not stop between items to report.

- **Do it yourself:** read the threads and files, look things up, work out the
  figure from the document, fill a form to its last button, write the draft,
  update `STATE.md` and the obligation line as each item moves.
- **Stop only at a final step that is the owner's:** sending or submitting,
  paying, signing, a sign-in, a code, a step on a phone, a permission refusal.
  Prepare it fully, leave it one action from done, move to the next item.
  Never stop the whole session at the first of these.
- **Ask only when two answers lead to different work** and nothing on file
  settles it. Hold the questions and ask them together at the end, as options
  with a recommended default.
- **A line that cannot move today** gets its `from:` date and the reason, and
  nothing more is said about it.
- **Every figure traces to a document.** Never estimate one.

## 8. Look for wins
Before finishing, think past the list: what would bring money in, stop money
going out, or save the owner a step. Offer at most five, each with its source
and what it is worth. The door's `## How to work in this door` may say what
kind of win it looks for.

## 9. Finish with one list
End with this and nothing after it:

**Done** — what moved, one line each
**Needs your hand** — numbered, most urgent first. Each is one final action: a
draft shown in full with recipient and account, waiting for a yes; a page
filled, waiting for a click; a sign-in; a phone step. Say exactly what to press
or type.
**Later** — the owner's steps that cannot happen before a date, one line each
with the date. Each is also an obligation line with that `from:` date.
**Questions** — only if any survived, as options
**Wins** — from step 8
**Could not check** — any source that would not open

## Rules that hold in every door
- Nothing is sent without the full body and recipient shown first and a yes to
  that draft.
- A line marked `· review` is an invitation to sit with the door, not a chore.
- Write only to this door; a note for another door is appended under
  `## From <door> — YYYY-MM-DD`, never edited in.
