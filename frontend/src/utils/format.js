export function badgeForViolation(type = "") {
  const value = type.toLowerCase();
  if (value.includes("fighting") || value.includes("weapon")) return "badge-red";
  if (value.includes("cigarette") || value.includes("smoking")) return "badge-amber";
  if (value.includes("dustbin")) return "badge-blue";
  if (value.includes("trash")) return "badge-gray";
  return "badge-blue";
}

export function badgeForStatus(status = "") {
  const value = status.toLowerCase();
  if (value === "pending") return "badge-amber";
  if (value === "accepted" || value === "approved" || value === "paid") return "badge-green";
  if (value === "appealed") return "badge-blue";
  if (value === "declined" || value === "rejected" || value === "cancelled") return "badge-gray";
  return "badge-gray";
}

export function money(value = 0) {
  return `Rs. ${Number(value || 0).toLocaleString()}`;
}

export function dateTime(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

export function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export const sampleCameras = [
  { id: 1, name: "Main Gate Entrance", location_label: "Gate A", camera_type: "webcam", source: "0", is_running: true },
  { id: 2, name: "Library Corridor", location_label: "Block B", camera_type: "rtsp", source: "rtsp://192.168.1.100:554/stream", is_running: false }
];

export const sampleDetections = [
  {
    id: 101,
    violation_type: "Weapon",
    student_roll_no: "CS-2023-045",
    student_name: "Zabih Ullah",
    location: "Main Gate Entrance",
    camera_name: "Main Gate",
    confidence: 0.88,
    status: "pending",
    is_alert: true,
    detected_at: new Date().toISOString()
  },
  {
    id: 102,
    violation_type: "Cigarette",
    student_roll_no: "",
    student_name: "",
    location: "Cafeteria Area",
    camera_name: "Cafeteria",
    confidence: 0.76,
    status: "pending",
    is_alert: true,
    detected_at: new Date(Date.now() - 3600000).toISOString()
  }
];
