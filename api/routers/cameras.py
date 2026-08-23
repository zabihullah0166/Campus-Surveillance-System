from datetime import datetime

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from api.serializers import public_camera
from core.database import get_db
from models.pydantic_models import CameraCreate
from services.vision_service import websocket_stream

router = APIRouter(tags=["cameras"])


@router.get("/cameras/")
def list_cameras():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM cameras ORDER BY id").fetchall()
    return [public_camera(row) for row in rows]


@router.post("/cameras/")
def create_camera(payload: CameraCreate):
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO cameras (name, location_label, camera_type, source, is_running, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                payload.name,
                payload.location_label,
                payload.camera_type,
                payload.source,
                0,
                datetime.now().isoformat(timespec="seconds"),
            ),
        )
        row = conn.execute("SELECT * FROM cameras WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return public_camera(row)


@router.post("/cameras/{camera_id}/start")
def start_camera(camera_id: int):
    with get_db() as conn:
        cursor = conn.execute("UPDATE cameras SET is_running = 1 WHERE id = ?", (camera_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Camera not found.")
    return {"status": "started"}


@router.post("/cameras/{camera_id}/stop")
def stop_camera(camera_id: int):
    with get_db() as conn:
        cursor = conn.execute("UPDATE cameras SET is_running = 0 WHERE id = ?", (camera_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Camera not found.")
    return {"status": "stopped"}


@router.delete("/cameras/{camera_id}")
def delete_camera(camera_id: int):
    with get_db() as conn:
        cursor = conn.execute("DELETE FROM cameras WHERE id = ?", (camera_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Camera not found.")
    return {"status": "deleted"}


@router.websocket("/cameras/{camera_id}/ws")
async def camera_ws(websocket: WebSocket, camera_id: int):
    await websocket.accept()
    try:
        await websocket_stream(websocket, camera_id)
    except WebSocketDisconnect:
        return
