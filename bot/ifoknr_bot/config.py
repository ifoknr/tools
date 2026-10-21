"""Settings, read once from the environment."""

import os
from dataclasses import dataclass
from pathlib import Path

DEFAULT_TOOLS_URL = "https://raw.githubusercontent.com/ifoknr/tools/main/site/assets/tools.json"

# Telegram's cloud Bot API lets a bot download files up to 20 MB and send up to 50 MB.
# A local Bot API server (BOT_API_URL) raises both to 2000 MB.
CLOUD_DOWNLOAD_LIMIT = 20 * 1024 * 1024
CLOUD_UPLOAD_LIMIT = 50 * 1024 * 1024
LOCAL_LIMIT = 2000 * 1024 * 1024


@dataclass(frozen=True)
class Config:
    token: str
    owners: frozenset
    files_dir: Path
    state_file: Path
    tools_file: Path
    tools_url: str
    github_token: str
    site_url: str
    channel_url: str
    bot_api_url: str
    library_file: Path = Path("/data/library.json")
    public_dir: Path = Path("/data/public")

    @property
    def app_url(self) -> str:
        """The tools library (Telegram Mini App) on the site. Telegram opens only https pages."""
        return self.site_url.rstrip("/") + "/app/" if self.site_url.startswith("https://") else ""

    @property
    def local_api(self) -> bool:
        return bool(self.bot_api_url)

    @property
    def download_limit(self) -> int:
        return LOCAL_LIMIT if self.local_api else CLOUD_DOWNLOAD_LIMIT

    @property
    def upload_limit(self) -> int:
        return LOCAL_LIMIT if self.local_api else CLOUD_UPLOAD_LIMIT

    def is_owner(self, user_id) -> bool:
        return user_id is not None and user_id in self.owners


def parse_owners(text: str) -> frozenset:
    owners = set()
    for part in (text or "").replace(";", ",").split(","):
        part = part.strip()
        if part:
            if not part.lstrip("-").isdigit():
                raise ValueError(f"OWNER_IDS must be numeric Telegram user ids, got {part!r}")
            owners.add(int(part))
    return frozenset(owners)


def load(env=None) -> Config:
    env = os.environ if env is None else env
    token = env.get("BOT_TOKEN", "").strip()
    if not token:
        raise SystemExit("BOT_TOKEN is not set. Get one from @BotFather and pass it as an environment variable.")
    data_dir = Path(env.get("DATA_DIR", "/data"))
    here = Path(__file__).resolve().parent
    return Config(
        token=token,
        owners=parse_owners(env.get("OWNER_IDS", "")),
        files_dir=Path(env.get("FILES_DIR", str(data_dir / "files"))),
        state_file=Path(env.get("STATE_FILE", str(data_dir / "bot-state.pickle"))),
        tools_file=Path(env.get("TOOLS_FILE", str(here / "tools.json"))),
        tools_url=env.get("TOOLS_URL", DEFAULT_TOOLS_URL).strip(),
        github_token=env.get("GITHUB_TOKEN", "").strip(),
        site_url=env.get("SITE_URL", "").strip(),
        channel_url=env.get("CHANNEL_URL", "https://t.me/IFOKNR1").strip(),
        bot_api_url=env.get("BOT_API_URL", "").strip().rstrip("/"),
        library_file=Path(env.get("LIBRARY_FILE", str(data_dir / "library.json"))),
        public_dir=Path(env.get("PUBLIC_DIR", str(data_dir / "public"))),
    )
