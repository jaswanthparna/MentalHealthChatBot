from fastapi import APIRouter, Depends, HTTPException, status
from middlewares.auth_middleware import ensure_authenticated
from chatbot.chatbot import process_query
from controllers.conversation_controller import add_message, new_conversation
from models.conversation_models import Message
from controllers.crisis_controller import handle_crisis
from pydantic import BaseModel

router = APIRouter()

class ChatbotQuery(BaseModel):
    query: str
    conversation_id: str | None = None

@router.post("/query")
async def chatbot_query(query: ChatbotQuery, user: dict = Depends(ensure_authenticated)):
    print(f"Processing query for user: {user['_id']}, query: {query.query}")
    crisis_response = await handle_crisis(str(user["_id"]), query.query)
    if crisis_response:
        print(f"Crisis detected: {crisis_response}")
        return crisis_response
    try:
        conversation_id = query.conversation_id
        if not conversation_id:
            result = await new_conversation(str(user["_id"]), "Chatbot Conversation")
            conversation_id = result["conversation_id"]
            print(f"Created new conversation: {conversation_id}")
        
        await add_message(conversation_id, str(user["_id"]), Message(role="user", text=query.query))
        print(f"Saved user message to conversation {conversation_id}")
        
        response = await process_query(query.query)
        await add_message(conversation_id, str(user["_id"]), Message(role="bot", text=response))
        print(f"Saved bot response to conversation {conversation_id}")
        
        return {
            "message": "Chatbot response retrieved successfully",
            "success": True,
            "error": False,
            "response": response,
            "conversation_id": conversation_id
        }
    except Exception as e:
        print(f"Error in chatbot_query: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "Error processing chatbot query",
                "success": False,
                "error": True,
                "details": str(e)
            }
        )