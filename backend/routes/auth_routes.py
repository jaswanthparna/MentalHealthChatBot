from fastapi import APIRouter, HTTPException
from controllers.auth_controller import register_user, login_user
from models.user_models import UserRegister, UserLogin

router = APIRouter()

@router.post("/register")
async def register(user: UserRegister):
    return await register_user(user)

@router.post("/login")
async def login(user: UserLogin):
    return await login_user(user)