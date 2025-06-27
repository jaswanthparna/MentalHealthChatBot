from configs.db import connect_db
from bson import ObjectId
from datetime import datetime
from models.contact_models import EmergencyContact
from typing import List

async def handle_crisis(user_id: str, message: str):
    crisis_phrases = ["die", "hurt", "kill", "suicide"]
    if any(phrase in message.lower() for phrase in crisis_phrases):
        db = await connect_db()
        contacts_doc = await db.emergency_contacts.find_one({"user_id": user_id})
        contacts = contacts_doc.get("contacts", []) if contacts_doc else []
        contact_suggestions = [
            {
                "name": contact["name"],
                "phone": contact["phone"],
                "email": contact.get("email"),
                "relationship": contact["relationship"],
                "call_url": f"tel:{contact['phone']}",
                "message_url": f"sms:{contact['phone']}"
            } for contact in contacts
        ]
        response = (
            "I'm here for you. It sounds like you might be in crisis. Please consider calling a hotline (e.g., 1-800-273-8255) "
            "or contacting one of your trusted contacts below:\n"
        )
        if contact_suggestions:
            response += "\n".join(
                f"- {contact['name']} ({contact['relationship']}): Call {contact['phone']} or Message {contact['phone']}"
                for contact in contact_suggestions
            )
        else:
            response += "You haven't added any emergency contacts yet. Please add some in your profile."
        await db.crisis_events.insert_one({
            "user_id": user_id,
            "message": message,
            "timestamp": datetime.utcnow()
        })
        return {
            "message": "Crisis detected",
            "success": True,
            "error": False,
            "response": response,
            "crisis": True,
            "contacts": contact_suggestions
        }
    return None

async def save_emergency_contacts(user_id: str, contacts: List[EmergencyContact]):
    db = await connect_db()
    contacts_dict = [contact.dict() for contact in contacts]
    result = await db.emergency_contacts.update_one(
        {"user_id": user_id},
        {"$set": {"contacts": contacts_dict}},
        upsert=True
    )
    print(f"Saved emergency contacts for user {user_id}: {result.modified_count} document(s) modified")
    return {
        "message": "Emergency contacts saved successfully",
        "success": True,
        "error": False
    }

async def get_emergency_contacts(user_id: str):
    db = await connect_db()
    contacts_doc = await db.emergency_contacts.find_one({"user_id": user_id})
    contacts = contacts_doc.get("contacts", []) if contacts_doc else []
    print(f"Retrieved {len(contacts)} emergency contacts for user {user_id}")
    return {
        "message": "Emergency contacts retrieved successfully",
        "success": True,
        "error": False,
        "contacts": contacts
    }

async def delete_emergency_contact(user_id: str, contact_name: str):
    db = await connect_db()
    contacts_doc = await db.emergency_contacts.find_one({"user_id": user_id})
    if not contacts_doc or not contacts_doc.get("contacts"):
        return {
            "message": "No emergency contacts found",
            "success": False,
            "error": True
        }
    updated_contacts = [contact for contact in contacts_doc["contacts"] if contact["name"] != contact_name]
    result = await db.emergency_contacts.update_one(
        {"user_id": user_id},
        {"$set": {"contacts": updated_contacts}}
    )
    print(f"Deleted emergency contact for user {user_id}: {result.modified_count} document(s) modified")
    return {
        "message": f"Emergency contact {contact_name} deleted successfully",
        "success": True,
        "error": False
    }