#!/usr/bin/env bash
# install.sh — set up a doors workspace for Claude Code.
#
#   ./install.sh                 interactive
#   ./install.sh ~/doors "Ana"   workspace path and owner name, no questions
#
# What it does:
#   1. creates the workspace (default ~/doors) with README, CLAUDE.md, bin/, docs/, .templates/
#   2. installs the skills (/open /wrap /meet /newdoor /doors-setup) into ~/.claude/skills
#   3. adds `door` to your shell (sources bin/door.sh from ~/.zshrc or ~/.bashrc)
#   4. makes the workspace a git repo with a first commit
#   5. tells you to run `claude "/doors-setup"` from the workspace for the interactive part
#
# Safe to re-run: it never overwrites a file that already exists, and says what it skipped.

set -euo pipefail
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

say()  { printf '\033[1m%s\033[0m\n' "$*"; }
note() { printf '  %s\n' "$*"; }
ask()  { local v; printf '%s' "$1"; read -r v; printf '%s' "${v:-$2}"; }

command -v node >/dev/null || { echo "node is required (18+): https://nodejs.org"; exit 1; }
command -v git  >/dev/null || { echo "git is required"; exit 1; }
command -v claude >/dev/null || note "claude is not on PATH yet — install Claude Code first; the files will still be put in place."

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 18 ] || { echo "node 18+ required, found $(node --version)"; exit 1; }

say "Doors — setup"
echo
if [ $# -ge 1 ]; then DOORS_HOME="$1"; else DOORS_HOME=$(ask "Where should the workspace live? [~/doors] " "$HOME/doors"); fi
DOORS_HOME="${DOORS_HOME/#\~/$HOME}"
if [ $# -ge 2 ]; then OWNER="$2"; else OWNER=$(ask "Your name, as the files should refer to you [the owner] " "the owner"); fi
OWNER_SHORT="${OWNER%% *}"
echo

# 1. workspace --------------------------------------------------------------
say "1. Workspace at $DOORS_HOME"
mkdir -p "$DOORS_HOME"/{bin,docs,handoffs,.templates}
put() { # put <src> <dst>  — copy unless dst exists
  if [ -e "$2" ]; then note "kept    $2"; else cp "$1" "$2"; note "wrote   $2"; fi
}
fill() { # fill <src> <dst> — template with placeholders
  if [ -e "$2" ]; then note "kept    $2"; return; fi
  sed -e "s|{{DOORS_HOME}}|${DOORS_HOME/#$HOME/~}|g" -e "s|{{OWNER}}|$OWNER|g" -e "s|{{OWNER_SHORT}}|$OWNER_SHORT|g" \
      -e "s|{{DOOR_ROWS}}|_no doors yet — run \`claude \"/doors-setup\"\` here, or \`door new <name>\`_|" "$1" > "$2"
  note "wrote   $2"
}
fill "$KIT/templates/CLAUDE.md" "$DOORS_HOME/CLAUDE.md"
fill "$KIT/templates/README.md" "$DOORS_HOME/README.md"
put  "$KIT/templates/STATE.md"   "$DOORS_HOME/.templates/STATE.md"
put  "$KIT/templates/meeting.md" "$DOORS_HOME/.templates/meeting.md"
put  "$KIT/templates/handoff.md" "$DOORS_HOME/.templates/handoff.md"
for f in "$KIT"/templates/docs/*.md; do put "$f" "$DOORS_HOME/docs/$(basename "$f")"; done
cp "$KIT/bin/obligations.mjs" "$DOORS_HOME/bin/obligations.mjs"; note "wrote   $DOORS_HOME/bin/obligations.mjs"
cp "$KIT/bin/door.sh"         "$DOORS_HOME/bin/door.sh";         note "wrote   $DOORS_HOME/bin/door.sh"
cp "$KIT/bin/test.mjs"        "$DOORS_HOME/bin/test.mjs"
[ -e "$DOORS_HOME/.doors" ] || printf 'owner: %s\nopened: %s\nkit: doors-kit\n' "$OWNER" "$(date +%Y-%m-%d)" > "$DOORS_HOME/.doors"
[ -e "$DOORS_HOME/handoffs/.keep" ] || : > "$DOORS_HOME/handoffs/.keep"
[ -e "$DOORS_HOME/.gitignore" ] || printf '.DS_Store\n*.sent.*\n' > "$DOORS_HOME/.gitignore"
echo

# 2. skills -----------------------------------------------------------------
say "2. Skills into ~/.claude/skills"
mkdir -p "$HOME/.claude/skills"
for s in open wrap meet newdoor doors-setup; do
  if [ -e "$HOME/.claude/skills/$s/SKILL.md" ]; then
    if diff -q "$KIT/skills/$s/SKILL.md" "$HOME/.claude/skills/$s/SKILL.md" >/dev/null; then note "same    /$s"
    else note "kept    /$s  (yours differs — the kit's copy is at $KIT/skills/$s/SKILL.md)"; fi
  else
    mkdir -p "$HOME/.claude/skills/$s"; cp "$KIT/skills/$s/SKILL.md" "$HOME/.claude/skills/$s/"; note "wrote   /$s"
  fi
done
echo

# 3. shell ------------------------------------------------------------------
say "3. Shell"
RC="$HOME/.zshrc"; [ -n "${BASH_VERSION:-}" ] && [ "$(basename "${SHELL:-}")" = "bash" ] && RC="$HOME/.bashrc"
case "$(basename "${SHELL:-zsh}")" in bash) RC="$HOME/.bashrc";; *) RC="$HOME/.zshrc";; esac
LINE1="export DOORS_HOME=\"${DOORS_HOME/#$HOME/\$HOME}\""
LINE2="source \"\$DOORS_HOME/bin/door.sh\""
if grep -qs 'bin/door.sh' "$RC"; then note "kept    $RC already sources door.sh"
else printf '\n# doors — one Claude Code door per project (see $DOORS_HOME/README.md)\n%s\n%s\n' "$LINE1" "$LINE2" >> "$RC"; note "added   two lines to $RC"; fi
echo

# 4. git ----------------------------------------------------------------------
say "4. Git"
if [ -d "$DOORS_HOME/.git" ]; then note "kept    existing repo"
else
  git -C "$DOORS_HOME" init -q -b main 2>/dev/null || { git -C "$DOORS_HOME" init -q; git -C "$DOORS_HOME" checkout -q -b main 2>/dev/null || true; }
  git -C "$DOORS_HOME" add -A
  git -C "$DOORS_HOME" -c user.name="${OWNER}" -c user.email="doors@localhost" commit -q -m "Workspace — Installed From Doors Kit" 2>/dev/null \
    || git -C "$DOORS_HOME" commit -q -m "Workspace — Installed From Doors Kit"
  note "init    main, first commit"
fi
echo

# 5. check ------------------------------------------------------------------
say "5. Check"
( cd "$DOORS_HOME" && node bin/test.mjs ) && note "tool    tests pass"
echo
say "Done. Next:"
cat <<MSG
  1. open a new terminal (or:  source $RC)
  2. cd "$DOORS_HOME" && claude "/doors-setup"
     — a short conversation that names your doors, writes your rules into
       CLAUDE.md and creates the first STATE.md files.
  3. then:  door            list the doors
            door <name>     open one (runs /open)
            /wrap           as the last message of every session
MSG
