import { useState, useEffect, useRef, useCallback } from "react";

const SEVERITY_CONFIG = {
  None: { color: "#00ff41", label: "CLEAN", bar: 5 },
  Moderate: { color: "#ffcc00", label: "MODERATE", bar: 45 },
  High: { color: "#ff6600", label: "HIGH RISK", bar: 70 },
  "Moderate–High": { color: "#ff6600", label: "ELEVATED", bar: 60 },
  "Very High": { color: "#ff2200", label: "CRITICAL", bar: 85 },
  Critical: { color: "#ff0000", label: "CRITICAL", bar: 100 },
  Unknown: { color: "#888", label: "UNKNOWN", bar: 0 },
};

// ── Glitch Text ──────────────────────────────────────────────
function GlitchText({ text, className = "", tag: Tag = "span" }) {
  return (
    <Tag className={`glitch-text ${className}`} data-text={text}>
      {text}
      <style>{`
        .glitch-text {
          position: relative;
          display: inline-block;
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
        }
        .glitch-text::before {
          color: #0ff;
          animation: glitch-before 2.5s infinite;
          clip-path: polygon(0 30%, 100% 30%, 100% 50%, 0 50%);
        }
        .glitch-text::after {
          color: #f0f;
          animation: glitch-after 2.5s infinite;
          clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
        }
        @keyframes glitch-before {
          0%,90%,100% { transform: translate(0); opacity: 0; }
          91% { transform: translate(-3px, 1px); opacity: 1; }
          93% { transform: translate(3px, -1px); opacity: 1; }
          95% { transform: translate(-2px, 2px); opacity: 1; }
          97% { transform: translate(0); opacity: 0; }
        }
        @keyframes glitch-after {
          0%,88%,100% { transform: translate(0); opacity: 0; }
          89% { transform: translate(3px, -2px); opacity: 1; }
          91% { transform: translate(-3px, 1px); opacity: 1; }
          93% { transform: translate(2px, -1px); opacity: 1; }
          95% { transform: translate(0); opacity: 0; }
        }
      `}</style>
    </Tag>
  );
}

// ── Matrix Rain Canvas ───────────────────────────────────────
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
    const chars = "AGCTNUCLEOTIDEPLANTPATHOGENFUNGALVIRUSBACTERIADNASEQUENCE01".split("");
    const interval = setInterval(() => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff4122";
      ctx.font = "14px monospace";
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.98 ? "#afffaf" : "#00ff4133";
        ctx.fillText(char, i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }, 50);
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => { clearInterval(interval); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: 0, opacity: 0.4, pointerEvents: "none" }} />;
}

// ── Scanline overlay ─────────────────────────────────────────
function Scanlines() {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 1,
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      animation: "scanMove 8s linear infinite",
    }}>
      <style>{`
        @keyframes scanMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 100vh; }
        }
      `}</style>
    </div>
  );
}

// ── Typewriter ───────────────────────────────────────────────
function Typewriter({ text, speed = 40, onDone, className = "" }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const t = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(t); setDone(true); onDone && onDone(); }
    }, speed);
    return () => clearInterval(t);
  }, [text]);
  return (
    <span className={className}>
      {displayed}
      {!done && <span style={{ animation: "blink 0.7s step-end infinite", color: "#00ff41" }}>_</span>}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </span>
  );
}

// ── HUD Corner Decorations ───────────────────────────────────
function HUDCorners({ color = "#00ff41", size = 20 }) {
  const s = {
    position: "absolute", width: size, height: size,
    border: `2px solid ${color}`,
  };
  return (
    <>
      <div style={{ ...s, top: 0, left: 0, borderRight: "none", borderBottom: "none" }} />
      <div style={{ ...s, top: 0, right: 0, borderLeft: "none", borderBottom: "none" }} />
      <div style={{ ...s, bottom: 0, left: 0, borderRight: "none", borderTop: "none" }} />
      <div style={{ ...s, bottom: 0, right: 0, borderLeft: "none", borderTop: "none" }} />
    </>
  );
}

// ── Animated Progress Bar ────────────────────────────────────
function ThreatBar({ value, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", height: 8, borderRadius: 2, overflow: "hidden", position: "relative" }}>
      <div style={{
        height: "100%", width: `${width}%`, background: `linear-gradient(90deg, ${color}88, ${color})`,
        transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: `0 0 10px ${color}`,
        position: "relative",
      }}>
        <div style={{
          position: "absolute", right: 0, top: 0, height: "100%", width: 4,
          background: color, boxShadow: `0 0 8px ${color}, 0 0 16px ${color}`,
          animation: "pulse 1s ease-in-out infinite",
        }} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

// ── Loading Sequence ─────────────────────────────────────────
function LoadingSequence({ onComplete }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const lines = [
    "INITIALIZING BIO-SCAN PROTOCOL...",
    "LOADING NEURAL PATHOGEN DATABASE...",
    "CALIBRATING SPECTRAL ANALYSIS ENGINE...",
    "CONNECTING TO AGRICULTURAL THREAT MATRIX...",
    "DEPLOYING DEEP SCAN ALGORITHMS...",
    "SCAN READY. UPLOADING SAMPLE...",
  ];

  useEffect(() => {
    const prog = setInterval(() => setProgress(p => Math.min(p + Math.random() * 4, 99)), 80);
    const stepInt = setInterval(() => setStep(s => {
      if (s >= lines.length - 1) { clearInterval(stepInt); clearInterval(prog); setProgress(100); setTimeout(onComplete, 600); return s; }
      return s + 1;
    }), 520);
    return () => { clearInterval(prog); clearInterval(stepInt); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "#000",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Share Tech Mono', monospace",
    }}>
      <MatrixRain />
      <Scanlines />
      <div style={{ position: "relative", zIndex: 10, width: "min(600px, 90vw)", padding: "2rem" }}>
        <HUDCorners color="#00ff41" size={30} />

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.7rem", color: "#00ff4188", letterSpacing: "0.5em", marginBottom: "0.5rem" }}>
            SYSTEM BOOT — v4.2.1
          </div>
          <GlitchText
            text="PHYTO//SCAN"
            tag="div"
            className=""
          />
          <style>{`
            .glitch-text { font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 900; color: #00ff41; letter-spacing: 0.1em; }
          `}</style>
        </div>

        {/* Terminal lines */}
        <div style={{
          background: "#000", border: "1px solid #00ff4133",
          padding: "1.2rem", borderRadius: 4, marginBottom: "1.5rem",
          minHeight: 180,
        }}>
          {lines.slice(0, step + 1).map((line, i) => (
            <div key={i} style={{
              color: i === step ? "#00ff41" : "#00ff4166",
              fontSize: "0.75rem", letterSpacing: "0.05em",
              marginBottom: "0.4rem",
              animation: i === step ? "fadeIn 0.3s ease" : "none",
            }}>
              <span style={{ color: "#00ff4144" }}>[{String(i).padStart(2, "0")}]</span> {line}
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#00ff4188" }}>
          <span>NEURAL LOAD</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ background: "#0a0a0a", border: "1px solid #00ff4122", height: 6, borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: "linear-gradient(90deg, #00ff4144, #00ff41)",
            transition: "width 0.1s linear",
            boxShadow: "0 0 10px #00ff41",
          }} />
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
        `}</style>
      </div>
    </div>
  );
}

// ── Upload Zone ──────────────────────────────────────────────
function UploadZone({ onFile, file, preview }) {
  const [drag, setDrag] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!preview) return;
    let pos = 0;
    const t = setInterval(() => { pos = (pos + 1) % 100; setScanLine(pos); }, 20);
    return () => clearInterval(t);
  }, [preview]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
      style={{
        position: "relative", border: `2px dashed ${drag ? "#00ff41" : preview ? "#00ff4166" : "#00ff4133"}`,
        borderRadius: 4, minHeight: preview ? 320 : 220, cursor: preview ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: drag ? "#00ff4108" : "#000",
        transition: "all 0.3s ease",
        overflow: "hidden",
        boxShadow: drag ? "0 0 30px #00ff4133, inset 0 0 30px #00ff4108" : "none",
      }}
    >
      <HUDCorners color={preview ? "#00ff41" : "#00ff4166"} size={16} />

      {preview ? (
        <>
          <img src={preview} alt="sample" style={{ width: "100%", height: 320, objectFit: "cover", opacity: 0.85 }} />
          {/* Scan overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, transparent 0%, #00ff4115 50%, transparent 100%)",
            backgroundSize: "100% 40px",
            backgroundPositionY: `${scanLine}%`,
            pointerEvents: "none",
            animation: "scanPulse 3s ease-in-out infinite",
          }} />
          {/* Grid overlay */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "linear-gradient(#00ff4108 1px, transparent 1px), linear-gradient(90deg, #00ff4108 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          {/* Crosshair */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ width: 60, height: 60, position: "relative", animation: "rotate 8s linear infinite" }}>
              <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: 1, background: "#00ff4166" }} />
              <div style={{ position: "absolute", left: "50%", top: 0, width: 1, height: "100%", background: "#00ff4166" }} />
              <div style={{ position: "absolute", inset: 8, border: "1px solid #00ff4144", borderRadius: "50%", animation: "rotate 4s linear infinite reverse" }} />
            </div>
          </div>
          {/* Replace button */}
          <button
            onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
            style={{
              position: "absolute", bottom: 12, right: 12,
              background: "#000", border: "1px solid #00ff4166",
              color: "#00ff41", padding: "4px 12px", fontSize: "0.65rem",
              letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.background = "#00ff4122"; e.target.style.boxShadow = "0 0 10px #00ff4155"; }}
            onMouseLeave={e => { e.target.style.background = "#000"; e.target.style.boxShadow = "none"; }}
          >
            RELOAD SAMPLE
          </button>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "2rem", userSelect: "none" }}>
          {/* Animated upload icon */}
          <div style={{ marginBottom: "1.5rem", position: "relative", display: "inline-block" }}>
            <div style={{
              width: 64, height: 64, border: "2px solid #00ff4166",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              animation: "orbit 3s linear infinite",
            }}>
              <div style={{ width: 24, height: 24, position: "relative" }}>
                <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 0, width: 2, height: 16, background: "#00ff41" }} />
                <div style={{ position: "absolute", top: 4, left: "50%", transform: "translateX(-50%) rotate(-45deg)", width: 8, height: 8, borderLeft: "2px solid #00ff41", borderTop: "2px solid #00ff41" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 2, background: "#00ff41" }} />
              </div>
            </div>
            <div style={{ position: "absolute", inset: -8, border: "1px dashed #00ff4133", borderRadius: "50%", animation: "orbit 6s linear infinite reverse" }} />
          </div>
          <div style={{ color: "#00ff41", fontSize: "0.8rem", letterSpacing: "0.2em", marginBottom: "0.5rem" }}>
            DROP SAMPLE HERE
          </div>
          <div style={{ color: "#00ff4155", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
            JPG / PNG / WEBP — BIO-SCAN READY
          </div>
          {drag && (
            <div style={{ marginTop: "1rem", color: "#00ff41", fontSize: "0.7rem", animation: "fadeIn 0.2s ease" }}>
              RELEASE TO INITIATE SCAN
            </div>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && onFile(e.target.files[0])} />

      <style>{`
        @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes scanPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>
    </div>
  );
}

// ── Scan Animation (while predicting) ───────────────────────
function ScanAnimation() {
  const [line, setLine] = useState(0);
  const [logLines, setLogLines] = useState([]);
  const logs = [
    "ACQUIRING SPECTRAL DATA...",
    "RUNNING CNN INFERENCE ENGINE...",
    "CROSS-REFERENCING PATHOGEN DATABASE...",
    "ANALYZING CHLOROPHYLL SIGNATURE...",
    "COMPUTING THREAT VECTORS...",
    "EVALUATING GEOGRAPHIC RISK PROFILE...",
    "COMPILING TREATMENT PROTOCOLS...",
  ];

  useEffect(() => {
    const lineT = setInterval(() => setLine(l => (l + 1) % 100), 18);
    let i = 0;
    const logT = setInterval(() => {
      if (i < logs.length) { setLogLines(prev => [...prev, logs[i]]); i++; }
    }, 400);
    return () => { clearInterval(lineT); clearInterval(logT); };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "2rem 0", position: "relative" }}>
      {/* Big radar */}
      <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 2rem" }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            position: "absolute", inset: i * 20, border: "1px solid #00ff41",
            borderRadius: "50%", opacity: 1 - i * 0.2,
            animation: `radarPing 2s ease-out ${i * 0.3}s infinite`,
          }} />
        ))}
        <div style={{
          position: "absolute", inset: 0,
          background: `conic-gradient(from ${line * 3.6}deg, #00ff4133, #00ff4100 120deg)`,
          borderRadius: "50%", transition: "background 0.02s linear",
        }} />
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", flexDirection: "column",
        }}>
          <div style={{ color: "#00ff41", fontSize: "0.6rem", letterSpacing: "0.15em" }}>SCANNING</div>
          <div style={{ color: "#00ff4166", fontSize: "0.55rem", marginTop: 4 }}>{line}%</div>
        </div>
      </div>

      {/* Log stream */}
      <div style={{
        background: "#000", border: "1px solid #00ff4122",
        padding: "1rem", borderRadius: 4, textAlign: "left",
        fontFamily: "'Share Tech Mono', monospace",
        maxHeight: 160, overflow: "hidden",
      }}>
        {logLines.map((log, i) => (
          <div key={i} style={{
            color: i === logLines.length - 1 ? "#00ff41" : "#00ff4166",
            fontSize: "0.65rem", marginBottom: "0.3rem",
            animation: "slideIn 0.3s ease",
          }}>
            {">"} {log}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes radarPing { 0%{opacity:0.8} 50%{opacity:0.3} 100%{opacity:0.8} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }
      `}</style>
    </div>
  );
}

// ── Result Card ──────────────────────────────────────────────
function ResultCard({ data, index }) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(index === 0);
  const sev = SEVERITY_CONFIG[data.severity] || SEVERITY_CONFIG.Unknown;
  const isTop = index === 0;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 200 + 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(20px)",
      transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
      marginBottom: "1rem",
      position: "relative",
    }}>
      <div style={{
        background: isTop ? "#000" : "#040404",
        border: `1px solid ${isTop ? sev.color + "66" : "#1a1a1a"}`,
        borderRadius: 4, overflow: "hidden",
        boxShadow: isTop ? `0 0 30px ${sev.color}22, 0 0 60px ${sev.color}11` : "none",
        transition: "all 0.3s ease",
      }}>
        <HUDCorners color={isTop ? sev.color : "#333"} size={12} />

        {/* Header */}
        <div
          style={{
            padding: "1rem 1.2rem", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: expanded ? `1px solid ${sev.color}22` : "none",
          }}
          onClick={() => setExpanded(e => !e)}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
              <span style={{
                background: sev.color + "22", border: `1px solid ${sev.color}66`,
                color: sev.color, fontSize: "0.6rem", padding: "2px 8px",
                letterSpacing: "0.15em", fontWeight: 700,
              }}>
                {isTop ? "PRIMARY" : `ALT-${index}`}
              </span>
              <span style={{
                background: sev.color + "11", border: `1px solid ${sev.color}44`,
                color: sev.color, fontSize: "0.6rem", padding: "2px 8px",
                letterSpacing: "0.1em",
              }}>
                {sev.label}
              </span>
            </div>
            <div style={{
              color: isTop ? "#fff" : "#aaa",
              fontSize: isTop ? "1.1rem" : "0.9rem",
              fontWeight: 700, letterSpacing: "0.05em",
              fontFamily: "'Share Tech Mono', monospace",
            }}>
              {data.disease?.toUpperCase()}
            </div>
          </div>

          {/* Confidence ring */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: sev.color, lineHeight: 1, fontFamily: "'Share Tech Mono', monospace" }}>
              {data.confidence}
              <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>%</span>
            </div>
            <div style={{ fontSize: "0.55rem", color: sev.color + "99", letterSpacing: "0.1em" }}>MATCH RATE</div>
          </div>
        </div>

        {/* Expanded body */}
        {expanded && (
          <div style={{ padding: "1.2rem", animation: "expandIn 0.4s ease" }}>
            {/* Threat bar */}
            <div style={{ marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", color: "#555", marginBottom: "0.4rem", letterSpacing: "0.1em" }}>
                <span>THREAT LEVEL</span><span style={{ color: sev.color }}>{sev.label}</span>
              </div>
              <ThreatBar value={sev.bar} color={sev.color} />
            </div>

            {/* Data grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
              {[
                { label: "PATHOGEN TYPE", value: data.cause },
                { label: "PEAK SEASON", value: data.season },
                { label: "AFFECTED REGION", value: data.region },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: "#050505", border: "1px solid #1a1a1a",
                  padding: "0.8rem", borderRadius: 2, position: "relative",
                  gridColumn: label === "PATHOGEN TYPE" ? "1 / -1" : "auto",
                }}>
                  <div style={{ fontSize: "0.55rem", color: "#555", letterSpacing: "0.15em", marginBottom: "0.35rem" }}>{label}</div>
                  <div style={{ fontSize: "0.75rem", color: "#ccc", lineHeight: 1.4 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Remedy — full width, highlighted */}
            <div style={{
              background: sev.color + "08", border: `1px solid ${sev.color}33`,
              padding: "1rem", borderRadius: 2, position: "relative",
            }}>
              <div style={{ fontSize: "0.55rem", color: sev.color + "99", letterSpacing: "0.15em", marginBottom: "0.4rem" }}>
                RECOMMENDED TREATMENT PROTOCOL
              </div>
              <div style={{ fontSize: "0.8rem", color: "#ddd", lineHeight: 1.6 }}>
                {data.remedy}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes expandIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }`}</style>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function DiseaseDetection() {
  const [booted, setBooted] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [headerDone, setHeaderDone] = useState(false);
  const [tick, setTick] = useState(0);

  // Clock tick
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1000); return () => clearInterval(t); }, []);

  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);
  const dateStr = now.toLocaleDateString("en-GB").replace(/\//g, ".");

  const handleFile = useCallback((f) => {
    setFile(f);
    setResult(null);
    setError(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("http://localhost:5200/predict", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`SERVER ERROR ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "PREDICTION FAILED");
      await new Promise(r => setTimeout(r, 800)); // dramatic pause
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(null); };

  if (!booted) return <LoadingSequence onComplete={() => setBooted(true)} />;

  return (
    <div style={{
      minHeight: "100vh", background: "#000",
      fontFamily: "'Share Tech Mono', monospace",
      color: "#00ff41", position: "relative", overflow: "hidden",
    }}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />

      <MatrixRain />
      <Scanlines />

      {/* HUD top bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(0,0,0,0.92)", borderBottom: "1px solid #00ff4122",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.6rem 2rem",
        animation: "slideDown 0.6s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1rem", fontWeight: 900, color: "#00ff41", letterSpacing: "0.1em" }}>
            PHYTO<span style={{ color: "#fff" }}>//</span>SCAN
          </div>
          <div style={{ fontSize: "0.6rem", color: "#00ff4166", letterSpacing: "0.15em" }}>
            AGRICULTURAL THREAT DETECTION SYSTEM
          </div>
        </div>
        <div style={{ display: "flex", gap: "2rem", fontSize: "0.6rem", color: "#00ff4188", letterSpacing: "0.1em" }}>
          <span>{dateStr}</span>
          <span style={{ color: "#00ff41" }}>{timeStr}</span>
          <span style={{
            color: "#00ff41", animation: "blink 2s step-end infinite",
          }}>SYS ONLINE</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        position: "relative", zIndex: 10,
        maxWidth: 1100, margin: "0 auto",
        padding: "calc(60px + 2rem) 1.5rem 3rem",
      }}>

        {/* Hero heading */}
        <div style={{ marginBottom: "2.5rem", animation: "fadeUp 0.8s ease 0.2s both" }}>
          <div style={{ fontSize: "0.65rem", color: "#00ff4166", letterSpacing: "0.4em", marginBottom: "0.5rem" }}>
            // MISSION CONTROL — PATHOGEN ANALYSIS MODULE
          </div>
          <h1 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "clamp(1.4rem, 4vw, 2.4rem)",
            fontWeight: 900, margin: 0, lineHeight: 1.2,
            color: "#fff", letterSpacing: "0.05em",
          }}>
            {headerDone ? (
              <span>CROP PATHOGEN <span style={{ color: "#00ff41" }}>DETECTION</span></span>
            ) : (
              <Typewriter text="CROP PATHOGEN DETECTION" speed={50} onDone={() => setHeaderDone(true)} />
            )}
          </h1>
          <div style={{
            marginTop: "0.75rem", height: 2, width: headerDone ? "100%" : "0%",
            background: "linear-gradient(90deg, #00ff41, transparent)",
            transition: "width 1s ease",
          }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>

          {/* LEFT: Upload + scan */}
          <div style={{ animation: "fadeUp 0.8s ease 0.4s both" }}>

            {/* Status bar */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "0.75rem", fontSize: "0.6rem", color: "#00ff4188", letterSpacing: "0.1em",
            }}>
              <span>// INPUT TERMINAL</span>
              <span style={{ color: file ? "#00ff41" : "#555" }}>
                {file ? `SAMPLE: ${file.name.toUpperCase()}` : "AWAITING SAMPLE"}
              </span>
            </div>

            <UploadZone onFile={handleFile} file={file} preview={preview} />

            {/* Scan button */}
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
              <button
                onClick={handleScan}
                disabled={!file || loading}
                style={{
                  flex: 1, padding: "0.9rem", background: file && !loading ? "#000" : "#050505",
                  border: `1px solid ${file && !loading ? "#00ff41" : "#333"}`,
                  color: file && !loading ? "#00ff41" : "#444",
                  fontFamily: "'Share Tech Mono', monospace", fontSize: "0.8rem",
                  letterSpacing: "0.25em", cursor: file && !loading ? "pointer" : "not-allowed",
                  position: "relative", overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={e => { if (file && !loading) { e.target.style.background = "#00ff4111"; e.target.style.boxShadow = "0 0 20px #00ff4133"; } }}
                onMouseLeave={e => { e.target.style.background = "#000"; e.target.style.boxShadow = "none"; }}
              >
                {loading ? (
                  <span style={{ animation: "blink 0.5s step-end infinite" }}>SCANNING...</span>
                ) : "INITIATE SCAN"}
                {file && !loading && (
                  <div style={{
                    position: "absolute", bottom: 0, left: "-100%", width: "100%", height: 1,
                    background: "linear-gradient(90deg, transparent, #00ff41, transparent)",
                    animation: "sweep 2s linear infinite",
                  }} />
                )}
              </button>
              {(file || result) && (
                <button
                  onClick={reset}
                  style={{
                    padding: "0.9rem 1.2rem", background: "#000",
                    border: "1px solid #333", color: "#666",
                    fontFamily: "'Share Tech Mono', monospace", fontSize: "0.7rem",
                    letterSpacing: "0.15em", cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = "#ff2200"; e.target.style.color = "#ff2200"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#333"; e.target.style.color = "#666"; }}
                >
                  PURGE
                </button>
              )}
            </div>

            {/* Scanning animation */}
            {loading && <ScanAnimation />}

            {/* Error */}
            {error && (
              <div style={{
                marginTop: "1rem", padding: "1rem",
                background: "#0a0000", border: "1px solid #ff220066",
                color: "#ff2200", fontSize: "0.7rem", letterSpacing: "0.05em",
                animation: "fadeIn 0.4s ease",
              }}>
                <div style={{ fontSize: "0.6rem", marginBottom: "0.4rem", opacity: 0.7 }}>// SCAN ERROR</div>
                {error}
              </div>
            )}

            {/* System info panel */}
            {!loading && !result && !error && (
              <div style={{
                marginTop: "1.5rem", padding: "1rem",
                background: "#050505", border: "1px solid #0a0a0a",
                fontSize: "0.6rem", color: "#333", letterSpacing: "0.08em",
                animation: "fadeIn 1s ease 1s both",
              }}>
                <div style={{ color: "#00ff4144", marginBottom: "0.5rem" }}>// SYSTEM CAPABILITIES</div>
                {["PLANT DISEASE DETECTION", "PATHOGEN IDENTIFICATION", "TREATMENT PROTOCOL GENERATION", "REGIONAL RISK ASSESSMENT", "SEASONAL THREAT ANALYSIS"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    <div style={{ width: 4, height: 4, background: "#00ff4155", borderRadius: "50%" }} />
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Results */}
          <div style={{ animation: "fadeUp 0.8s ease 0.5s both" }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "0.75rem", fontSize: "0.6rem", color: "#00ff4188", letterSpacing: "0.1em",
            }}>
              <span>// ANALYSIS OUTPUT</span>
              {result && <span style={{ color: "#00ff41", animation: "blink 1.5s step-end infinite" }}>SCAN COMPLETE</span>}
            </div>

            {!result && !loading && (
              <div style={{
                border: "1px dashed #0a0a0a", borderRadius: 4,
                minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center",
                color: "#111", fontSize: "0.7rem", letterSpacing: "0.2em", flexDirection: "column", gap: "1rem",
              }}>
                <div style={{
                  width: 80, height: 80, border: "1px solid #0f0f0f",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  <div style={{ width: 40, height: 40, border: "1px solid #1a1a1a", borderRadius: "50%", animation: "pulse2 2s ease-in-out infinite" }} />
                  <div style={{ position: "absolute", inset: 0, border: "1px dashed #1a1a1a", borderRadius: "50%", animation: "rotate 10s linear infinite" }} />
                </div>
                AWAITING INPUT
                <style>{`@keyframes pulse2 { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.2);opacity:1} }`}</style>
              </div>
            )}

            {result && (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                {/* Summary banner */}
                <div style={{
                  padding: "0.8rem 1rem", marginBottom: "1rem",
                  background: "#000", border: "1px solid #00ff4133",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  animation: "slideIn 0.4s ease",
                }}>
                  <div style={{ fontSize: "0.6rem", color: "#00ff4188", letterSpacing: "0.15em" }}>
                    SCAN COMPLETE — {result.top3?.length || 1} CANDIDATES IDENTIFIED
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "#555" }}>
                    {new Date().toTimeString().slice(0, 8)}
                  </div>
                </div>

                {result.top3?.map((item, i) => (
                  <ResultCard key={i} data={item} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom HUD bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(0,0,0,0.92)", borderTop: "1px solid #00ff4111",
        padding: "0.4rem 2rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: "0.55rem", color: "#00ff4144", letterSpacing: "0.1em",
      }}>
        <span>PHYTO//SCAN v4.2.1 — NEURAL PATHOGEN DETECTION SYSTEM</span>
        <span>BACKEND: localhost:5200 — MODEL: CROP_CNN</span>
        <span style={{ animation: "blink 2s step-end infinite", color: "#00ff4166" }}>SECURE CHANNEL ACTIVE</span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #000; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:none} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes sweep { from{left:-100%} to{left:100%} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #00ff4144; }
        ::-webkit-scrollbar-thumb:hover { background: #00ff41; }
        ::selection { background: #00ff4133; color: #00ff41; }
      `}</style>
    </div>
  );
}