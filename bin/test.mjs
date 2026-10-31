// node bin/test.mjs — a handful of checks that the format and the proposer agree.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseDoor, assess, proposeLine, nextOccurrence } from './obligations.mjs';

const now = new Date(Date.UTC(2026, 9, 31)); // Sat 31 Oct 2026
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'doors-'));
const state = path.join(tmp, 'STATE.md');

fs.writeFileSync(state, `# test door

## Obligations
- [ ] 2026-11-02 · chase the deposit · deadline: 2026-11-05
- [ ] 2026-11-10 · viewing · from: 2026-11-10
- [ ] 2026-10-01 · weekly sweep · repeats: weekly
- [x] 2026-10-20 · done thing
- [ ] 2026-11-01 · sit with the door · repeats: monthly · review
- [ ] 2026-11-03 · misspelt · every: week
- [ ] 2026-13-45 · broken
- [ ] 2026-11-20 · late chase · deadline: 2026-11-15

## Other
- [ ] 2020-01-01 · not an obligation, wrong section
`);

const { items, problems } = parseDoor('test', state);
assert.equal(items.length, 7, 'seven readable lines');
assert.equal(problems.length, 3, 'three problems: near-miss, bad date, due after deadline');
assert.ok(problems.some((p) => /every: week/.test(p.why)));
assert.ok(problems.some((p) => p.why === 'not a real date'));
assert.ok(problems.some((p) => /after its own deadline/.test(p.why)));

const a = assess(items, now);
const by = (t) => a.find((o) => o.text === t);
assert.equal(by('chase the deposit').active, false, '2 Nov with 1-day lead is not active on 31 Oct');
assert.equal(by('viewing').blocked, true);
assert.equal(by('weekly sweep').due, '2026-11-05', 'weekly from 1 Oct rolls to 5 Nov');
assert.equal(by('weekly sweep').active, false);
assert.equal(a.find((o) => o.text === 'done thing'), undefined, 'done lines are dropped');
assert.equal(a[a.length - 1].text, 'viewing', 'blocked sorts last');
assert.equal(a[0].text, 'sit with the door', 'soonest pressing first');

assert.equal(nextOccurrence({ date: '2026-01-31', repeats: 'monthly' }, new Date(Date.UTC(2026, 1, 15))).toISOString().slice(0, 10), '2026-02-28');

assert.equal(proposeLine('chase the deposit in 5 days', now), '- [ ] 2026-11-05 · chase the deposit');
assert.equal(proposeLine('council tax 2026-12-01 with 14 days notice', now), '- [ ] 2026-12-01 · council tax · lead: 14d');
assert.equal(proposeLine('sweep the inbox weekly', now), '- [ ] 2026-11-07 · sweep the inbox · repeats: weekly');
assert.equal(proposeLine('ring the agent on Tuesday', now), '- [ ] 2026-11-03 · ring the agent');
assert.equal(proposeLine('post the letter not before 2026-11-09', now), '- [ ] 2026-11-09 · post the letter · from: 2026-11-09');
assert.equal(proposeLine('reply to PayPal by 3 Nov deadline 2026-11-05', now), '- [ ] 2026-11-03 · reply to PayPal · deadline: 2026-11-05');
assert.throws(() => proposeLine('do the thing'), /no date/);

for (const p of ['chase the deposit in 5 days', 'sweep weekly', 'ring on Tuesday']) {
  fs.writeFileSync(state, `# t\n\n## Obligations\n${proposeLine(p, now)}\n`);
  assert.equal(parseDoor('t', state).problems.length, 0, `parser accepts what propose wrote: ${p}`);
}

fs.rmSync(tmp, { recursive: true });
console.log('ok — obligations format, assessment and proposer agree');
