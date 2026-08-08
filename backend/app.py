from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib
import numpy as np
import google.generativeai as genai

api_key = os.getenv("GOOGLE_API_KEY", "AIzaSyA_GXbC5tLk9qR2kaDk7xu72Yb8se8VFOc")
genai.configure(api_key=api_key)


def load_ai_model():
    try:
        models = list(genai.list_models())
        available = [m.name for m in models]
        supported = [m.name for m in models if "generateContent" in getattr(m, "supported_generation_methods", [])]
        print("✅ Available AI models:", available[:20])
        print("✅ Discovered generateContent-compatible models:", supported[:10])

        if not supported:
            print("❌ No supported generateContent models found. Available models:", available[:20])
            return None

        model_name = supported[0]
        ai_model = genai.GenerativeModel(model_name)
        print("✅ Using AI model:", ai_model.model_name)
        return ai_model

    except Exception as e:
        print("❌ AI model discovery error:", e)
        return None


model_ai = load_ai_model()
app = Flask(__name__)
CORS(app)

# ---------- LOAD MODELS ----------
try:
    crop_model = joblib.load("models/crop_model.pkl")
    yield_model = joblib.load("models/yield_model.pkl")
    encoders = joblib.load("models/encoders.pkl")
    print("✅ Models loaded successfully")
except Exception as e:
    print("❌ Model loading error:", e)


# ---------- HOME ----------
@app.route("/")
def home():
    return "RealAgro Backend Running"


# ---------- YIELD PREDICTION ----------
@app.route("/predict-yield", methods=["POST"])
def predict_yield():
    try:
        data = request.json
        print("📥 Incoming:", data)

        # -------- INPUT --------
        crop = str(data.get("crop", "")).lower().strip()
        rainfall = float(data.get("rainfall", 0))
        temperature = float(data.get("temperature", 0))
        area = float(data.get("area", 1))

        # -------- VALIDATION --------
        if crop == "":
            return jsonify({"status": "error", "message": "Crop is required"})

        # -------- ENCODING --------
        if "crop" in encoders:
            if crop not in encoders["crop"].classes_:
                return jsonify({
                    "status": "error",
                    "message": f"Unknown crop: {crop}"
                })
            crop_encoded = encoders["crop"].transform([crop])[0]
        else:
            crop_encoded = 0

        # -------- FEATURE VECTOR --------
        features = np.array([[crop_encoded, rainfall, temperature, area]])
        print("📊 Features:", features)

        # -------- PREDICTION --------
        prediction = yield_model.predict(features)[0]

        return jsonify({
            "status": "success",
            "yield": float(prediction)
        })

    except Exception as e:
        print("❌ Yield error:", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        })


# ---------- CHATBOT API ----------
@app.route("/ask-ai", methods=["POST"])
def ask_ai():
    data = request.json or {}
    user_message = data.get("message", "")

    context = f"""
You are an expert agriculture assistant.

System Data:
Crop: {data.get('crop', 'unknown')}
Yield: {data.get('yield', 'unknown')}
Temperature: {data.get('temperature', 'unknown')}
Humidity: {data.get('humidity', 'unknown')}
Nitrogen: {data.get('nitrogen', 'unknown')}
Phosphorus: {data.get('phosphorus', 'unknown')}
Potassium: {data.get('potassium', 'unknown')}

User Question:
{user_message}

Answer only about agriculture.
Give practical advice.
"""

    if model_ai is None:
        error_message = (
            "AI service is unavailable. "
            "No compatible generateContent model could be loaded."
        )
        print("❌", error_message)
        return jsonify({
            "status": "error",
            "message": error_message,
        }), 503

    try:
        response = model_ai.generate_content(context)
        return jsonify({
            "status": "success",
            "reply": response.text,
        })
    except Exception as e:
        print("❌ AI error:", e)
        return jsonify({
            "status": "error",
            "message": "AI service error. Check the server logs.",
        }), 500


# ---------- RUN ----------
if __name__ == "__main__":
    app.run(debug=True, port=5000)