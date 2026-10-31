# Doors — a starter kit

Run your projects, ventures and life admin as **doors**: one directory per
project, each with a `STATE.md` that Claude Code reads on the way in and writes
on the way out. Sessions start inside a door and see only that door. Dated
commitments live in a strict one-line format that a small tool turns into a
calendar across every door. Doors leave each other notes; nothing else crosses
between them.

This kit is what one person's setup looked like after eight weeks and some
twenty doors, with the personal parts taken out and the lessons kept in.

## Five-minute start

```sh
git clone <this repo> doors-kit && cd doors-kit
./install.sh
# open a new terminal, then:
cd ~/doors && claude "/doors-setup"
```

`install.sh` puts the workspace at `~/doors` (or where you say), installs five
skills into `~/.claude/skills`, adds a `door` command to your shell and makes
the workspace a git repo. `/doors-setup` is a conversation inside Claude Code
that names your doors, writes your rules into `CLAUDE.md` and creates the
first `STATE.md` files.

After that:

```
door               list the doors and pick one
door shop          open the shop door — runs /open, which briefs you and then works
/wrap              last message of every session
door new tax       add a door; /newdoor asks what it is for
door cal           the calendar across every door
```

Requires Node 18+, git and Claude Code.

## What is in the box

```
install.sh                   the installer; safe to re-run, never overwrites
bin/obligations.mjs          the calendar tool — list, --calendar, --doctor, --propose, --history, --json
bin/door.sh                  the `door` shell command (bash and zsh)
bin/test.mjs                 tests for the format and the proposer
skills/open                  /open — brief, then work
skills/wrap                  /wrap — notes, obligations, handoff, commit
skills/meet                  /meet — a recurring sitting with a door, with minutes
skills/newdoor               /newdoor — set up a door that was just created
skills/doors-setup           /doors-setup — first-run conversation for the workspace
templates/CLAUDE.md          the working agreement every session reads
templates/README.md          the workspace map (doors table)
templates/STATE.md           a door's memory, empty
templates/meeting.md         a door's agenda, empty
templates/docs/how-doors-work.md     the ideas and the lessons
templates/docs/obligations-format.md the one-line format, in full
templates/docs/meeting-format.md     how meetings work
```

## The ideas, in one screen

- **A door is a directory with a `STATE.md`.** Start the session inside it.
- **Read any door, write only your own.** A note for another door is appended
  under `## From <door> — <date>`; never edited in.
- **Obligations are lines, not prose.** `- [ ] 2026-11-16 · chase the deposit
  · deadline: 2026-11-20`. A script reads them; a malformed line is reported,
  never dropped. `from: <date>` is the only way to defer.
- **`/open` then work then `/wrap`.** Short sessions. The handoff is the
  record that the door was wrapped; the calendar flags doors that were not.
- **Never estimate a figure. Never send without showing the draft.** These two
  are the rules every workspace has ended up needing.

Read `templates/docs/how-doors-work.md` for the rest.

## Adapting it

Everything is plain markdown and one dependency-free Node file. Edit the
skills in `~/.claude/skills/<name>/SKILL.md` to fit how you work; the kit
keeps its copy so you can diff. The agreement in `CLAUDE.md` is yours from the
moment `/doors-setup` writes your rules into it. The format in
`docs/obligations-format.md` is the one contract worth keeping strict, because
the tool and the skills both depend on it.

## Licence

MIT. Take it, change it, share it.
