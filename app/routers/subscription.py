import re
from datetime import datetime
from typing import Any, Optional
try:
    from packaging.version import Version as LooseVersion
except ImportError:
    try:
        from distutils.version import LooseVersion
    except ImportError:
        def LooseVersion(v):
            return [int(x) if x.isdigit() else x for x in re.split(r'(\d+)', str(v))]

from fastapi import APIRouter, Depends, Header, HTTPException, Path, Request, Response
from fastapi.responses import HTMLResponse

from app.db import GetDB, Session, crud, get_db
from app.dependencies import get_validated_sub, validate_dates
from app.models.user import SubscriptionUserResponse, UserResponse
from app.subscription.cache import get_cached_subscription, set_cached_subscription
from app.subscription.share import encode_title, generate_subscription
from app.templates import render_template
from app.utils.jwt import get_subscription_payload
from config import (
    SUB_PROFILE_TITLE,
    SUB_SUPPORT_URL,
    SUB_UPDATE_INTERVAL,
    SUBSCRIPTION_PAGE_TEMPLATE,
    USE_CUSTOM_JSON_DEFAULT,
    USE_CUSTOM_JSON_FOR_HAPP,
    USE_CUSTOM_JSON_FOR_STREISAND,
    USE_CUSTOM_JSON_FOR_V2RAYN,
    USE_CUSTOM_JSON_FOR_V2RAYNG,
    XRAY_SUBSCRIPTION_PATH,
)

client_config = {
    "clash-meta": {"config_format": "clash-meta", "media_type": "text/yaml", "as_base64": False, "reverse": False},
    "sing-box": {"config_format": "sing-box", "media_type": "application/json", "as_base64": False, "reverse": False},
    "clash": {"config_format": "clash", "media_type": "text/yaml", "as_base64": False, "reverse": False},
    "v2ray": {"config_format": "v2ray", "media_type": "text/plain", "as_base64": True, "reverse": False},
    "outline": {"config_format": "outline", "media_type": "application/json", "as_base64": False, "reverse": False},
    "v2ray-json": {"config_format": "v2ray-json", "media_type": "application/json", "as_base64": False,
                   "reverse": False}
}

router = APIRouter(tags=['Subscription'], prefix=f'/{XRAY_SUBSCRIPTION_PATH}')


def _safe_update_user_sub(db: Session, dbuser: UserResponse, user_agent: str):
    now = datetime.utcnow()
    last_updated = getattr(dbuser, "sub_updated_at", None)
    last_ua = getattr(dbuser, "sub_last_user_agent", None)
    if (not last_updated) or ((now - last_updated).total_seconds() > 60) or (last_ua != user_agent):
        try:
            crud.update_user_sub(db, dbuser, user_agent)
        except Exception:
            pass


def get_subscription_user_info(user: UserResponse) -> dict:
    """Retrieve user subscription information including upload, download, total data, and expiry."""
    return {
        "upload": 0,
        "download": user.used_traffic,
        "total": user.data_limit if user.data_limit is not None else 0,
        "expire": user.expire if user.expire is not None else 0,
    }


def _render_user_subscription(
    request: Request,
    db: Session,
    dbuser: UserResponse,
    user_agent: str,
    is_html: bool,
    client_key: str
) -> Response:
    user: UserResponse = UserResponse.model_validate(dbuser)

    if is_html:
        html_content = render_template(
            SUBSCRIPTION_PAGE_TEMPLATE,
            {"user": user}
        )
        set_cached_subscription(user.username, "__html__", html_content, "text/html", {})
        return HTMLResponse(html_content)

    _safe_update_user_sub(db, dbuser, user_agent)
    response_headers = {
        "content-disposition": f'attachment; filename="{user.username}"',
        "profile-web-page-url": str(request.url),
        "support-url": SUB_SUPPORT_URL,
        "profile-title": encode_title(SUB_PROFILE_TITLE),
        "profile-update-interval": SUB_UPDATE_INTERVAL,
        "subscription-userinfo": "; ".join(
            f"{key}={val}"
            for key, val in get_subscription_user_info(user).items()
        )
    }

    if re.match(r'^([Cc]lash-verge|[Cc]lash[-\.]?[Mm]eta|[Ff][Ll][Cc]lash|[Mm]ihomo)', user_agent):
        conf = generate_subscription(user=user, config_format="clash-meta", as_base64=False, reverse=False)
        media_type = "text/yaml"

    elif re.match(r'^([Cc]lash|[Ss]tash)', user_agent):
        conf = generate_subscription(user=user, config_format="clash", as_base64=False, reverse=False)
        media_type = "text/yaml"

    elif re.match(r'^(SFA|SFI|SFM|SFT|[Kk]aring|[Hh]iddify[Nn]ext)', user_agent):
        conf = generate_subscription(user=user, config_format="sing-box", as_base64=False, reverse=False)
        media_type = "application/json"

    elif re.match(r'^(SS|SSR|SSD|SSS|Outline|Shadowsocks|SSconf)', user_agent):
        conf = generate_subscription(user=user, config_format="outline", as_base64=False, reverse=False)
        media_type = "application/json"

    elif (USE_CUSTOM_JSON_DEFAULT or USE_CUSTOM_JSON_FOR_V2RAYN) and re.match(r'^v2rayN/(\d+\.\d+)', user_agent):
        version_str = re.match(r'^v2rayN/(\d+\.\d+)', user_agent).group(1)
        if LooseVersion(version_str) >= LooseVersion("6.40"):
            conf = generate_subscription(user=user, config_format="v2ray-json", as_base64=False, reverse=False)
            media_type = "application/json"
        else:
            conf = generate_subscription(user=user, config_format="v2ray", as_base64=True, reverse=False)
            media_type = "text/plain"

    elif (USE_CUSTOM_JSON_DEFAULT or USE_CUSTOM_JSON_FOR_V2RAYNG) and re.match(r'^v2rayNG/(\d+\.\d+\.\d+)', user_agent):
        version_str = re.match(r'^v2rayNG/(\d+\.\d+\.\d+)', user_agent).group(1)
        if LooseVersion(version_str) >= LooseVersion("1.8.29"):
            conf = generate_subscription(user=user, config_format="v2ray-json", as_base64=False, reverse=False)
            media_type = "application/json"
        elif LooseVersion(version_str) >= LooseVersion("1.8.18"):
            conf = generate_subscription(user=user, config_format="v2ray-json", as_base64=False, reverse=True)
            media_type = "application/json"
        else:
            conf = generate_subscription(user=user, config_format="v2ray", as_base64=True, reverse=False)
            media_type = "text/plain"

    elif re.match(r'^[Ss]treisand', user_agent):
        if USE_CUSTOM_JSON_DEFAULT or USE_CUSTOM_JSON_FOR_STREISAND:
            conf = generate_subscription(user=user, config_format="v2ray-json", as_base64=False, reverse=False)
            media_type = "application/json"
        else:
            conf = generate_subscription(user=user, config_format="v2ray", as_base64=True, reverse=False)
            media_type = "text/plain"

    elif (USE_CUSTOM_JSON_DEFAULT or USE_CUSTOM_JSON_FOR_HAPP) and re.match(r'^Happ/(\d+\.\d+\.\d+)', user_agent):
        version_str = re.match(r'^Happ/(\d+\.\d+\.\d+)', user_agent).group(1)
        if LooseVersion(version_str) >= LooseVersion("1.63.1"):
            conf = generate_subscription(user=user, config_format="v2ray-json", as_base64=False, reverse=False)
            media_type = "application/json"
        else:
            conf = generate_subscription(user=user, config_format="v2ray", as_base64=True, reverse=False)
            media_type = "text/plain"

    else:
        conf = generate_subscription(user=user, config_format="v2ray", as_base64=True, reverse=False)
        media_type = "text/plain"

    set_cached_subscription(user.username, client_key, conf, media_type, response_headers)
    return Response(content=conf, media_type=media_type, headers=response_headers)


def _render_subscription_with_client_type(
    request: Request,
    db: Session,
    dbuser: UserResponse,
    client_type: str,
    user_agent: str,
    client_key: str
) -> Response:
    user: UserResponse = UserResponse.model_validate(dbuser)

    _safe_update_user_sub(db, dbuser, user_agent)
    response_headers = {
        "content-disposition": f'attachment; filename="{user.username}"',
        "profile-web-page-url": str(request.url),
        "support-url": SUB_SUPPORT_URL,
        "profile-title": encode_title(SUB_PROFILE_TITLE),
        "profile-update-interval": SUB_UPDATE_INTERVAL,
        "subscription-userinfo": "; ".join(
            f"{key}={val}"
            for key, val in get_subscription_user_info(user).items()
        )
    }

    config = client_config.get(client_type)
    conf = generate_subscription(user=user,
                                 config_format=config["config_format"],
                                 as_base64=config["as_base64"],
                                 reverse=config["reverse"])

    set_cached_subscription(user.username, client_key, conf, config["media_type"], response_headers)
    return Response(content=conf, media_type=config["media_type"], headers=response_headers)


@router.get("/{token}/")
@router.get("/{token}", include_in_schema=False)
def user_subscription(
    request: Request,
    user_agent: str = Header(default=""),
    dbuser: Any = None,
    db: Any = None,
):
    """Provides a subscription link based on the user agent (Clash, V2Ray, etc.)."""
    accept_header = request.headers.get("Accept", "")
    is_html = "text/html" in accept_header
    client_key = "__html__" if is_html else f"ua:{user_agent}"

    # Direct pass (tests or explicit callers with dbuser)
    if dbuser is not None:
        session = db if db is not None else GetDB().__enter__()
        cached = get_cached_subscription(dbuser.username, client_key)
        if cached:
            if is_html:
                return HTMLResponse(content=cached[0])
            return Response(content=cached[0], media_type=cached[1], headers=cached[2])
        return _render_user_subscription(request, session, dbuser, user_agent, is_html, client_key)

    # Fast Zero-DB Path via in-memory cryptographic verification
    token = request.path_params.get("token", "")
    sub = get_subscription_payload(token)
    if not sub:
        raise HTTPException(status_code=404, detail="Not Found")
    username = sub["username"]

    cached = get_cached_subscription(username, client_key)
    if cached:
        if is_html:
            return HTMLResponse(content=cached[0])
        return Response(content=cached[0], media_type=cached[1], headers=cached[2])

    with GetDB() as session:
        dbuser = crud.get_user(session, username)
        if not dbuser or dbuser.created_at > sub['created_at']:
            raise HTTPException(status_code=404, detail="Not Found")
        if dbuser.sub_revoked_at and dbuser.sub_revoked_at > sub['created_at']:
            raise HTTPException(status_code=404, detail="Not Found")

        return _render_user_subscription(request, session, dbuser, user_agent, is_html, client_key)


@router.get("/{token}/info", response_model=SubscriptionUserResponse)
def user_subscription_info(
    dbuser: UserResponse = Depends(get_validated_sub),
):
    """Retrieves detailed information about the user's subscription."""
    return dbuser


@router.get("/{token}/usage")
def user_get_usage(
    dbuser: UserResponse = Depends(get_validated_sub),
    start: str = "",
    end: str = "",
    db: Session = Depends(get_db)
):
    """Fetches the usage statistics for the user within a specified date range."""
    start, end = validate_dates(start, end)

    usages = crud.get_user_usages(db, dbuser, start, end)

    return {"usages": usages, "username": dbuser.username}


@router.get("/{token}/{client_type}")
def user_subscription_with_client_type(
    request: Request,
    client_type: str = Path(..., regex="sing-box|clash-meta|clash|outline|v2ray|v2ray-json"),
    user_agent: str = Header(default=""),
    dbuser: Any = None,
    db: Any = None,
):
    """Provides a subscription link based on the specified client type (e.g., Clash, V2Ray)."""
    client_key = f"type:{client_type}:{user_agent}"

    # Direct pass (tests or explicit callers with dbuser)
    if dbuser is not None:
        session = db if db is not None else GetDB().__enter__()
        cached = get_cached_subscription(dbuser.username, client_key)
        if cached:
            return Response(content=cached[0], media_type=cached[1], headers=cached[2])
        return _render_subscription_with_client_type(request, session, dbuser, client_type, user_agent, client_key)

    # Fast Zero-DB Path via in-memory cryptographic verification
    token = request.path_params.get("token", "")
    sub = get_subscription_payload(token)
    if not sub:
        raise HTTPException(status_code=404, detail="Not Found")
    username = sub["username"]

    cached = get_cached_subscription(username, client_key)
    if cached:
        return Response(content=cached[0], media_type=cached[1], headers=cached[2])

    with GetDB() as session:
        dbuser = crud.get_user(session, username)
        if not dbuser or dbuser.created_at > sub['created_at']:
            raise HTTPException(status_code=404, detail="Not Found")
        if dbuser.sub_revoked_at and dbuser.sub_revoked_at > sub['created_at']:
            raise HTTPException(status_code=404, detail="Not Found")

        return _render_subscription_with_client_type(request, session, dbuser, client_type, user_agent, client_key)
