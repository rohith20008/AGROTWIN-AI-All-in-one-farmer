import React, { useState, useEffect } from "react";

const SoilIntelligence = () => {
  const [crop, setCrop] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState([]);
  const [progress, setProgress] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [scanActive, setScanActive] = useState(false);

  const fullText = "SOIL INTELLIGENCE ENGINE v2.0 INITIALIZED";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const startPrediction = async () => {
    setLoading(true);
    setLogs([]);
    setResult([]);
    setProgress(0);
    setScanActive(true);

    const steps = [
      "[00] Booting Soil Intelligence Core...",
      "[01] Loading Crop Dataset...",
      "[02] Analyzing Soil Nutrients (NPK)...",
      "[03] Evaluating Environmental Conditions...",
      "[04] Running ML Fertilizer Model...",
      "[05] Ranking Optimal Fertilizers...",
      "[06] Computing Quantity & Cost...",
      "[07] Generating AI Insights..."
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, step]);
        setProgress((prev) => prev + 12);
      }, index * 500);
    });

    setTimeout(async () => {
      try {
        const res = await fetch("http://localhost:5900/predict-fertilizer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            crop: crop || "Maize",
            soil: "Loamy",
            N: 0,
            P: 0,
            K: 0,
            temperature: 28,
            humidity: 60,
            moisture: 40
          })
        });

        const data = await res.json();
        setResult(data || []);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
      setScanActive(false);
      setProgress(100);
    }, steps.length * 500 + 800);
  };

  const renderResults = () => {
    return result.map((item, index) => (
      <div key={index} style={styles.card}>
        <h3>#{index + 1} {item.fertilizer}</h3>
        <p>Confidence: {(item.confidence * 100).toFixed(0)}%</p>
        <p>Quantity: {item.quantity} kg/acre</p>
        <p>Reason: {item.reason}</p>
      </div>
    ));
  };

  return (
    <div style={styles.container}>
      <div style={styles.glow}></div>

      <h1 style={styles.title}>AGRO AI // SOIL INTELLIGENCE</h1>
      <p style={styles.typing}>{typedText}</p>

      <div style={styles.panel}>
        <h3 style={styles.subTitle}>INPUT</h3>

        <input
          style={styles.input}
          placeholder="Enter Crop Name"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        />

        <button style={styles.button} onClick={startPrediction}>
          RUN AI ANALYSIS
        </button>

        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
      </div>
      <div style={styles.terminal}>
        <h3 style={styles.subTitle}>AI TERMINAL</h3>
        <div style={styles.logBox}>
          {logs.map((log, i) => (
            <div key={i} style={styles.logLine}>
              {log}
            </div>
          ))}
          {loading && <div style={styles.blink}>█</div>}
        </div>
      </div>

      {scanActive && (
        <div style={styles.scanOverlay}>
          <div style={styles.scanLine}></div>
        </div>
      )}

      {result.length > 0 && (
        <div style={styles.resultSection}>
          <h2 style={styles.subTitle}>FERTILIZER RECOMMENDATIONS</h2>
          {renderResults()}
        </div>
      )}

      <div style={styles.footer}>
        Soil Intelligence Engine v2.0 | Nutrient Optimization Active
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: "#000",
    minHeight: "100vh",
    color: "#00ff9f",
    fontFamily: "monospace",
    padding: "20px",
    position: "relative",
    overflow: "hidden"
  },

  glow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "radial-gradient(circle, rgba(0,255,159,0.1), transparent)",
    top: 0,
    left: 0,
    pointerEvents: "none"
  },

  title: {
    textAlign: "center",
    fontSize: "28px",
    marginBottom: "10px"
  },

  typing: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#00ffaa"
  },

  panel: {
    border: "1px solid #00ff9f",
    padding: "20px",
    marginBottom: "20px"
  },

  subTitle: {
    marginBottom: "10px",
    color: "#00ffaa"
  },

  input: {
    width: "100%",
    padding: "10px",
    background: "#000",
    border: "1px solid #00ff9f",
    color: "#00ff9f",
    marginBottom: "10px"
  },

  button: {
    width: "100%",
    padding: "10px",
    background: "#00ff9f",
    color: "#000",
    border: "none",
    cursor: "pointer",
    marginBottom: "10px"
  },

  progressBar: {
    width: "100%",
    height: "5px",
    background: "#111"
  },

  progressFill: {
    height: "100%",
    background: "#00ff9f",
    transition: "width 0.5s"
  },

  terminal: {
    border: "1px solid #00ff9f",
    padding: "15px",
    marginBottom: "20px"
  },

  logBox: {
    height: "120px",
    overflowY: "auto",
    fontSize: "12px"
  },

  logLine: {
    marginBottom: "4px"
  },

  blink: {
    animation: "blink 1s infinite"
  },

  scanOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none"
  },

  scanLine: {
    width: "100%",
    height: "2px",
    background: "#00ff9f",
    position: "absolute",
    animation: "scan 2s linear infinite"
  },

  resultSection: {
    border: "1px solid #00ff9f",
    padding: "20px"
  },

  card: {
    border: "1px solid #00ffaa",
    padding: "10px",
    marginBottom: "10px"
  },

  footer: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "12px",
    opacity: 0.7
  }
};
export default SoilIntelligence;