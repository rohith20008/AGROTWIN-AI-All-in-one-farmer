import { useState, useEffect } from "react";
import { motion } from "framer-motion";

/* ---------- THEME SYSTEM ---------- */
function getTheme(condition) {
  switch (condition) {
    case "Clear":
      return {
        bg: "linear-gradient(180deg, #1e3c2f, #0f1f17)",
        glow: "#6effa3",
        accent: "#ffd166",
        effect: "sun"
      };
    case "Rain":
      return {
        bg: "linear-gradient(180deg, #0f2027, #203a43, #2c5364)",
        glow: "#6bdcff",
        accent: "#3399ff",
        effect: "rain"
      };
    case "Clouds":
      return {
        bg: "linear-gradient(180deg, #2f3e46, #354f52)",
        glow: "#b7e4c7",
        accent: "#95d5b2",
        effect: "cloud"
      };
    default:
      return {
        bg: "linear-gradient(180deg, #0b0f0c, #1a2e22)",
        glow: "#00ff99",
        accent: "#66ffcc",
        effect: "default"
      };
  }
}

/* ---------- ICON ---------- */
function getIcon(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/* ---------- SUN EFFECT ---------- */
const SunEffect = () => {
  return (
    <motion.div
      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 3 }}
      style={{
        position: "absolute",
        top: "15%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "220px",
        height: "220px",
        borderRadius: "50%",
        background: "radial-gradient(circle, #ffd166, transparent)",
        filter: "blur(40px)"
      }}
    />
  );
};

/* ---------- RAIN EFFECT ---------- */
const RainEffect = () => {
  return (
    <div style={styles.rainContainer}>
      {[...Array(80)].map((_, i) => (
        <div key={i} style={styles.raindrop}></div>
      ))}
    </div>
  );
};

/* ---------- DAY CARD ---------- */
function DayCard({ day, glow }) {
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      style={{
        width: "160px",
        padding: "15px",
        borderRadius: "14px",
        background: "rgba(10, 25, 18, 0.6)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${glow}`,
        boxShadow: `0 0 20px ${glow}`,
        textAlign: "center"
      }}
    >
      <h4>{day.date}</h4>
      <img src={getIcon(day.icon)} alt="weather" />
      <h3>{day.temp}°C</h3>
      <p style={{ color: glow }}>{day.condition}</p>
      <p>💨 {day.wind}</p>
      <p>💧 {day.humidity}%</p>
    </motion.div>
  );
}

/* ---------- MAIN ---------- */
export default function Weather() {
  const [location, setLocation] = useState("");
  const [data, setData] = useState([]);
  const [theme, setTheme] = useState(getTheme("default"));

  async function fetchWeather() {
    if (!location) return alert("Enter location");

    const API_KEY = "a02c7068c6413fd64368a4c513d4abc1";

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${API_KEY}`
      );

      const json = await res.json();

      if (json.cod !== "200") {
        alert("City not found");
        return;
      }

      const daily = json.list.filter((_, i) => i % 8 === 0);

      const processed = daily.slice(0, 7).map((item) => ({
        date: new Date(item.dt * 1000).toLocaleDateString("en-IN", {
          weekday: "short"
        }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        condition: item.weather[0].main,
        wind: item.wind.speed,
        humidity: item.main.humidity
      }));

      setData(processed);

      if (processed.length > 0) {
        setTheme(getTheme(processed[0].condition));
      }

    } catch (err) {
      console.error(err);
      alert("Error fetching weather");
    }
  }

  return (
    <div style={{ ...styles.container, background: theme.bg }}>

      {/* FARM GRID OVERLAY */}
      <div style={styles.gridOverlay}></div>

      {/* EFFECTS */}
      {theme.effect === "rain" && <RainEffect />}
      {theme.effect === "sun" && <SunEffect />}

      {/* TITLE */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ textAlign: "center", color: theme.glow }}
      >
        🌿 WEATHER INTELLIGENCE SYSTEM
      </motion.h1>

      {/* INPUT */}
      <div style={styles.inputBox}>
        <input
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={styles.input}
        />

        <button onClick={fetchWeather} style={styles.button}>
          SCAN WEATHER
        </button>
      </div>
            {/* TERMINAL */}
      <div style={styles.terminal}>
        <h3 style={{ color: theme.glow }}>🌾 SYSTEM ANALYSIS</h3>
        <div style={styles.logBox}>
          {data.length === 0 && <p>Awaiting scan...</p>}
          {data.map((d, i) => (
            <p key={i}>
              [{i}] {d.date} → {d.condition} | {d.temp}°C | Wind {d.wind}
            </p>
          ))}
        </div>
      </div>

      {/* WEATHER GRID */}
      <div style={styles.grid}>
        {data.map((day, i) => (
          <DayCard key={i} day={day} glow={theme.glow} />
        ))}
      </div>

      {/* SUN PARTICLES */}
      {theme.effect === "sun" && (
        <div style={styles.particles}>
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -50, 0],
                opacity: [0.2, 1, 0.2]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.1
              }}
              style={{
                ...styles.particle,
                background: theme.accent
              }}
            />
          ))}
        </div>
      )}

    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  container: {
    minHeight: "100vh",
    color: "#d8ffe3",
    fontFamily: "monospace",
    padding: "30px",
    overflow: "hidden",
    position: "relative"
  },

  gridOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(rgba(0,255,150,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,150,0.05) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none"
  },

  inputBox: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px"
  },

  input: {
    padding: "12px",
    width: "300px",
    background: "#000",
    border: "1px solid #6effa3",
    color: "#6effa3",
    borderRadius: "6px"
  },

  button: {
    padding: "12px",
    marginLeft: "10px",
    background: "#6effa3",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    borderRadius: "6px"
  },

  grid: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
    marginTop: "40px"
  },

  terminal: {
    marginTop: "30px",
    border: "1px solid rgba(110,255,163,0.3)",
    padding: "15px",
    background: "rgba(0, 30, 20, 0.6)",
    backdropFilter: "blur(10px)"
  },

  logBox: {
    fontSize: "12px",
    height: "120px",
    overflowY: "auto"
  },

  rainContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    pointerEvents: "none"
  },

  raindrop: {
    width: "2px",
    height: "15px",
    background: "#6bdcff",
    position: "absolute",
    top: "-10px",
    animation: "rain 0.8s linear infinite"
  },

  particles: {
    position: "absolute",
    bottom: "0",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "15px"
  },

  particle: {
    width: "10px",
    height: "10px",
    borderRadius: "50%"
  }
};