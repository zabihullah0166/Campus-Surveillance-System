import os
from datetime import datetime

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import FileResponse

from api.dependencies import current_student
from api.serializers import detection_dict
from core.database import get_db
from models.pydantic_models import DetectionAccept
from services.chalan_service import generate_challan_pdf
from services.detection_service import challan_number, fine_for_violation

router = APIRouter(tags=["detections"])


@router.get("/detections/")
def list_detections(
    violation_type: str | None = None,
    period: str | None = None,
    department: str | None = None,
    status: str | None = None,
    limit: int | None = None,
):
    query = "SELECT * FROM detections WHERE 1 = 1"
    params = []

    if violation_type:
        query += " AND lower(violation_type) = lower(?)"
        params.append(violation_type)
    if status:
        query += " AND lower(status) = lower(?)"
        params.append(status)
    if department:
        query += """
            AND student_roll_no IN (
                SELECT roll_no FROM students WHERE lower(department) LIKE lower(?)
            )
        """
        params.append(f"%{department}%")
    if period:
        days = {"daily": 1, "weekly": 7, "monthly": 31, "yearly": 366}.get(period)
        if days:
            query += " AND detected_at >= datetime('now', ?)"
            params.append(f"-{days} days")

    query += " ORDER BY detected_at DESC"
    if limit:
        query += " LIMIT ?"
        params.append(limit)

    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
    return [detection_dict(row) for row in rows]


@router.get("/detections/my/records")
def my_detections(authorization: str | None = Header(default=None)):
    student = current_student(authorization)
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT detections.*, challans.id AS challan_id, challans.challan_no, challans.pdf_path
            FROM detections
            LEFT JOIN challans ON challans.detection_id = detections.id
            WHERE detections.student_roll_no = ? AND detections.status = ?
            ORDER BY detections.detected_at DESC
            """,
            (student["roll_no"], "accepted"),
        ).fetchall()
    return [detection_dict(row) for row in rows]


@router.get("/detections/{detection_id}/snapshot")
def detection_snapshot(detection_id: int):
    with get_db() as conn:
        row = conn.execute("SELECT snapshot_path FROM detections WHERE id = ?", (detection_id,)).fetchone()

    if row is None or not row["snapshot_path"] or not os.path.exists(row["snapshot_path"]):
        raise HTTPException(status_code=404, detail="Snapshot not found.")

    return FileResponse(row["snapshot_path"], media_type="image/jpeg")


@router.post("/detections/{detection_id}/accept")
def accept_detection(detection_id: int, payload: DetectionAccept | None = None):
    payload = payload or DetectionAccept()
    with get_db() as conn:
        detection = conn.execute("SELECT * FROM detections WHERE id = ?", (detection_id,)).fetchone()
        if detection is None:
            raise HTTPException(status_code=404, detail="Detection not found.")

        roll_no = payload.roll_no or detection["student_roll_no"]
        student_name = detection["student_name"]
        if roll_no:
            student = conn.execute("SELECT roll_no, name FROM students WHERE roll_no = ?", (roll_no,)).fetchone()
            if student:
                student_name = student["name"]

        conn.execute(
            "UPDATE detections SET status = ?, student_roll_no = ?, student_name = ? WHERE id = ?",
            ("accepted", roll_no, student_name, detection_id),
        )

        existing = conn.execute("SELECT * FROM challans WHERE detection_id = ?", (detection_id,)).fetchone()
        if existing is None:
            cursor = conn.execute(
                """
                INSERT INTO challans (
                    challan_no, detection_id, student_roll_no, student_name, violation_type,
                    fine_amount, status, due_date, issued_at, remarks
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, date('now', '+14 days'), ?, ?)
                """,
                (
                    challan_number(),
                    detection_id,
                    roll_no,
                    student_name,
                    detection["violation_type"],
                    fine_for_violation(detection["violation_type"]),
                    "pending",
                    datetime.now().isoformat(timespec="seconds"),
                    "Auto-generated after admin acceptance",
                ),
            )
            challan = conn.execute("SELECT * FROM challans WHERE id = ?", (cursor.lastrowid,)).fetchone()
        else:
            challan = existing

        if challan and not challan["pdf_path"]:
            detection_for_pdf = conn.execute("SELECT * FROM detections WHERE id = ?", (detection_id,)).fetchone()
            pdf_path = generate_challan_pdf(dict(challan), dict(detection_for_pdf) if detection_for_pdf else None)
            conn.execute("UPDATE challans SET pdf_path = ? WHERE id = ?", (pdf_path, challan["id"]))

    return {"status": "accepted"}


@router.post("/detections/{detection_id}/decline")
def decline_detection(detection_id: int):
    with get_db() as conn:
        detection = conn.execute("SELECT snapshot_path FROM detections WHERE id = ?", (detection_id,)).fetchone()
        if detection is None:
            raise HTTPException(status_code=404, detail="Detection not found.")
        conn.execute("UPDATE detections SET status = ? WHERE id = ?", ("declined", detection_id))

    snapshot_path = detection["snapshot_path"]
    if snapshot_path and os.path.exists(snapshot_path):
        try:
            os.remove(snapshot_path)
        except OSError:
            pass

    return {"status": "declined"}
