from fastapi import HTTPException
from configs.db import connect_db
from models.user_models import UserRegister, UserLogin
from passlib.context import CryptContext
from jose import jwt
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def register_user(user: UserRegister):
    db = await connect_db()
    users_collection = db.users
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail={"message": "User already exists", "success": False, "error": True}
        )
    hashed_password = pwd_context.hash(user.password)
    user_data = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }
    result = await users_collection.insert_one(user_data)
    return {"message": "User registered successfully", "success": True, "error": False}

async def login_user(user: UserLogin):
    db = await connect_db()
    users_collection = db.users
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not pwd_context.verify(user.password, db_user["password"]):
        raise HTTPException(
            status_code=401,
            detail={"message": "Invalid credentials", "success": False, "error": True}
        )
    token = jwt.encode(
        {"email": user.email, "_id": str(db_user["_id"])},
        os.getenv("JWT_SECRET"),
        algorithm="HS256"
    )
    return {
        "message": "User logged in successfully",
        "success": True,
        "error": False,
        "jwtToken": token,
        "email": user.email,
        "name": db_user["name"]
    }