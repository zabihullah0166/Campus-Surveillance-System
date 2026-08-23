from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse, Response

from config import API_PREFIXES, FRONTEND_DIR, FRONTEND_DIST

router = APIRouter(tags=["static"])


@router.get("/")
def index():
    dist_index = FRONTEND_DIST / "index.html"
    if dist_index.exists():
        return FileResponse(dist_index)
    return FileResponse(f"{FRONTEND_DIR}/index.html")


@router.get("/health")
def health():
    return JSONResponse({"status": "ok"})


@router.get("/favicon.ico")
def favicon():
    return Response(status_code=204)


@router.get("/{path:path}")
def frontend_fallback(path: str):
    if path.split("/", 1)[0] in API_PREFIXES:
        return JSONResponse({"detail": "Not found"}, status_code=404)

    dist_index = FRONTEND_DIST / "index.html"
    if dist_index.exists():
        return FileResponse(dist_index)
    return FileResponse(f"{FRONTEND_DIR}/index.html")
