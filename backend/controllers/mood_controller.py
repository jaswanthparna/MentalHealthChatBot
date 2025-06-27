from fastapi import HTTPException, status
from configs.db import connect_db
from models.mood_models import MoodCheckIn, CopingToolRequest
from datetime import datetime
from bson import ObjectId

async def log_mood(mood: MoodCheckIn, user: dict):
    db = await connect_db()
    mood_logs_collection = db.mood_logs
    mood_data = mood.dict()
    mood_data["user_id"] = str(user["_id"])
    mood_data["email"] = user["email"]
    result = await mood_logs_collection.insert_one(mood_data)
    print(f"Inserted mood log with ID: {result.inserted_id}")
    return {
        "message": "Mood logged successfully",
        "success": True,
        "error": False,
        "mood_id": str(result.inserted_id)
    }

async def get_mood_history(user: dict):
    db = await connect_db()
    mood_logs_collection = db.mood_logs
    try:
        history = await mood_logs_collection.find({"user_id": str(user["_id"])}).sort("timestamp", -1).to_list(100)
        serialized_history = []
        for doc in history:
            doc["_id"] = str(doc["_id"])
            if "timestamp" in doc:
                doc["timestamp"] = doc["timestamp"].isoformat()
            if "user_id" in doc:
                doc["user_id"] = str(doc["user_id"])
            serialized_history.append(doc)
        print(f"Retrieved {len(serialized_history)} mood logs for user {user['_id']}")
        return {
            "message": "Mood history retrieved successfully",
            "success": True,
            "error": False,
            "history": serialized_history
        }
    except Exception as e:
        print(f"Error retrieving mood history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Error retrieving mood history",
                "success": False,
                "error": True,
                "details": str(e)
            }
        )

async def get_coping_tool(request: CopingToolRequest, user: dict):
    tool_type = request.tool_type.lower()
    tools = {
        "breathing": "Take a deep breath for 4 seconds, hold for 4, exhale for 4. Repeat 5 times.",
        "mindfulness": "Focus on 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
        "affirmation": "I am enough, and I deserve peace.",
        "cbt": "Challenge a negative thought: Is there evidence against it? Reframe it positively."
    }
    if tool_type not in tools:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Invalid tool type", "success": False, "error": True}
        )
    return {
        "message": "Coping tool retrieved successfully",
        "success": True,
        "error": False,
        "tool": tools[tool_type]
    }