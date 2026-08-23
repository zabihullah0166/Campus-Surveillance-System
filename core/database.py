import os
import sqlite3
from datetime import datetime

from config import DB_PATH
from core.security import hash_password


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    os.makedirs("data", exist_ok=True)
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS cameras (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                location_label TEXT,
                camera_type TEXT NOT NULL DEFAULT 'webcam',
                source TEXT NOT NULL DEFAULT '0',
                is_running INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                full_name TEXT,
                email TEXT,
                role TEXT NOT NULL CHECK(role IN ('admin', 'viewer')),
                status TEXT NOT NULL DEFAULT 'active',
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS students (
                roll_no TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                semester TEXT,
                department TEXT,
                subject TEXT,
                mobile_number TEXT,
                photo_path TEXT,
                password_hash TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                violation_type TEXT NOT NULL,
                detected_objects TEXT,
                student_roll_no TEXT,
                student_name TEXT,
                location TEXT,
                camera_id INTEGER,
                camera_name TEXT,
                confidence REAL NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'pending',
                is_alert INTEGER NOT NULL DEFAULT 1,
                snapshot_path TEXT,
                detected_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS challans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                challan_no TEXT NOT NULL UNIQUE,
                detection_id INTEGER,
                student_roll_no TEXT,
                student_name TEXT,
                violation_type TEXT NOT NULL,
                fine_amount INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                due_date TEXT NOT NULL,
                issued_at TEXT NOT NULL,
                remarks TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS access_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT NOT NULL,
                full_name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                requested_role TEXT NOT NULL,
                reason TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT NOT NULL
            )
            """
        )

        student_columns = [row["name"] for row in conn.execute("PRAGMA table_info(students)").fetchall()]
        if "password_hash" not in student_columns:
            conn.execute("ALTER TABLE students ADD COLUMN password_hash TEXT")

        challan_columns = [row["name"] for row in conn.execute("PRAGMA table_info(challans)").fetchall()]
        if "pdf_path" not in challan_columns:
            conn.execute("ALTER TABLE challans ADD COLUMN pdf_path TEXT")

        admin = conn.execute("SELECT id FROM users WHERE username = ?", ("admin",)).fetchone()
        if admin is None:
            conn.execute(
                """
                INSERT INTO users (username, password_hash, full_name, email, role, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    "admin",
                    hash_password("admin@123"),
                    "System Administrator",
                    "admin@campus.local",
                    "admin",
                    "active",
                    datetime.now().isoformat(timespec="seconds"),
                ),
            )
        else:
            conn.execute(
                """
                UPDATE users
                SET password_hash = ?, full_name = ?, role = ?, status = ?
                WHERE username = ?
                """,
                (hash_password("admin@123"), "System Administrator", "admin", "active", "admin"),
            )

        with conn:
            conn.execute(
                "UPDATE students SET password_hash = ? WHERE lower(name) = ?",
                (hash_password("faiz123"), "faiz ur rehman"),
            )
            conn.execute(
                "UPDATE students SET password_hash = ? WHERE lower(name) = ?",
                (hash_password("ahmad123"), "ahmad hassan shah"),
            )

            rows = conn.execute(
                "SELECT roll_no, name FROM students WHERE password_hash IS NULL OR password_hash = ''"
            ).fetchall()
            for row in rows:
                first_name = row["name"].split(" ", 1)[0].strip().lower() if row["name"] else "student"
                default_password = f"{first_name}123"
                conn.execute(
                    "UPDATE students SET password_hash = ? WHERE roll_no = ?",
                    (hash_password(default_password), row["roll_no"]),
                )

        camera = conn.execute("SELECT id FROM cameras WHERE id = 1").fetchone()
        if camera is None:
            conn.execute(
                """
                INSERT INTO cameras (id, name, location_label, camera_type, source, is_running, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    1,
                    "Main Gate Entrance",
                    "Gate A",
                    "webcam",
                    "0",
                    1,
                    datetime.now().isoformat(timespec="seconds"),
                ),
            )
