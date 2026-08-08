import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from "recharts";

// ── Matrix Rain ──────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / 20);
    const drops = Array(cols).fill(1);
    const chars = "PROFITREVENUECOSTCROPYIELDSOILNPKMARKETPRICEHECTARE01RUPEE".split("");
    const interval = setInterval(() => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.98 ? "#afffaf" : "#00ff4133";
        ctx.font = "13px monospace";
        ctx.fillText(char, i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }, 50);
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { clearInterval(interval); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: 0, opacity: 0.35, pointerEvents: "none" }} />;
}

// ── Scanlines ────────────────────────────────────────────────
function Scanlines() {
  return <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)" }} />;
}

// ── HUD Corners ──────────────────────────────────────────────
function HUDCorners({ color = "#00ff41", size = 16 }) {
  const s = { position: "absolute", width: size, height: size, border: `1px solid ${color}` };
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderRight: "none", borderBottom: "none" }} />
      <div style={{ ...s, top: 0, right: 0, borderLeft: "none", borderBottom: "none" }} />
      <div style={{ ...s, bottom: 0, left: 0, borderRight: "none", borderTop: "none" }} />
      <div style={{ ...s, bottom: 0, right: 0, borderLeft: "none", borderTop: "none" }} />
    </>
  );
}

// ── Glitch Text ──────────────────────────────────────────────
function GlitchText({ text }) {
  return (
    <span className="glitch" data-text={text} style={{ position: "relative", display: "inline-block" }}>
      {text}
      <style>{`
        .glitch::before,.glitch::after{content:attr(data-text);position:absolute;top:0;left:0;width:100%;height:100%;}
        .glitch::before{color:#0ff;animation:gb 3s infinite;clip-path:polygon(0 30%,100% 30%,100% 50%,0 50%);}
        .glitch::after{color:#f0f;animation:ga 3s infinite;clip-path:polygon(0 65%,100% 65%,100% 80%,0 80%);}
        @keyframes gb{0%,88%,100%{transform:translate(0);opacity:0}89%{transform:translate(-3px,1px);opacity:1}91%{transform:translate(3px,-1px);opacity:1}93%{transform:translate(0);opacity:0}}
        @keyframes ga{0%,90%,100%{transform:translate(0);opacity:0}91%{transform:translate(3px,-2px);opacity:1}93%{transform:translate(-3px,1px);opacity:1}95%{transform:translate(0);opacity:0}}
      `}</style>
    </span>
  );
}

// ── Typewriter ───────────────────────────────────────────────
function Typewriter({ text, speed = 30 }) {
  const [d, setD] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setD(""); setDone(false); let i = 0;
    const t = setInterval(() => { setD(text.slice(0, i + 1)); i++; if (i >= text.length) { clearInterval(t); setDone(true); } }, speed);
    return () => clearInterval(t);
  }, [text]);
  return <span>{d}{!done && <span style={{ color: "#00ff41", animation: "blink 0.6s step-end infinite" }}>_</span>}</span>;
}

// ── Animated Counter ─────────────────────────────────────────
function Counter({ value, prefix = "₹", duration = 1500 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(String(value).replace(/[^0-9.-]/g, "")) || 0;
    const steps = 60;
    const increment = end / steps;
    let step = 0;
    const t = setInterval(() => {
      step++;
      start += increment;
      setDisplay(Math.round(start));
      if (step >= steps) { setDisplay(end); clearInterval(t); }
    }, duration / steps);
    return () => clearInterval(t);
  }, [value]);
  return <span>{prefix}{display.toLocaleString("en-IN")}</span>;
}

// ── HUD Input ────────────────────────────────────────────────
function HUDInput({ label, placeholder, value, onChange, type = "text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <div style={{ fontSize: "0.55rem", color: "#00ff4177", letterSpacing: "0.2em", marginBottom: "0.4rem" }}>{label}</div>
      <div style={{ position: "relative" }}>
        <HUDCorners color={focused ? "#00ff41" : "#00ff4133"} size={8} />
        <input
          type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "0.7rem 0.9rem",
            background: "#000", border: `1px solid ${focused ? "#00ff4166" : "#00ff4122"}`,
            color: "#00ff41", fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.8rem", outline: "none", borderRadius: 2,
            boxShadow: focused ? "0 0 15px #00ff4122" : "none",
            transition: "all 0.2s", boxSizing: "border-box",
            caretColor: "#00ff41",
          }}
        />
        {focused && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,#00ff41,transparent)", animation: "sweep 1.5s linear infinite" }} />}
      </div>
      <style>{`input::placeholder{color:#00ff4133}`}</style>
    </div>
  );
}

// ── Analyzing Animation ──────────────────────────────────────
function AnalyzingScreen() {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const lines = [
    "FETCHING MARKET PRICE DATABASE...",
    "COMPUTING YIELD PER HECTARE...",
    "RUNNING ECONOMIC SIMULATION...",
    "ANALYZING DISEASE RISK VECTORS...",
    "EVALUATING ALTERNATIVE CROPS...",
    "GENERATING PROFIT FORECAST...",
    "COMPILING INTELLIGENCE REPORT...",
  ];
  useEffect(() => {
    let i = 0;
    const lt = setInterval(() => { if (i < lines.length) { setLogs(p => [...p, lines[i]]); i++; } }, 350);
    const pt = setInterval(() => setProgress(p => Math.min(p + Math.random() * 5, 97)), 100);
    return () => { clearInterval(lt); clearInterval(pt); };
  }, []);
  return (
    <div style={{ padding: "2rem 0", animation: "fadeIn 0.4s ease" }}>
      {/* Radar */}
      <div style={{ width: 120, height: 120, margin: "0 auto 1.5rem", position: "relative" }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ position: "absolute", inset: i * 18, border: "1px solid #00ff41", borderRadius: "50%", opacity: 0.6 - i * 0.15, animation: `radarPing 2s ease-out ${i * 0.4}s infinite` }} />
        ))}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}>
          <div style={{ width: "100%", height: "100%", animation: "radarSweep 2s linear infinite", background: "conic-gradient(#00ff4133 0deg, transparent 90deg, transparent 360deg)" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", color: "#00ff41", letterSpacing: "0.1em" }}>
          {Math.round(progress)}%
        </div>
      </div>
      {/* Log terminal */}
      <div style={{ background: "#000", border: "1px solid #00ff4122", padding: "1rem", borderRadius: 2, maxHeight: 160, overflow: "hidden", position: "relative" }}>
        <HUDCorners color="#00ff4133" size={10} />
        {logs.map((l, i) => (
          <div key={i} style={{ fontSize: "0.65rem", color: i === logs.length - 1 ? "#00ff41" : "#00ff4155", marginBottom: "0.3rem", animation: "slideIn 0.3s ease", letterSpacing: "0.05em" }}>
            {">"} {l}
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.55rem", color: "#00ff4166", marginBottom: "0.35rem", letterSpacing: "0.1em" }}>
          <span>ANALYSIS PROGRESS</span><span>{Math.round(progress)}%</span>
        </div>
        <div style={{ background: "#0a0a0a", border: "1px solid #00ff4111", height: 5, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#00ff4144,#00ff41)", transition: "width 0.1s linear", boxShadow: "0 0 8px #00ff41" }} />
        </div>
      </div>
      <style>{`
        @keyframes radarPing{0%,100%{opacity:0.6}50%{opacity:0.2}}
        @keyframes radarSweep{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
      `}</style>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, color = "#00ff41", prefix = "₹", delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "relative", padding: "1.2rem", background: "#000",
      border: `1px solid ${color}33`, flex: 1,
      opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(16px)",
      transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
      boxShadow: `0 0 20px ${color}11`,
    }}>
      <HUDCorners color={`${color}66`} size={10} />
      <div style={{ fontSize: "0.55rem", color: `${color}88`, letterSpacing: "0.2em", marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ fontSize: "1.4rem", fontWeight: 900, color, fontFamily: "'Orbitron', monospace", lineHeight: 1 }}>
        {visible && <Counter value={value} prefix={prefix} />}
      </div>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#000", border: "1px solid #00ff4166", padding: "0.6rem 0.9rem", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.7rem" }}>
      <div style={{ color: "#00ff4188", marginBottom: "0.3rem" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>₹{Number(p.value).toLocaleString("en-IN")}</div>
      ))}
    </div>
  );
}

// ── Disease Risk Card ────────────────────────────────────────
function DiseaseCard({ d, index }) {
  const [visible, setVisible] = useState(false);
  const [barW, setBarW] = useState(0);
  const pct = d.probability_percent || 0;
  const color = pct > 60 ? "#ff2200" : pct > 30 ? "#ffaa00" : "#00ff41";
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), index * 150);
    const t2 = setTimeout(() => setBarW(pct), index * 150 + 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div style={{
      position: "relative", padding: "1rem 1.2rem", background: "#000",
      border: `1px solid ${color}33`, marginBottom: "0.75rem",
      opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(-16px)",
      transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <HUDCorners color={`${color}55`} size={10} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
        <div>
          <span style={{ background: `${color}22`, border: `1px solid ${color}55`, color, fontSize: "0.6rem", padding: "2px 8px", letterSpacing: "0.1em", marginRight: "0.5rem" }}>
            {pct > 60 ? "HIGH RISK" : pct > 30 ? "MODERATE" : "LOW RISK"}
          </span>
          <div style={{ color: "#ccc", fontSize: "0.85rem", fontWeight: 700, marginTop: "0.4rem" }}>{d.name?.toUpperCase()}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, color, fontFamily: "'Orbitron', monospace", lineHeight: 1 }}>{pct}<span style={{ fontSize: "0.7rem" }}>%</span></div>
          <div style={{ fontSize: "0.5rem", color: `${color}88`, letterSpacing: "0.1em" }}>PROBABILITY</div>
        </div>
      </div>
      <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", height: 5, borderRadius: 2, overflow: "hidden", marginBottom: "0.75rem" }}>
        <div style={{ height: "100%", width: `${barW}%`, background: `linear-gradient(90deg,${color}55,${color})`, transition: "width 1s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 8px ${color}` }} />
      </div>
      <div style={{ fontSize: "0.7rem", color: "#888", lineHeight: 1.5 }}>{d.prevention}</div>
    </div>
  );
}

// ── Crop Alternative Card ────────────────────────────────────
function AltCropCard({ c, index }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), index * 120 + 200); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "relative", padding: "0.9rem 1.1rem", background: "#000",
      border: "1px solid #00ff4122", marginBottom: "0.5rem",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(16px)",
      transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <HUDCorners color="#00ff4133" size={8} />
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{
          width: 28, height: 28, border: "1px solid #00ff4166",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.7rem", color: "#00ff41", fontFamily: "'Orbitron', monospace", fontWeight: 900,
        }}>#{c.rank}</div>
        <div style={{ color: "#ccc", fontSize: "0.82rem" }}>{c.name?.toUpperCase()}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ color: "#00ff41", fontFamily: "'Orbitron', monospace", fontSize: "0.9rem", fontWeight: 700 }}>
          ₹{Number(c.expected_profit).toLocaleString("en-IN")}
        </div>
        <div style={{ fontSize: "0.5rem", color: "#00ff4166", letterSpacing: "0.1em" }}>EXPECTED PROFIT</div>
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────
function SectionHeader({ label, sub }) {
  return (
    <div style={{ marginBottom: "1rem", paddingBottom: "0.6rem", borderBottom: "1px solid #00ff4122" }}>
      <div style={{ fontSize: "0.55rem", color: "#00ff4155", letterSpacing: "0.3em", marginBottom: "0.25rem" }}>// MODULE</div>
      <div style={{ color: "#fff", fontFamily: "'Orbitron', monospace", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.08em" }}>{label}</div>
      {sub && <div style={{ fontSize: "0.6rem", color: "#555", marginTop: "0.25rem" }}>{sub}</div>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function ProfitEstimator() {
  const [crop, setCrop] = useState("");
  const [location, setLocation] = useState("");
  const [land, setLand] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1000); return () => clearInterval(t); }, []);
  const timeStr = new Date().toTimeString().slice(0, 8);
  const dateStr = new Date().toLocaleDateString("en-GB").replace(/\//g, ".");

  const runAI = useCallback(async () => {
    if (!crop || !location || !land) return;
    setLoading(true); setData(null);
    try {
      const res = await axios.post("http://127.0.0.1:5030/ai-profit", { crop, location, land });
      await new Promise(r => setTimeout(r, 800));
      setData(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
    setLoading(false);
  }, [crop, location, land]);

  const econ = data?.economic_analysis;
  const risks = data?.risk_analysis?.disease_risks || [];
  const alts = data?.recommendations?.better_crops_ranked || [];
  const profitChart = data?.chart_data?.profit_comparison || [];
  const growthChart = data?.chart_data?.growth_timeline || [];

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'Share Tech Mono', monospace", color: "#00ff41", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />
      <MatrixRain />
      <Scanlines />

      {/* TOP HUD */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(0,0,0,0.95)", borderBottom: "1px solid #00ff4122",
        backdropFilter: "blur(10px)", padding: "0.6rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        animation: "slideDown 0.5s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1rem", fontWeight: 900, letterSpacing: "0.1em" }}>
            <GlitchText text="AGRO" /><span style={{ color: "#fff" }}>//</span><span style={{ color: "#fff" }}>INTEL</span>
          </div>
          <div style={{ fontSize: "0.55rem", color: "#00ff4155", letterSpacing: "0.2em" }}>AGRICULTURAL PROFIT INTELLIGENCE SYSTEM</div>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.55rem", color: "#00ff4177", letterSpacing: "0.1em" }}>
          <span>{dateStr}</span>
          <span style={{ color: "#00ff41" }}>{timeStr}</span>
          <span style={{ animation: "blink 2s step-end infinite", color: "#00ff41" }}>LIVE</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>

        {/* Hero */}
        <div style={{ marginBottom: "2rem", animation: "fadeUp 0.7s ease 0.1s both" }}>
          <div style={{ fontSize: "0.6rem", color: "#00ff4155", letterSpacing: "0.4em", marginBottom: "0.4rem" }}>// PROFIT ANALYSIS MODULE — AI POWERED</div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "clamp(1.4rem, 4vw, 2.2rem)", fontWeight: 900, margin: 0, color: "#fff", letterSpacing: "0.05em" }}>
            AGRICULTURAL <span style={{ color: "#00ff41" }}>PROFIT</span> INTELLIGENCE
          </h1>
          <div style={{ marginTop: "0.6rem", height: 2, background: "linear-gradient(90deg,#00ff41,transparent)", animation: "expandW 1s ease 0.5s both" }} />
        </div>

        {/* INPUT PANEL */}
        <div style={{ position: "relative", padding: "1.5rem", background: "#000", border: "1px solid #00ff4133", marginBottom: "1.5rem", animation: "fadeUp 0.7s ease 0.2s both" }}>
          <HUDCorners color="#00ff4166" size={18} />
          <div style={{ fontSize: "0.55rem", color: "#00ff4166", letterSpacing: "0.25em", marginBottom: "1.2rem" }}>// INPUT PARAMETERS</div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
            <HUDInput label="CROP NAME" placeholder="e.g. RICE, WHEAT..." value={crop} onChange={setCrop} />
            <HUDInput label="LOCATION / REGION" placeholder="e.g. TAMIL NADU..." value={location} onChange={setLocation} />
            <HUDInput label="LAND AREA (ACRES)" placeholder="e.g. 5" value={land} onChange={setLand} type="number" />
          </div>

          <button
            onClick={runAI}
            disabled={loading || !crop || !location || !land}
            style={{
              width: "100%", padding: "0.9rem",
              background: "#000",
              border: `1px solid ${!crop || !location || !land || loading ? "#222" : "#00ff41"}`,
              color: !crop || !location || !land || loading ? "#333" : "#00ff41",
              fontFamily: "'Share Tech Mono', monospace", fontSize: "0.85rem",
              letterSpacing: "0.3em", cursor: !crop || !location || !land || loading ? "not-allowed" : "pointer",
              position: "relative", overflow: "hidden", borderRadius: 2,
              transition: "all 0.3s",
            }}
            onMouseEnter={e => { if (crop && location && land && !loading) { e.target.style.background = "#00ff4111"; e.target.style.boxShadow = "0 0 25px #00ff4133"; } }}
            onMouseLeave={e => { e.target.style.background = "#000"; e.target.style.boxShadow = "none"; }}
          >
            {loading ? <span style={{ animation: "blink 0.5s step-end infinite" }}>RUNNING ANALYSIS...</span> : "INITIATE PROFIT ANALYSIS"}
            {crop && location && land && !loading && (
              <div style={{ position: "absolute", bottom: 0, left: "-100%", width: "100%", height: 1, background: "linear-gradient(90deg,transparent,#00ff41,transparent)", animation: "sweep 1.5s linear infinite" }} />
            )}
          </button>
        </div>

        {/* ANALYZING */}
        {loading && (
          <div style={{ position: "relative", padding: "1.5rem", background: "#000", border: "1px solid #00ff4133", marginBottom: "1.5rem", animation: "fadeIn 0.4s ease" }}>
            <HUDCorners color="#00ff4166" size={16} />
            <div style={{ fontSize: "0.55rem", color: "#00ff4166", letterSpacing: "0.25em", marginBottom: "1rem" }}>// INTELLIGENCE ENGINE — ACTIVE</div>
            <AnalyzingScreen />
          </div>
        )}

        {/* RESULTS */}
        {data && !loading && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>

            {/* SCAN COMPLETE BANNER */}
            <div style={{ padding: "0.7rem 1rem", marginBottom: "1.5rem", background: "#000", border: "1px solid #00ff4166", display: "flex", justifyContent: "space-between", alignItems: "center", animation: "slideIn 0.4s ease" }}>
              <div style={{ fontSize: "0.6rem", color: "#00ff41", letterSpacing: "0.2em", animation: "blink 1.5s step-end 3" }}>
                ANALYSIS COMPLETE — INTELLIGENCE REPORT READY
              </div>
              <div style={{ fontSize: "0.55rem", color: "#00ff4166" }}>{crop?.toUpperCase()} / {location?.toUpperCase()} / {land} ACRES</div>
            </div>

            {/* ECONOMIC STATS */}
            <div style={{ marginBottom: "1.5rem" }}>
              <SectionHeader label="ECONOMIC ANALYSIS" sub="Projected financial performance based on current market data" />
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <StatCard label="TOTAL REVENUE" value={econ?.total_revenue} color="#00ff41" delay={0} />
                <StatCard label="TOTAL COST" value={econ?.total_cost} color="#ffaa00" delay={150} />
                <StatCard label="NET PROFIT" value={econ?.net_profit} color={Number(econ?.net_profit) >= 0 ? "#00ff41" : "#ff2200"} delay={300} />
              </div>
            </div>

            {/* CHARTS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

              {/* Profit Chart */}
              {profitChart.length > 0 && (
                <div style={{ position: "relative", padding: "1.2rem", background: "#000", border: "1px solid #00ff4122", animation: "fadeUp 0.6s ease 0.3s both" }}>
                  <HUDCorners color="#00ff4144" size={12} />
                  <SectionHeader label="PROFIT COMPARISON" sub="Estimated profit vs alternative crops" />
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={profitChart} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                      <CartesianGrid stroke="#00ff4111" strokeDasharray="3 3" />
                      <XAxis dataKey="crop" tick={{ fill: "#00ff4188", fontSize: 10, fontFamily: "Share Tech Mono" }} axisLine={{ stroke: "#00ff4122" }} />
                      <YAxis tick={{ fill: "#00ff4188", fontSize: 10, fontFamily: "Share Tech Mono" }} axisLine={{ stroke: "#00ff4122" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="profit" fill="#00ff41" opacity={0.8} radius={[2, 2, 0, 0]}
                        style={{ filter: "drop-shadow(0 0 4px #00ff41)" }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Growth Timeline */}
              {growthChart.length > 0 && (
                <div style={{ position: "relative", padding: "1.2rem", background: "#000", border: "1px solid #00ff4122", animation: "fadeUp 0.6s ease 0.4s both" }}>
                  <HUDCorners color="#00ff4144" size={12} />
                  <SectionHeader label="GROWTH TIMELINE" sub="Days per crop development stage" />
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={growthChart} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                      <CartesianGrid stroke="#00ff4111" strokeDasharray="3 3" />
                      <XAxis dataKey="stage" tick={{ fill: "#00ff4188", fontSize: 10, fontFamily: "Share Tech Mono" }} axisLine={{ stroke: "#00ff4122" }} />
                      <YAxis tick={{ fill: "#00ff4188", fontSize: 10, fontFamily: "Share Tech Mono" }} axisLine={{ stroke: "#00ff4122" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="days" stroke="#00ff41" strokeWidth={2} dot={{ fill: "#00ff41", r: 4, strokeWidth: 0 }}
                        style={{ filter: "drop-shadow(0 0 4px #00ff41)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* DISEASE RISKS */}
            {risks.length > 0 && (
              <div style={{ marginBottom: "1.5rem", animation: "fadeUp 0.6s ease 0.5s both" }}>
                <div style={{ position: "relative", padding: "1.2rem", background: "#000", border: "1px solid #00ff4122" }}>
                  <HUDCorners color="#00ff4144" size={14} />
                  <SectionHeader label="DISEASE RISK ASSESSMENT" sub="Pathogen threat probability matrix" />
                  {risks.map((d, i) => <DiseaseCard key={i} d={d} index={i} />)}
                </div>
              </div>
            )}

            {/* ALTERNATIVE CROPS */}
            {alts.length > 0 && (
              <div style={{ animation: "fadeUp 0.6s ease 0.6s both" }}>
                <div style={{ position: "relative", padding: "1.2rem", background: "#000", border: "1px solid #00ff4122" }}>
                  <HUDCorners color="#00ff4144" size={14} />
                  <SectionHeader label="ALTERNATIVE CROP RECOMMENDATIONS" sub="Ranked by expected profitability" />
                  {alts.map((c, i) => <AltCropCard key={i} c={c} index={i} />)}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* BOTTOM HUD */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(0,0,0,0.95)", borderTop: "1px solid #00ff4111",
        padding: "0.35rem 2rem", display: "flex", justifyContent: "space-between",
        fontSize: "0.5rem", color: "#00ff4133", letterSpacing: "0.1em",
      }}>
        <span>AGRO//INTEL v3.0.0 — PROFIT INTELLIGENCE SYSTEM</span>
        <span>BACKEND: 127.0.0.1:5030</span>
        <span style={{ animation: "blink 2s step-end infinite", color: "#00ff4155" }}>SECURE CHANNEL ACTIVE</span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #000; }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes slideDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:none}}
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes sweep   { from{left:-100%} to{left:100%} }
        @keyframes expandW { from{width:0} to{width:100%} }
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:#000}
        ::-webkit-scrollbar-thumb{background:#00ff4133}
        ::-webkit-scrollbar-thumb:hover{background:#00ff41}
        ::selection{background:#00ff4133;color:#00ff41}
      `}</style>
    </div>
  );
}