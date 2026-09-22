import os
import subprocess


def get_version(fallback: str = "0.1.1") -> str:
    """
    Resolve the real live version of the application dynamically.

    Resolution order:
    1. Environment variables: MARZDAR_VERSION, APP_VERSION, VERSION
    2. version.txt or VERSION file in the project root
    3. git describe --tags --abbrev=0 (live git tag if in a git repository)
    4. Fallback version string
    """
    # 1. Check explicit environment variables
    for env_var in ("MARZDAR_VERSION", "APP_VERSION", "VERSION"):
        val = os.environ.get(env_var)
        if val:
            clean = val.strip().lstrip("v")
            if clean and clean.lower() not in ("master", "latest", "main"):
                return clean

    # 2. Check version.txt in project root
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for filename in ("version.txt", "VERSION", ".version"):
        filepath = os.path.join(root_dir, filename)
        if os.path.isfile(filepath):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read().strip().lstrip("v")
                    if content and content.lower() not in ("master", "latest", "main"):
                        return content
            except Exception:
                pass

    # 3. Check live git tag if running within a git repository
    try:
        tag = subprocess.check_output(
            ["git", "describe", "--tags", "--abbrev=0"],
            cwd=root_dir,
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=2,
        ).strip().lstrip("v")
        if tag and tag.lower() not in ("master", "latest", "main"):
            return tag
    except Exception:
        pass

    return fallback


__version__ = get_version()
