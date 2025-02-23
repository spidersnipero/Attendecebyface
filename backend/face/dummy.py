

import os
import zipfile
import numpy as np
import pickle
from deepface import DeepFace
from scipy.spatial.distance import euclidean
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import cv2

def extract_zip(zip_path, extract_to):
    if not os.path.exists(zip_path):
        print(f"⚠ Warning: ZIP file {zip_path} not found!")
        return
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    print(f"✅ Extracted: {zip_path}")

def extract_face_features(image_path):
    try:
        embeddings = DeepFace.represent(
            img_path=image_path,
            model_name="Facenet512",
            detector_backend="mtcnn",
            enforce_detection=False
        )
        if embeddings and isinstance(embeddings, list):
            return [(np.array(face['embedding']).flatten(), face['facial_area']) for face in embeddings]
    except Exception as e:
        print(f"❌ Error extracting features from {image_path}: {e}")
    return []

def load_images_from_folder(folder):
    if not os.path.exists(folder):
        raise FileNotFoundError(f"❌ The folder '{folder}' does not exist! Please extract ZIP files first.")

    face_features = []
    labels = []

    label_mapping = {
        "harshi": "Harshi",
        "lahari": "Lahari",
        "keerthana": "Keerthana",
        "haritha": "Haritha",
        "madhavi": "Madhavi",
        "poojitha": "Poojitha"
    }

    for person_name in os.listdir(folder):
        normalized_name = person_name.replace(" ", "").replace("(", "").replace(")", "").lower().strip()
        matched_label = label_mapping.get(normalized_name, "Unknown")

        person_path = os.path.join(folder, person_name)
        if os.path.isdir(person_path):
            for img_name in os.listdir(person_path):
                img_path = os.path.join(person_path, img_name)
                features = extract_face_features(img_path)
                for feature, _ in features:
                    face_features.append(feature)
                    labels.append(matched_label)

    print(f"✅ Loaded {len(face_features)} face embeddings from dataset.")
    return face_features, labels

def train_model(features, labels):
    X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)
    model = KNeighborsClassifier(n_neighbors=3)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"✅ Model trained with accuracy: {acc:.2f}")
    with open("face_recognition_model.pkl", "wb") as f:
        pickle.dump(model, f)
    print("✅ Model saved successfully!")

def recognize_faces(image_path):
    with open("face_recognition_model.pkl", "rb") as f:
        model = pickle.load(f)
    
    face_data_list = extract_face_features(image_path)
    if not face_data_list:
        print("⚠ No faces found in the image.")
        return []

    recognized_names = set()  # Use set to remove duplicates

    for face_embedding, _ in face_data_list:
        face_embedding = np.array(face_embedding).reshape(1, -1)
        prediction = model.predict(face_embedding)[0]
        recognized_names.add(prediction)  # Add to set to avoid duplicates

    recognized_names = list(recognized_names)  # Convert back to list for further processing
    print("🟢 Recognized Names:", recognized_names)
    return recognized_names

zip_files = ["/content/Haritha.zip", "/content/Harshi.zip", "/content/Keerthana.zip",
             "/content/Lahari.zip", "/content/Madhavi.zip", "/content/Poojitha.zip"]
extraction_folder = "./extracted_faces"

os.makedirs(extraction_folder, exist_ok=True)

for zip_file in zip_files:
    extract_zip(zip_file, extraction_folder)

features, labels = load_images_from_folder(extraction_folder)
if features:
    train_model(features, labels)

group_photo_path = "/content/Girls.jpg"  # Replace with actual image path
recognized_names = recognize_faces(group_photo_path)

if recognized_names:
    with open("/content/detected_names.txt", "w") as f:
        for name in recognized_names:
            f.write(name + "\n")
    print("✅ Recognized names saved successfully!")
else:
    print("⚠ No recognized names found to save.")

