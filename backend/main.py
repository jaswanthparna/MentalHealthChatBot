from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from configs.db import connect_db, close_db
from routes import auth_routes, chatbot_routes, mood_routes, conversation_routes
from chatbot.chatbot import initialize_chatbot

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await connect_db()
        initialize_chatbot()
        print("Application startup completed")
    except Exception as e:
        print(f"Startup error: {str(e)}")
        raise
    yield
    await close_db()
    print("Application shutdown completed")

app = FastAPI(lifespan=lifespan)

# Configure CORS from environment variable
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:8080").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_routes, prefix="/auth")
app.include_router(chatbot_routes, prefix="/chatbot")
app.include_router(mood_routes, prefix="/mood")
app.include_router(conversation_routes, prefix="/conversations")

@app.get("/")
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)