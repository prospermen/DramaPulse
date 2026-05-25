from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import UserAccount
from ..schemas import AuthLogin, AuthRegister, AuthTokenOut
from ..services.auth_service import create_access_token, hash_password, verify_password
from .common import ok

router = APIRouter(prefix="/auth")


def _token_response(user: UserAccount) -> dict:
    token = create_access_token(user)
    return AuthTokenOut(
        access_token=token,
        user_id=user.id,
        username=user.username,
        role=user.role,
    ).model_dump()


@router.post("/register")
def register(payload: AuthRegister, db: Session = Depends(get_db)):
    username = payload.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="username is required")
    if db.query(UserAccount).filter(UserAccount.username == username).first():
        raise HTTPException(status_code=409, detail="username already exists")
    user = UserAccount(username=username, password_hash=hash_password(payload.password), role="uploader")
    db.add(user)
    db.commit()
    db.refresh(user)
    return ok(_token_response(user), "registered")


@router.post("/login")
def login(payload: AuthLogin, db: Session = Depends(get_db)):
    user = db.query(UserAccount).filter(UserAccount.username == payload.username.strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid username or password")
    return ok(_token_response(user), "logged in")
