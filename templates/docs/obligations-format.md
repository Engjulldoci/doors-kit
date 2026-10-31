# The obligations format

The strict one-line format each door uses to declare what it owes and when.
It exists so a script can read what is due without parsing prose — and so a
line that cannot be read is reported, not quietly dropped.

## The rule that shapes it

**Writes go to the door; reads come from the tool.** A door declares its own
obligations in its own `STATE.md`, and nothing else writes there.
`bin/obligations.mjs` reads every door and derives what is due. It writes one
file, `CALENDAR.md` at the root, which is generated and never edited by hand.

## The format

Under a heading named exactly `## Obligations`. Every line under it, until the
next heading, is an obligation or blank.

```
## Obligations
- [ ] 2026-11-16 · chase the deposit · lead: 2d
- [ ] 2026-11-23 · send the letter if no reply · from: 2026-11-23
- [ ] 2026-11-19 · weekly sweep of the inbox · repeats: weekly
- [ ] 2026-11-23 · reply to the agent · deadline: 2026-11-25
- [ ] 2026-11-15 · sit with this door · repeats: fortnightly · review
- [x] 2026-11-01 · confirm the unit takes pallets
```

Fields, in order, separated by ` · ` (space, middot, space):

| Field | Required | Meaning |
|---|---|---|
| `- [ ]` / `- [x]` | yes | Open, or done. Done lines are kept as a record and never nudged. |
| `2026-11-16` | yes | ISO date. The day you chose to act. |
| text | yes | What is owed, in your words. Notes go **in the text**, never after the fields. |
| `repeats: <r>` | no | `daily`, `weekly`, `fortnightly`, `monthly`. The date rolls forward on its own. |
| `lead: <n>d` | no | Start showing it this many days early. Default one day, so you always get a night's warning. |
| `deadline: YYYY-MM-DD` | no | The date the world imposes, as distinct from the date you chose. Ranks the list. Put it on anything with someone else's clock running. |
| `from: YYYY-MM-DD` | no | The earliest date this can be acted on. Before it the line is **blocked**: never due, never overdue, back on its own that day. |
| `review` | no | Not a task — a standing invitation to sit with the door. Listed separately. |

Anything else after a ` · ` is kept as a note but a part *shaped* like a field
and misspelled (`every: week`, `due: …`) is reported, because it is somebody
reaching for a field and missing.

## Why so rigid

Parsing prose works until the day it quietly doesn't, and the failure looks
exactly like having no obligations. A malformed line is reported loudly; a
missing one cannot be detected at all. So the format is narrow enough to be
unambiguous, and the tool refuses what it does not recognise and says which
file and line.

## Update the line when you act, not at wrap

If a session does something that changes an obligation, it edits that line
there and then. Everything else in `STATE.md` is a summary written at the end;
an obligation is live state something else reads while you are not looking.
`/wrap` reconciles as a safety net, not as the method.

## `from:` is the only honest way to defer

One date used to do two jobs: when this is due and when it becomes possible.
They are not the same. An agent shut until Tuesday cannot be rung on Monday; a
letter that must go in the post needs a day the post goes.

The test a door applies to itself is mechanical: **can I write the date the
constraint lifts?** If yes, the deferral is real and goes on the line. If the
honest answer is "I would rather do this tomorrow", there is no constraint and
the work is today's.

## Ranking — what can be done now, not what is dated soonest

A line has two clocks: the date you chose and the `deadline:` the world set. It
is active when either is inside its lead, and the list is ordered by whichever
presses soonest. A blocked line never outranks one that can be done today.
That gives the calendar's groups:

- **DO NOW** — nothing is stopping these.
- **WAITING** — blocked until a named date.
- **LATER** — real, dated, not yet within its lead.
- **DOORS TO SIT WITH** — the `review` lines.
- **NOT CHECKED** — lines that could not be read, doors nobody has wrapped. The
  most important block: a calendar that cannot tell "nothing happened" from
  "nothing was looked at" is the failure this format exists to prevent.

## Repeats are never ticked

A `[x]` on a `repeats:` line hides it for good. Move the date or leave it; the
tool rolls it forward. Never use `repeats:` for something that must stay true,
because a repeating line can never show as overdue.

Known simplification: a monthly line dated the 31st lands on the 28th after
February and stays there. Anchor monthly lines on the 1st if that matters.

## Writing a line without typing the format

```sh
node bin/obligations.mjs --propose "chase the deposit in 5 days"
# - [ ] 2026-11-05 · chase the deposit

node bin/obligations.mjs --propose "council tax 2026-12-01 with 14 days notice"
# - [ ] 2026-12-01 · council tax · lead: 14d

node bin/obligations.mjs --propose "post the letter not before 2026-11-09"
# - [ ] 2026-11-09 · post the letter · from: 2026-11-09
```

It understands `in N days/weeks/months`, `tomorrow`, `today`, `next week`, a
weekday, `by 18 Nov`, an ISO date, the repeat words, `N days notice`,
`deadline <date>` and `not before <date>`. **It will not invent a date.**

## Checking the system is trustworthy

```sh
node bin/obligations.mjs --doctor
```

Looks for the quiet failures: a line that cannot be read, the same obligation
in two doors, a one-off open for over a month, a mistyped year, a deadline
passed with the line still open, a door carrying obligations that nobody has
wrapped in a week, a `watch.sh` that is not executable. Exits non-zero on an
unreadable line.

## A door can have a watcher

Put an executable `watch.sh` beside a door's `STATE.md`. `/open` runs it and
reports exactly what it prints; `--watchers` runs them all.

| | |
|---|---|
| no output, exit 0 | all well |
| any stdout | reported under that door |
| non-zero exit | reported as broken, never swallowed |
| over 20 s | killed and reported |

Most doors need none. A watcher earns its place only when something outside
the doors can change without anyone writing it down — a backup that did not
run, a container that fell over, a mailbox with a deadline in it.

## The paper trail

```sh
node bin/obligations.mjs --history "home::chase the deposit"
```

Every commit that touched that line, since the doors are a git repo.
