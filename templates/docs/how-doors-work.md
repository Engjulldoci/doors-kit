# How doors work

The ideas behind the kit, and the lessons that shaped it. Read once; the
skills carry the mechanics.

## The problem it solves

Claude Code sessions forget. A chat about your shop knows nothing about the
chat you had yesterday about the same shop, and a chat about your shop started
from your home directory sees your tax return, your flat hunt and your side
project at once. Context is either missing or everywhere.

Doors fix both. **A door is a directory with a `STATE.md`.** You start the
session inside it, so the session sees that project and nothing else. The
`STATE.md` is the project's memory: what it covers, what is true now, what is
open, what it owes. The session reads it on the way in (`/open`) and writes it
on the way out (`/wrap`). The next session starts where this one stopped.

## The parts

| Part | What it is |
|---|---|
| **Door** | One directory, one project, one `STATE.md`. Start sessions inside it. |
| **The seat above** | The workspace root. Not a door. Sees every door, does no door's work. Run cross-door things from here. |
| **`STATE.md`** | The door's memory. Purpose, how to behave here, picture, open items, obligations, facts, decisions, minutes, notes from other doors. |
| **Obligations** | Dated lines in a strict format under `## Obligations`. The only part a script reads. The calendar. |
| **Notes** | `## From <door> — <date>` appended to another door's `STATE.md`. The only way one door writes to another. Append only. |
| **Handoffs** | `handoffs/<door>-<date>.md`, written by `/wrap`. Where the last session stopped, and the record that the door was wrapped. |
| **`/open`** | First message. Reads everything, briefs you, then does the work. |
| **`/wrap`** | Last message. Updates `STATE.md`, reconciles the obligations, writes the handoff, commits. |
| **`/meet`** | A recurring sitting with a door that has a `meeting.md`: same measures, same questions, minutes in the door. |
| **Parent** | A door whose `STATE.md` says `**Parent:** \`<door>\`` reports one line up to that door at every wrap. The top door is your own board. |

## The rules, and why each exists

Every rule in `CLAUDE.md` was learned the hard way. The ones that ship:

- **Never estimate a figure.** A guessed number in a file is read as a fact by
  the next session, and by you. A number traces to a document or it is
  reported as "not checked".
- **Show every draft before it is sent.** The whole body, the recipient, the
  account. A yes covers the text shown. This is the whole of the protection;
  there is no second net.
- **Work first, bring only the final step.** Sessions that stop to ask every
  few minutes cost more attention than doing it yourself. A door does
  everything it can and ends with one numbered list of what needs your hand.
- **If it can be done now, do it now.** A door given room to defer will defer.
  A deferral is `from: <date>` on the line, naming when the constraint lifts.
  No date, no constraint, work is today's.
- **A commitment in prose is hidden work.** One workspace found seventeen
  commitments buried in paragraphs and a door with no obligations block at
  all. The calendar reads lines, not prose.
- **An unchecked source is not a quiet one.** "No new mail" and "could not
  open the mailbox" look identical in a summary. The system exists to tell them
  apart, so every door says what it could not check.
- **Read another door, write only your own.** Two sessions editing one file
  from different directions destroy each other's notes. Reading is free;
  writing is scoped; a note is the one exception and it is append-only.
- **Repeating lines are never ticked.** A `[x]` on a weekly line silences it
  for good.
- **Commit the doors straight to main.** The doors are directories in one
  repo. A branch per session hides the notes from every other session. Code
  projects that need review keep branch-and-PR in their own repos.

## Lessons from running it

- **A door summary is not the source.** Before drafting from `STATE.md`,
  re-read the thread or document it summarises. Summaries lag, and a session
  once drafted a chase to a company whose reply had arrived two days earlier.
- **Short sessions are the saving.** Most of a day's cost came from sessions
  past 150k tokens of context. Open, work, wrap, close. Open again.
- **Two sessions can share a door.** `STATE.md` can change under you. Re-read
  before editing; stage only your door; never `add -A`.
- **Answer "what is left" from the list.** Grep the open obligations before
  saying "that's everything". Carry every due line even when nothing in the
  mail mentions it.
- **Absence of records is not absence of the event.** Say what the search
  could see. "Not found" becomes "did not happen" the next time someone reads it.
- **Give commands, not windows.** When a session wants you to open another
  door, it prints the `door <name>` line for you to paste. It does not open it.
- **The top door convenes; the doors conclude.** A cross-door session that
  summarised and advised would be an opinion formed on thin context. It routes
  attention to the door that has the context.

## Growing it

Start with three to eight doors. Add one when a project keeps turning up in the
wrong door. Archive one by moving its directory to `archive/` and noting the
date in the README. Add a `watch.sh` to a door only when something outside the
doors can change without anyone writing it down. Add a `meeting.md` to a door
you want to sit with on a cadence. Put facts that every session should know
into Claude Code memory, not into a door.

What is *not* in the kit, on purpose: notifications, a phone digest, an
always-on box, mail readers. Those come later, once the doors have earned
them, and they are specific to what you run. The format is designed so a
script can be written against it when the time comes: `--json` gives the
assessed list.
