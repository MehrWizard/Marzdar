import time
from threading import RLock
from typing import Dict, Optional, Tuple

from config import SUB_CACHE_TTL

_lock = RLock()
# Structure: { (username, client_key): (content, media_type, headers, expire_at) }
_cache: Dict[Tuple[str, str], Tuple[str, str, dict, float]] = {}
_MAX_CACHE_SIZE = 10000


def get_cached_subscription(username: str, client_key: str) -> Optional[Tuple[str, str, dict]]:
    """Retrieve cached subscription response if valid."""
    if SUB_CACHE_TTL <= 0:
        return None

    now = time.monotonic()
    key = (username, client_key)
    with _lock:
        item = _cache.get(key)
        if not item:
            return None
        content, media_type, headers, expire_at = item
        if now > expire_at:
            _cache.pop(key, None)
            return None
        return content, media_type, headers


def set_cached_subscription(username: str, client_key: str, content: str, media_type: str, headers: dict) -> None:
    """Store subscription response in memory with TTL."""
    if SUB_CACHE_TTL <= 0:
        return

    now = time.monotonic()
    key = (username, client_key)
    with _lock:
        if len(_cache) >= _MAX_CACHE_SIZE:
            # Purge expired entries
            expired = [k for k, v in _cache.items() if now > v[3]]
            for k in expired:
                _cache.pop(k, None)
            # If still full, pop first item
            if len(_cache) >= _MAX_CACHE_SIZE:
                _cache.pop(next(iter(_cache)), None)

        _cache[key] = (content, media_type, dict(headers), now + SUB_CACHE_TTL)


def invalidate_sub_cache(username: Optional[str] = None) -> None:
    """Invalidate subscription cache for a specific user or completely."""
    with _lock:
        if username is None:
            _cache.clear()
        else:
            keys_to_remove = [k for k in _cache if k[0] == username]
            for k in keys_to_remove:
                _cache.pop(k, None)
