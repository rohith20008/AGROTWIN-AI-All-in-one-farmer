import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useState, useEffect } from "react";
import FarmScene from "../components/3d/FarmScene";

/* ---------- GLASS UI ---------- */
function GlassCard({ children, style }) {
  return (
    <div
      style={{
        position: "absolute",
        backdropFilter: "blur(12px)",
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(0,255,150,0.3)",
        borderRadius: "12px",
        padding: "12px 16px",
        color: "white",
        boxShadow: "0 0 20px rgba(0,255,150,0.2)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- POPUP ---------- */
function SensorPopup({ sensor }) {
  if (!sensor) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 30,
        right: 30,
        width: 300,
        background: "rgba(0,0,0,0.85)",
        padding: 20,
        borderRadius: 12,
        border: "2px solid #00ffcc",
        boxShadow: "0 0 30px rgba(0,255,200,0.6)",
        zIndex: 20,
      }}
    >
      <h2 style={{ color: "#00ffcc" }}>{sensor.name}</h2>
      <p><strong>Value:</strong> {sensor.value}</p>
      <p style={{ color: sensor.alert ? "red" : "#00ff99" }}>
        {sensor.alert ? "⚠ Alert" : "Normal"}
      </p>
    </div>
  );
}

/* ---------- DASHBOARD ---------- */
export default function Dashboard() {
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [sensors, setSensors] = useState([
    { name: "pH", value: 6.5, color: "#00ccff", pos: [-2, 0.3, 0] },
    { name: "Temp", value: 29, color: "#ffcc00", pos: [2, 0.3, 1] },
    { name: "TDS", value: 420, color: "#ff4444", pos: [0, 0.3, -2] },
    { name: "Moisture", value: 78, color: "#00ff99", pos: [1, 0.3, 2] },
  ]);

  /* ---------- LIVE DATA SIMULATION ---------- */
  useEffect(() => {
  const interval = setInterval(() => {
    setSensors((prev) =>
      prev.map((s) => {
        const baseValue = Number(s.value); // FIX: convert to number
        const newValue = baseValue + (Math.random() * 2 - 1);

        return {
          ...s,
          value: Number(newValue.toFixed(2)), // keep as number
          alert:
            s.name === "Temp"
              ? newValue > 32
              : s.name === "pH"
              ? newValue < 5.5 || newValue > 7.5
              : false,
        };
      })
    );
  }, 2000);

  return () => clearInterval(interval);
}, []);

  return (
    <div style={{ height: "100%", position: "relative" }}>
      
      {/* HEADER */}
      <GlassCard style={{ top: 20, left: 20 }}>
        <h2>3D Digital Twin</h2>
        <p style={{ fontSize: 12, color: "#aaa" }}>
          Real-time IoT Monitoring
        </p>
      </GlassCard>

      {/* STATUS */}
      <GlassCard style={{ top: 100, left: 20 }}>
        <p style={{ color: "#00ff99" }}>● System Active</p>
      </GlassCard>

      {/* POPUP */}
      <SensorPopup sensor={selectedSensor} />

      {/* 3D */}
      <Canvas camera={{ position: [6, 6, 6], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <pointLight position={[0, 5, 0]} intensity={2} color="#00ffcc" />

        <FarmScene
          sensors={sensors}
          onSensorClick={setSelectedSensor}
        />

        <Grid
          args={[20, 20]}
          cellColor="#00ffff"
          sectionColor="#00ff99"
        />

        <OrbitControls />
      </Canvas>
    </div>
  );
}