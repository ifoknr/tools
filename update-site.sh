#!/bin/sh
# Updates the site container to the newest image, and gives it the bot's list of the owner's
# library files (the bot's data folder, public/), so the tools library can show them.
# Install:  curl -fsSL https://raw.githubusercontent.com/ifoknr/tools/main/update-site.sh -o /usr/local/bin/update-site && chmod +x /usr/local/bin/update-site
IMG=ghcr.io/ifoknr/tools:latest
APP_LIVE=/usr/share/nginx/html/app/live
LIVE=""
for d in /var/lib/ifoknr-bot/public /DATA/AppData/ifoknr-bot/public; do
  if [ -d "$d" ]; then LIVE="$d"; break; fi
done

echo "Checking for a new version..."
docker pull -q "$IMG" >/dev/null || { echo "Download failed: check the internet connection"; exit 1; }
NEW=$(docker image inspect -f '{{.Id}}' "$IMG")
CUR=$(docker inspect -f '{{.Image}}' ifoknr-tools 2>/dev/null)
CUR_LIVE=$(docker inspect -f "{{range .Mounts}}{{if eq .Destination \"$APP_LIVE\"}}{{.Source}}{{end}}{{end}}" ifoknr-tools 2>/dev/null)
if [ "$NEW" = "$CUR" ] && [ "$LIVE" = "$CUR_LIVE" ]; then
  echo "The site is already up to date."
else
  docker rm -f ifoknr-tools >/dev/null 2>&1
  if [ -n "$LIVE" ]; then
    docker run -d --name ifoknr-tools -p 8090:80 --restart unless-stopped -v "$LIVE:$APP_LIVE:ro" "$IMG" >/dev/null && echo "The site has been updated (with the bot's library files from $LIVE)."
  else
    docker run -d --name ifoknr-tools -p 8090:80 --restart unless-stopped "$IMG" >/dev/null && echo "The site has been updated."
  fi
fi
docker ps --filter name=ifoknr-tools --format '{{.Names}}: {{.Status}}'
