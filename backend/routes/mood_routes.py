from fastapi import APIRouter, Depends, HTTPException, status
from controllers.mood_controller import log_mood, get_mood_history, get_coping_tool
from controllers.crisis_controller import get_emergency_contacts, save_emergency_contacts, delete_emergency_contact
from models.mood_models import MoodCheckIn, CopingToolRequest
from models.contact_models import EmergencyContact
from middlewares.auth_middleware import ensure_authenticated
from typing import List

router = APIRouter()

@router.post("/checkin")
async def mood_checkin(mood: MoodCheckIn, user: dict = Depends(ensure_authenticated)):
    return await log_mood(mood, user)

@router.get("/history")
async def mood_history(user: dict = Depends(ensure_authenticated)):
    try:
        history = await get_mood_history(user)
        print(f"Retrieved {len(history['history'])} mood logs for user {user['_id']}")
        return history
    except Exception as e:
        print(f"Error in mood_history endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Error retrieving mood history",
                "success": False,
                "error": True,
                "details": str(e)
            }
        )

@router.post("/coping/tools")
async def coping_tools(request: CopingToolRequest, user: dict = Depends(ensure_authenticated)):
    return await get_coping_tool(request, user)

@router.post("/profile/emergency-contacts")
async def save_emergency_contacts_route(contacts: List[EmergencyContact], user: dict = Depends(ensure_authenticated)):
    return await save_emergency_contacts(str(user["_id"]), contacts)

@router.get("/profile/emergency-contacts")
async def get_emergency_contacts_route(user: dict = Depends(ensure_authenticated)):
    return await get_emergency_contacts(str(user["_id"]))

@router.delete("/profile/emergency-contacts/{contact_name}")
async def delete_emergency_contact_route(contact_name: str, user: dict = Depends(ensure_authenticated)):
    return await delete_emergency_contact(str(user["_id"]), contact_name)