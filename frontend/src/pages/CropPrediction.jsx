import React, { useState, useEffect } from "react";

const CropPrediction = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [scanActive, setScanActive] = useState(false);

  const fullText = "NEURAL AGRO MODEL v2.1 INITIALIZED";

  const fakeRanking = [
    { crop: "Banana", score: 0.96, profit: 120000, yield: "High" },
    { crop: "Turmeric", score: 0.93, profit: 110000, yield: "High" },
    { crop: "Rice", score: 0.90, profit: 80000, yield: "Stable" },
    { crop: "Sugarcane", score: 0.88, profit: 95000, yield: "Very High" },
    { crop: "Moringa", score: 0.85, profit: 105000, yield: "High" },
    { crop: "Onion", score: 0.82, profit: 90000, yield: "Variable" },
    { crop: "Chilli", score: 0.80, profit: 98000, yield: "High" },
    { crop: "Coconut", score: 0.78, profit: 85000, yield: "Long-term" },
    { crop: "Dragon Fruit", score: 0.75, profit: 130000, yield: "Premium" },
    { crop: "Aloe Vera", score: 0.72, profit: 70000, yield: "Moderate" },
    { crop: "Betel Leaf", score: 0.70, profit: 115000, yield: "Niche High" }
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const startPrediction = () => {
    setLoading(true);
    setLogs([]);
    setResult(null);
    setProgress(0);
    setScanActive(true);

    const steps = [
      "[00] Booting Agro Intelligence Core...",
      "[01] Loading Soil Data Matrix...",
      "[02] Syncing Atmospheric Sensors...",
      "[03] Running NPK Analysis...",
      "[04] Activating Yield Prediction Engine...",
      "[05] Calculating Market Profit Index...",
      "[06] Optimizing Crop Ranking Algorithm...",
      "[07] Finalizing Output Matrix..."
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, step]);
        setProgress((prev) => prev + 12);
      }, index * 600);
    });

    setTimeout(() => {
      setResult(fakeRanking);
      setLoading(false);
      setScanActive(false);
      setProgress(100);
    }, steps.length * 600 + 1000);
  };

  const renderBars = () => {
    if (!result) return null;

    return result.map((item, index) => (
      <div key={index} style={styles.barContainer}>
        <div style={styles.barLabel}>
          {item.crop} - ₹{item.profit.toLocaleString()}
        </div>
        <div style={styles.barBg}>
          <div
            style={{
              ...styles.barFill,
              width: `${item.score * 100}%`
            }}
          />
        </div>
      </div>
    ));
  };

  const renderTopCrop = () => {
    if (!result) return null;

    const top = result[0];

    return (
      <div style={styles.topCard}>
        <h2 style={styles.topTitle}>TOP RECOMMENDATION</h2>
        <h1 style={styles.cropName}>{top.crop}</h1>
        <p style={styles.stat}>Profit: ₹{top.profit.toLocaleString()} / acre</p>
        <p style={styles.stat}>Yield: {top.yield}</p>
        <p style={styles.stat}>
          Confidence: {(top.score * 100).toFixed(0)}%
        </p>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.glowOverlay}></div>

      <h1 style={styles.title}>AGRO AI // CROP PREDICTION</h1>
      <p style={styles.typing}>{typedText}</p>

      <div style={styles.panel}>
        <h3 style={styles.subTitle}>INPUT PARAMETERS</h3>

        <div style={styles.grid}>
          <Input label="Nitrogen" value="0" />
          <Input label="Phosphorus" value="0" />
          <Input label="Potassium" value="0" />
          <Input label="Temperature" value="28°C" />
          <Input label="Humidity" value="0%" />
          <Input label="pH" value="0" />
        </div>

        <button style={styles.button} onClick={startPrediction}>
          INITIATE AI SCAN
        </button>

        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress}%`
            }}
          />
        </div>
      </div>
      <div style={styles.terminal}>
        <h3 style={styles.subTitle}>AI ANALYSIS TERMINAL</h3>
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

      {result && (
        <div style={styles.resultSection}>
          {renderTopCrop()}

          <div style={styles.rankingBox}>
            <h3 style={styles.subTitle}>CROP RANKING MATRIX</h3>
            {renderBars()}
          </div>

          <div style={styles.aiInsight}>
            <h3 style={styles.subTitle}>AI INSIGHT</h3>
            <p>
              Environmental conditions favor high-yield crops with strong market demand.
              Profit optimization algorithm identified Banana and Turmeric as top-performing crops.
              Export potential and yield stability contributed to ranking score.
            </p>
          </div>
        </div>
      )}

      <div style={styles.footer}>
        Neural Agro Model v2.1 | Profit Optimization Engine Active
      </div>
    </div>
  );
};

const Input = ({ label, value }) => {
  return (
    <div style={styles.inputBox}>
      <label style={styles.label}>{label}</label>
      <input style={styles.input} value={value} readOnly />
    </div>
  );
};

const styles = {
  container: {
    background: "#000",
    minHeight: "100vh",
    color: "#0fe100",
    fontFamily: "monospace",
    padding: "20px",
    position: "relative",
    overflow: "hidden"
  },

  glowOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "radial-gradient(circle, rgba(0,255,159,0.1), transparent)",
    top: 0,
    left: 0,
    pointerEvents: "none"
  },

  title: {
    fontSize: "32px",
    textAlign: "center",
    marginBottom: "10px",
    letterSpacing: "2px"
  },

  typing: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#03a338"
  },

  panel: {
    border: "1px solid #d9c3f1",
    padding: "20px",
    marginBottom: "20px",
    background: "rgba(0,0,0,0.8)"
  },

  subTitle: {
    marginBottom: "10px",
    color: "#05f735"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: "20px"
  },

  inputBox: {
    display: "flex",
    flexDirection: "column"
  },

  label: {
    fontSize: "12px",
    marginBottom: "5px"
  },

  input: {
    background: "#000",
    border: "1px solid #08f02b",
    color: "#07dc31",
    padding: "5px"
  },

  button: {
    width: "100%",
    padding: "10px",
    background: "#00e031",
    color: "#000",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
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
    marginBottom: "20px",
    background: "#010101"
  },

  logBox: {
    height: "150px",
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
    padding: "20px",
    background: "rgba(0,0,0,0.9)"
  },

  topCard: {
    textAlign: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #00ff9f",
    paddingBottom: "10px"
  },

  topTitle: {
    color: "#00ffaa"
  },

  cropName: {
    fontSize: "36px",
    margin: "10px 0"
  },

  stat: {
    fontSize: "14px"
  },

  rankingBox: {
    marginBottom: "20px"
  },

  barContainer: {
    marginBottom: "10px"
  },

  barLabel: {
    fontSize: "12px",
    marginBottom: "3px"
  },

  barBg: {
    width: "100%",
    height: "8px",
    background: "#111"
  },

  barFill: {
    height: "100%",
    background: "#00ff9f",
    transition: "width 1s ease"
  },

  aiInsight: {
    fontSize: "13px",
    lineHeight: "1.5"
  },

  footer: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "12px",
    opacity: 0.7
  }
};
export default CropPrediction;