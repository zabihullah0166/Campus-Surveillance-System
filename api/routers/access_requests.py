import sqlite3
from datetime import datetime

from fastapi import APIRouter, HTTPException

from core.database import get_db
from core.security import hash_password
from models.pydantic_models import AccessRequestCreate

router = APIRouter(tags=["access-requests"])


@router.get("/access-requests/")
def list_access_requests():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, username, email, full_name, requested_role, reason, status, created_at FROM access_requests ORDER BY created_at DESC"
        ).fetchall()
    return [dict(row) for row in rows]


@router.post("/access-requests/")
def create_access_request(payload: AccessRequestCreate):
    if payload.requested_role not in ("admin", "viewer"):
        raise HTTPException(status_code=400, detail="Requested role must be admin or viewer.")

    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO access_requests (
                username, email, full_name, password_hash, requested_role, reason, status, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.username,
                payload.email,
                payload.full_name,
                hash_password(payload.password),
                payload.requested_role,
                payload.reason,
                "pending",
                datetime.now().isoformat(timespec="seconds"),
            ),
        )
        row = conn.execute(
            "SELECT id, username, email, full_name, requested_role, reason, status, created_at FROM access_requests WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
    return dict(row)


@router.post("/access-requests/{request_id}/approve")
def approve_access_request(request_id: int):
    with get_db() as conn:
        request = conn.execute("SELECT * FROM access_requests WHERE id = ?", (request_id,)).fetchone()
        if request is None:
            raise HTTPException(status_code=404, detail="Access request not found.")
        try:
            conn.execute(
                """
                INSERT INTO users (username, password_hash, full_name, email, role, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    request["username"],
                    request["password_hash"],
                    request["full_name"],
                    request["email"],
                    request["requested_role"],
                    "active",
                    datetime.now().isoformat(timespec="seconds"),
                ),
            )
        except sqlite3.IntegrityError:
            pass
        conn.execute("UPDATE access_requests SET status = ? WHERE id = ?", ("approved", request_id))
    return {"status": "approved"}


@router.post("/access-requests/{request_id}/reject")
def reject_access_request(request_id: int):
    with get_db() as conn:
        cursor = conn.execute("UPDATE access_requests SET status = ? WHERE id = ?", ("rejected", request_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Access request not found.")
    return {"status": "rejected"}
