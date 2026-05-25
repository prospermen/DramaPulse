from fastapi import Header, HTTPException

from ..config import settings


def require_admin(x_admin_token: str | None = Header(default=None)):
    if x_admin_token != settings.admin_token:
        raise HTTPException(status_code=403, detail="invalid admin token")


def ok(data=None, message="ok"):
    return {"success": True, "message": message, "data": data}
