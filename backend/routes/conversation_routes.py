from fastapi import APIRouter, Depends, HTTPException
from controllers.conversation_controller import get_conversations, get_conversation, add_message, new_conversation
from models.conversation_models import Message
from middlewares.auth_middleware import ensure_authenticated

router = APIRouter()

@router.get("/")
async def list_conversations(user: dict = Depends(ensure_authenticated)):
    return await get_conversations(str(user["_id"]))

@router.get("/{conversation_id}")
async def retrieve_conversation(conversation_id: str, user: dict = Depends(ensure_authenticated)):
    return await get_conversation(conversation_id, str(user["_id"]))

@router.post("/new")
async def create_conversation(user: dict = Depends(ensure_authenticated), title: str = "New Conversation"):
    return await new_conversation(str(user["_id"]), title)

@router.post("/{conversation_id}/message")
async def send_message(conversation_id: str, message: Message, user: dict = Depends(ensure_authenticated)):
    return await add_message(conversation_id, str(user["_id"]), message)