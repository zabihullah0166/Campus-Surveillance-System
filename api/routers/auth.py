from fastapi import APIRouter, HTTPException

from core.database import get_db
from core.security import create_session, verify_password
from models.pydantic_models import LoginRequest

router = APIRouter(tags=["auth"])


@router.post("/auth/login")
def login(payload: LoginRequest):
    if payload.account_type == "student":
        with get_db() as conn:
            student = conn.execute("SELECT * FROM students WHERE roll_no = ?", (payload.username,)).fetchone()

        if student is None or not student["password_hash"] or not verify_password(payload.password, student["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid roll number or password.")

        token = create_session("student", student["roll_no"], student["name"])
        return {
            "access_token": token,
            "role": "student",
            "full_name": student["name"],
        }

    if payload.account_type != "user":
        raise HTTPException(status_code=401, detail="Invalid account type.")

    with get_db() as conn:
        user = conn.execute("SELECT * FROM users WHERE username = ?", (payload.username,)).fetchone()

    if user is None or user["status"] != "active" or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    token = create_session(user["role"], user["username"], user["full_name"] or user["username"])
    return {
        "access_token": token,
        "role": user["role"],
        "full_name": user["full_name"] or user["username"],
    }
