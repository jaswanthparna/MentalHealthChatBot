from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
import os

async def ensure_authenticated(request: Request):
    auth_header = request.headers.get("authorization")
    if not auth_header:
        raise HTTPException(
            status_code=401,
            detail={"message": "Unauthorized - No token provided", "success": False, "error": True}
        )
    token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(
            status_code=401,
            detail={"message": "Unauthorized - Invalid token format", "success": False, "error": True}
        )
    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        print(f"Decoded JWT payload: {payload}")
        request.state.user = payload
        return payload
    except jwt.PyJWTError as e:
        print(f"JWT decode error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail={"message": "Unauthorized - Invalid or expired token", "success": False, "error": True}
        )