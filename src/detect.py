import cv2
from ultralytics import YOLO

MODEL_PATH = "models/detection_model.pt"

def run_detection(camera_index=0, confidence=0.4, iou=0.5):
    """
    Run object detection on webcam feed.
    
    Args:
        camera_index: Camera device index (0 for default webcam)
        confidence: Confidence threshold for detections
        iou: IOU threshold for NMS
    """
    model = YOLO(MODEL_PATH)
    cap = cv2.VideoCapture(camera_index)
    
    if not cap.isOpened():
        raise RuntimeError("❌ Could not access webcam")
    
    print("[INFO] Webcam started. Press 'Q' to quit.")
    
    # detection loop
    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Failed to read frame")
            break
        
        # Run YOLO inference
        results = model(frame, conf=confidence, iou=iou, verbose=False)
        # Draw detections
        annotated_frame = results[0].plot()
        
        cv2.imshow("Campus Surveillance - Object Detection", annotated_frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print("[INFO] Camera closed.")

if __name__ == "__main__":
    run_detection()