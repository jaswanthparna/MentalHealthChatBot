from pydantic import BaseModel
from typing import List

class Message(BaseModel):
    role: str
    text: str

class Conversation(BaseModel):
    user_id: str
    conversation_id: str
    title: str
    messages: List[Message]