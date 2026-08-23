import hashlib
import hmac
import secrets

from fastapi import HTTPException

SESSIONS: dict[str, dict] = {}


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"pbkdf2_sha256${salt}${digest.hex()}"


def verify_password(password, stored_hash):
    try:
        algorithm, salt, expected = stored_hash.split("$", 2)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    actual = hash_password(password, salt).split("$", 2)[2]
    return hmac.compare_digest(actual, expected)


def create_session(role, username, full_name):
    token = secrets.token_urlsafe(32)
    SESSIONS[token] = {
        "role": role,
        "username": username,
        "full_name": full_name,
    }
    return token


def current_session(authorization: str | None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")

    token = authorization.removeprefix("Bearer ").strip()
    session = SESSIONS.get(token)
    if session is None:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    return session
