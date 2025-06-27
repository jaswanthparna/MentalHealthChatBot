from fastapi import HTTPException, status
from configs.db import connect_db
from models.conversation_models import Conversation, Message
import uuid
from datetime import datetime
from bson import ObjectId

async def get_conversations(user_id: str):
    db = await connect_db()
    conversations = await db.conversations.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    print(f"Retrieved {len(conversations)} conversations for user {user_id}")
    serialized_conversations = []
    for doc in conversations:
        doc["_id"] = str(doc["_id"])
        if "created_at" in doc:
            doc["created_at"] = doc["created_at"].isoformat()
        serialized_conversations.append(doc)
    return {"message": "Conversations retrieved", "success": True, "error": False, "conversations": serialized_conversations}

async def get_conversation(conversation_id: str, user_id: str):
    db = await connect_db()
    conversation = await db.conversations.find_one({"conversation_id": conversation_id, "user_id": user_id})
    if not conversation:
        raise HTTPException(status_code=404, detail={"message": "Conversation not found", "success": False, "error": True})
    conversation["_id"] = str(conversation["_id"])
    if "created_at" in conversation:
        conversation["created_at"] = conversation["created_at"].isoformat()
    return {"message": "Conversation retrieved", "success": True, "error": False, "conversation": conversation}

async def add_message(conversation_id: str, user_id: str, message: Message):
    db = await connect_db()
    conversation = await db.conversations.find_one({"conversation_id": conversation_id, "user_id": user_id})
    if not conversation:
        raise HTTPException(status_code=404, detail={"message": "Conversation not found", "success": False, "error": True})
    conversation["messages"].append(message.dict())
    result = await db.conversations.update_one(
        {"conversation_id": conversation_id, "user_id": user_id},
        {"$set": {"messages": conversation["messages"], "created_at": datetime.utcnow()}}
    )
    print(f"Updated conversation {conversation_id}: {result.modified_count} document(s) modified")
    return {"message": "Message added", "success": True, "error": False}

async def new_conversation(user_id: str, title: str):
    db = await connect_db()
    conversation_id = str(uuid.uuid4())
    new_conversation = {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "title": title,
        "messages": [],
        "created_at": datetime.utcnow()
    }
    result = await db.conversations.insert_one(new_conversation)
    print(f"Inserted conversation with ID: {result.inserted_id}")
    return {"message": "New conversation created", "success": True, "error": False, "conversation_id": conversation_id}