import cv2
import os
from datetime import datetime
from ultralytics import YOLO

MODEL_PATH = "F:\\1. FYP\\fight\\fight_model.pt"
EVIDENCE_DIR = "F:\\1. FYP\\fight"

# Create folder if it doesn't exist
os.makedirs(EVIDENCE_DIR, exist_ok=True)

# Load the YOLO model
print("[INFO] Loading Fight Detection Model...")
model = YOLO(MODEL_PATH)

# Start webcam
cap = cv2.VideoCapture(0)

print("[INFO] Monitoring... Press 'Q' to stop.")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Run detection
    # Adjust conf (confidence) as needed. 0.5 means 50% certainty.
    results = model(frame, conf=0.5, verbose=False)

    # Check if any detection exists in the current frame
    if len(results[0].boxes) > 0:
        # Get the timestamp for the filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"{EVIDENCE_DIR}/fight_{timestamp}.jpg"
        
        # Save the frame
        cv2.imwrite(filename, frame)
        print(f"[ALERT] Fight detected! Saved to: {filename}")

        # Optional: Draw the boxes on the screen so you can see what it sees
        frame = results[0].plot()

    # Display the feed
    cv2.imshow("Fight Detection Feed", frame)

    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("[INFO] System closed.")