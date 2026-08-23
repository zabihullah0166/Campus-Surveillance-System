from fastapi import HTTPException

from core.database import get_db
from core.security import current_session


def current_student(authorization: str | None):
    session = current_session(authorization)
    if session["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required.")

    with get_db() as conn:
        student = conn.execute("SELECT * FROM students WHERE roll_no = ?", (session["username"],)).fetchone()

    if student is None:
        raise HTTPException(status_code=404, detail="Student not found.")
    return student
