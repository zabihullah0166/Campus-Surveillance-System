from pathlib import Path

MODEL_PATH = "yolo_models/last.pt"
STD_PICS = "data/Known_students"
EVIDENCE_FOLDER = "data/Evidence"
DB_PATH = "data/campus_surveillance.db"
FRONTEND_DIR = "frontend"
FRONTEND_DIST = Path(FRONTEND_DIR) / "dist"


CAMERA_INDEXES = (0, 1, 2, 3, 4)
CONFIDENCE = 0.45
IOU = 0.5
VIOLATION_CLASSES = ("cigarette", "weapon")
VIOLATION_CONFIDENCE = 0.70
FACE_SKIP = 3
FACE_MATCH_MAX_DIST = 40
YOLO_IMG_SIZE = 416
STREAM_INTERVAL = 0.02
JPEG_QUALITY = 80
COOLDOWN_SECONDS = 5

API_PREFIXES = (
    "auth",
    "cameras",
    "detections",
    "challans",
    "students",
    "users",
    "access-requests",
)