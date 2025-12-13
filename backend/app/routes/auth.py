# app/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import schemas
from app.models.user import User as UserModel
from app.local_db import get_db
from app.auth.jwt_handler import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
)

router = APIRouter(tags=["auth"])  # router has no internal prefix; main.py includes it under /api/auth

# Dependency to get DB session
# get_db is provided by app.database.connection (SQLAlchemy session)


# Register
@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = UserModel(
        email=user.email,
        full_name=user.full_name,
        username=user.username,
        hashed_password=get_password_hash(user.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token = create_access_token({"sub": str(db_user.id)})
    return {"user": user, "access_token": token}


# Login
class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Login accepts JSON body {username, password} - can use email or username."""
    username = body.username
    password = body.password
    # Try to find by username first, then by email if username not found
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user:
        # If not found by username, try email
        user = db.query(UserModel).filter(UserModel.email == username).first()
    
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return {"user": {"email": user.email, "full_name": user.full_name, "username": user.username}, "access_token": token}


# Get current user
def get_current_user(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(UserModel).get(int(user_id))
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/me")
def read_me(current_user: UserModel = Depends(get_current_user)):
    return {"user": {"email": current_user.email, "full_name": current_user.full_name, "username": current_user.username}}
