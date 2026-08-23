import sqlite3
from datetime import datetime

from fastapi import APIRouter, HTTPException

from api.serializers import public_user
from core.database import get_db
from core.security import hash_password
from models.pydantic_models import UserCreate

router = APIRouter(tags=["users"])


@router.get("/users/")
def list_users():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, username, full_name, email, role, status, created_at FROM users ORDER BY created_at DESC"
        ).fetchall()
    return [public_user(row) for row in rows]


@router.post("/users/")
def create_user(payload: UserCreate):
    if payload.role not in ("admin", "viewer"):
        raise HTTPException(status_code=400, detail="Role must be admin or viewer.")

    try:
        with get_db() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users (username, password_hash, full_name, email, role, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    payload.username,
                    hash_password(payload.password),
                    payload.full_name,
                    payload.email,
                    payload.role,
                    "active",
                    datetime.now().isoformat(timespec="seconds"),
                ),
            )
            user_id = cursor.lastrowid
            row = conn.execute(
                "SELECT id, username, full_name, email, role, status, created_at FROM users WHERE id = ?",
                (user_id,),
            ).fetchone()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Username already exists.") from None

    return public_user(row)


@router.delete("/users/{user_id}")
def delete_user(user_id: int):
    with get_db() as conn:
        cursor = conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found.")
    return {"status": "deleted"}
