from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import re
import traceback
from google import genai

# ------------------ APP SETUP ------------------
app = Flask(__name__)
CORS(app)

# 🔐 PUT YOUR NEW GEMINI API KEY HERE
client = genai.Client(api_key="AIzaSyApHWxO0LcBeItnLlpEgRYCH3t5vSrm160")


# ------------------ HOME ------------------
@app.route("/")
def home():
    return "AI Agro Backend Running"


# ------------------ AI PROFIT API ------------------
@app.route("/ai-profit", methods=["POST"])
def ai_profit():
    try:
        data = request.json
        print("📥 Incoming:", data)

        crop = data.get("crop")
        location = data.get("location")
        land = float(data.get("land", 1))

        # 🔹 Sensor data (constant for now)
        temperature = 28
        soil_moisture = 0
        ph = 14
        nitrogen = 0
        phosphorus = 0
        potassium = 0

        prompt = f"""
You are an advanced Agricultural Intelligence System combining:
Agronomy, Soil Science, Climate Analysis, and Market Economics.

Farmer Location: {location}
Selected Crop: {crop}
Land Size: {land} acres

Sensor Data:
Temperature: {temperature}
Soil Moisture: {soil_moisture}
pH: {ph}
Nitrogen: {nitrogen}
Phosphorus: {phosphorus}
Potassium: {potassium}

Return STRICT JSON ONLY:

{{
  "economic_analysis": {{
    "total_revenue": number,
    "total_cost": number,
    "net_profit": number,
    "profit_margin_percent": number
  }},
  "risk_analysis": {{
    "disease_risks": [
      {{
        "name": "disease",
        "probability_percent": number,
        "prevention": "text"
      }}
    ]
  }},
  "recommendations": {{
    "better_crops_ranked": [
      {{
        "name": "crop",
        "expected_profit": number,
        "rank": number
      }}
    ]
  }},
  "chart_data": {{
    "profit_comparison": [
      {{"crop": "name", "profit": number}}
    ],
    "growth_timeline": [
      {{"stage": "stage", "days": number}}
    ]
  }}
}}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )

        ai_text = response.text
        print("🔍 RAW AI RESPONSE:\n", ai_text)

        # 🔥 CLEAN RESPONSE
        ai_text = ai_text.strip()
        ai_text = re.sub(r"```json|```", "", ai_text)

        match = re.search(r"\{.*\}", ai_text, re.DOTALL)

        if not match:
            return jsonify({
                "status": "error",
                "raw": ai_text
            }), 500

        json_text = match.group(0)
        parsed = json.loads(json_text)

        return jsonify(parsed)

    except Exception as e:
        print("🔥 ERROR START")
        traceback.print_exc()
        print("🔥 ERROR END")

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ------------------ RUN ------------------
if __name__ == "__main__":
    app.run(debug=True, port=5030)