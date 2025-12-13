# app/schemas.py
from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str | None = None
    username: str | None = None


class UserResponse(BaseModel):
    user: UserCreate
    access_token: str

    model_config = ConfigDict(from_attributes=True)
