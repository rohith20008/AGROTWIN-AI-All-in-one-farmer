from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

print("🚀 Starting Profit Backend...")

# LOAD MODEL (if exists)
try:
    model = joblib.load("models/yield_model.pkl")
    print("✅ ML Model Loaded")
except:
    model = None
    print("⚠️ Model not found, using dummy value")

@app.route("/")
def home():
    return "Profit API Running"

@app.route("/predict-profit", methods=["POST"])
def predict_profit():
    try:
        data = request.json

        crop = data.get("crop", "rice")
        area = float(data.get("area", 1))

        # 👉 ML or fallback
        if model:
            features = np.array([[70, 25, 6.5]])
            pred_prod = model.predict(features)[0]
        else:
            pred_prod = 4.5  # fallback

        price_per_kg = 20
        cost_per_hectare = 25000

        production_kg = pred_prod * 1000 * area
        total_cost = cost_per_hectare * area
        profit = (production_kg * price_per_kg) - total_cost

        return jsonify({
            "predicted_yield_tons": pred_prod,
            "production_kg": production_kg,
            "profit": profit
        })

    except Exception as e:
        return jsonify({"error": str(e)})

# 🔥 THIS IS THE CRITICAL PART
if __name__ == "__main__":
    print("🔥 Running Flask Server...")
    app.run(port=5002, debug=True)