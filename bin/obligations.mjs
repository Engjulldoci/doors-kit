#!/usr/bin/env node
// obligations.mjs — the calendar every door writes and nothing else edits.
//
// Each door declares what it owes under a `## Obligations` heading in its own
// STATE.md. This reads every door, works out what is due, blocked or late, and
// prints it. It never writes to a door. The only file it writes is CALENDAR.md
// at the workspace root, which is generated and read-only.
//
//   node bin/obligations.mjs                 what is active now (⏰ lines)
//   node bin/obligations.mjs --all           every open line, grouped by door
//   node bin/obligations.mjs --door home     one door
//   node bin/obligations.mjs --calendar      write CALENDAR.md (DO NOW / WAITING / LATER / NOT CHECKED)
//   node bin/obligations.mjs --doctor        can the calendar be trusted? exits 1 on an unreadable line
//   node bin/obligations.mjs --propose "chase the deposit in 5 days"   a correct line from loose words
//   node bin/obligations.mjs --history "home::chase the deposit"        every commit that touched that line
//   node bin/obligations.mjs --json          the assessed list, for other scripts
//
// No dependencies. Node 18+.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const DAY_MS = 86_400_000;
const DEFAULT_LEAD_DAYS = 1;
const STALE_AFTER_DAYS = 7;
const REPEATS = { daily: 1, weekly: 7, fortnightly: 14, monthly: 30 };

// --- where the doors are ---------------------------------------------------
//
// The workspace root is the nearest parent of the current directory holding a
// `.doors` marker; failing that $DOORS_HOME; failing that ~/doors.

export function findRoot(start = process.cwd()) {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.doors'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  if (process.env.DOORS_HOME && fs.existsSync(path.join(process.env.DOORS_HOME, '.doors'))) return process.env.DOORS_HOME;
  const fallback = path.join(os.homedir(), 'doors');
  if (fs.existsSync(path.join(fallback, '.doors'))) return fallback;
  return null;
}

// --- parsing ---------------------------------------------------------------
//
// `- [ ] YYYY-MM-DD · text[ · repeats: r][ · lead: Nd][ · deadline: D][ · from: D][ · review]`
//
// A line that claims to be an obligation and has no readable date is reported,
// never skipped: a reminder that silently vanishes is worse than none. Trailing
// parts the format does not know are kept as a note, so one extra field never
// costs a line its place; but a part *shaped* like a field and misspelled is
// reported, because "every: week" is somebody asking for a repeat and not
// getting one.

const LINE_RE = /^- \[( |x)\] (\d{4}-\d{2}-\d{2}) · (.+)$/;
const NEAR_MISS = /^(repeat|repeating|repeats|recurs?|every|freq\w*|lead|leadtime|lead-time|leads|due|deadlines?|dead-line|reviews?|from|starts?|starting|earliest|not-?before|unblocks?|blocked)\s*:/i;

export function parseDoor(door, stateFile) {
  const items = [];
  const problems = [];
  if (!fs.existsSync(stateFile)) return { items, problems };
  const lines = fs.readFileSync(stateFile, 'utf8').split('\n');
  let inSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^##\s/.test(line)) { inSection = /^##\s+Obligations\s*$/.test(line); continue; }
    if (!inSection || !line || !line.startsWith('- [')) continue;

    const m = LINE_RE.exec(line);
    if (!m) { problems.push({ door, file: stateFile, lineNo: i + 1, text: line, why: 'does not match the obligation format' }); continue; }

    const [, mark, date, rest] = m;
    const parts = rest.split(' · ').map((s) => s.trim());
    const text = parts.shift();
    const item = { door, text, date, done: mark === 'x', repeats: null, lead: DEFAULT_LEAD_DAYS, deadline: null, from: null, review: false, note: null, lineNo: i + 1 };
    const notes = [];

    for (const part of parts) {
      let x;
      if ((x = /^repeats:\s*(\w+)$/.exec(part))) {
        if (x[1] in REPEATS) item.repeats = x[1];
        else problems.push({ door, file: stateFile, lineNo: i + 1, text: line, why: `unknown repeat "${x[1]}" — ignored, so this will not repeat` });
      } else if ((x = /^lead:\s*(\d+)d$/.exec(part))) item.lead = Number(x[1]);
      else if ((x = /^deadline:\s*(\d{4}-\d{2}-\d{2})$/.exec(part))) item.deadline = x[1];
      else if ((x = /^from:\s*(\d{4}-\d{2}-\d{2})$/.exec(part))) item.from = x[1];
      else if (part === 'review') item.review = true;
      else {
        if (NEAR_MISS.test(part)) problems.push({ door, file: stateFile, lineNo: i + 1, text: line, why: `"${part}" is not a field — the fields are repeats:, lead:, deadline:, from: and review` });
        notes.push(part);
      }
    }
    if (notes.length) item.note = notes.join(' · ');

    if (!Number.isFinite(Date.parse(item.date))) problems.push({ door, file: stateFile, lineNo: i + 1, text: line, why: 'not a real date' });
    else if (item.deadline && item.date > item.deadline) { problems.push({ door, file: stateFile, lineNo: i + 1, text: line, why: `due ${item.date} is after its own deadline ${item.deadline}` }); items.push(item); }
    else items.push(item);
  }
  return { items, problems };
}

export function listDoors(root) {
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.') && fs.existsSync(path.join(root, d.name, 'STATE.md')))
    .map((d) => d.name)
    .sort();
}

export function readAllDoors(root) {
  const items = [];
  const problems = [];
  for (const door of listDoors(root)) {
    const r = parseDoor(door, path.join(root, door, 'STATE.md'));
    items.push(...r.items);
    problems.push(...r.problems);
  }
  return { items, problems };
}

// --- dates -----------------------------------------------------------------

export function today() {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}
const iso = (d) => d.toISOString().slice(0, 10);
const shift = (from, days) => new Date(from.getTime() + days * DAY_MS);
const utc = (s) => new Date(`${s}T00:00:00Z`);

function addMonths(date, n) {
  const d = new Date(date);
  const target = d.getUTCMonth() + n;
  d.setUTCMonth(target);
  // 31 Jan + 1 month clamps to the last day of February, not 3 March. Known
  // simplification: repeated clamping drifts; anchor monthly lines on the 1st.
  if (d.getUTCMonth() !== ((target % 12) + 12) % 12) d.setUTCDate(0);
  return d;
}

// A repeating line is never "done": its date rolls forward on its own, so the
// line in STATE.md never needs rewriting.
export function nextOccurrence(item, now = today()) {
  let due = utc(item.date);
  if (!item.repeats) return due;
  let guard = 0;
  while (due < now && guard++ < 1000) due = item.repeats === 'monthly' ? addMonths(due, 1) : shift(due, REPEATS[item.repeats]);
  return due;
}

// --- assessing -------------------------------------------------------------
//
// Two clocks: the date the door chose to act, and the deadline the world set.
// A line is active when either is inside its lead; the list ranks on whichever
// presses soonest. A `from:` in the future blocks the line: never nudged,
// never overdue, back on its own the day the block lifts.

export function assess(items, now = today()) {
  return items
    .filter((i) => !i.done)
    .map((item) => {
      const due = nextOccurrence(item, now);
      const daysUntil = Math.round((due - now) / DAY_MS);
      const blocked = !!item.from && utc(item.from) > now;
      const pressing = item.deadline || iso(due);
      const daysToDeadline = Math.round((utc(pressing) - now) / DAY_MS);
      return { ...item, due: iso(due), daysUntil, blocked, daysToDeadline, active: !blocked && (daysUntil <= item.lead || daysToDeadline <= item.lead) };
    })
    .sort((a, b) => Number(a.blocked) - Number(b.blocked) || a.daysToDeadline - b.daysToDeadline || a.daysUntil - b.daysUntil);
}

export const idOf = (o) => `${o.door}::${o.text}`;

export function whenHuman(o, now = today()) {
  if (o.blocked) return `blocked until ${o.from}`;
  const d = o.daysUntil;
  const base = d < -1 ? `${-d} days overdue` : d === -1 ? 'yesterday' : d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days (${o.due})`;
  if (o.deadline && o.deadline !== o.due) return `${base}, deadline ${o.deadline}`;
  return base;
}

// --- wraps -----------------------------------------------------------------
//
// A door's STATE.md is written at the end of a session, so it lags its chat by
// however long since the last /wrap. The handoffs directory is the record.

export function lastWrap(root, door) {
  const dir = path.join(root, 'handoffs');
  if (!fs.existsSync(dir)) return null;
  let latest = null;
  for (const name of fs.readdirSync(dir)) {
    const m = new RegExp(`^${door}-(\\d{4}-\\d{2}-\\d{2})\\.md$`).exec(name);
    if (m && (!latest || m[1] > latest)) latest = m[1];
  }
  return latest;
}

export function staleDoors(root, assessed, now = today()) {
  const out = [];
  for (const door of [...new Set(assessed.map((o) => o.door))].sort()) {
    const wrapped = lastWrap(root, door);
    if (!wrapped) { out.push({ door, wrapped: null, days: null }); continue; }
    const days = Math.round((now - utc(wrapped)) / DAY_MS);
    if (days > STALE_AFTER_DAYS) out.push({ door, wrapped, days });
  }
  return out;
}

// --- proposing -------------------------------------------------------------
//
// Loose words in, a correct line out. It will not invent a date.

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const REPEAT_WORDS = [
  [/\b(daily|every day)\b/i, 'daily'],
  [/\b(weekly|every week)\b/i, 'weekly'],
  [/\b(fortnightly|every fortnight|every two weeks)\b/i, 'fortnightly'],
  [/\b(monthly|every month)\b/i, 'monthly'],
];

export function proposeLine(input, now = today()) {
  let text = String(input || '').trim();
  if (!text) throw new Error('nothing to propose');
  let date = null, repeats = null, lead = null, from = null, deadline = null;

  const eat = (re, fn) => {
    const m = re.exec(text);
    if (!m) return false;
    fn(m);
    text = (text.slice(0, m.index) + ' ' + text.slice(m.index + m[0].length)).replace(/\s+/g, ' ').trim();
    return true;
  };
  const dayMonth = (m, dayIdx, monthIdx) => {
    const month = m[monthIdx] ? MONTHS.indexOf(m[monthIdx].slice(0, 3).toLowerCase()) : now.getUTCMonth();
    let d = new Date(Date.UTC(now.getUTCFullYear(), month, Number(m[dayIdx])));
    if (d < shift(now, -180)) d = new Date(Date.UTC(now.getUTCFullYear() + 1, month, Number(m[dayIdx])));
    return d;
  };

  eat(/\b(\d+)\s*days?\s*(?:of\s*)?(?:warning|notice|heads[- ]?up)\b/i, (m) => { lead = Number(m[1]); });
  eat(/\bwarn\s*me\s*(\d+)\s*days?\s*(?:before|early)\b/i, (m) => { lead = Number(m[1]); });
  for (const [re, name] of REPEAT_WORDS) if (eat(re, () => { repeats = name; })) break;

  eat(/\bdeadline\s+(\d{4}-\d{2}-\d{2})\b/i, (m) => { deadline = m[1]; }) ||
    eat(new RegExp(`\\bdeadline\\s+(?:the\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTHS.join('|')})[a-z]*\\b`, 'i'), (m) => { deadline = iso(dayMonth(m, 1, 2)); });

  eat(/\b(?:not before|no earlier than|earliest|only (?:on|from|after)|from)\s+(\d{4}-\d{2}-\d{2})\b/i, (m) => { from = m[1]; }) ||
    eat(new RegExp(`\\b(?:not before|no earlier than|earliest|only (?:on|from|after)|from)\\s+(?:the\\s+)?(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+(${MONTHS.join('|')})[a-z]*)?\\b`, 'i'), (m) => { from = iso(dayMonth(m, 1, 2)); }) ||
    eat(new RegExp(`\\b(?:not before|no earlier than|only on|from)\\s+(${DAYS.join('|')})[a-z]*\\b`, 'i'), (m) => {
      const want = DAYS.indexOf(m[1].slice(0, 3).toLowerCase());
      from = iso(shift(now, (want - now.getUTCDay() + 7) % 7));
    });

  eat(/\b(\d{4}-\d{2}-\d{2})\b/, (m) => { date = m[1]; }) ||
    eat(new RegExp(`\\b(?:by|on|due)?\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTHS.join('|')})[a-z]*\\b`, 'i'), (m) => { date = iso(dayMonth(m, 1, 2)); }) ||
    eat(/\bin\s+(\d+)\s*(day|week|month)s?\b/i, (m) => { date = iso(shift(now, Number(m[1]) * { day: 1, week: 7, month: 30 }[m[2].toLowerCase()])); }) ||
    eat(/\btomorrow\b/i, () => { date = iso(shift(now, 1)); }) ||
    eat(/\btoday\b/i, () => { date = iso(now); }) ||
    eat(/\bnext week\b/i, () => { date = iso(shift(now, 7)); }) ||
    eat(new RegExp(`\\b(?:on\\s+)?(?:next\\s+)?(${DAYS.join('|')})[a-z]*\\b`, 'i'), (m) => {
      const want = DAYS.indexOf(m[1].slice(0, 3).toLowerCase());
      const ahead = (want - now.getUTCDay() + 7) % 7 || 7;
      date = iso(shift(now, ahead));
    });

  if (!date && repeats) date = iso(shift(now, REPEATS[repeats]));
  if (!date && from) date = from;
  if (!date && deadline) date = deadline;
  if (!date) throw new Error('no date found — say when, e.g. "in 3 days", "by 18 Sep", "on Tuesday", "weekly"');

  text = text.replace(/\s+(with|and|by|on|in|for|to|at|of)\s*$/i, '').replace(/^[\s,;:·-]+|[\s,;:·-]+$/g, '');
  if (!text) throw new Error('nothing left to describe once the date was removed');

  const parts = [`- [ ] ${date} · ${text}`];
  if (repeats) parts.push(`repeats: ${repeats}`);
  if (lead !== null) parts.push(`lead: ${lead}d`);
  if (deadline) parts.push(`deadline: ${deadline}`);
  if (from) parts.push(`from: ${from}`);
  const line = parts.join(' · ');
  if (!LINE_RE.test(line)) throw new Error(`proposed a line the parser refuses: ${line}`);
  return line;
}

// --- doctor ----------------------------------------------------------------
//
// One question: can the calendar be trusted? Looks for the quiet failures.

export function doctor(root, now = today()) {
  const { items, problems } = readAllDoors(root);
  const findings = problems.map((p) => ({ level: 'error', door: p.door, text: `${path.relative(root, p.file)}:${p.lineNo} — ${p.why}\n      ${p.text}` }));
  const open = items.filter((i) => !i.done);

  const seen = new Map();
  for (const o of open) {
    const key = o.text.toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key) && seen.get(key) !== o.door) findings.push({ level: 'warn', door: o.door, text: `same obligation in two doors (${seen.get(key)} and ${o.door}): "${o.text}"` });
    seen.set(key, o.door);
  }
  for (const o of open) {
    const y = Number(o.date.slice(0, 4));
    if (y < now.getUTCFullYear() - 1 || y > now.getUTCFullYear() + 3) findings.push({ level: 'warn', door: o.door, text: `date ${o.date} looks like a mistyped year: "${o.text}"` });
    if (!o.repeats && !o.review && utc(o.date) < shift(now, -30)) findings.push({ level: 'warn', door: o.door, text: `open since ${o.date}, over a month ago — abandoned or still owed? "${o.text}"` });
    if (o.deadline && utc(o.deadline) < now) findings.push({ level: 'warn', door: o.door, text: `deadline ${o.deadline} has passed and the line is still open: "${o.text}"` });
    if (o.repeats && o.review === false && /must stay true|always/i.test(o.text)) findings.push({ level: 'warn', door: o.door, text: `a repeating line can never show as overdue; is "${o.text}" really a repeat?` });
  }
  for (const s of staleDoors(root, assess(open, now), now)) findings.push({ level: 'warn', door: s.door, text: s.wrapped ? `carries obligations and was last wrapped ${s.wrapped}, ${s.days} days ago` : 'carries obligations and has never been wrapped (no handoff note)' });
  for (const door of listDoors(root)) {
    const w = path.join(root, door, 'watch.sh');
    if (fs.existsSync(w)) { try { fs.accessSync(w, fs.constants.X_OK); } catch { findings.push({ level: 'warn', door, text: 'watch.sh exists but is not executable, so it never runs' }); } }
  }
  return { findings, items, problems };
}

// --- watchers --------------------------------------------------------------
//
// A door with something external to look at keeps an executable `watch.sh`
// beside its STATE.md. Silence and exit 0 mean all well; any output is
// reported; a non-zero exit or a hang is reported, never swallowed.

export function runWatchers(root) {
  const out = [];
  for (const door of listDoors(root)) {
    const w = path.join(root, door, 'watch.sh');
    if (!fs.existsSync(w)) continue;
    try {
      const text = execFileSync(w, { cwd: path.join(root, door), timeout: 20_000, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
      out.push({ door, ok: true, text });
    } catch (e) {
      out.push({ door, ok: false, text: (e.stdout || '').toString().trim() + (e.stderr || '').toString().trim() || e.message });
    }
  }
  return out;
}

// --- calendar --------------------------------------------------------------

const fmt = (o) => {
  const tags = [];
  if (o.repeats) tags.push(o.repeats);
  if (o.review) tags.push('review');
  const t = tags.length ? ` [${tags.join(', ')}]` : '';
  return `- ${o.door} · ${o.text} — ${whenHuman(o)}${t}`;
};

export function calendarText(root, now = today()) {
  const { items, problems } = readAllDoors(root);
  const a = assess(items, now);
  const doNow = a.filter((o) => o.active && !o.review);
  const waiting = a.filter((o) => o.blocked);
  const later = a.filter((o) => !o.active && !o.blocked && !o.review);
  const reviews = a.filter((o) => o.review && !o.blocked);
  const stale = staleDoors(root, a, now);
  const lines = [`# Calendar — generated ${iso(now)}`, '', 'Generated by `bin/obligations.mjs --calendar` from every door\'s `## Obligations` block. Do not edit here: edit the door\'s line.', ''];
  const section = (title, list, empty) => { lines.push(`## ${title}`, ''); lines.push(...(list.length ? list.map(fmt) : [`_${empty}_`]), ''); };
  section('DO NOW', doNow, 'nothing is due');
  section('WAITING', waiting, 'nothing is blocked');
  section('LATER', later, 'nothing further out');
  section('DOORS TO SIT WITH', reviews, 'no reviews set');
  lines.push('## NOT CHECKED', '');
  const nc = [];
  for (const p of problems) nc.push(`- ${p.door} · line ${p.lineNo} could not be read: ${p.why}`);
  for (const s of stale) nc.push(`- ${s.door} · ${s.wrapped ? `last wrapped ${s.wrapped} (${s.days} days ago)` : 'never wrapped'} — its lines may be stale`);
  lines.push(...(nc.length ? nc : ['_every door read cleanly and was wrapped within a week_']), '');
  return lines.join('\n');
}

// --- history ---------------------------------------------------------------

export function history(root, id) {
  const [door, ...rest] = id.split('::');
  const text = rest.join('::');
  if (!door || !text) throw new Error('id is <door>::<text>');
  const file = path.join(door, 'STATE.md');
  try {
    return execFileSync('git', ['-C', root, 'log', '--date=short', '--format=%h %ad %s', '-G', text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), '--', file], { encoding: 'utf8' }).trim();
  } catch (e) { throw new Error(`git log failed: ${e.message}`); }
}

// --- cli -------------------------------------------------------------------

const arg = (name) => { const i = process.argv.indexOf(name); return i === -1 ? null : process.argv[i + 1] ?? ''; };
const has = (name) => process.argv.includes(name);

function main() {
  if (has('--propose')) { try { console.log(proposeLine(arg('--propose'))); } catch (e) { console.error(`cannot propose: ${e.message}`); process.exit(1); } return; }

  const root = findRoot();
  if (!root) { console.error('no doors workspace found: run from inside one, or set DOORS_HOME (the directory with the `.doors` marker)'); process.exit(2); }

  if (has('--root')) { console.log(root); return; }
  if (has('--doors')) { console.log(listDoors(root).join('\n')); return; }
  if (has('--history')) { try { console.log(history(root, arg('--history')) || 'no commit touched those words — check they match the line exactly'); } catch (e) { console.error(e.message); process.exit(1); } return; }
  if (has('--calendar')) { const file = path.join(root, 'CALENDAR.md'); fs.writeFileSync(file, calendarText(root)); console.log(`wrote ${file}`); return; }
  if (has('--watchers')) { for (const w of runWatchers(root)) console.log(`${w.ok ? '✓' : '✗'} ${w.door}${w.text ? ` — ${w.text}` : ''}`); return; }

  if (has('--doctor')) {
    const { findings, items } = doctor(root);
    if (!findings.length) console.log(`✓ ${items.length} lines across ${listDoors(root).length} doors read cleanly; nothing looks wrong`);
    for (const f of findings) console.log(`${f.level === 'error' ? '✗' : '!'} ${f.door} · ${f.text}`);
    process.exit(findings.some((f) => f.level === 'error') ? 1 : 0);
  }

  const { items, problems } = readAllDoors(root);
  const door = arg('--door');
  let a = assess(items);
  if (door) a = a.filter((o) => o.door === door);
  if (has('--json')) { console.log(JSON.stringify(a, null, 2)); return; }

  const show = has('--all') ? a : a.filter((o) => o.active);
  if (!show.length) console.log(has('--all') ? 'no open obligations' : 'nothing active today');
  for (const o of show) {
    const mark = o.review ? '◇' : o.blocked ? '⏸' : o.daysUntil < 0 || (o.deadline && o.daysToDeadline < 0) ? '‼' : '⏰';
    console.log(`${mark} ${o.door} · ${o.text} — ${whenHuman(o)}${o.repeats ? ` [${o.repeats}]` : ''}${o.note ? `  (${o.note})` : ''}`);
  }
  for (const p of problems) console.log(`✗ ${p.door} · ${path.relative(root, p.file)}:${p.lineNo} — ${p.why}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
