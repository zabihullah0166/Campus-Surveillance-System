import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.routers import (
    access_requests,
    auth,
    cameras,
    challans,
    detections,
    static,
    students,
    users,
    video,
)
from config import EVIDENCE_FOLDER, FRONTEND_DIST
from core.database import init_database

app = FastAPI(title="Campus Surveillance System")

app.add_middleware( 
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets", check_dir=False), name="assets")

os.makedirs(EVIDENCE_FOLDER, exist_ok=True)
init_database()

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(users.router)
app.include_router(cameras.router)
app.include_router(detections.router)
app.include_router(challans.router)
app.include_router(access_requests.router)
app.include_router(video.router)
app.include_router(static.router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
