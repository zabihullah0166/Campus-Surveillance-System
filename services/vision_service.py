import asyncio
import base64
import os
import threading
import time
from datetime import datetime

import cv2
import face_recognition
import numpy as np
from ultralytics import YOLO

from config import (
    CAMERA_INDEXES,
    CONFIDENCE,
    COOLDOWN_SECONDS,
    EVIDENCE_FOLDER,
    FACE_MATCH_MAX_DIST,
    FACE_SKIP,
    IOU,
    JPEG_QUALITY,
    MODEL_PATH,
    STD_PICS,
    STREAM_INTERVAL,
    VIOLATION_CLASSES,
    VIOLATION_CONFIDENCE,
    YOLO_IMG_SIZE,
)
from core.database import get_db
from services.detection_service import save_detection

obj_model = None
known_face_encodings = []
known_face_names = []
faces_loaded = False
_model_lock = threading.Lock()


class StreamState:
    def __init__(self):
        self.face_locations = []
        self.face_names = []
        self.face_pass = 0


def load_model():
    global obj_model

    if obj_model is None:
        print("Loading YOLO model...")
        obj_model = YOLO(MODEL_PATH)

    return obj_model


def load_known_faces():
    global faces_loaded

    if faces_loaded:
        return

    print("Loading known faces...")
    for filename in os.listdir(STD_PICS):
        if filename.lower().endswith((".jpg", ".jpeg", ".png")):
            path = os.path.join(STD_PICS, filename)
            name = os.path.splitext(filename)[0]
            image = face_recognition.load_image_file(path)
            encodings = face_recognition.face_encodings(image)

            if encodings:
                known_face_encodings.append(encodings[0])
                known_face_names.append(name)
                print(f"Loaded: {name}")

    faces_loaded = True


def open_camera(indexes=CAMERA_INDEXES):
    backends = (cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY)

    for camera_index in indexes:
        for backend in backends:
            cap = cv2.VideoCapture(camera_index, backend)
            if not cap.isOpened():
                cap.release()
                continue

            ret, _ = cap.read()
            if ret:
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                print(f"Camera opened on index {camera_index}.")
                return cap

            cap.release()

    return None


def configure_capture(cap):
    if cap is None:
        return
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)


def jpeg_bytes(frame):
    ok, buffer = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
    if not ok:
        return None
    return buffer.tobytes()


def fallback_frame(message):
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(frame, message, (45, 230), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
    cv2.putText(frame, "Check camera permission or index.", (45, 270), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (180, 180, 180), 2)
    return frame


def face_center(location):
    top, right, bottom, left = location
    return ((top + bottom) / 2, (left + right) / 2)


def match_face_names(old_locations, old_names, new_locations):
    if not new_locations:
        return []
    if not old_locations or not old_names:
        return ["Unknown"] * len(new_locations)

    names = []
    used = set()
    for new_loc in new_locations:
        new_center = face_center(new_loc)
        best_index = None
        best_distance = FACE_MATCH_MAX_DIST

        for index, old_loc in enumerate(old_locations):
            if index in used:
                continue
            old_center = face_center(old_loc)
            distance = ((new_center[0] - old_center[0]) ** 2 + (new_center[1] - old_center[1]) ** 2) ** 0.5
            if distance < best_distance:
                best_distance = distance
                best_index = index

        if best_index is not None:
            names.append(old_names[best_index])
            used.add(best_index)
        else:
            names.append("Unknown")

    return names


def recognize_face_names(rgb_small_frame, locations):
    if not locations:
        return []

    encodings = face_recognition.face_encodings(rgb_small_frame, locations)
    names = []
    for face_encoding in encodings:
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.6)
        name = "Unknown"
        face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)

        if len(face_distances) > 0:
            best_match_index = np.argmin(face_distances)
            if matches[best_match_index]:
                name = known_face_names[best_match_index]

        names.append(name)

    return names


def update_faces(frame, state: StreamState):
    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
    locations = face_recognition.face_locations(rgb_small_frame, model="hog")

    state.face_pass += 1
    run_recognition = state.face_pass == 1 or state.face_pass % FACE_SKIP == 0

    if run_recognition:
        names = recognize_face_names(rgb_small_frame, locations)
    else:
        names = match_face_names(state.face_locations, state.face_names, locations)

    state.face_locations = locations
    state.face_names = names
    return locations, names


def draw_faces(frame, face_locations, names):
    for (top, right, bottom, left), name in zip(face_locations, names):
        top, right, bottom, left = top * 4, right * 4, bottom * 4, left * 4
        color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
        cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
        cv2.putText(frame, name, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)


def draw_yolo_boxes(frame, boxes):
    violation_set = {name.lower() for name in VIOLATION_CLASSES}
    for x1, y1, x2, y2, label, confidence in boxes:
        color = (0, 0, 255) if label.lower() in violation_set else (0, 255, 0)
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, f"{label} {confidence:.0%}", (x1, y1 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)


def extract_yolo_boxes(results):
    if not results or results[0].boxes is None or len(results[0].boxes) == 0:
        return [], []

    names_map = results[0].names
    boxes = []
    labels = []

    for box in results[0].boxes.data.tolist():
        x1, y1, x2, y2, confidence, class_id = box[:6]
        label = names_map[int(class_id)]
        labels.append(label)
        boxes.append((int(x1), int(y1), int(x2), int(y2), label, float(confidence)))

    return boxes, labels


def process_frame(frame, model, state: StreamState, last_saved_time: float):
    with _model_lock:
        results = model.predict(
            frame,
            conf=CONFIDENCE,
            iou=IOU,
            imgsz=YOLO_IMG_SIZE,
            verbose=False,
        )

    yolo_boxes, detected_objects = extract_yolo_boxes(results)
    face_locations, face_names = update_faces(frame, state)

    display = frame.copy()
    draw_yolo_boxes(display, yolo_boxes)
    draw_faces(display, face_locations, face_names)

    violation_set = {name.lower() for name in VIOLATION_CLASSES}
    violation_boxes = [
        entry
        for entry in yolo_boxes
        if entry[4].lower() in violation_set and entry[5] >= VIOLATION_CONFIDENCE
    ]
    violation_found = len(violation_boxes) > 0
    violation_labels = [entry[4] for entry in violation_boxes]
    violation_keys = [label.lower() for label in violation_labels]
    if "weapon" in violation_keys:
        violation_type = "Weapon"
    elif "cigarette" in violation_keys:
        violation_type = "Cigarette"
    else:
        violation_type = violation_labels[0].title() if violation_labels else "Violation"
    confidence = max((item[5] for item in violation_boxes), default=0.0)

    if violation_found:
        current_time = time.time()
        if current_time - last_saved_time > COOLDOWN_SECONDS:
            subject_name = ", ".join(face_names) if face_names else "Unknown_Subject"
            obj_name = "_".join(violation_labels)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{EVIDENCE_FOLDER}/{subject_name}_{obj_name}_{timestamp}.jpg"
            cv2.imwrite(filename, frame)
            save_detection(violation_type, detected_objects, subject_name, confidence, filename)
            print(f"[ALERT] Violation detected by {subject_name}! Evidence saved.")
            last_saved_time = current_time

    return display, last_saved_time


async def _async_stream_loop(cap, websocket):
    model = load_model()
    load_known_faces()
    state = StreamState()
    last_saved_time = 0.0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                image = jpeg_bytes(fallback_frame("Camera read failed"))
                encoded = base64.b64encode(image).decode("ascii")
                await websocket.send_json({"frame": encoded})
                await asyncio.sleep(1)
                continue

            frame = cv2.flip(frame, 1)
            display, last_saved_time = await asyncio.to_thread(
                process_frame, frame, model, state, last_saved_time
            )

            image = jpeg_bytes(display)
            if image is not None:
                encoded = base64.b64encode(image).decode("ascii")
                await websocket.send_json({"frame": encoded})

            await asyncio.sleep(STREAM_INTERVAL)
    finally:
        cap.release()


def video_stream():
    cap = open_camera()
    if cap is None:
        image = jpeg_bytes(fallback_frame("Camera unavailable"))

        while True:
            yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + image + b"\r\n"
            time.sleep(1)

    model = load_model()
    load_known_faces()
    state = StreamState()
    last_saved_time = 0.0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                payload = jpeg_bytes(fallback_frame("Camera read failed"))
                if payload:
                    yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + payload + b"\r\n"
                time.sleep(1)
                continue

            frame = cv2.flip(frame, 1)
            display, last_saved_time = process_frame(frame, model, state, last_saved_time)

            payload = jpeg_bytes(display)
            if payload is None:
                continue

            yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + payload + b"\r\n"
    finally:
        cap.release()


async def websocket_stream(websocket, camera_id):
    with get_db() as conn:
        camera = conn.execute("SELECT * FROM cameras WHERE id = ?", (camera_id,)).fetchone()
    if camera is None:
        image = jpeg_bytes(fallback_frame("Camera not found"))
        encoded = base64.b64encode(image).decode("ascii")
        while True:
            await websocket.send_json({"frame": encoded})
            await asyncio.sleep(1)

    if camera["camera_type"] == "webcam":
        try:
            preferred_index = int(camera["source"])
            indexes = (preferred_index, *CAMERA_INDEXES)
        except ValueError:
            indexes = CAMERA_INDEXES
        cap = open_camera(indexes)
    elif camera["camera_type"] == "video":
        cap = cv2.VideoCapture(camera["source"])
        if not cap.isOpened():
            cap = None
        else:
            configure_capture(cap)
    else:
        cap = None

    if cap is None:
        image = jpeg_bytes(fallback_frame("Camera unavailable"))
        encoded = base64.b64encode(image).decode("ascii")
        while True:
            await websocket.send_json({"frame": encoded})
            await asyncio.sleep(1)

    await _async_stream_loop(cap, websocket)
