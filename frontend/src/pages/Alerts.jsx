import React, { useEffect, useState } from "react";

export default function Alerts() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [aiMode, setAiMode] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [waterOn, setWaterOn] = useState(false);

  // FAKE API CALL
  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      setData({
        temperature: 28,
        soilMoisture: 0,
        ph: 18.12,
        tds: 0,
        turbidity: 3000,
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        waterNeeded: true,
      });

      setLoading(false);
    }, 10000);
  }, []);

  // ALERT GENERATION
  const generateAlerts = () => {
    if (!data) return [];

    const alerts = [];

    if (data.temperature > 35) {
      alerts.push({ type: "high", message: "High temperature detected. Risk to crops." });
    } else if (data.temperature < 10) {
      alerts.push({ type: "medium", message: "Low temperature detected. Growth may slow." });
    }

    if (data.soilMoisture < 20) {
      alerts.push({ type: "critical", message: "Soil moisture extremely low. Irrigation required." });
    }

    if (data.ph > 8.5) {
      alerts.push({ type: "critical", message: "Soil is highly alkaline. Immediate correction required." });
    } else if (data.ph < 5.5) {
      alerts.push({ type: "critical", message: "Soil is highly acidic. Immediate correction required." });
    }

    if (data.tds === 0) {
      alerts.push({ type: "medium", message: "No dissolved solids detected. Nutrient deficiency possible." });
    }

    if (data.turbidity > 1000) {
      alerts.push({ type: "critical", message: "Water turbidity is extremely high. Unsafe for irrigation." });
    }

    if (data.nitrogen === 0) {
      alerts.push({ type: "medium", message: "Nitrogen level is zero. Add nitrogen fertilizers." });
    }

    if (data.phosphorus === 0) {
      alerts.push({ type: "medium", message: "Phosphorus level is zero. Add phosphorus fertilizers." });
    }

    if (data.potassium === 0) {
      alerts.push({ type: "medium", message: "Potassium level is zero. Add potassium fertilizers." });
    }

    if (data.waterNeeded) {
      alerts.push({ type: "critical", message: "Immediate irrigation required." });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  const getStyle = (type) => {
    switch (type) {
      case "critical":
        return styles.critical;
      case "high":
        return styles.high;
      case "medium":
        return styles.medium;
      default:
        return styles.normal;
    }
  };

  // MODE SWITCH LOGIC
  const toggleAI = () => {
    setAiMode(true);
    setManualMode(false);
  };

  const toggleManual = () => {
    setManualMode(true);
    setAiMode(false);
  };

  const toggleWater = () => {
    setWaterOn(!waterOn);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>AGROTWIN AI - ALERT SYSTEM</h1>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.loader}>Fetching live sensor data...</div>
        ) : alerts.length === 0 ? (
          <div style={styles.safeBox}>All conditions are within safe limits.</div>
        ) : (
          alerts.map((alert, index) => (
            <div key={index} style={{ ...styles.alertBox, ...getStyle(alert.type) }}>
              <div style={styles.alertType}>{alert.type.toUpperCase()}</div>
              <div>{alert.message}</div>
            </div>
          ))
        )}
      </div>

      {/* AUTOMATION SECTION */}
      <div style={styles.controlPanel}>
        <h2 style={styles.subTitle}>Water Supply Control</h2>

        <div style={styles.buttonRow}>
          <button
            style={aiMode ? styles.activeBtn : styles.btn}
            onClick={toggleAI}
          >
            AI Mode
          </button>

          <button
            style={manualMode ? styles.activeBtn : styles.btn}
            onClick={toggleManual}
          >
            Manual Mode
          </button>
        </div>

        {manualMode && (
          <div style={styles.manualControl}>
            <button
              style={waterOn ? styles.stopBtn : styles.startBtn}
              onClick={toggleWater}
            >
              {waterOn ? "Stop Water Supply" : "Start Water Supply"}
            </button>
          </div>
        )}

        {aiMode && (
          <div style={styles.aiStatus}>
            AI system monitoring conditions and controlling irrigation automatically.
          </div>
        )}
      </div>
    </div>
  );
}

// STYLES
const styles = {
  container: {
    backgroundColor: "#0f172a",
    minHeight: "100vh",
    padding: "40px",
    color: "#ffffff",
    fontFamily: "Segoe UI, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "28px",
  },
  subTitle: {
    marginBottom: "15px",
  },
  card: {
    maxWidth: "750px",
    margin: "0 auto",
    backgroundColor: "#1e293b",
    padding: "25px",
    borderRadius: "12px",
  },
  loader: {
    textAlign: "center",
    padding: "20px",
    color: "#38bdf8",
  },
  alertBox: {
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "12px",
    borderLeft: "6px solid",
  },
  alertType: {
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  critical: {
    backgroundColor: "#7f1d1d",
    borderColor: "#ef4444",
  },
  high: {
    backgroundColor: "#78350f",
    borderColor: "#f97316",
  },
  medium: {
    backgroundColor: "#1e3a8a",
    borderColor: "#3b82f6",
  },
  normal: {
    backgroundColor: "#065f46",
    borderColor: "#10b981",
  },
  safeBox: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#065f46",
    borderRadius: "8px",
  },
  controlPanel: {
    maxWidth: "750px",
    margin: "30px auto",
    backgroundColor: "#1e293b",
    padding: "25px",
    borderRadius: "12px",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  btn: {
    padding: "10px 15px",
    backgroundColor: "#334155",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    borderRadius: "6px",
  },
  activeBtn: {
    padding: "10px 15px",
    backgroundColor: "#2563eb",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    borderRadius: "6px",
  },
  manualControl: {
    marginTop: "10px",
  },
  startBtn: {
    padding: "12px 20px",
    backgroundColor: "#16a34a",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    borderRadius: "6px",
  },
  stopBtn: {
    padding: "12px 20px",
    backgroundColor: "#dc2626",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    borderRadius: "6px",
  },
  aiStatus: {
    marginTop: "10px",
    color: "#38bdf8",
  },
};