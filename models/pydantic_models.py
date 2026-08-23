from pydantic import BaseModel

class LoginRequest(BaseModel):
    account_type: str = "user"
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    full_name: str = ""
    email: str = ""
    password: str
    role: str = "viewer"


class CameraCreate(BaseModel):
    name: str
    location_label: str = ""
    camera_type: str = "webcam"
    source: str = "0"


class DetectionAccept(BaseModel):
    roll_no: str | None = None


class ChallanStatusUpdate(BaseModel):
    status: str
    remarks: str = ""


class AccessRequestCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str
    requested_role: str
    reason: str


class StudentCreate(BaseModel):
    roll_no: str
    full_name: str
    email: str = ""
    phone: str = ""
    department: str = ""
    program: str = ""
    semester: str = ""
    password: str
