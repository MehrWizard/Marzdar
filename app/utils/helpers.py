import json
from datetime import datetime as dt
from uuid import UUID

import yaml

try:
    from yaml import CSafeLoader as SafeLoader, CSafeDumper as SafeDumper
except ImportError:
    from yaml import SafeLoader, SafeDumper  # type: ignore


def yml_uuid_representer(dumper, data):
    return dumper.represent_scalar('tag:yaml.org,2002:str', str(data))


yaml.add_representer(UUID, yml_uuid_representer, Dumper=SafeDumper)
yaml.add_representer(UUID, yml_uuid_representer, Dumper=yaml.SafeDumper)
yaml.add_representer(UUID, yml_uuid_representer)


class UUIDEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return str(obj)
        return super().default(self, obj)


try:
    import orjson

    def json_dumps(obj, indent: bool = False) -> str:
        opt = orjson.OPT_INDENT_2 if indent else 0
        return orjson.dumps(obj, option=opt).decode("utf-8")

    def json_dumps_bytes(obj, sort_keys: bool = False) -> bytes:
        opt = orjson.OPT_SORT_KEYS if sort_keys else 0
        return orjson.dumps(obj, option=opt)

    def json_loads(s):
        return orjson.loads(s)
except ImportError:
    def json_dumps(obj, indent: bool = False) -> str:
        return json.dumps(obj, indent=2 if indent else None, cls=UUIDEncoder)

    def json_dumps_bytes(obj, sort_keys: bool = False) -> bytes:
        return json.dumps(obj, sort_keys=sort_keys, cls=UUIDEncoder).encode("utf-8")

    def json_loads(s):
        return json.loads(s)


def calculate_usage_percent(used_traffic: int, data_limit: int) -> float:
    return (used_traffic * 100) / data_limit


def calculate_expiration_days(expire: int) -> int:
    return (dt.fromtimestamp(expire) - dt.utcnow()).days
