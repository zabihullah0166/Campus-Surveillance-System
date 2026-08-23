import os
import sqlite3
from pathlib import Path

from fastapi import APIRouter, File, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse

from api.dependencies import current_student
from api.serializers import public_student
from config import STD_PICS
from core.database import get_db
from core.security import hash_password
from models.pydantic_models import StudentCreate

router = APIRouter(tags=["students"])


@router.get("/students/me/profile")
def student_profile(authorization: str | None = Header(default=None)):
    student = current_student(authorization)
    return public_student(student)


@router.get("/students/")
def list_students():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM students ORDER BY name COLLATE NOCASE").fetchall()
    return [public_student(row) for row in rows]


@router.get("/students/{roll_no}/photo")
def student_photo(roll_no: str):
    with get_db() as conn:
        row = conn.execute("SELECT photo_path FROM students WHERE roll_no = ?", (roll_no,)).fetchone()
    if row is None or not row["photo_path"]:
        raise HTTPException(status_code=404, detail="Student photo not found.")
    photo_path = row["photo_path"]
    if not os.path.exists(photo_path):
        raise HTTPException(status_code=404, detail="Student photo not found.")
    return FileResponse(photo_path)


@router.post("/students/")
def create_student(payload: StudentCreate):
    with get_db() as conn:
        try:
            conn.execute(
                """
                INSERT INTO students (roll_no, name, semester, department, subject, mobile_number, password_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    payload.roll_no,
                    payload.full_name,
                    payload.semester,
                    payload.department,
                    payload.program,
                    payload.phone,
                    hash_password(payload.password),
                ),
            )
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=400, detail="Student already exists.")
    student = {
        "roll_no": payload.roll_no,
        "full_name": payload.full_name,
        "name": payload.full_name,
        "department": payload.department,
        "program": payload.program,
        "subject": payload.program,
        "semester": payload.semester,
        "mobile_number": payload.phone,
        "photo_path": "",
        "photo_url": "",
        "id": payload.roll_no,
    }
    return student


@router.delete("/students/{roll_no}")
def delete_student(roll_no: str):
    with get_db() as conn:
        row = conn.execute("SELECT photo_path FROM students WHERE roll_no = ?", (roll_no,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Student not found.")

        conn.execute("DELETE FROM students WHERE roll_no = ?", (roll_no,))

    photo_path = row["photo_path"]
    if photo_path and os.path.exists(photo_path):
        try:
            os.remove(photo_path)
        except OSError:
            pass

    for extension in (".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"):
        candidate = Path(STD_PICS) / f"{roll_no}{extension}"
        if candidate.exists():
            try:
                candidate.unlink()
            except OSError:
                pass

    return {"status": "deleted"}


@router.post("/students/{roll_no}/photo")
def upload_student_photo(roll_no: str, file: UploadFile = File(...)):
    with get_db() as conn:
        student = conn.execute("SELECT roll_no FROM students WHERE roll_no = ?", (roll_no,)).fetchone()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found.")

    extension = Path(file.filename).suffix or ".jpg"
    filename = f"{roll_no}{extension}"
    os.makedirs(STD_PICS, exist_ok=True)
    destination = Path(STD_PICS) / filename
    with destination.open("wb") as buffer:
        buffer.write(file.file.read())

    with get_db() as conn:
        conn.execute("UPDATE students SET photo_path = ? WHERE roll_no = ?", (str(destination), roll_no))

    return {"photo_url": f"/students/{roll_no}/photo"}
