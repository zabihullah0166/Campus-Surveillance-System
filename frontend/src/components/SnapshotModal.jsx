import { useEffect, useState } from "react";
import { ImageOff, X } from "lucide-react";
import { api } from "../api/client";

export default function SnapshotModal({ detectionId, onClose }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let objectUrl = "";
    setUrl("");
    setError("");

    api
      .get(`/detections/${detectionId}/snapshot`, { responseType: "blob" })
      .then((response) => {
        objectUrl = URL.createObjectURL(response.data);
        setUrl(objectUrl);
      })
      .catch(() => setError("Snapshot file is missing or unavailable."));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [detectionId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="page-header">
          <h2 className="modal-title">Detection Snapshot</h2>
          <button className="btn btn-ghost btn-sm icon-btn" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>
        {error ? (
          <div className="empty-state">
            <ImageOff size={42} />
            <span>{error}</span>
          </div>
        ) : url ? (
          <img alt="Detection snapshot" style={{ borderRadius: 8, maxHeight: "70vh", objectFit: "contain", width: "100%" }} src={url} />
        ) : (
          <div className="empty-state">Loading...</div>
        )}
      </div>
    </div>
  );
}
