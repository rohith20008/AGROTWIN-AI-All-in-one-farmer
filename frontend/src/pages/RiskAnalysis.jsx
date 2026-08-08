import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ============================================================
   SENSOR DATA — replace with your real import
   ============================================================ */
const sensorData = {
  nitrogen: 0,
  phosphorus: 0,
  potassium: 0,
  ph: 0,
  turbidity: 0,
  temperature: 28,
  soilMoisture: 0,
  humidity: 0,
  rainfall: 12,
};

/* ============================================================
   RISK ENGINE
   ============================================================ */
function analyzeRisk() {
  const riskList = [];
  let score = 100;

  if (
    sensorData.nitrogen === 0 ||
    sensorData.phosphorus === 0 ||
    sensorData.potassium === 0
  ) {
    score -= 30;
    riskList.push({
      title: "Soil Nutrient Deficiency",
      level: "high",
      msg: `Essential NPK nutrients critically low`,
      sol: "Apply balanced NPK fertilizer immediately",
      param: "NPK",
    });
  }
  if (sensorData.ph > 8.5) {
    score -= 25;
    riskList.push({
      title: "Water pH Imbalance",
      level: "high",
      msg: `pH at ${sensorData.ph} — exceeds safe alkalinity threshold`,
      sol: "Deploy pH neutralizer or elemental sulfur amendment",
      param: "pH",
    });
  }
  if (sensorData.turbidity > 1000) {
    score -= 20;
    riskList.push({
      title: "Water Contamination Detected",
      level: "medium",
      msg: `Turbidity ${sensorData.turbidity} NTU — contamination elevated`,
      sol: "Pre-filter irrigation water; install sediment trap",
      param: "NTU",
    });
  }
  if (sensorData.temperature > 30) {
    score -= 10;
    riskList.push({
      title: "Thermal Stress Condition",
      level: "medium",
      msg: `Ambient ${sensorData.temperature}°C exceeds optimal crop range`,
      sol: "Schedule irrigation during pre-dawn hours",
      param: "TEMP",
    });
  }
  if (sensorData.soilMoisture === 0) {
    score -= 15;
    riskList.push({
      title: "Critical Soil Drought",
      level: "high",
      msg: "Zero moisture detected in root zone",
      sol: "Initiate emergency drip irrigation protocol",
      param: "H2O",
    });
  }

  return { riskList, score: Math.max(0, score) };
}

/* ============================================================
   HELPERS
   ============================================================ */
const SENSOR_DEFS = [
  { key: "nitrogen",    label: "NITROGEN",   unit: "mg/kg", max: 100, warn: (v) => v < 20 ? "crit" : v < 50 ? "warn" : "ok" },
  { key: "phosphorus",  label: "PHOSPHORUS", unit: "mg/kg", max: 100, warn: (v) => v < 10 ? "crit" : v < 30 ? "warn" : "ok" },
  { key: "potassium",   label: "POTASSIUM",  unit: "mg/kg", max: 150, warn: (v) => v < 20 ? "crit" : v < 60 ? "warn" : "ok" },
  { key: "ph",          label: "SOIL pH",    unit: "pH",    max: 14,  warn: (v) => v > 8.5 || v < 5.5 ? "crit" : v > 7.5 ? "warn" : "ok" },
  { key: "turbidity",   label: "TURBIDITY",  unit: "NTU",   max: 2000,warn: (v) => v > 1000 ? "crit" : v > 500 ? "warn" : "ok" },
  { key: "temperature", label: "TEMP",       unit: "°C",    max: 50,  warn: (v) => v > 35 ? "crit" : v > 30 ? "warn" : "ok" },
];

const RADAR_AXES = ["NPK", "pH", "TURB", "TEMP", "H2O", "HUM"];

function getRadarValues() {
  return {
    NPK:  Math.min(1, (sensorData.nitrogen + sensorData.phosphorus + sensorData.potassium) / 180),
    pH:   sensorData.ph > 8.5 ? 0.85 : sensorData.ph > 7 ? 0.5 : 0.2,
    TURB: Math.min(1, sensorData.turbidity / 1500),
    TEMP: Math.min(1, sensorData.temperature / 45),
    H2O:  sensorData.soilMoisture === 0 ? 0.05 : Math.min(1, sensorData.soilMoisture / 100),
    HUM:  Math.min(1, sensorData.humidity / 100),
  };
}

const CROPS = [
  { name: "RICE",   base: 80 },
  { name: "WHEAT",  base: 65 },
  { name: "MAIZE",  base: 72 },
  { name: "COTTON", base: 55 },
];

function scoreColor(s) {
  return s > 70 ? "#00ff41" : s > 40 ? "#ffaa00" : "#ff2222";
}
function levelColor(l) {
  return l === "high" ? "#ff2222" : l === "medium" ? "#ffaa00" : "#00ff41";
}
function stColor(st) {
  return st === "ok" ? "#00ff41" : st === "warn" ? "#ffaa00" : "#ff2222";
}

/* ============================================================
   MATRIX BACKGROUND CANVAS
   ============================================================ */
function MatrixCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const chars = "01アイウNPKpH⚡∇Ω";
    let drops;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drops = Array(Math.floor(canvas.width / 18)).fill(1);
    }
    function draw() {
      ctx.fillStyle = "rgba(2,10,4,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#003a0e";
      ctx.font = "12px monospace";
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * 18, y * 18);
        if (y * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      animId = requestAnimationFrame(draw);
    }
    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}

/* ============================================================
   SCAN LINE OVERLAY
   ============================================================ */
const ScanLines = () => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 999, pointerEvents: "none",
    background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)",
  }} />
);

/* ============================================================
   CORNER DECORATION
   ============================================================ */
const Corners = () => (
  <>
    {[["tl","1px 0 0 1px","0 auto auto 0"],["tr","1px 1px 0 0","0 0 auto auto"],
      ["bl","0 0 1px 1px","auto auto 0 0"],["br","0 1px 1px 0","auto 0 0 auto"]].map(([k,bw,p]) => (
      <div key={k} style={{
        position:"absolute", width:16, height:16,
        borderColor:"rgba(0,255,65,0.6)", borderStyle:"solid", borderWidth:bw,
        inset: p.replace(/auto/g,"0").split(" ").map((v,i)=>p.split(" ")[i]).join(" "),
        top: k.includes("t") ? 0 : "auto", bottom: k.includes("b") ? 0 : "auto",
        left: k.includes("l") ? 0 : "auto", right: k.includes("r") ? 0 : "auto",
      }}/>
    ))}
  </>
);

/* ============================================================
   PANEL WRAPPER
   ============================================================ */
function Panel({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(0,20,5,0.85)",
      border: "1px solid rgba(0,255,65,0.25)",
      borderRadius: 4,
      position: "relative",
      overflow: "hidden",
      ...style,
    }}>
      <Corners />
      {children}
    </div>
  );
}

/* ============================================================
   SECTION TITLE
   ============================================================ */
function SecTitle({ children }) {
  return (
    <div style={{
      fontFamily: "'Orbitron',sans-serif", fontSize: 10, letterSpacing: 3,
      color: "#006620", marginBottom: 14,
      borderLeft: "2px solid #00ff41", paddingLeft: 10,
    }}>
      {children}
    </div>
  );
}

/* ============================================================
   SCORE RING
   ============================================================ */
function ScoreRing({ score }) {
  const [displayed, setDisplayed] = useState(0);
  const CIRC = 351.86;
  const offset = CIRC - (score / 100) * CIRC;
  const color = scoreColor(score);

  useEffect(() => {
    let cur = 0;
    const inc = score / 60;
    const iv = setInterval(() => {
      cur = Math.min(cur + inc, score);
      setDisplayed(Math.round(cur));
      if (cur >= score) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [score]);

  const verdict = score > 70 ? "LOW RISK" : score > 40 ? "MODERATE RISK" : "CRITICAL RISK";

  return (
    <Panel style={{ flex: "0 0 200px", display: "flex", flexDirection: "column", alignItems: "center", padding: 20 }}>
      {/* grid lines */}
      <div style={{ position:"absolute", inset:0, background:"repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(0,255,65,0.02) 20px,rgba(0,255,65,0.02) 21px)" }}/>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={56} fill="none" stroke="#001a06" strokeWidth={10}/>
        <motion.circle
          cx={70} cy={70} r={56}
          fill="none" strokeWidth={10} strokeLinecap="round"
          stroke={color}
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: [0.4, 0, 0.2, 1], delay: 0.4 }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "70px 70px" }}
        />
        <text x={70} y={62} textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily:"'Orbitron',sans-serif", fontSize:32, fontWeight:900, fill:color }}>
          {displayed}
        </text>
        <text x={70} y={86} textAnchor="middle"
          style={{ fontSize:9, fill:"#006620", letterSpacing:3 }}>
          RISK SCORE
        </text>
        <text x={70} y={100} textAnchor="middle"
          style={{ fontSize:8, fill:"#004d12", letterSpacing:2 }}>
          / 100
        </text>
      </svg>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        style={{
          marginTop: 10, fontFamily:"'Orbitron',sans-serif", fontSize:9,
          letterSpacing:2, color, padding:"4px 10px", borderRadius:2,
          border:`1px solid ${color}44`, background:`${color}0d`,
        }}
      >
        {verdict}
      </motion.div>
    </Panel>
  );
}

/* ============================================================
   SENSOR NODE
   ============================================================ */
function SensorNode({ def, delay }) {
  const v = sensorData[def.key];
  const st = def.warn(v);
  const pct = Math.min(100, (v / def.max) * 100);
  const color = stColor(st);
  const sparkData = Array.from({ length: 8 }, () =>
    Math.max(10, Math.min(100, pct + (Math.random() - 0.5) * 30))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        background: "rgba(0,20,5,0.85)",
        border: "1px solid rgba(0,255,65,0.18)",
        borderRadius: 4, padding: "12px 14px",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* bottom bar */}
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.3 }}
        style={{ position:"absolute", bottom:0, left:0, height:2, background:color, borderRadius:0 }}
      />
      <div style={{ fontSize:9, letterSpacing:2, color:"#006620", marginBottom:4 }}>{def.label}</div>
      <div>
        <span style={{ fontFamily:"'Orbitron',sans-serif", fontSize:18, fontWeight:700, color }}>{v}</span>
        <span style={{ fontSize:10, color:"#006620", marginLeft:4 }}>{def.unit}</span>
      </div>
      <div style={{ fontSize:9, letterSpacing:1, color, marginTop:2 }}>
        {st === "ok" ? "NOMINAL" : st === "warn" ? "WARNING" : "CRITICAL"}
      </div>
      <div style={{ marginTop:6, height:24, display:"flex", alignItems:"flex-end", gap:2 }}>
        {sparkData.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: delay + 0.5 + i * 0.05, duration: 0.4 }}
            style={{ flex:1, background: st==="crit"?"rgba(255,34,34,0.35)":st==="warn"?"rgba(255,170,0,0.35)":"rgba(0,255,65,0.3)", borderRadius:1 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ============================================================
   RISK ROW
   ============================================================ */
function RiskRow({ risk, index }) {
  const color = levelColor(risk.level);
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 + index * 0.15, duration: 0.5 }}
      style={{
        display:"flex", alignItems:"center", gap:12,
        padding:"10px 12px", marginBottom:10,
        border:`1px solid rgba(${risk.level==="high"?"255,34,34":risk.level==="medium"?"255,170,0":"0,255,65"},0.15)`,
        borderRadius:3, position:"relative", overflow:"hidden",
      }}
    >
      {/* left accent */}
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:color }}/>
      {/* scan animation */}
      <motion.div
        animate={{ left: ["-60px","105%"] }}
        transition={{ duration: 3, repeat: Infinity, ease:"linear", delay: index*0.5 }}
        style={{ position:"absolute", top:0, bottom:0, width:60, background:"linear-gradient(90deg,transparent,rgba(0,255,65,0.06),transparent)", pointerEvents:"none" }}
      />
      <div style={{ fontSize:16, flexShrink:0 }}>⚠</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:12, fontWeight:600, letterSpacing:1, color, marginBottom:2 }}>
          {risk.title}
        </div>
        <div style={{ fontSize:10, color:"#006620" }}>{risk.msg}</div>
        <div style={{ fontSize:10, color:"#aaff77", marginTop:2 }}>// SOL: {risk.sol}</div>
      </div>
      <div style={{
        fontFamily:"'Orbitron',sans-serif", fontSize:8, letterSpacing:1,
        padding:"3px 8px", borderRadius:2, whiteSpace:"nowrap",
        background:`rgba(${risk.level==="high"?"255,34,34":risk.level==="medium"?"255,170,0":"0,255,65"},0.12)`,
        color, border:`1px solid ${color}44`,
      }}>
        {risk.level.toUpperCase()}
      </div>
    </motion.div>
  );
}

/* ============================================================
   RADAR
   ============================================================ */
function RadarChart() {
  const cx = 100, cy = 95, r = 68;
  const values = getRadarValues();

  const polygonPoints = (factor) =>
    RADAR_AXES.map((_, i) => {
      const a = (i / RADAR_AXES.length) * Math.PI * 2 - Math.PI / 2;
      return `${cx + Math.cos(a) * r * factor},${cy + Math.sin(a) * r * factor}`;
    }).join(" ");

  const dataPoints = RADAR_AXES.map((ax, i) => {
    const a = (i / RADAR_AXES.length) * Math.PI * 2 - Math.PI / 2;
    const v = values[ax];
    return `${cx + Math.cos(a) * r * v},${cy + Math.sin(a) * r * v}`;
  }).join(" ");

  return (
    <svg width="100%" height={180} viewBox="0 0 200 180">
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <polygon key={i} points={polygonPoints(f)} fill="none" stroke="rgba(0,255,65,0.1)" strokeWidth={0.5}/>
      ))}
      {RADAR_AXES.map((ax, i) => {
        const a = (i / RADAR_AXES.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <g key={ax}>
            <line x1={cx} y1={cy} x2={cx + Math.cos(a)*r} y2={cy + Math.sin(a)*r}
              stroke="rgba(0,255,65,0.2)" strokeWidth={0.5}/>
            <text x={cx + Math.cos(a)*(r+16)} y={cy + Math.sin(a)*(r+16)}
              textAnchor="middle" dominantBaseline="middle"
              style={{ fill:"#006620", fontSize:8, fontFamily:"monospace" }}>
              {ax}
            </text>
          </g>
        );
      })}
      <motion.polygon
        points={dataPoints}
        fill="rgba(255,34,34,0.12)" stroke="#ff3333" strokeWidth={1.5} strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {RADAR_AXES.map((ax, i) => {
        const a = (i / RADAR_AXES.length) * Math.PI * 2 - Math.PI / 2;
        const v = values[ax];
        const color = v > 0.7 ? "#ff2222" : v > 0.4 ? "#ffaa00" : "#00ff41";
        return (
          <motion.circle key={ax}
            cx={cx + Math.cos(a)*r*v} cy={cy + Math.sin(a)*r*v} r={3}
            fill={color} stroke="#020a04" strokeWidth={1}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.2 + i * 0.08 }}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={3} fill="#00ff41" opacity={0.5}/>
    </svg>
  );
}

/* ============================================================
   CROP VIABILITY BARS
   ============================================================ */
function CropBars({ score }) {
  return (
    <div>
      {CROPS.map((c, i) => {
        const pct = Math.round(c.base * (score / 100));
        const color = pct > 60 ? "#00ff41" : pct > 35 ? "#ffaa00" : "#ff2222";
        return (
          <div key={c.name} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ fontSize:10, letterSpacing:1, width:60, flexShrink:0, fontFamily:"'Rajdhani',sans-serif", color:"#006620" }}>
              {c.name}
            </div>
            <div style={{ flex:1, height:6, background:"#001a06", borderRadius:3, overflow:"hidden" }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 2, ease:"easeOut", delay: 1 + i*0.15 }}
                style={{ height:"100%", background:color, borderRadius:3 }}
              />
            </div>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, color, width:34, textAlign:"right" }}>
              {pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   AI DECISION PANEL
   ============================================================ */
function AIDecision({ score }) {
  let msg, rec;
  const color = scoreColor(score);
  if (score > 70) {
    msg = "FIELD STATUS: STABLE. Low-risk conditions detected. Routine monitoring protocol active.";
    rec = "Continue standard irrigation schedule. Next full scan in 24h.";
  } else if (score > 40) {
    msg = "FIELD STATUS: ELEVATED THREAT. Multiple moderate anomalies detected. Human intervention advised within 48h.";
    rec = "Prioritize pH correction and turbidity filtration. Monitor temperature variance closely.";
  } else {
    msg = "FIELD STATUS: CRITICAL. Compound threat matrix active. Immediate intervention required to prevent crop loss.";
    rec = "URGENT: Deploy emergency NPK + irrigation + pH correction simultaneously. Alert field team now.";
  }

  return (
    <Panel style={{ padding: 16, marginBottom: 16 }}>
      {/* animated top sweep */}
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease:"linear" }}
        style={{ position:"absolute", top:0, left:0, right:0, height:1,
          background:"linear-gradient(90deg,transparent,#00ff41,transparent)" }}
      />
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:9, letterSpacing:3, color:"#006620", marginBottom:8 }}>
        AI FIELD COMMANDER // DECISION OUTPUT
      </div>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:14, fontWeight:600, letterSpacing:1, color, lineHeight:1.5 }}
      >
        {msg}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        style={{ fontSize:11, color:"#aaff77", marginTop:8, paddingLeft:10, borderLeft:"1px solid #00ff41" }}
      >
        // RECOMMENDED ACTION: {rec}
      </motion.div>
    </Panel>
  );
}

/* ============================================================
   CLOCK WIDGET
   ============================================================ */
function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setTime([n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>String(v).padStart(2,"0")).join(":"));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);
  return <span>{time}</span>;
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function RiskAnalysis() {
  const { riskList, score } = analyzeRisk();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020a04",
      color: "#00ff41",
      fontFamily: "'Share Tech Mono', monospace",
      position: "relative",
      overflowX: "hidden",
    }}>
      {/* Load Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse-dot { 0%,100%{box-shadow:0 0 0 0 #00ff4155} 50%{box-shadow:0 0 0 6px transparent} }
        @keyframes glitch { 0%,90%,100%{transform:none;filter:none} 92%{transform:translate(-2px,0);filter:hue-rotate(90deg)} 94%{transform:translate(2px,0);filter:none} 96%{transform:none;filter:hue-rotate(-90deg)} }
      `}</style>

      <MatrixCanvas />
      <ScanLines />

      <div style={{ position:"relative", zIndex:1, padding:16, maxWidth:900, margin:"0 auto" }}>

        {/* HEADER */}
        <motion.div
          initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          style={{ textAlign:"center", paddingBottom:12, animation:"glitch 8s infinite" }}
        >
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:10, letterSpacing:6, color:"#004d12", marginBottom:6 }}>
            AGRI-OS v4.7 // FIELD INTELLIGENCE NETWORK
          </div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:28, fontWeight:900, letterSpacing:2, color:"#00ff41", textShadow:"0 0 20px #00ff4133" }}>
            RISK ANALYSIS SYSTEM
          </div>
          <div style={{ fontSize:10, color:"#004d12", letterSpacing:4, marginTop:4 }}>
            MULTI-FACTOR AGRICULTURAL THREAT ASSESSMENT
          </div>
          <div style={{ height:1, background:"linear-gradient(90deg,transparent,#00ff41,transparent)", margin:"14px 0" }}/>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:10, color:"#006620", letterSpacing:1 }}>
            <span>
              <span style={{ display:"inline-block", width:7, height:7, borderRadius:"50%", background:"#00ff41", marginRight:6, animation:"pulse-dot 1.5s ease-in-out infinite", verticalAlign:"middle" }}/>
              LIVE FEED ACTIVE
            </span>
            <span style={{ fontFamily:"'Orbitron',sans-serif" }}><LiveClock /></span>
            <span>NODE ID: FLD-007-CHN</span>
          </div>
        </motion.div>

        {/* SCORE RING + SENSOR GRID */}
        <div style={{ display:"flex", gap:16, marginBottom:16 }}>
          {mounted && <ScoreRing score={score} />}
          <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {SENSOR_DEFS.map((def, i) => (
              <SensorNode key={def.key} def={def} delay={i * 0.08} />
            ))}
          </div>
        </div>

        {/* THREAT MATRIX */}
        <Panel style={{ padding:16, marginBottom:16 }}>
          <div style={{ position:"absolute", top:10, right:14, fontSize:9, letterSpacing:3, color:"rgba(0,255,65,0.1)", fontFamily:"'Orbitron',sans-serif" }}>
            THREAT MATRIX
          </div>
          <SecTitle>DETECTED THREATS</SecTitle>
          {riskList.length === 0 ? (
            <div style={{ fontSize:12, color:"#00ff41", textAlign:"center", padding:20, opacity:0.6 }}>
              NO THREATS DETECTED // ALL SYSTEMS NOMINAL
            </div>
          ) : (
            riskList.map((r, i) => <RiskRow key={i} risk={r} index={i}/>)
          )}
        </Panel>

        {/* RADAR + CROP VIABILITY */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
          <Panel style={{ padding:16 }}>
            <SecTitle>THREAT RADAR</SecTitle>
            <RadarChart />
          </Panel>
          <Panel style={{ padding:16 }}>
            <SecTitle>CROP VIABILITY INDEX</SecTitle>
            <CropBars score={score} />
            <div style={{ marginTop:14, fontSize:9, letterSpacing:1, color:"#004d12", borderTop:"1px solid rgba(0,255,65,0.1)", paddingTop:10 }}>
              VIABILITY FORECAST BASED ON CURRENT FIELD CONDITIONS
            </div>
          </Panel>
        </div>

        {/* AI DECISION */}
        <AIDecision score={score} />

        {/* FOOTER */}
        <div style={{ borderTop:"1px solid rgba(0,255,65,0.15)", paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:9, color:"#004d12", letterSpacing:1 }}>
          <span>AGRI-INTEL SYSTEM // FIELD UNIT ACTIVE</span>
          <span style={{ animation:"blink 1.2s step-end infinite" }}>UPLINK SECURED</span>
          <span>SYN: <LiveClock /></span>
        </div>

      </div>
    </div>
  );
}