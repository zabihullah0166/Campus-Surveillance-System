import { Camera, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import LiveFeed from "../components/LiveFeed";
import { useToast } from "../components/Toast";
import { normalizeList, sampleCameras } from "../utils/format";

const emptyCamera = { name: "", location_label: "", camera_type: "webcam", source: "" };

export default function Cameras() {
  const [cameras, setCameras] = useState(sampleCameras);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyCamera);
  const toast = useToast();

  function load() {
    api.get("/cameras/").then((res) => setCameras(normalizeList(res.data))).catch(() => {});
  }

  useEffect(load, []);

  async function addCamera(event) {
    event.preventDefault();
    try {
      const { data } = await api.post("/cameras/", form);
      setCameras((items) => [...items, data]);
      setModal(false);
      setForm(emptyCamera);
      toast.success("Camera added");
    } catch {
      toast.error("Camera add failed");
    }
  }

  async function action(id, type) {
    try {
      await api.post(`/cameras/${id}/${type}`);
      setCameras((items) => items.map((camera) => (camera.id === id ? { ...camera, is_running: type === "start" } : camera)));
    } catch {
      toast.error(`${type} failed`);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this camera?")) return;
    try {
      await api.delete(`/cameras/${id}`);
      setCameras((items) => items.filter((camera) => camera.id !== id));
      toast.info("Camera deleted");
    } catch {
      toast.error("Delete failed");
    }
  }

  const hint = {
    webcam: "0 (or 1, 2 for multiple webcams)",
    video: "C:\\videos\\sample.mp4"
  }[form.camera_type];

  return (
    <div className="page">
      <div className="page-header">
        <div><span className="section-label">Live Infrastructure</span><h1 className="page-title">Cameras</h1></div>
        <button className="btn btn-primary" onClick={() => setModal(true)} type="button"><Plus size={16} /> Add Camera</button>
      </div>

      <div className="grid-2 camera-grid">
        {cameras.map((camera) => (
          <div className="card" key={camera.id}>
            {camera.is_running ? <LiveFeed camera={camera} /> : <div className="feed"><div className="feed-placeholder"><Camera size={42} />Offline</div></div>}
            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              <div className="page-header">
                <div><strong>{camera.name}</strong><div className="mono muted">{camera.location_label || camera.location} · {camera.camera_type}</div></div>
                <span className={`badge ${camera.is_running ? "badge-green" : "badge-gray"}`}>{camera.is_running ? "live" : "offline"}</span>
              </div>
              <div className="mono muted">{camera.source}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {camera.is_running ? (
                  <button className="btn btn-ghost btn-sm" onClick={() => action(camera.id, "stop")} type="button">Stop</button>
                ) : (
                  <button className="btn btn-sm" onClick={() => action(camera.id, "start")} type="button">Start</button>
                )}
                <button className="btn btn-danger btn-sm icon-btn" onClick={() => remove(camera.id)} type="button"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <form className="modal page" onClick={(e) => e.stopPropagation()} onSubmit={addCamera}>
            <h2 className="modal-title">Add Camera</h2>
            <div className="grid-2">
              <div className="form-group"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label>Location Label</label><input required value={form.location_label} onChange={(e) => setForm({ ...form, location_label: e.target.value })} /></div>
              <div className="form-group"><label>Camera Type</label><select value={form.camera_type} onChange={(e) => setForm({ ...form, camera_type: e.target.value, source: "" })}><option value="webcam">Webcam</option><option value="video">Video</option></select></div>
              <div className="form-group"><label>Source</label><input required placeholder={hint} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
            </div>
            <div className="modal-actions"><button className="btn btn-ghost" onClick={() => setModal(false)} type="button">Cancel</button><button className="btn btn-primary" type="submit">Save</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
