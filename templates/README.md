# {{OWNER_SHORT}}'s doors

One door per project. **Start a session from the door** (`door <name>`) so it
carries that project's context and nothing it doesn't need.

`{{DOORS_HOME}}/` itself is the seat above the doors: no `STATE.md`, nothing of
its own. A session started here sees every door and does no door's work.

## The doors

| Tier | Door | What it covers |
|---|---|---|
{{DOOR_ROWS}}

Tiers are yours to choose. A common shape: one **top** door that reads all the
others and asks "where is this going"; **project** doors that report up to it
(`**Parent:** \`<top>\`` on the second line of their `STATE.md`); and
**outside** doors — personal, private — that report to nobody.

Plus `handoffs/` for end-of-session notes, `bin/` for the tools, and
`CALENDAR.md`, which is generated from every door's obligations and never
edited by hand.

## Daily shape

```
door                 # list the doors, pick one
door <name>          # open it: runs /open, which briefs you and then works
  ... work ...
/wrap                # last message: notes, obligations, handoff, commit
door cal             # the calendar across every door
```

## How the doors talk to each other

Every door has a `STATE.md`. Any session may **read** another door's
`STATE.md`; a session **writes** only to its own door. The one exception is a
note: when a session learns something another door needs, it appends it to that
door's `STATE.md` under `## From <door> — YYYY-MM-DD`. Append only; never edit
or tick a line you did not write. `/open` reads notes first.

What a door owes goes in its `## Obligations` block in a strict one-line
format (`docs/obligations-format.md`). `bin/obligations.mjs` reads every door
and prints what is due; `--calendar` writes `CALENDAR.md`; `--doctor` says
whether the whole thing can be trusted today.

A door that should be sat with on a cadence keeps a `meeting.md` and a
`· review` obligation line; `/meet` runs the meeting (`docs/meeting-format.md`).

## Adding a door

```
door new <name>
```

That makes the directory and a `STATE.md` from the template, then opens the
door with `/newdoor`, which asks what the door is for and writes it down. Add a
row to the table above. That is the whole ceremony.

Facts that should reach *every* session, whatever door, go in Claude Code's
memory, not in a door.
