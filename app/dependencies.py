from typing import Optional, Union, Tuple
from app.models.admin import AdminInDB, AdminValidationResult, Admin
from app.models.user import UserResponse, UserStatus
from app.db import Session, crud, get_db
from app.db.models import User
from config import SUDOERS
from fastapi import Depends, HTTPException
from datetime import datetime, timezone, timedelta
from app.utils.jwt import get_subscription_payload


def validate_admin(db: Session, username: str, password: str) -> Optional[AdminValidationResult]:
    """Validate admin credentials with environment variables or database."""
    if SUDOERS.get(username) == password:
        return AdminValidationResult(username=username, is_sudo=True)

    dbadmin = crud.get_admin(db, username)
    if dbadmin and AdminInDB.model_validate(dbadmin).verify_password(password):
        return AdminValidationResult(username=dbadmin.username, is_sudo=dbadmin.is_sudo)

    return None


def get_admin_by_username(username: str, db: Session = Depends(get_db)):
    """Fetch an admin by username from the database."""
    dbadmin = crud.get_admin(db, username)
    if not dbadmin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return dbadmin


def get_dbnode(node_id: int, db: Session = Depends(get_db)):
    """Fetch a node by its ID from the database, raising a 404 error if not found."""
    dbnode = crud.get_node_by_id(db, node_id)
    if not dbnode:
        raise HTTPException(status_code=404, detail="Node not found")
    return dbnode


def validate_dates(start: Optional[Union[str, datetime]], end: Optional[Union[str, datetime]]) -> (datetime, datetime):
    """Validate if start and end dates are correct and if end is after start."""
    try:
        if start:
            if isinstance(start, datetime):
                start_date = start.replace(tzinfo=timezone.utc) if start.tzinfo is None else start.astimezone(timezone.utc)
            else:
                dt = datetime.fromisoformat(start)
                start_date = dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)
        else:
            start_date = datetime.now(timezone.utc) - timedelta(days=30)
        if end:
            if isinstance(end, datetime):
                end_date = end.replace(tzinfo=timezone.utc) if end.tzinfo is None else end.astimezone(timezone.utc)
            else:
                dt = datetime.fromisoformat(end)
                end_date = dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)
            if start_date and end_date < start_date:
                raise HTTPException(status_code=400, detail="Start date must be before end date")
        else:
            end_date = datetime.now(timezone.utc)

        return start_date, end_date
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date range or format")


def validate_expired_dates(after: Optional[datetime], before: Optional[datetime]) -> Tuple[Optional[datetime], Optional[datetime]]:
    """Validate expired_after and expired_before dates ensuring UTC awareness without enforcing 30-day default."""
    try:
        if after:
            after = after.replace(tzinfo=timezone.utc) if after.tzinfo is None else after.astimezone(timezone.utc)
        if before:
            before = before.replace(tzinfo=timezone.utc) if before.tzinfo is None else before.astimezone(timezone.utc)
        if after and before and before < after:
            raise HTTPException(status_code=400, detail="Start date must be before end date")
        return after, before
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date range or format")


def get_user_template(template_id: int, db: Session = Depends(get_db)):
    """Fetch a User Template by its ID, raise 404 if not found."""
    dbuser_template = crud.get_user_template(db, template_id)
    if not dbuser_template:
        raise HTTPException(status_code=404, detail="User Template not found")
    return dbuser_template


def get_validated_sub(
        token: str,
        db: Session = Depends(get_db)
) -> UserResponse:
    sub = get_subscription_payload(token)
    if not sub:
        raise HTTPException(status_code=404, detail="Not Found")

    dbuser = crud.get_user(db, sub['username'])
    if not dbuser or dbuser.created_at > sub['created_at']:
        raise HTTPException(status_code=404, detail="Not Found")

    if dbuser.sub_revoked_at and dbuser.sub_revoked_at > sub['created_at']:
        raise HTTPException(status_code=404, detail="Not Found")

    return dbuser


def get_validated_user(
        username: str,
        admin: Admin = Depends(Admin.get_current),
        db: Session = Depends(get_db)
) -> UserResponse:
    dbuser = crud.get_user(db, username)
    if not dbuser:
        raise HTTPException(status_code=404, detail="User not found")

    if not (admin.is_sudo or (dbuser.admin and dbuser.admin.username == admin.username)):
        raise HTTPException(status_code=403, detail="You're not allowed")

    return dbuser

def get_expired_users_list(db: Session, admin: Admin, expired_after: Optional[datetime] = None,
                           expired_before: Optional[datetime] = None):
    expired_before = expired_before or datetime.now(timezone.utc)
    expired_after = expired_after or datetime.min.replace(tzinfo=timezone.utc)

    dbadmin = crud.get_admin(db, admin.username)
    query = db.query(User).filter(
        User.status.in_([UserStatus.expired, UserStatus.limited]),
        User.expire.isnot(None),
        User.expire >= int(expired_after.timestamp()),
        User.expire <= int(expired_before.timestamp()),
    )
    if not admin.is_sudo and dbadmin:
        query = query.filter(User.admin_id == dbadmin.id)

    return query.all()
