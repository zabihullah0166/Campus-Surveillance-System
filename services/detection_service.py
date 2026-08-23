from datetime import datetime
import secrets

from core.database import get_db


def fine_for_violation(violation_type):
    normalized = violation_type.lower()
    if "weapon" in normalized:
        return 5000
    if "fighting" in normalized:
        return 3000
    if "cigarette" in normalized or "smoking" in normalized:
        return 1000
    return 500


def challan_number():
    return f"CHN-{datetime.now().strftime('%Y%m%d')}-{secrets.token_hex(3).upper()}"


def lookup_student(roll_no=None, name=None):
    if not roll_no and not name:
        return None

    with get_db() as conn:
        if roll_no:
            return conn.execute(
                "SELECT roll_no, name, department, subject, semester FROM students WHERE roll_no = ?",
                (roll_no,),
            ).fetchone()
        return conn.execute(
            "SELECT roll_no, name, department, subject, semester FROM students WHERE lower(name) = lower(?)",
            (name,),
        ).fetchone()


def save_detection(violation_type, detected_objects, subject_name, confidence, snapshot_path, camera_id=1):
    student = None
    if subject_name and subject_name != "Unknown_Subject":
        first_name = subject_name.split(",", 1)[0].strip()
        student = lookup_student(name=first_name)

    student_roll_no = student["roll_no"] if student else None
    student_name = student["name"] if student else None

    with get_db() as conn:
        camera = conn.execute("SELECT id, name, location_label FROM cameras WHERE id = ?", (camera_id,)).fetchone()
        camera_name = camera["name"] if camera else "Main Gate Entrance"
        location = camera["location_label"] if camera else "Gate A"
        conn.execute(
            """
            INSERT INTO detections (
                violation_type, detected_objects, student_roll_no, student_name, location,
                camera_id, camera_name, confidence, status, is_alert, snapshot_path, detected_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                violation_type,
                ",".join(detected_objects),
                student_roll_no,
                student_name or subject_name,
                location,
                camera_id,
                camera_name,
                confidence,
                "pending",
                1,
                snapshot_path,
                datetime.now().isoformat(timespec="seconds"),
            ),
        )
