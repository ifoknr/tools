#!/usr/bin/env bash
# Installs the IFOKNR tools site with nginx, without Docker (for servers where Docker cannot
# run containers, such as Droidspaces). Optionally connects a Cloudflare Tunnel.
#
#   curl -fsSL https://raw.githubusercontent.com/ifoknr/tools/main/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/ifoknr/tools/main/install.sh | bash -s -- --tunnel TOKEN
#
# Options:  --port N (default 8090)   --tunnel TOKEN (Cloudflare Tunnel token)   --dir PATH
set -euo pipefail

PORT=8090
DIR=/opt/ifoknr-tools
TOKEN=""
REPO=https://github.com/ifoknr/tools

while [ $# -gt 0 ]; do
  case "$1" in
    --port) PORT="$2"; shift 2 ;;
    --tunnel) TOKEN="$2"; shift 2 ;;
    --dir) DIR="$2"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
[ "$(id -u)" = 0 ] || { echo "Run as root." >&2; exit 1; }
case "$PORT" in ''|*[!0-9]*) echo "--port must be a number" >&2; exit 2 ;; esac
has_systemd() { [ -d /run/systemd/system ] && command -v systemctl >/dev/null; }

say "Installing nginx and git"
export DEBIAN_FRONTEND=noninteractive
apt-get update -q
apt-get install -y -q nginx git curl ca-certificates

say "Getting the site into $DIR"
if [ -d "$DIR/.git" ]; then
  git -C "$DIR" pull --ff-only -q
else
  git clone -q --depth 1 "$REPO" "$DIR"
fi

say "Configuring nginx on port $PORT"
install -m 644 "$DIR/security-headers.conf" /etc/nginx/ifoknr-security-headers.conf
sed -e "s#listen 80;#listen $PORT;#" \
    -e "s#root /usr/share/nginx/html;#root $DIR/site;#" \
    -e "s#/etc/nginx/security-headers.conf#/etc/nginx/ifoknr-security-headers.conf#g" \
    "$DIR/nginx.conf" > /etc/nginx/conf.d/ifoknr-tools.conf
# The stock site listens on port 80, which CasaOS already uses.
rm -f /etc/nginx/sites-enabled/default
nginx -t

if has_systemd; then
  systemctl enable -q nginx
  systemctl restart nginx

  say "Updating the site every hour"
  cat > /etc/systemd/system/ifoknr-tools-update.service <<EOF
[Unit]
Description=Update the IFOKNR tools site

[Service]
Type=oneshot
ExecStart=/usr/bin/git -C $DIR pull --ff-only -q
ExecStartPost=/usr/sbin/nginx -s reload
EOF
  cat > /etc/systemd/system/ifoknr-tools-update.timer <<'EOF'
[Unit]
Description=Update the IFOKNR tools site every hour

[Timer]
OnBootSec=5min
OnUnitActiveSec=1h

[Install]
WantedBy=timers.target
EOF
  systemctl daemon-reload
  systemctl enable -q --now ifoknr-tools-update.timer
else
  (pgrep -x nginx >/dev/null && nginx -s reload) || nginx
  echo "No systemd: nginx started now, but start it again after a reboot (run: nginx)."
fi

if [ -n "$TOKEN" ]; then
  say "Connecting the Cloudflare Tunnel"
  if ! command -v cloudflared >/dev/null; then
    arch=$(dpkg --print-architecture)
    curl -fsSL -o /tmp/cloudflared.deb "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$arch.deb"
    dpkg -i /tmp/cloudflared.deb
    rm -f /tmp/cloudflared.deb
  fi
  if has_systemd; then
    cloudflared service uninstall >/dev/null 2>&1 || true
    cloudflared service install "$TOKEN"
  else
    nohup cloudflared tunnel --no-autoupdate run --token "$TOKEN" >/var/log/cloudflared.log 2>&1 &
  fi
fi

say "Checking"
sleep 1
if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/"; then
  ip=$(hostname -I 2>/dev/null | awk '{print $1}')
  echo "The site is up: http://${ip:-SERVER-IP}:$PORT"
  if [ -n "$TOKEN" ]; then
    echo "In Cloudflare, point the public hostname to: HTTP  localhost:$PORT"
  fi
else
  echo "nginx did not answer on port $PORT. Check: nginx -t ; journalctl -u nginx" >&2
  exit 1
fi
