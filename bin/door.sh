# door.sh — shell helpers for a doors workspace. Sourced by your shell rc.
# Works in bash and zsh.
#
#   door                 list the doors and pick one
#   door home            open that door (prefix match works: `door ho`)
#   door home --continue flags pass through to claude
#   door new <name>      scaffold a new door, then open it with /newdoor
#   door cal             print today's calendar (what is due, blocked, later)
#   door root            cd to the workspace root (the seat above the doors)
#
# DOORS_HOME is set by install.sh. Default: ~/doors.

: "${DOORS_HOME:=$HOME/doors}"

_door_names() {
  # Every directory with a STATE.md is a door. The README table is for humans.
  local d
  for d in "$DOORS_HOME"/*/; do
    [ -f "$d/STATE.md" ] && basename "$d"
  done
}

_door_desc() {
  # First non-empty line after the title in STATE.md, trimmed to one line.
  awk 'NR>1 && NF {gsub(/^[ \t]+|[ \t]+$/,""); print; exit}' "$DOORS_HOME/$1/STATE.md" 2>/dev/null | cut -c1-70
}

door() {
  if [ ! -f "$DOORS_HOME/.doors" ]; then
    echo "door: no workspace at $DOORS_HOME (run install.sh, or export DOORS_HOME)" >&2
    return 1
  fi

  case "$1" in
    root) cd "$DOORS_HOME" && return 0 ;;
    cal)  node "$DOORS_HOME/bin/obligations.mjs" --calendar >/dev/null && sed -n '1,200p' "$DOORS_HOME/CALENDAR.md"; return $? ;;
    new)
      local name="$2"
      if [ -z "$name" ]; then echo "usage: door new <name>" >&2; return 1; fi
      if [ -d "$DOORS_HOME/$name" ]; then echo "door: $name already exists" >&2; return 1; fi
      mkdir -p "$DOORS_HOME/$name"
      sed "s/{{DOOR}}/$name/g; s/{{DATE}}/$(date +%Y-%m-%d)/g" "$DOORS_HOME/.templates/STATE.md" > "$DOORS_HOME/$name/STATE.md"
      cd "$DOORS_HOME/$name" && claude "/newdoor $name"
      return $?
      ;;
  esac

  local names target match n
  names=$(_door_names)
  if [ -z "$names" ]; then echo "door: no doors yet — try: door new <name>" >&2; return 1; fi

  target="$1"
  if [ -z "$target" ]; then
    local i=1
    while IFS= read -r n; do
      printf '  %2d  %-16s %s\n' "$i" "$n" "$(_door_desc "$n")"
      i=$((i+1))
    done <<< "$names"
    printf 'Pick a door (number or name, blank to cancel): '
    read -r target
    [ -z "$target" ] && return 0
    case "$target" in
      ''|*[!0-9]*) ;;
      *) target=$(echo "$names" | sed -n "${target}p") ;;
    esac
    set --
  else
    shift
  fi

  if echo "$names" | grep -qx -- "$target"; then
    match="$target"
  else
    local hits
    hits=$(echo "$names" | grep -- "^$target")
    case $(echo "$hits" | grep -c .) in
      1) match="$hits" ;;
      0) echo "door: no door matching '$target'" >&2; return 1 ;;
      *) echo "door: '$target' is ambiguous — $(echo "$hits" | tr '\n' ' ')" >&2; return 1 ;;
    esac
  fi

  cd "$DOORS_HOME/$match" || return 1
  printf '\033[2m— %s —\033[0m\n' "$match"
  if [ $# -eq 0 ]; then claude "/open"; else claude "$@"; fi
}

doors() { door root; }
