def dict_row(row):
    return dict(row) if row is not None else None


def public_user(row):
    return {
        "id": row["id"],
        "username": row["username"],
        "full_name": row["full_name"] or "",
        "email": row["email"] or "",
        "role": row["role"],
        "status": row["status"],
        "created_at": row["created_at"],
    }


def public_camera(row):
    data = dict_row(row)
    if data:
        data["is_running"] = bool(data["is_running"])
    return data


def detection_dict(row):
    data = dict_row(row)
    if not data:
        return None
    data["is_alert"] = bool(data["is_alert"])
    return data


def challan_dict(row):
    data = dict_row(row)
    if data:
        data["pdf_url"] = f"/challans/{data['id']}/pdf"
    return data


def student_photo_url(row):
    if not row["photo_path"]:
        return ""
    return f"/students/{row['roll_no']}/photo"


def public_student(row):
    return {
        "id": row["roll_no"],
        "roll_no": row["roll_no"],
        "full_name": row["name"],
        "name": row["name"],
        "department": row["department"] or "",
        "program": row["subject"] or "",
        "subject": row["subject"] or "",
        "semester": row["semester"] or "",
        "mobile_number": row["mobile_number"] or "",
        "photo_path": row["photo_path"] or "",
        "photo_url": student_photo_url(row),
    }
