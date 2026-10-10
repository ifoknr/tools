# Build from the repository root:  docker build -f bot/Dockerfile .
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY bot/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY bot/ifoknr_bot ./ifoknr_bot
# The same tool list as the site; the bot also re-reads it from GitHub every hour.
COPY site/assets/tools.json ./ifoknr_bot/tools.json
VOLUME /data
CMD ["python", "-m", "ifoknr_bot"]
