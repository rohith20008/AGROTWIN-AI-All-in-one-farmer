/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║        AGRI-OS // AI VOICE FIELD COMMANDER v1.0             ║
 * ║  Speak a farm query → NLP classifies → AI responds live     ║
 * ║  Drop into any React project. Zero external dependencies     ║
 * ║  beyond framer-motion (already in your project).            ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * USAGE:  import VoiceCommander from "./VoiceCommander";
 *         <VoiceCommander />
 *
 * HOW IT WORKS:
 *   1. User holds SPEAK button → Web Speech API captures voice
 *   2. Transcript is classified into agri-categories via keyword NLP
 *   3. A context-aware response is built from sensor data + category
 *   4. Response streams letter-by-letter like a real terminal
 *   5. Each session is logged to a scrollable command history
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   LIVE SENSOR SNAPSHOT (swap with your import)
───────────────────────────────────────────── */
const SENSOR = {
  nitrogen: 42,
  phosphorus: 0,
  potassium: 18,
  ph: 8.7,
  turbidity: 1200,
  temperature: 33,
  soilMoisture: 0,
  humidity: 54,
  rainfall: 12,
  windSpeed: 14,
  uvIndex: 7,
  fieldId: "FLD-007-CHN",
};

/* ─────────────────────────────────────────────
   NLP CLASSIFICATION ENGINE
───────────────────────────────────────────── */
const INTENTS = [
  {
    id: "nutrient",
    label: "NUTRIENT ANALYSIS",
    color: "#aaff55",
    keywords: ["nitrogen","phosphorus","potassium","npk","nutrient","fertilize","fertilizer","soil","deficiency","feed"],
    respond: () => {
      const issues = [];
      if (SENSOR.nitrogen < 50)  issues.push(`Nitrogen at ${SENSOR.nitrogen} mg/kg — below optimal 80+`);
      if (SENSOR.phosphorus < 20) issues.push(`Phosphorus critically low at ${SENSOR.phosphorus} mg/kg`);
      if (SENSOR.potassium < 60) issues.push(`Potassium deficit: ${SENSOR.potassium} mg/kg detected`);
      return issues.length
        ? `NPK SCAN COMPLETE.\n${issues.join(".\n")}.\nRECOMMENDATION: Apply 120 kg/ha of 20-20-20 compound fertilizer within 48 hours. Follow with irrigation cycle 6 hours post-application.`
        : `NPK SCAN COMPLETE. All nutrient levels nominal. Nitrogen ${SENSOR.nitrogen}, Phosphorus ${SENSOR.phosphorus}, Potassium ${SENSOR.potassium} mg/kg. No intervention required.`;
    },
    icon: "◈",
  },
  {
    id: "water",
    label: "WATER INTELLIGENCE",
    color: "#00ccff",
    keywords: ["water","irrigation","ph","moisture","turbidity","flood","drought","rain","rainfall","humid","wet","dry"],
    respond: () =>
      `HYDRO ANALYSIS COMPLETE.\nSoil moisture: ${SENSOR.soilMoisture === 0 ? "CRITICAL — zero moisture in root zone" : SENSOR.soilMoisture + "%"}.\npH level: ${SENSOR.ph} — ${SENSOR.ph > 8.5 ? "ALKALINE ALERT: exceeds safe threshold of 8.5" : "within acceptable range"}.\nTurbidity: ${SENSOR.turbidity} NTU — ${SENSOR.turbidity > 1000 ? "HIGH CONTAMINATION — pre-filter before irrigation" : "acceptable"}.\nRainfall recorded: ${SENSOR.rainfall} mm this cycle.\nACTION: ${SENSOR.soilMoisture === 0 ? "Activate emergency drip protocol. Target 60% field capacity." : "Continue scheduled watering. Monitor pH daily."}`,
    icon: "◉",
  },
  {
    id: "temperature",
    label: "CLIMATE ASSESSMENT",
    color: "#ff7733",
    keywords: ["temperature","temp","heat","cold","weather","climate","uv","wind","sun","hot","warm","cool"],
    respond: () =>
      `CLIMATE SCAN COMPLETE.\nAmbient temperature: ${SENSOR.temperature}°C — ${SENSOR.temperature > 30 ? "HEAT STRESS ZONE. Most crops struggle above 28°C." : "within optimal range"}.\nUV Index: ${SENSOR.uvIndex} — ${SENSOR.uvIndex > 6 ? "HIGH. Risk of photobleaching on sensitive crops." : "moderate"}.\nWind speed: ${SENSOR.windSpeed} km/h — ${SENSOR.windSpeed > 20 ? "elevated — suspend aerial spraying" : "suitable for operations"}.\nHumidity: ${SENSOR.humidity}%.\nRECOMMENDATION: ${SENSOR.temperature > 30 ? "Irrigate before 06:00 and after 18:00. Install shade nets on nursery beds." : "Conditions are favorable. Proceed with standard schedule."}`,
    icon: "◆",
  },
  {
    id: "risk",
    label: "THREAT ASSESSMENT",
    color: "#ff2244",
    keywords: ["risk","threat","danger","alert","warning","problem","issue","critical","emergency","crop loss","damage","disease","pest"],
    respond: () => {
      const threats = [];
      if (SENSOR.phosphorus === 0 || SENSOR.nitrogen < 30) threats.push("CRITICAL: Nutrient deficiency — crop stunting imminent");
      if (SENSOR.ph > 8.5)    threats.push("HIGH: Alkaline pH will lock out micronutrients");
      if (SENSOR.turbidity > 1000) threats.push("MEDIUM: Contaminated water source detected");
      if (SENSOR.temperature > 30) threats.push("MEDIUM: Thermal stress on root systems");
      if (SENSOR.soilMoisture === 0) threats.push("CRITICAL: Zero soil moisture — wilting in 12-24h");
      const score = Math.max(0, 100 - threats.filter(t=>t.startsWith("CRITICAL")).length*30 - threats.filter(t=>t.startsWith("HIGH")).length*20 - threats.filter(t=>t.startsWith("MEDIUM")).length*10);
      return `MULTI-THREAT SCAN COMPLETE.\nField: ${SENSOR.fieldId} | Risk Score: ${score}/100\n${threats.length ? threats.join(".\n") : "No active threats detected."}.\nOVERALL STATUS: ${score > 70 ? "STABLE" : score > 40 ? "ELEVATED — monitor closely" : "CRITICAL — immediate field action required"}.`;
    },
    icon: "◬",
  },
  {
    id: "forecast",
    label: "YIELD FORECAST",
    color: "#ddaa00",
    keywords: ["yield","forecast","harvest","predict","crop","produce","output","growth","season","plant","sow"],
    respond: () => {
      const factor = SENSOR.soilMoisture === 0 ? 0.3 : 0.7;
      const phFactor = SENSOR.ph > 8.5 ? 0.6 : 1;
      const yieldPct = Math.round(factor * phFactor * 100);
      return `YIELD PROJECTION COMPUTED.\nField: ${SENSOR.fieldId}\nEstimated yield efficiency: ${yieldPct}% of optimal.\nPrimary yield limiters: ${SENSOR.soilMoisture === 0 ? "water deficit" : "nutrient imbalance"}, ${SENSOR.ph > 8.5 ? "pH lock" : "temperature stress"}.\nProjected harvest window: ${yieldPct > 70 ? "ON SCHEDULE" : yieldPct > 40 ? "DELAYED 2-3 weeks" : "AT RISK — intervention required to recover season"}.\nTo reach 90%+ yield efficiency: correct NPK, normalise pH to 6.5-7.2, achieve 60% soil moisture within 72 hours.`;
    },
    icon: "◑",
  },
  {
    id: "status",
    label: "FULL FIELD STATUS",
    color: "#00ff88",
    keywords: ["status","report","summary","overview","all","everything","field","check","scan","general","show","display"],
    respond: () =>
      `FULL FIELD REPORT — ${SENSOR.fieldId}\n${"─".repeat(36)}\nNitrogen    : ${SENSOR.nitrogen} mg/kg\nPhosphorus  : ${SENSOR.phosphorus} mg/kg  ${SENSOR.phosphorus === 0 ? "[!] CRITICAL" : ""}\nPotassium   : ${SENSOR.potassium} mg/kg\nSoil pH     : ${SENSOR.ph}  ${SENSOR.ph > 8.5 ? "[!] ALKALINE" : ""}\nTurbidity   : ${SENSOR.turbidity} NTU  ${SENSOR.turbidity > 1000 ? "[!] HIGH" : ""}\nTemperature : ${SENSOR.temperature}°C  ${SENSOR.temperature > 30 ? "[!] HEAT STRESS" : ""}\nMoisture    : ${SENSOR.soilMoisture === 0 ? "0% [!] CRITICAL" : SENSOR.soilMoisture + "%"}\nHumidity    : ${SENSOR.humidity}%\nRainfall    : ${SENSOR.rainfall} mm\nWind        : ${SENSOR.windSpeed} km/h\n${"─".repeat(36)}\nAGRI-OS ASSESSMENT: ${SENSOR.soilMoisture === 0 || SENSOR.phosphorus === 0 ? "IMMEDIATE ACTION REQUIRED" : "MONITOR AND MAINTAIN"}.`,
    icon: "◎",
  },
];

function classify(text) {
  const lower = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const intent of INTENTS) {
    const score = intent.keywords.filter(k => lower.includes(k)).length;
    if (score > bestScore) { bestScore = score; best = intent; }
  }
  return bestScore > 0 ? best : INTENTS[5]; // default to status
}

/* ─────────────────────────────────────────────
   STYLES (all inline — zero CSS file needed)
───────────────────────────────────────────── */
const S = {
  root: {
    minHeight: "100vh",
    background: "#060c08",
    color: "#00ff41",
    fontFamily: "'Share Tech Mono', 'Courier New', monospace",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 16px",
    position: "relative",
    overflowX: "hidden",
  },
  canvas: {
    position: "fixed", top:0, left:0, width:"100%", height:"100%",
    zIndex:0, pointerEvents:"none",
  },
  scanline: {
    position:"fixed", inset:0, zIndex:999, pointerEvents:"none",
    background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)",
  },
  wrap: {
    position:"relative", zIndex:1, width:"100%", maxWidth:760,
  },
  panel: (borderColor="rgba(0,255,65,0.2)") => ({
    background:"rgba(0,18,6,0.92)",
    border:`1px solid ${borderColor}`,
    borderRadius:3,
    position:"relative",
    overflow:"hidden",
  }),
};

/* ─────────────────────────────────────────────
   MATRIX RAIN CANVAS
───────────────────────────────────────────── */
function MatrixRain() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current, ctx = c.getContext("2d");
    let id, drops;
    const CHARS = "01アNPKpH◈◉◆◬◑◎∇Ω⚡";
    const resize = () => {
      c.width = window.innerWidth; c.height = window.innerHeight;
      drops = Array(Math.floor(c.width/16)).fill(1);
    };
    const draw = () => {
      ctx.fillStyle="rgba(6,12,8,0.06)";
      ctx.fillRect(0,0,c.width,c.height);
      ctx.font="11px monospace";
      drops.forEach((y,i)=>{
        const depth = Math.random();
        ctx.fillStyle = depth > 0.9 ? "#00ff41" : depth > 0.5 ? "#004d12" : "#002208";
        ctx.fillText(CHARS[Math.floor(Math.random()*CHARS.length)],i*16,y*16);
        if(y*16>c.height&&Math.random()>0.975) drops[i]=0;
        drops[i]++;
      });
      id=requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener("resize",resize);
    return ()=>{cancelAnimationFrame(id);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={S.canvas}/>;
}

/* ─────────────────────────────────────────────
   WAVEFORM VISUALIZER (microphone animation)
───────────────────────────────────────────── */
function Waveform({ active, color="#00ff41" }) {
  const bars = 32;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:2, height:40, padding:"0 4px" }}>
      {Array.from({length:bars}).map((_,i)=>(
        <motion.div key={i}
          animate={active ? {
            height: ["4px", `${8+Math.random()*28}px`, "4px"],
            opacity: [0.4, 1, 0.4],
          } : { height:"3px", opacity:0.15 }}
          transition={active ? {
            duration: 0.3 + Math.random()*0.4,
            repeat: Infinity,
            delay: i*0.02,
            ease:"easeInOut",
          } : { duration:0.3 }}
          style={{ width:3, background:color, borderRadius:1, minHeight:3 }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   TYPEWRITER TEXT
───────────────────────────────────────────── */
function TypeWriter({ text, color="#00ff41", speed=18, onDone }) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setShown(""); setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setShown(text.slice(0,i));
      if(i>=text.length){ clearInterval(iv); setDone(true); onDone && onDone(); }
    }, speed);
    return () => clearInterval(iv);
  }, [text]);

  return (
    <pre style={{
      fontFamily:"'Share Tech Mono','Courier New',monospace",
      fontSize:12, lineHeight:1.7, color,
      margin:0, whiteSpace:"pre-wrap", wordBreak:"break-word",
    }}>
      {shown}
      {!done && <span style={{ animation:"vc-blink .7s step-end infinite", color }}> █</span>}
    </pre>
  );
}

/* ─────────────────────────────────────────────
   CORNER BRACKETS
───────────────────────────────────────────── */
const Corner = ({ pos, color="rgba(0,255,65,0.5)" }) => {
  const styles = {
    tl: { top:0,left:0,    borderWidth:"1px 0 0 1px" },
    tr: { top:0,right:0,   borderWidth:"1px 1px 0 0" },
    bl: { bottom:0,left:0, borderWidth:"0 0 1px 1px" },
    br: { bottom:0,right:0,borderWidth:"0 1px 1px 0" },
  };
  return <div style={{ position:"absolute", width:14, height:14, borderColor:color, borderStyle:"solid", ...styles[pos] }}/>;
};

/* ─────────────────────────────────────────────
   INTENT BADGE
───────────────────────────────────────────── */
function IntentBadge({ intent }) {
  return (
    <motion.div
      initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }}
      style={{
        display:"inline-flex", alignItems:"center", gap:8,
        padding:"5px 14px", border:`1px solid ${intent.color}55`,
        borderRadius:2, background:`${intent.color}10`,
        fontFamily:"'Orbitron',sans-serif", fontSize:10,
        letterSpacing:2, color:intent.color,
      }}
    >
      <span style={{ fontSize:16 }}>{intent.icon}</span>
      {intent.label}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   HISTORY ITEM
───────────────────────────────────────────── */
function HistoryItem({ item, index }) {
  return (
    <motion.div
      initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        borderLeft:`2px solid ${item.intent.color}55`,
        paddingLeft:12, marginBottom:12,
      }}
    >
      <div style={{ fontSize:10, color:"#004d12", marginBottom:4, letterSpacing:1 }}>
        [{item.time}] &nbsp;
        <span style={{ color: item.intent.color }}>
          {item.intent.icon} {item.intent.label}
        </span>
      </div>
      <div style={{ fontSize:11, color:"#006620", fontStyle:"italic", marginBottom:4 }}>
        &gt; "{item.transcript}"
      </div>
      <div style={{ fontSize:11, color:"#00aa2a", whiteSpace:"pre-wrap", lineHeight:1.6 }}>
        {item.response.slice(0,200)}{item.response.length>200?"…":""}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   QUICK COMMAND BUTTONS
───────────────────────────────────────────── */
const QUICK_CMDS = [
  { label:"Full Status",  text:"show full field status report" },
  { label:"Water Check",  text:"check water and irrigation levels" },
  { label:"Nutrient Scan",text:"analyze soil nutrients NPK" },
  { label:"Risk Report",  text:"what are the current risks and threats" },
  { label:"Yield Forecast",text:"forecast crop yield this season" },
  { label:"Climate",      text:"check temperature and climate conditions" },
];

/* ─────────────────────────────────────────────
   CIRCULAR HOLD BUTTON
───────────────────────────────────────────── */
function HoldButton({ listening, onStart, onStop }) {
  return (
    <div style={{ position:"relative", width:120, height:120, cursor:"pointer" }}
      onMouseDown={onStart} onMouseUp={onStop}
      onTouchStart={e=>{e.preventDefault();onStart();}} onTouchEnd={onStop}
    >
      {/* outer pulse rings */}
      {listening && [1,2,3].map(i=>(
        <motion.div key={i}
          animate={{ scale:[1,2.2], opacity:[0.4,0] }}
          transition={{ duration:1.8, delay:i*0.6, repeat:Infinity }}
          style={{
            position:"absolute", inset:0, borderRadius:"50%",
            border:"1px solid #00ff41",
          }}
        />
      ))}
      {/* main circle */}
      <motion.div
        animate={listening ? { scale:0.92, boxShadow:"0 0 40px #00ff4155,0 0 80px #00ff4122" } : { scale:1, boxShadow:"0 0 0px transparent" }}
        transition={{ duration:0.15 }}
        style={{
          position:"absolute", inset:0, borderRadius:"50%",
          border:`2px solid ${listening?"#00ff41":"rgba(0,255,65,0.35)"}`,
          background:listening?"rgba(0,255,65,0.08)":"rgba(0,20,5,0.9)",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:4,
          userSelect:"none",
        }}
      >
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <rect x={9} y={2} width={6} height={13} rx={3}
            stroke={listening?"#00ff41":"#006620"} strokeWidth={1.5}/>
          <path d="M5 11a7 7 0 0 0 14 0" stroke={listening?"#00ff41":"#006620"} strokeWidth={1.5} strokeLinecap="round"/>
          <line x1={12} y1={18} x2={12} y2={22} stroke={listening?"#00ff41":"#006620"} strokeWidth={1.5} strokeLinecap="round"/>
          <line x1={8} y1={22} x2={16} y2={22} stroke={listening?"#00ff41":"#006620"} strokeWidth={1.5} strokeLinecap="round"/>
        </svg>
        <div style={{
          fontSize:8, letterSpacing:2,
          color:listening?"#00ff41":"#006620",
          fontFamily:"'Orbitron',monospace",
        }}>
          {listening?"LISTENING":"HOLD"}
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function VoiceCommander() {
  const [listening, setListening]   = useState(false);
  const [transcript, setTranscript] = useState("");
  const [phase, setPhase]           = useState("idle"); // idle | listening | processing | responding
  const [currentIntent, setIntent]  = useState(null);
  const [currentResponse, setResponse] = useState("");
  const [history, setHistory]       = useState([]);
  const [error, setError]           = useState("");
  const [supported, setSupported]   = useState(true);
  const recogRef = useRef(null);
  const historyRef = useRef(null);

  // Google Fonts injection
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap";
    document.head.appendChild(link);
    // Inject blink keyframe
    const style = document.createElement("style");
    style.textContent = `@keyframes vc-blink{0%,100%{opacity:1}50%{opacity:0}}`;
    document.head.appendChild(style);
    // Check support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  const handleText = useCallback((text) => {
    if (!text.trim()) return;
    setTranscript(text);
    setPhase("processing");

    setTimeout(() => {
      const intent = classify(text);
      setIntent(intent);
      setPhase("responding");

      const response = intent.respond();
      setResponse(response);

      const now = new Date();
      const timeStr = [now.getHours(),now.getMinutes(),now.getSeconds()]
        .map(v=>String(v).padStart(2,"0")).join(":");

      setTimeout(() => {
        setHistory(prev => [{
          transcript: text,
          intent,
          response,
          time: timeStr,
        }, ...prev].slice(0,20));
      }, response.length * 18 + 500);
    }, 800);
  }, []);

  const startListening = useCallback(() => {
    if (!supported) return;
    setError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onstart = () => { setListening(true); setPhase("listening"); setTranscript(""); setResponse(""); setIntent(null); };
    recog.onresult = (e) => {
      const t = Array.from(e.results).map(r=>r[0].transcript).join("");
      setTranscript(t);
    };
    recog.onend = () => {
      setListening(false);
      const t = recogRef.current?.lastTranscript;
      if (t) handleText(t);
    };
    recog.onerror = (e) => {
      setListening(false);
      setPhase("idle");
      if (e.error !== "no-speech" && e.error !== "aborted") setError(`Voice error: ${e.error}`);
    };

    recogRef.current = recog;
    recog.start();
  }, [supported, handleText]);

  const stopListening = useCallback(() => {
    if (recogRef.current) {
      recogRef.current.lastTranscript = transcript;
      recogRef.current.stop();
    }
  }, [transcript]);

  const runQuickCmd = (text) => {
    setTranscript(text);
    setPhase("idle");
    setResponse("");
    setIntent(null);
    setTimeout(() => handleText(text), 100);
  };

  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock([n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>String(v).padStart(2,"0")).join(":"));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={S.root}>
      <style>{`@keyframes vc-blink{0%,100%{opacity:1}50%{opacity:0}} @keyframes vc-sweep{from{left:-100%}to{left:100%}}`}</style>
      <MatrixRain />
      <div style={S.scanline}/>

      <div style={S.wrap}>

        {/* ── HEADER ── */}
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}
          style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:9, letterSpacing:6, color:"#003a0e", marginBottom:6 }}>
            AGRI-OS v4.7 // NEURAL FIELD INTERFACE
          </div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:24, fontWeight:900, letterSpacing:2, color:"#00ff41", textShadow:"0 0 30px #00ff4133" }}>
            AI VOICE COMMANDER
          </div>
          <div style={{ fontSize:10, color:"#004d12", letterSpacing:4, marginTop:4 }}>
            SPEAK TO YOUR FIELD — NATURAL LANGUAGE INTELLIGENCE
          </div>
          <div style={{ height:1, background:"linear-gradient(90deg,transparent,#00ff41,transparent)", margin:"14px 0" }}/>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#004d12" }}>
            <span>
              <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:listening?"#00ff41":"#004d12", marginRight:6, verticalAlign:"middle", boxShadow:listening?"0 0 8px #00ff41":"none", transition:"all .3s" }}/>
              {listening ? "VOICE ACTIVE" : "STANDBY"}
            </span>
            <span style={{ fontFamily:"'Orbitron',sans-serif" }}>{clock}</span>
            <span>NODE: {SENSOR.fieldId}</span>
          </div>
        </motion.div>

        {/* ── MAIN INPUT PANEL ── */}
        <div style={{ ...S.panel(), padding:24, marginBottom:16 }}>
          <Corner pos="tl"/> <Corner pos="tr"/> <Corner pos="bl"/> <Corner pos="br"/>

          {/* Sweep line */}
          <motion.div
            animate={{ left:["-100%","110%"] }}
            transition={{ duration:4, repeat:Infinity, ease:"linear" }}
            style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,#00ff41,transparent)", pointerEvents:"none" }}
          />

          <div style={{ display:"flex", gap:24, alignItems:"center" }}>

            {/* HOLD BUTTON */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, flexShrink:0 }}>
              {supported
                ? <HoldButton listening={listening} onStart={startListening} onStop={stopListening}/>
                : <div style={{ fontSize:10, color:"#ff2244", textAlign:"center", maxWidth:120 }}>Voice not supported. Use quick commands below.</div>
              }
              {supported && (
                <div style={{ fontSize:9, color:"#004d12", letterSpacing:1, textAlign:"center" }}>
                  HOLD TO SPEAK<br/>RELEASE TO PROCESS
                </div>
              )}
            </div>

            {/* CENTER — transcript + waveform */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:9, letterSpacing:2, color:"#004d12", marginBottom:8 }}>
                VOICE INPUT STREAM
              </div>
              <Waveform active={listening} color={listening?"#00ff41":"#004d12"}/>
              <div style={{
                marginTop:10, minHeight:52, padding:"10px 14px",
                border:"1px solid rgba(0,255,65,0.12)", borderRadius:2,
                fontSize:13, color: phase==="listening"?"#00ff41":"#00aa2a",
                fontStyle: transcript?"normal":"italic",
                lineHeight:1.6,
              }}>
                {phase === "listening" && !transcript && (
                  <span style={{ color:"#004d12", animation:"vc-blink 1s step-end infinite" }}>
                    Awaiting voice input...
                  </span>
                )}
                {transcript || (phase==="idle" && "Speak a command or use quick buttons below.")}
              </div>

              {/* Phase status */}
              <AnimatePresence mode="wait">
                {phase !== "idle" && (
                  <motion.div
                    key={phase}
                    initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    style={{ marginTop:8, fontSize:10, letterSpacing:2,
                      color: phase==="processing"?"#ffaa00":phase==="responding"?currentIntent?.color||"#00ff41":"#00ff41" }}
                  >
                    {phase==="listening"   && "// RECORDING..."}
                    {phase==="processing"  && "// NLP CLASSIFICATION IN PROGRESS..."}
                    {phase==="responding"  && currentIntent && `// MODULE: ${currentIntent.label}`}
                  </motion.div>
                )}
              </AnimatePresence>
              {error && <div style={{ marginTop:8, fontSize:10, color:"#ff2244" }}>{error}</div>}
            </div>
          </div>
        </div>

        {/* ── QUICK COMMANDS ── */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:9, letterSpacing:3, color:"#004d12", marginBottom:10 }}>
            QUICK COMMANDS
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {QUICK_CMDS.map(cmd => (
              <motion.button
                key={cmd.label}
                whileHover={{ scale:1.04, borderColor:"rgba(0,255,65,0.6)" }}
                whileTap={{ scale:0.96 }}
                onClick={() => runQuickCmd(cmd.text)}
                disabled={phase==="processing"||phase==="responding"}
                style={{
                  background:"rgba(0,18,6,0.9)", border:"1px solid rgba(0,255,65,0.2)",
                  borderRadius:2, padding:"7px 14px", color:"#006620",
                  fontFamily:"'Share Tech Mono',monospace", fontSize:11,
                  letterSpacing:1, cursor:"pointer",
                  transition:"border-color .2s, color .2s",
                  opacity: (phase==="processing"||phase==="responding") ? 0.4 : 1,
                }}
              >
                {cmd.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── RESPONSE PANEL ── */}
        <AnimatePresence>
          {(phase==="responding" || phase==="processing") && (
            <motion.div
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
              style={{ ...S.panel(`${currentIntent?.color||"rgba(0,255,65,0.3)"}55`), padding:20, marginBottom:16 }}
            >
              <Corner pos="tl" color={`${currentIntent?.color||"#00ff41"}88`}/>
              <Corner pos="tr" color={`${currentIntent?.color||"#00ff41"}88`}/>
              <Corner pos="bl" color={`${currentIntent?.color||"#00ff41"}88`}/>
              <Corner pos="br" color={`${currentIntent?.color||"#00ff41"}88`}/>

              {/* Intent badge */}
              <div style={{ marginBottom:14 }}>
                {currentIntent
                  ? <IntentBadge intent={currentIntent}/>
                  : <div style={{ fontSize:10, color:"#ffaa00", letterSpacing:3, animation:"vc-blink .8s step-end infinite" }}>CLASSIFYING INPUT...</div>
                }
              </div>

              {/* Response text */}
              {phase==="responding" && currentResponse && (
                <TypeWriter
                  text={currentResponse}
                  color={currentIntent?.color||"#00ff41"}
                  speed={16}
                  onDone={() => setTimeout(() => setPhase("idle"), 600)}
                />
              )}

              {phase==="processing" && (
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {[0,1,2,3,4].map(i=>(
                    <motion.div key={i}
                      animate={{ opacity:[0.2,1,0.2], scaleY:[0.5,1,0.5] }}
                      transition={{ duration:0.8, delay:i*0.12, repeat:Infinity }}
                      style={{ width:3, height:20, background:"#ffaa00", borderRadius:1 }}
                    />
                  ))}
                  <span style={{ fontSize:10, color:"#ffaa00", marginLeft:8, letterSpacing:2 }}>
                    NEURAL PROCESSING...
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── COMMAND HISTORY ── */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ ...S.panel(), padding:20 }}
            ref={historyRef}
          >
            <Corner pos="tl"/> <Corner pos="tr"/> <Corner pos="bl"/> <Corner pos="br"/>
            <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:9, letterSpacing:3, color:"#004d12", marginBottom:16, borderLeft:"2px solid rgba(0,255,65,0.4)", paddingLeft:10 }}>
              COMMAND LOG — {history.length} SESSION{history.length!==1?"S":""}
            </div>
            <div style={{ maxHeight:280, overflowY:"auto", paddingRight:4 }}>
              {history.map((item,i) => <HistoryItem key={i} item={item} index={i}/>)}
            </div>
          </motion.div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ marginTop:20, display:"flex", justifyContent:"space-between", fontSize:9, color:"#003a0e", letterSpacing:1, borderTop:"1px solid rgba(0,255,65,0.08)", paddingTop:12 }}>
          <span>AGRI-OS NLP ENGINE // INTENT CLASSIFICATION ACTIVE</span>
          <span style={{ animation:"vc-blink 1.2s step-end infinite" }}>NEURAL LINK OPEN</span>
          <span>SYN: {clock}</span>
        </div>

      </div>
    </div>
  );
}