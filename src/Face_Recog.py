import cv2
import face_recognition
import numpy as np
import os
from datetime import datetime

KNOWN_FACES_DIR = "data/Known_students"
EVIDENCE_DIR = "data/Evidence"

os.makedirs(EVIDENCE_DIR, exist_ok=True)

def load_known_faces(known_faces_dir):
    print("[INFO] Loading known faces...")
    known_face_encodings = []
    known_face_names = []
    
    for filename in os.listdir(known_faces_dir):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            path = os.path.join(known_faces_dir, filename)
            name = os.path.splitext(filename)[0]
            image = face_recognition.load_image_file(path)
            encodings = face_recognition.face_encodings(image)

            if len(encodings) > 0:
                known_face_encodings.append(encodings[0])
                known_face_names.append(name)
                print(f"Loaded: {name}")
            else:
                print(f"[WARNING] No face found in {filename}")

    print(f"[INFO] Total known faces loaded: {len(known_face_names)}")
    return known_face_encodings, known_face_names


def run_face_recognition(camera_index=0):
    known_face_encodings, known_face_names = load_known_faces(KNOWN_FACES_DIR)
    video_capture = cv2.VideoCapture(camera_index)

    if not video_capture.isOpened():
        raise Exception("[ERROR] Camera not accessible!")

    print("[INFO] Starting camera feed... Press 'Q' to exit.")

    while True:
        ret, frame = video_capture.read()
        if not ret:
            print("[ERROR] Failed to grab frame")
            break

        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(
            rgb_small_frame, face_locations)

        face_names = []
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(
                known_face_encodings, face_encoding, tolerance=0.45)
            name = "Unknown"

            face_distances = face_recognition.face_distance(
                known_face_encodings, face_encoding)
            best_match_index = np.argmin(face_distances) if len(
                face_distances) > 0 else -1
            if best_match_index != -1 and matches[best_match_index]:
                name = known_face_names[best_match_index]

            face_names.append(name)

            # if name == "Unknown":
            #     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            #     filename = f"{EVIDENCE_DIR}/unknown_{timestamp}.jpg"
            #     cv2.imwrite(filename, frame)
            #     print(f"[EVIDENCE] Unknown face saved: {filename}")

        for (top, right, bottom, left), name in zip(face_locations, face_names):
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4

            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            cv2.rectangle(frame, (left, bottom - 35),
                          (right, bottom), color, cv2.FILLED)
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, name, (left + 6, bottom - 6),
                        font, 0.8, (255, 255, 255), 1)

        cv2.imshow('Face Recognition - Campus Surveillance', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    video_capture.release()
    cv2.destroyAllWindows()
    print("[INFO] Camera feed closed.")


if __name__ == "__main__":
    run_face_recognition()
