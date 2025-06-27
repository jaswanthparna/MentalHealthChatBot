from pydantic import BaseModel
from typing import Optional

class EmergencyContact(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    relationship: str