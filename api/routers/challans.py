import os

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import FileResponse

from api.dependencies import current_student
from api.serializers import challan_dict
from core.database import get_db
from models.pydantic_models import ChallanStatusUpdate
from services.chalan_service import generate_challan_pdf

router = APIRouter(tags=["challans"])


@router.get("/challans/")
def list_challans(status: str | None = None):
    query = "SELECT * FROM challans"
    params = []
    if status and status != "all":
        query += " WHERE lower(status) = lower(?)"
        params.append(status)
    query += " ORDER BY issued_at DESC"
    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
    return [challan_dict(row) for row in rows]


@router.get("/challans/my/challans")
def my_challans(authorization: str | None = Header(default=None)):
    student = current_student(authorization)
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT *
            FROM challans
            WHERE student_roll_no = ?
            ORDER BY issued_at DESC
            """,
            (student["roll_no"],),
        ).fetchall()
    return [challan_dict(row) for row in rows]


@router.get("/challans/{challan_id}/pdf")
def challan_pdf(challan_id: int, download: bool = False):
    with get_db() as conn:
        challan = conn.execute("SELECT * FROM challans WHERE id = ?", (challan_id,)).fetchone()
        if challan is None:
            raise HTTPException(status_code=404, detail="Challan not found.")

        pdf_path = challan["pdf_path"]
        if not pdf_path or not os.path.exists(pdf_path):
            detection = None
            if challan["detection_id"]:
                detection = conn.execute("SELECT * FROM detections WHERE id = ?", (challan["detection_id"],)).fetchone()
            pdf_path = generate_challan_pdf(dict(challan), dict(detection) if detection else None)
            conn.execute("UPDATE challans SET pdf_path = ? WHERE id = ?", (pdf_path, challan_id))

    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Challan PDF not found.")

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"{challan['challan_no']}.pdf",
        content_disposition_type="attachment" if download else "inline",
    )


@router.patch("/challans/{challan_id}/status")
def update_challan_status(challan_id: int, payload: ChallanStatusUpdate):
    if payload.status not in ("pending", "paid", "appealed", "cancelled"):
        raise HTTPException(status_code=400, detail="Invalid challan status.")

    with get_db() as conn:
        cursor = conn.execute(
            "UPDATE challans SET status = ?, remarks = ? WHERE id = ?",
            (payload.status, payload.remarks, challan_id),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Challan not found.")
    return {"status": payload.status}
