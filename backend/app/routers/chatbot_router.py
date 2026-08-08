from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


class ChatMessage(BaseModel):
    message: str
    session_id: str = "default"


# Pre-chat and walkthrough logic
KNOWLEDGE_BASE = {
    "hello": "Hello! Welcome to PH Car Rental. How can I help you today?",
    "requirements": "To rent a car, you need a valid driver's license, a government ID, and a credit card or cash deposit.",
    "payment": "We accept Cash, GCash, Maya, and Bank Transfer.",
    "cancel": "You can cancel your booking anytime from your dashboard. If cancelled by admin, a reason will be provided.",
    "default": "I'm not sure I understand. You can ask about 'requirements', 'payment', or 'cancel'."
}


@router.post("/chat")
def chat_with_bot(msg: ChatMessage):
    user_input = msg.message.lower()
    response = "default"

    for key in KNOWLEDGE_BASE:
        if key in user_input:
            response = key
            break

    return {"reply": KNOWLEDGE_BASE[response], "quick_replies": ["requirements", "payment", "cancel"]}