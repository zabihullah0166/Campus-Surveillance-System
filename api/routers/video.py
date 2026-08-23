from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from services.vision_service import video_stream

router = APIRouter(tags=["video"])


@router.get("/video_feed")
def video_feed():
    return StreamingResponse(video_stream(), media_type="multipart/x-mixed-replace; boundary=frame")
