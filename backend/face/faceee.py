import os
import pickle
import numpy as np
from deepface import DeepFace
from sklearn.neighbors import KNeighborsClassifier
import cv2

# Load Pre-trained Model (Ensure this file is available)
MODEL_PATH = "/Users/ajaykota/Downloads/attendence/backend/face_features2.pkl"

def extract_face_features(image_path):
    """Extracts facial embeddings from an image."""
    try:
        embeddings = DeepFace.represent(
            img_path=image_path,
            model_name="Facenet512",
            detector_backend="mtcnn",
            enforce_detection=False
        )
        if embeddings and isinstance(embeddings, list):
            return [np.array(face['embedding']).flatten() for face in embeddings]
    except Exception as e:
        print(f"❌ Error extracting features from {image_path}: {e}")
    return []

def recognize_faces(image_path):
    """Recognizes faces from an input image using the pre-trained model."""
    if not os.path.exists(MODEL_PATH):
        print("❌ Pre-trained model not found! Train the model first.")
        return []

    # Load the pre-trained model
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    face_data_list = extract_face_features(image_path)
    if not face_data_list:
        print("⚠ No faces found in the image.")
        return []

    recognized_names = set()
    for face_embedding in face_data_list:
        face_embedding = np.array(face_embedding).reshape(1, -1)
        prediction = model.predict(face_embedding)[0]
        recognized_names.add(prediction)

    recognized_names = list(recognized_names)
    print("🟢 Recognized Names:", recognized_names)
    return recognized_names

# Example usage
# group_photo_path = "C:/Users/91817/OneDrive - Vignan University/Desktop/attendence/backend/upload/image.jpg"  # Change to your test image path
# recognized_names = recognize_faces(group_photo_path)

# if recognized_names:
#     with open("detected_names.txt", "w") as f:
#         for name in recognized_names:
#             f.write(name + "\n")
#     print("✅ Recognized names saved successfully!")
# else:
#     print("⚠ No recognized names found to save.")
