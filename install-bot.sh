#!/usr/bin/env bash
# Installs the IFOKNR tools Telegram bot as a service, without Docker (for servers where
# Docker cannot run containers, such as Droidspaces).
#
#   curl -fsSL https://raw.githubusercontent.com/ifoknr/tools/main/install-bot.sh | bash
#
# It asks for the bot token (from @BotFather) and your Telegram id; or pass them:
#   ... | bash -s -- --token 123:ABC --owner 123456789 --site https://ifoknr.com
# Options: --files DIR (where files you send are kept), --dir DIR (code), --no-start.
# Run it again to update the bot; the settings are kept.
set -euo pipefail

DIR=/opt/ifoknr-tools
ENV_FILE=/etc/ifoknr-bot.env
DATA=/var/lib/ifoknr-bot
REPO=https://github.com/ifoknr/tools
TOKEN="" OWNER="" SITE="" FILES="" START=1

while [ $# -gt 0 ]; do
  case "$1" in
    --token) TOKEN="$2"; shift 2 ;;
    --owner) OWNER="$2"; shift 2 ;;
    --site) SITE="$2"; shift 2 ;;
    --files) FILES="$2"; shift 2 ;;
    --dir) DIR="$2"; shift 2 ;;
    --no-start) START=0; shift ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
[ "$(id -u)" = 0 ] || { echo "Run as root." >&2; exit 1; }
has_systemd() { [ -d /run/systemd/system ] && command -v systemctl >/dev/null; }

# Settings already saved by an earlier run are kept unless given again.
old() { if [ -f "$ENV_FILE" ]; then sed -n "s/^$1=//p" "$ENV_FILE" | head -1; fi; }
TOKEN=${TOKEN:-$(old BOT_TOKEN)}
OWNER=${OWNER:-$(old OWNER_IDS)}
SITE=${SITE:-$(old SITE_URL)}
FILES=${FILES:-$(old FILES_DIR)}
if [ -z "$FILES" ]; then
  # CasaOS keeps its files under /DATA; the bot's then show up in its Files app.
  if [ -d /DATA ]; then FILES=/DATA/Telegram; else FILES=$DATA/files; fi
fi

# Piped into bash, stdin is this script: questions are read from the terminal.
ask() {
  local prompt="$1" secret="${2:-}" answer=""
  if [ -r /dev/tty ]; then
    if [ -n "$secret" ]; then read -r -s -p "$prompt" answer < /dev/tty; echo > /dev/tty
    else read -r -p "$prompt" answer < /dev/tty; fi
  fi
  printf '%s' "$answer"
}
if [ -z "$TOKEN" ]; then
  TOKEN=$(ask "Bot token from @BotFather (hidden): " secret)
fi
case "$TOKEN" in
  *:*) ;;
  *) echo "A bot token looks like 123456789:ABC... Get one from @BotFather (/newbot)." >&2; exit 2 ;;
esac
if [ -z "$OWNER" ]; then
  OWNER=$(ask "Your Telegram id (empty for now: send /id to the bot, then run this again): ")
fi
case "$OWNER" in
  ''|[0-9]*) ;;
  *) echo "The Telegram id is a number. Send /id to the bot to get it." >&2; exit 2 ;;
esac

say "Installing Python and git"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -y -q python3 python3-venv git ca-certificates

say "Getting the bot into $DIR"
if [ -d "$DIR/.git" ]; then
  git -C "$DIR" pull --ff-only -q
else
  git clone -q --depth 1 "$REPO" "$DIR"
fi
cp "$DIR/site/assets/tools.json" "$DIR/bot/ifoknr_bot/tools.json"
python3 -m venv "$DIR/bot/.venv"
"$DIR/bot/.venv/bin/pip" install -q --upgrade pip
"$DIR/bot/.venv/bin/pip" install -q -r "$DIR/bot/requirements.txt"

say "Saving the settings in $ENV_FILE"
mkdir -p "$DATA" "$FILES"
umask 077
cat > "$ENV_FILE" <<EOF
BOT_TOKEN=$TOKEN
OWNER_IDS=$OWNER
SITE_URL=$SITE
DATA_DIR=$DATA
FILES_DIR=$FILES
EOF
chmod 600 "$ENV_FILE"
umask 022

if has_systemd; then
  say "Running the bot as a service"
  cat > /etc/systemd/system/ifoknr-bot.service <<EOF
[Unit]
Description=IFOKNR tools Telegram bot
After=network-online.target
Wants=network-online.target

[Service]
EnvironmentFile=$ENV_FILE
WorkingDirectory=$DIR/bot
ExecStart=$DIR/bot/.venv/bin/python -m ifoknr_bot
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
  systemctl daemon-reload
  if [ "$START" = 1 ]; then
    systemctl enable -q ifoknr-bot
    systemctl restart ifoknr-bot
    sleep 4
    if systemctl is-active -q ifoknr-bot; then
      echo "The bot is running. Open it in Telegram and send /start."
    else
      echo "The bot did not start. See: journalctl -u ifoknr-bot -n 30 --no-pager" >&2
      exit 1
    fi
  fi
else
  echo "No systemd: start the bot with"
  echo "  set -a; . $ENV_FILE; set +a; cd $DIR/bot && nohup .venv/bin/python -m ifoknr_bot >> $DATA/bot.log 2>&1 &"
fi

if [ -z "$OWNER" ]; then
  echo
  echo "Next: send /id to the bot, then run this script again and give that number as your Telegram id."
fi
echo "Files you send to the bot are kept in: $FILES"
