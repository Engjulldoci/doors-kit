# The meeting format

A door that meets keeps a `meeting.md` beside its `STATE.md`. `/meet` reads it
and runs it. A door without one has no meetings — until the first `/meet`,
which proposes one from the door's own words and writes it on a yes.

## Why a file and not a prompt

The calendar can say "sit with this door". What it cannot do is make two
sittings comparable: the same measures, the same questions, so a month of
meetings reads as a line and not a scatter. The measures are set once and
changed on purpose, in a commit.

## The file

```markdown
# shop — meeting

cadence: weekly

## Measures
- orders this week · source: the orders export in shop/exports/
- cash in vs out this month · source: the bank statement, never memory
- stock unlisted for more than 14 days · source: STATE.md, the stock table

## Standing questions
- What sat unanswered longer than a day?
- What did we spend that we did not plan?

## Board
- one number: the month's margin against the target
```

| Field | Required | Meaning |
|---|---|---|
| `cadence:` | yes | `weekly`, `fortnightly` or `monthly`. Must agree with the `repeats:` on the door's `· review` line. |
| `## Measures` | yes | Three to five. Each is `<what> · source: <where the number comes from>`. A measure with no source is refused: it would be estimated. |
| `## Standing questions` | yes | Asked every meeting, plainly. |
| `## Board` | no | The line or two the top door reads instead of the whole door. |

## What a meeting leaves behind

A `## Minutes — YYYY-MM-DD` section in the door's `STATE.md`: last time's
decisions checked, the measures as a table with now, last and source, what
moved, what went well and did not in the owner's words, what was decided, what
was deferred and to when, and next period's goals with dates. The goals become
obligation lines the same moment.

A goal that was not met is never minuted as just "missed". The door says from
its own records why, and recommends an action; the owner accepts or corrects
it; both go in the minutes.

A decision that changes what another door should do is appended to that door
under `## From <door> — <date>`. That is how the top door's decisions reach the
project doors.

## Rules

- The door leads the meeting; the owner decides. Nothing is decided by Claude.
- Every number traces to its source or is reported as not checked.
- Minutes quote the owner; they do not paraphrase them into agreement.
- A meeting decides; it never sends.
