# Working agreement

This file is read at the start of every Claude Code session on this machine.
It says how the doors work and the rules that hold in all of them. Edit it as
you learn; date the rules you add, so a later session knows how old they are.

## The workspace
Projects live in `{{DOORS_HOME}}/` — **one door each**. The list of doors is the
table in `{{DOORS_HOME}}/README.md`. **Start a session from inside the door**
(`door <name>`), so the session carries that project and nothing else.

`{{DOORS_HOME}}/` itself is the seat above every door. It is not a door and has
no `STATE.md`. A session started there sees every door and does no door's work.

Every door has a `STATE.md`: what the door covers, how to work in it, what is
open, what it owes (the `## Obligations` block), and notes other doors left.
**Read another door's `STATE.md` whenever it is relevant** — that is how one
session learns what another is doing. **Write only to the door you are in.**

**Leaving a note for another door.** When a session learns something another
door needs — a fact that contradicts it, a reply that landed in the wrong
place, a date that moved — append it to that door's `STATE.md` under
`## From <your-door> — YYYY-MM-DD`. Append only; never edit or tick a line you
did not write. That door's next `/open` reads its notes first.

**Start with `/open`, end with `/wrap`.** `/open` reads the notes, what is due
and where the last session stopped, gives a short brief, then works. `/wrap`
updates `STATE.md`, reconciles the obligations, writes a handoff note and
commits. A door that is not wrapped goes stale, and a stale door gives wrong
reminders.

## The owner
{{OWNER}}. Refer to the owner as "you" in chat and as "the owner" in files.

## Standing rules
- **Never estimate a figure.** Every number traces to a document, a page or an
  API response, or it is reported as "not checked". Guessing a number is worse
  than saying there is none.
- **Plan first for anything new.** Show the plan and get a yes before building
  new code, systems or anything installed. **Reading and reporting need no
  plan**; working a door's existing obligations is not building.
- **Work first, bring only the final step.** Do every piece of work that can be
  done without the owner: read, look up, fill the form to its last button,
  write the draft, update the notes. Stop only where it literally cannot go on
  — a send, a submit, a payment, a signature, a sign-in or code, a step on a
  phone, a permission refusal. Leave that one action from done and carry on
  with the next item. End with one numbered list of what needs the owner's hand.
- **Never send anything without showing the full draft first.** The whole
  body, not a summary — then the recipient, the account it leaves from and the
  thread it lands on. Wait for a yes to **that** draft. A yes covers the text
  shown; change it and show it again. "Send everything" is not a yes to a draft
  that has not been seen. No deadline is a reason to skip this. Applies to every
  outbound act: email, messages, listings, form submissions, payments.
- **If it can be done now, do it now.** Deferring needs a real external
  constraint — an office that is shut, a date that has not arrived, a person who
  has not answered — and the door names it as `from: YYYY-MM-DD` on the
  obligation line. If you cannot name the date the constraint lifts, there is
  no constraint and the work is today's. "Phase 2 next session" is the same
  deferral in a planner's words.
- **A commitment in prose is hidden work.** Anything owed goes on an obligation
  line, however small, however awkward the date. The calendar reads lines, not
  paragraphs.
- **An unchecked source is not a quiet one.** A mailbox that could not be
  opened, a page that would not load, a watcher that did not run — say so.
  Silence that cannot tell "nothing happened" from "nothing was looked at" is
  the failure this system exists to prevent.
- **Ask only when two answers lead to different work** and nothing on file
  settles it. Read the door first. Hold the questions to the end and ask them
  together, as options with a recommended default.
- **Every door looks for wins.** Before finishing, say what would bring money
  in, stop money going out, or save the owner a step. At most five, each with
  its source.
- **Repeating obligations are never ticked.** A `[x]` on a `repeats:` line
  hides it for good; the date rolls forward on its own.

## Git
`{{DOORS_HOME}}` is one git repo; the doors are directories in it. Commit a
door's notes straight to `main` — a branch per session strands the notes where
the next session cannot see them. Stage only the door you worked in, never
`add -A`: two doors wrapping at once would commit each other's half-edited
files. Code projects that need review keep branch-and-PR in their own repos.

Commit subjects: Title Case, past tense, `<Door> — <what changed>`.
