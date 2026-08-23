# Campus Surveillance & Automated Violation Detection System

An AI-powered real-time campus monitoring system built with **FastAPI**, **YOLO**, **OpenCV**, **Face Recognition**, and **React (Vite)**. The system monitors live camera streams to automatically detect security violations (e.g., weapons, smoking, fighting), identify students using facial recognition, capture evidence snapshots, and issue automated fine challans.

---

## 🌟 Key Features

- **Live Multi-Camera Monitoring**: Real-time video stream ingestion and processing across multiple campus camera feeds.
- **AI Violation Detection**: Custom YOLO-trained models for detecting prohibited items and security threats (weapons, cigarettes, altercations).
- **Facial Recognition & Identification**: Integrated face recognition pipeline matching detected individuals against student database records (`data/Known_students`).
- **Evidence Management**: Automated snapshot capturing stored upon violation detection for verification.
- **Automated Challan Generation**: Instant ticket/challan issuance with customizable fine amounts, student details, and timestamped evidence.
- **User & Access Management**: Secure authentication with role-based access (Admin & Viewer) and pending request management.
- **Modern Responsive Dashboard**: Interactive React frontend delivering live feeds, analytics, detection logs, and challan tracking.

---

## 🏗️ System Architecture

```
Campus Surveillance System
├── Backend (FastAPI / Uvicorn)
│   ├── REST API Routers (Auth, Cameras, Detections, Challans, Students, Video)
│   ├── AI Services (YOLO Vision Engine, Face Matcher, Challan Generator)
│   └── Database Layer (SQLite with Automatic Seeding)
└── Frontend (React / Vite / Lucide Icons / Recharts)
    └── Dynamic Web UI for Live Monitoring & Management
```

---

## 📁 Repository Structure

```
├── api/                    # FastAPI router endpoints & request serializers
│   ├── routers/            # Endpoint definitions (cameras, detections, auth, etc.)
│   ├── dependencies.py     # API dependencies & auth guards
│   └── serializers.py      # Response serialization helpers
├── config.py               # Central configuration (Model paths, thresholds, camera index)
├── core/                   # Core infrastructure
│   ├── database.py         # SQLite connection & table schema initialization
│   └── security.py         # Password hashing & session token management
├── data/                   # Data storage
│   ├── Evidence/           # Captured violation snapshots
│   ├── Known_students/     # Reference photographs for face recognition
│   └── challans/           # Generated PDF challans
├── frontend/               # React + Vite frontend application
│   ├── src/                # UI Components & Page Views
│   ├── package.json        # Frontend Node dependencies
│   └── vite.config.js      # Vite build configuration
├── main.py                 # Main FastAPI application entry point
├── models/                 # Pydantic data schemas
├── requirements.txt        # Python backend dependencies
├── services/               # Core vision processing & business logic
│   ├── vision_service.py   # YOLO & Face Recognition processing engine
│   ├── detection_service.py# Detection event logger
│   └── chalan_service.py   # Challan PDF generation service
├── train/                  # YOLO training metrics, curves, & confusion matrices
└── yolo_models/            # Trained PyTorch YOLO model weights (.pt)
```

---

## 🚀 Getting Started

### Prerequisites

- **Python**: `3.10` or higher
- **Node.js**: `18.0` or higher (with `npm`)
- **C++ Build Tools** (Required on Windows for `dlib` / `face-recognition` compilation if installing pre-built binaries is not used)

---

### Backend Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/campus-surveillance-system.git
   cd campus-surveillance-system
   ```

2. **Create and Activate a Virtual Environment**:
   - **Windows**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Verify Model Weights**:
   Ensure YOLO model weights file is present at `yolo_models/last.pt` (configured in `config.py`).

---

### Frontend Setup

1. **Navigate to the Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install NPM Packages**:
   ```bash
   npm install
   ```

3. **Start Frontend Development Server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://127.0.0.1:5173`.

---

## ⚙️ Running the Application

To run the complete system (Backend API + Streaming Engine):

```bash
python main.py
```

The FastAPI backend server will start at `http://127.0.0.1:8000`.

- **Swagger API Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

Default admin credentials seeded automatically on first run:
- **Username**: `admin`
- **Password**: `admin@123`

---

## 🛠️ Configuration (`config.py`)

Key settings can be modified in `config.py`:

| Parameter | Default | Description |
|---|---|---|
| `MODEL_PATH` | `"yolo_models/last.pt"` | Path to trained YOLO model weights |
| `CONFIDENCE` | `0.45` | Minimum YOLO detection confidence threshold |
| `VIOLATION_CONFIDENCE` | `0.70` | Confidence threshold required to flag security violation |
| `FACE_MATCH_MAX_DIST` | `40` | Maximum distance threshold for face match matching |
| `STREAM_INTERVAL` | `0.02` | Processing frame delay for video streaming |

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
