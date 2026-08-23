import { Camera, Maximize2, RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function websocketUrl(cameraId) {
  const base = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000";
  return `${base}/cameras/${cameraId}/ws`;
}

export default function LiveFeed({ camera }) {
  const [status, setStatus] = useState(camera?.is_running ? "connecting" : "offline");
  const [frame, setFrame] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const feedRef = useRef(null);

  useEffect(() => {
    if (!camera?.is_running) {
      setStatus("offline");
      return undefined;
    }

    let closedByEffect = false;
    setStatus("connecting");
    const socket = new WebSocket(websocketUrl(camera.id));

    socket.onopen = () => setStatus("live");
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.ping) return;
        if (payload.frame) {
          setFrame(`data:image/jpeg;base64,${payload.frame}`);
          setStatus("live");
        }
      } catch {
        setStatus("error");
      }
    };
    socket.onerror = () => setStatus("error");
    socket.onclose = () => {
      if (!closedByEffect) setStatus("error");
    };

    return () => {
      closedByEffect = true;
      socket.close();
    };
  }, [camera?.id, camera?.is_running, retryKey]);

  function fullscreen() {
    feedRef.current?.requestFullscreen?.();
  }

  return (
    <div className="feed" ref={feedRef}>
      <div className="feed-header">
        <div>
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <span className={status === "live" ? "pulse-green" : "pulse"} />
            <span className="mono">{camera?.name || "Camera"}</span>
          </div>
          <div className="muted" style={{ fontSize: 12 }}>{camera?.location_label || camera?.location || "Campus"}</div>
        </div>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <span className={`badge ${status === "live" ? "badge-green" : status === "connecting" ? "badge-amber" : "badge-gray"}`}>
            {status}
          </span>
          <button className="btn btn-ghost btn-sm icon-btn" onClick={fullscreen} title="Fullscreen" type="button">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {status === "live" && frame ? (
        <img alt={`${camera?.name || "Camera"} live feed`} src={frame} />
      ) : status === "error" ? (
        <div className="feed-placeholder">
          <WifiOff size={38} />
          <span>Feed unavailable</span>
          <button className="btn btn-primary btn-sm" onClick={() => setRetryKey((value) => value + 1)} type="button">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : status === "offline" ? (
        <div className="feed-placeholder">
          <Camera size={42} />
          <span>Offline</span>
        </div>
      ) : (
        <div className="feed-placeholder">
          <RefreshCw size={34} />
          <span>Connecting...</span>
        </div>
      )}
    </div>
  );
}
