FROM nginx:1.27-alpine
# The certificates nginx checks GitHub's against, for the release data it fetches (nginx.conf).
RUN apk add --no-cache ca-certificates && test -s /etc/ssl/certs/ca-certificates.crt
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf
COPY app-headers.conf /etc/nginx/app-headers.conf
COPY site/ /usr/share/nginx/html/
# Cloudflare keeps /assets/ for hours, so each release names its own copy: app.js?v=<hash>.
# A new index.html (never cached) then asks for the new files instead of yesterday's.
RUN cd /usr/share/nginx/html && for f in assets/boot.js assets/app.js assets/style.css; do \
      h=$(md5sum "$f" | cut -c1-10); sed -i "s#\"$f\"#\"$f?v=$h\"#" index.html; \
    done && grep -q 'app.js?v=' index.html \
    && sed -i '/<script type="application\/json" id="tools-data">/r assets/tools.json' index.html \
    && grep -q '"fastbootstudio"' index.html \
    && for f in app/app.js app/app.css; do \
      h=$(md5sum "$f" | cut -c1-10); sed -i "s#\"/$f\"#\"/$f?v=$h\"#" app/index.html; \
    done && grep -q 'app.js?v=' app/index.html && rm -rf app/live
EXPOSE 80
HEALTHCHECK --interval=1m --timeout=5s CMD wget -qO /dev/null http://127.0.0.1/ || exit 1
