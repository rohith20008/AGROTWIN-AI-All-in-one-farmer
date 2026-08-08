from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image

app = Flask(__name__)
CORS(app)

# LOAD PRETRAINED MODEL
model = tf.keras.applications.MobileNetV2(weights="imagenet")

# LABELS
decode_predictions = tf.keras.applications.mobilenet_v2.decode_predictions

@app.route("/")
def home():
    return "Pretrained Disease API Running"

@app.route("/predict-disease", methods=["POST"])
def predict_disease():
    try:
        file = request.files["image"]

        # PREPROCESS
        img = Image.open(file).convert("RGB")
        img = img.resize((224, 224))

        img = np.array(img)
        img = np.expand_dims(img, axis=0)
        img = tf.keras.applications.mobilenet_v2.preprocess_input(img)

        # PREDICT
        preds = model.predict(img)

        decoded = decode_predictions(preds, top=1)[0][0]

        label = decoded[1]
        confidence = float(decoded[2]) * 100

        # SIMPLE REMEDY LOGIC
        if "leaf" in label:
            remedy = "Possible leaf issue. Use fungicide or neem oil."
        elif "fungus" in label:
            remedy = "Apply antifungal treatment."
        else:
            remedy = "Monitor plant condition."

        return jsonify({
            "disease": label,
            "confidence": round(confidence, 2),
            "remedy": remedy
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(port=5001, debug=True)