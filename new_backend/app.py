from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import traceback

app = Flask(__name__)
CORS(app)

# ── Load model ───────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "crop_disease_model.h5")
model = tf.keras.models.load_model(MODEL_PATH)

IMG_SIZE = 224  # confirmed from model — input shape [null, 224, 224, 3]

print(f"✅ Model loaded")
print(f"   Input  shape : {model.input_shape}")
print(f"   Output shape : {model.output_shape}")
print(f"   Classes      : {model.output_shape[-1]}")

# ── Class names (alphabetical — matches ImageDataGenerator sort order) ──
# Your model outputs 15 classes — these are the first 15 alphabetically
# from the PlantVillage dataset
CLASS_NAMES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
]

# Trim/extend to exactly match model output count
num_classes = model.output_shape[-1]
CLASS_NAMES = CLASS_NAMES[:num_classes]
print(f"   Using classes : {CLASS_NAMES}")

# ── Disease metadata ─────────────────────────────────────────
METADATA = {
    "Apple___Apple_scab": {
        "disease": "Apple Scab",
        "cause": "Fungal — Venturia inaequalis",
        "remedy": "Apply Captan or Mancozeb fungicide. Remove and destroy infected leaves. Ensure good air circulation around the canopy. Use scab-resistant apple varieties.",
        "region": "North America, Europe, temperate regions",
        "season": "Spring (wet, cool weather)",
        "severity": "Moderate",
    },
    "Apple___Black_rot": {
        "disease": "Apple Black Rot",
        "cause": "Fungal — Botryosphaeria obtusa",
        "remedy": "Prune and destroy infected branches. Apply copper-based fungicide. Remove mummified fruits from the tree and ground. Avoid overhead irrigation.",
        "region": "Eastern USA, Canada, South America",
        "season": "Summer to Autumn",
        "severity": "High",
    },
    "Apple___Cedar_apple_rust": {
        "disease": "Cedar Apple Rust",
        "cause": "Fungal — Gymnosporangium juniperi-virginianae (requires cedar host)",
        "remedy": "Remove nearby cedar or juniper trees. Apply myclobutanil or propiconazole during spring. Plant rust-resistant apple varieties.",
        "region": "Eastern North America",
        "season": "Spring",
        "severity": "Moderate",
    },
    "Apple___healthy": {
        "disease": "Healthy Apple",
        "cause": "None — no disease detected",
        "remedy": "Maintain regular watering, fertilization, and annual pruning schedules. Monitor periodically.",
        "region": "All apple-growing regions",
        "season": "All seasons",
        "severity": "None",
    },
    "Blueberry___healthy": {
        "disease": "Healthy Blueberry",
        "cause": "None — no disease detected",
        "remedy": "Maintain soil pH between 4.5 and 5.5. Apply mulch to retain moisture. Monitor for early pest activity.",
        "region": "North America, Europe",
        "season": "All seasons",
        "severity": "None",
    },
    "Cherry_(including_sour)___Powdery_mildew": {
        "disease": "Cherry Powdery Mildew",
        "cause": "Fungal — Podosphaera clandestina",
        "remedy": "Apply sulfur-based fungicide. Improve air circulation by pruning. Avoid excess nitrogen fertilizers. Use resistant cherry varieties.",
        "region": "Europe, North America, Australia",
        "season": "Late Spring to Summer",
        "severity": "Moderate",
    },
    "Cherry_(including_sour)___healthy": {
        "disease": "Healthy Cherry",
        "cause": "None — no disease detected",
        "remedy": "Regular pruning after harvest and disease monitoring recommended.",
        "region": "Temperate regions worldwide",
        "season": "All seasons",
        "severity": "None",
    },
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "disease": "Corn Gray Leaf Spot",
        "cause": "Fungal — Cercospora zeae-maydis",
        "remedy": "Use resistant hybrid varieties. Apply strobilurin fungicides early. Practice crop rotation. Improve field drainage and reduce residue.",
        "region": "Sub-Saharan Africa, Southeast Asia, USA Corn Belt",
        "season": "Humid summer months",
        "severity": "High",
    },
    "Corn_(maize)___Common_rust_": {
        "disease": "Corn Common Rust",
        "cause": "Fungal — Puccinia sorghi",
        "remedy": "Plant resistant varieties. Apply triazole fungicides at early rust detection. Monitor regularly during humid conditions.",
        "region": "Tropical and subtropical regions worldwide",
        "season": "Rainy season",
        "severity": "Moderate",
    },
    "Corn_(maize)___Northern_Leaf_Blight": {
        "disease": "Northern Corn Leaf Blight",
        "cause": "Fungal — Exserohilum turcicum",
        "remedy": "Use resistant hybrids. Apply propiconazole or azoxystrobin at tasseling. Practice crop rotation and plow under crop debris after harvest.",
        "region": "USA Midwest, India, East Africa",
        "season": "Cool, moist summer weather",
        "severity": "High",
    },
    "Corn_(maize)___healthy": {
        "disease": "Healthy Corn",
        "cause": "None — no disease detected",
        "remedy": "Maintain proper plant spacing, consistent irrigation, and balanced soil nutrition.",
        "region": "Corn belts worldwide",
        "season": "All seasons",
        "severity": "None",
    },
    "Grape___Black_rot": {
        "disease": "Grape Black Rot",
        "cause": "Fungal — Guignardia bidwellii",
        "remedy": "Remove and destroy infected berries and leaves. Apply mancozeb or myclobutanil from bud break. Prune for improved air circulation.",
        "region": "Eastern USA, Europe, South America",
        "season": "Warm, wet summer",
        "severity": "High",
    },
    "Grape___Esca_(Black_Measles)": {
        "disease": "Grape Esca (Black Measles)",
        "cause": "Complex fungal — Phaeomoniella chlamydospora and Phaeoacremonium spp.",
        "remedy": "Prune infected wood well below visible symptoms. Apply wound protectants after pruning. No effective chemical cure exists — focus on prevention and sanitation.",
        "region": "Mediterranean, California, South America",
        "season": "Summer (stress conditions)",
        "severity": "Very High",
    },
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "disease": "Grape Leaf Blight",
        "cause": "Fungal — Pseudocercospora vitis",
        "remedy": "Apply copper-based fungicides. Remove and destroy fallen leaves. Ensure good vineyard air circulation through canopy management.",
        "region": "Asia, South America, Mediterranean",
        "season": "Warm and humid periods",
        "severity": "Moderate",
    },
    "Grape___healthy": {
        "disease": "Healthy Grape",
        "cause": "None — no disease detected",
        "remedy": "Maintain vineyard hygiene, regular canopy management, and seasonal scouting.",
        "region": "All viticulture regions",
        "season": "All seasons",
        "severity": "None",
    },
}

# ── Image preprocessing ──────────────────────────────────────
def preprocess(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = arr / 255.0          # normalize to [0, 1] — model has no Rescaling layer
    arr = np.expand_dims(arr, axis=0)  # shape: (1, 224, 224, 3)
    return arr

# ── Routes ───────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "model": "CropDiseaseCNN",
        "classes": num_classes,
        "img_size": IMG_SIZE,
    })

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Send image as multipart/form-data with key 'file'."}), 400

    f = request.files["file"]
    if f.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    try:
        img_bytes = f.read()
        arr = preprocess(img_bytes)

        preds = model.predict(arr, verbose=0)[0]  # shape: (15,)

        top3_idx = np.argsort(preds)[::-1][:3]
        results = []

        for rank, idx in enumerate(top3_idx):
            idx = int(idx)
            key = CLASS_NAMES[idx]
            conf = round(float(preds[idx]) * 100, 2)
            meta = METADATA.get(key, {
                "disease": key.replace("___", " — ").replace("_", " "),
                "cause": "Data not available",
                "remedy": "Consult a local agricultural extension officer",
                "region": "Not specified",
                "season": "Not specified",
                "severity": "Unknown",
            })
            results.append({
                "rank": rank + 1,
                "class_key": key,
                "confidence": conf,
                **meta,
            })

        return jsonify({
            "success": True,
            "prediction": results[0],
            "top3": results,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/classes", methods=["GET"])
def get_classes():
    return jsonify({"classes": CLASS_NAMES, "count": len(CLASS_NAMES)})

# ── Run ──────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5200, debug=True)