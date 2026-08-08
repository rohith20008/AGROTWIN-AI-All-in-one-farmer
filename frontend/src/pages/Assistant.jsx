import { useState, useRef, useEffect, useCallback } from "react";

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
    const chars = "AGCTNUCLEOTIDEPLANTPATHOGENFUNGALVIRUSBACTERIADNASEQUENCE01SOILPHROOTLEAFSTEMNPK".split("");
    const interval = setInterval(() => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.98 ? "#afffaf" : "#00ff4133";
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
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 1,
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)",
    }} />
  );
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
function Typewriter({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const t = setInterval(() => {
      setDisplayed(text.slice(0, i + 1)); i++;
      if (i >= text.length) { clearInterval(t); setDone(true); }
    }, speed);
    return () => clearInterval(t);
  }, [text]);
  return (
    <span>
      {displayed}
      {!done && <span style={{ color: "#00ff41", animation: "blink 0.6s step-end infinite" }}>_</span>}
    </span>
  );
}

// ── Thinking Animation ───────────────────────────────────────
function ThinkingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 0" }}>
      <span style={{ fontSize: "0.6rem", color: "#00ff4188", letterSpacing: "0.15em" }}>PROCESSING</span>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          width: 5, height: 5,
          background: "#00ff41",
          borderRadius: "50%",
          animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          boxShadow: "0 0 6px #00ff41",
        }} />
      ))}
      <style>{`
        @keyframes dotPulse {
          0%,80%,100%{transform:scale(0.5);opacity:0.3}
          40%{transform:scale(1.2);opacity:1}
        }
      `}</style>
    </div>
  );
}

// ── Message Bubble ───────────────────────────────────────────
function Message({ msg, isLatestAI }) {
  const isUser = msg.role === "user";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "1rem",
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : isUser ? "translateX(20px)" : "translateX(-20px)",
      transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {/* AI avatar */}
      {!isUser && (
        <div style={{
          width: 32, height: 32, marginRight: 10, flexShrink: 0,
          border: "1px solid #00ff4166", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", alignSelf: "flex-end",
        }}>
          <div style={{ width: 10, height: 10, background: "#00ff41", borderRadius: "50%", boxShadow: "0 0 8px #00ff41", animation: "pulse 2s ease-in-out infinite" }} />
          <div style={{ position: "absolute", inset: -3, border: "1px dashed #00ff4133", borderRadius: "50%", animation: "spin 6s linear infinite" }} />
        </div>
      )}

      <div style={{
        maxWidth: "65%",
        position: "relative",
      }}>
        {/* Label */}
        <div style={{
          fontSize: "0.5rem", letterSpacing: "0.2em",
          color: isUser ? "#00ff4188" : "#00ff4166",
          marginBottom: "0.3rem",
          textAlign: isUser ? "right" : "left",
        }}>
          {isUser ? "OPERATOR INPUT" : "AGRI-AI RESPONSE"}
        </div>

        <div style={{
          padding: "0.9rem 1.1rem",
          background: isUser ? "#000" : "#020a02",
          border: `1px solid ${isUser ? "#00ff4166" : "#00ff4133"}`,
          borderRadius: 4,
          color: isUser ? "#00ff41" : "#ccc",
          fontSize: "0.82rem",
          lineHeight: 1.65,
          fontFamily: "'Share Tech Mono', monospace",
          boxShadow: isUser
            ? "0 0 20px #00ff4122"
            : "none",
          position: "relative",
        }}>
          <HUDCorners color={isUser ? "#00ff4166" : "#00ff4122"} size={8} />
          {!isUser && isLatestAI ? <Typewriter text={msg.content} /> : msg.content}
        </div>

        {/* Timestamp */}
        <div style={{
          fontSize: "0.5rem", color: "#333", letterSpacing: "0.1em",
          marginTop: "0.3rem", textAlign: isUser ? "right" : "left",
        }}>
          {new Date().toTimeString().slice(0, 8)}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          width: 32, height: 32, marginLeft: 10, flexShrink: 0,
          border: "1px solid #00ff41", borderRadius: 2,
          display: "flex", alignItems: "center", justifyContent: "center",
          alignSelf: "flex-end", background: "#00ff4111",
        }}>
          <div style={{ width: 12, height: 12, border: "1px solid #00ff41", borderRadius: 1 }} />
        </div>
      )}
    </div>
  );
}

// ── Suggested Prompts ────────────────────────────────────────
const SUGGESTIONS = [
  "How do I treat powdery mildew?",
  "Best fertilizer for tomatoes?",
  "Signs of nitrogen deficiency?",
  "How to improve soil pH?",
];

// ── Main Component ───────────────────────────────────────────
export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "AGRI-AI ONLINE. Neural pathogen database loaded. Smart farming intelligence active. Ask me anything about crop diseases, soil health, or farming protocols.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [latestAIIndex, setLatestAIIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [msgCount, setMsgCount] = useState(1);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1000); return () => clearInterval(t); }, []);
  const timeStr = new Date().toTimeString().slice(0, 8);
  const dateStr = new Date().toLocaleDateString("en-GB").replace(/\//g, ".");

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content) return;

    const userMsg = { role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");
    setMsgCount(c => c + 1);

    try {
      const res = await fetch("http://127.0.0.1:5000/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      if (!res.ok) throw new Error(`SERVER ERROR ${res.status}`);
      const data = await res.json();
      const reply = data.reply || "No response received from AI service.";
      setMessages(prev => {
        const next = [...prev, { role: "assistant", content: reply }];
        setLatestAIIndex(next.length - 1);
        setMsgCount(c => c + 1);
        return next;
      });
    } catch (err) {
      setError(err.message);
      setMessages(prev => {
        const next = [...prev, { role: "assistant", content: "CONNECTION FAILED. Unable to reach AI service. Verify backend is running on port 5000 and retry." }];
        setLatestAIIndex(next.length - 1);
        return next;
      });
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "#000", fontFamily: "'Share Tech Mono', monospace",
      color: "#00ff41", position: "relative", overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />

      <MatrixRain />
      <Scanlines />

      {/* ── TOP HUD BAR ── */}
      <div style={{
        position: "relative", zIndex: 10,
        background: "rgba(0,0,0,0.95)", borderBottom: "1px solid #00ff4122",
        backdropFilter: "blur(10px)",
        padding: "0.6rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
        animation: "slideDown 0.5s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
          <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1rem", fontWeight: 900, letterSpacing: "0.1em" }}>
            <GlitchText text="AGRI" />
            <span style={{ color: "#fff" }}>//</span>
            <span style={{ color: "#fff" }}>AI</span>
          </div>
          <div style={{ fontSize: "0.55rem", color: "#00ff4155", letterSpacing: "0.2em" }}>
            SMART FARMING INTELLIGENCE SYSTEM
          </div>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.55rem", color: "#00ff4177", letterSpacing: "0.1em" }}>
          <span>MSGS: <span style={{ color: "#00ff41" }}>{msgCount}</span></span>
          <span>{dateStr}</span>
          <span style={{ color: "#00ff41" }}>{timeStr}</span>
          <span style={{ animation: "blink 2s step-end infinite", color: "#00ff41" }}>ONLINE</span>
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      <div style={{
        flex: 1, position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", minHeight: 0,
      }}>
        {/* Side HUD lines */}
        <div style={{ position: "absolute", left: 12, top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg, transparent, #00ff4122, transparent)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 12, top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg, transparent, #00ff4122, transparent)", pointerEvents: "none" }} />

        {/* Messages scroll area */}
        <div ref={chatRef} style={{
          flex: 1, overflowY: "auto", padding: "1.5rem 2rem",
          scrollbarWidth: "thin", scrollbarColor: "#00ff4133 #000",
        }}>
          {/* System boot message */}
          <div style={{
            textAlign: "center", marginBottom: "1.5rem",
            fontSize: "0.55rem", color: "#00ff4133", letterSpacing: "0.2em",
            animation: "fadeIn 1s ease",
          }}>
            -- SESSION INITIALIZED {dateStr} {timeStr} -- ENCRYPTION ACTIVE --
          </div>

          {messages.map((msg, i) => (
            <Message key={i} msg={msg} isLatestAI={i === latestAIIndex && msg.role === "assistant"} />
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: "1rem", animation: "fadeIn 0.3s ease" }}>
              <div style={{
                width: 32, height: 32, border: "1px solid #00ff4166", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                position: "relative",
              }}>
                <div style={{ width: 10, height: 10, background: "#00ff41", borderRadius: "50%", boxShadow: "0 0 8px #00ff41", animation: "pulse 1s ease-in-out infinite" }} />
                <div style={{ position: "absolute", inset: -3, border: "1px dashed #00ff4133", borderRadius: "50%", animation: "spin 3s linear infinite" }} />
              </div>
              <div style={{
                background: "#020a02", border: "1px solid #00ff4133",
                padding: "0.9rem 1.1rem", borderRadius: 4, position: "relative",
              }}>
                <HUDCorners color="#00ff4122" size={8} />
                <ThinkingDots />
              </div>
            </div>
          )}
        </div>

        {/* ── SUGGESTED PROMPTS ── */}
        {messages.length <= 2 && !loading && (
          <div style={{
            padding: "0 2rem 0.75rem", display: "flex", gap: "0.5rem",
            flexWrap: "wrap", zIndex: 10, position: "relative",
            animation: "fadeIn 1s ease 0.5s both",
          }}>
            <span style={{ fontSize: "0.55rem", color: "#333", letterSpacing: "0.15em", alignSelf: "center" }}>QUICK QUERY:</span>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)} style={{
                background: "#000", border: "1px solid #00ff4133",
                color: "#00ff4188", fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.6rem", padding: "4px 10px", cursor: "pointer",
                letterSpacing: "0.05em", borderRadius: 2,
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.target.style.borderColor = "#00ff41"; e.target.style.color = "#00ff41"; e.target.style.boxShadow = "0 0 10px #00ff4133"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#00ff4133"; e.target.style.color = "#00ff4188"; e.target.style.boxShadow = "none"; }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* ── INPUT AREA ── */}
        <div style={{
          position: "relative", zIndex: 10,
          background: "rgba(0,0,0,0.95)", borderTop: "1px solid #00ff4122",
          backdropFilter: "blur(10px)",
          padding: "1rem 1.5rem",
          flexShrink: 0,
        }}>
          {/* Error */}
          {error && (
            <div style={{
              marginBottom: "0.75rem", padding: "0.6rem 1rem",
              background: "#0a0000", border: "1px solid #ff220055",
              color: "#ff4422", fontSize: "0.65rem", letterSpacing: "0.05em",
              animation: "fadeIn 0.3s ease",
            }}>
              // ERROR: {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
            {/* Input label */}
            <div style={{
              fontSize: "0.55rem", color: "#00ff4166", letterSpacing: "0.15em",
              whiteSpace: "nowrap", paddingBottom: "0.8rem",
            }}>
              {">"}_
            </div>

            {/* Textarea wrapper */}
            <div style={{ flex: 1, position: "relative" }}>
              <HUDCorners color="#00ff4133" size={10} />
              <textarea
                ref={inputRef}
                rows={1}
                placeholder="ENTER QUERY..."
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                onKeyDown={handleKey}
                style={{
                  width: "100%", padding: "0.75rem 1rem",
                  background: "#000", border: "1px solid #00ff4133",
                  color: "#00ff41", fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.8rem", resize: "none", outline: "none",
                  borderRadius: 2, lineHeight: 1.5,
                  caretColor: "#00ff41",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                  scrollbarWidth: "none",
                }}
                onFocus={e => { e.target.style.borderColor = "#00ff41"; e.target.style.boxShadow = "0 0 15px #00ff4122"; }}
                onBlur={e => { e.target.style.borderColor = "#00ff4133"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                padding: "0.75rem 1.4rem", flexShrink: 0,
                background: "#000",
                border: `1px solid ${loading || !input.trim() ? "#222" : "#00ff41"}`,
                color: loading || !input.trim() ? "#333" : "#00ff41",
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.7rem", letterSpacing: "0.2em",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                position: "relative", overflow: "hidden",
                transition: "all 0.2s",
                borderRadius: 2,
              }}
              onMouseEnter={e => { if (!loading && input.trim()) { e.target.style.background = "#00ff4111"; e.target.style.boxShadow = "0 0 20px #00ff4133"; } }}
              onMouseLeave={e => { e.target.style.background = "#000"; e.target.style.boxShadow = "none"; }}
            >
              {loading ? (
                <span style={{ animation: "blink 0.5s step-end infinite" }}>...</span>
              ) : "SEND"}
              {!loading && input.trim() && (
                <div style={{
                  position: "absolute", bottom: 0, left: "-100%", width: "100%", height: 1,
                  background: "linear-gradient(90deg, transparent, #00ff41, transparent)",
                  animation: "sweep 1.5s linear infinite",
                }} />
              )}
            </button>
          </div>

          {/* Bottom status */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: "0.5rem", fontSize: "0.5rem", color: "#00ff4133", letterSpacing: "0.1em",
          }}>
            <span>ENTER TO SEND — SHIFT+ENTER FOR NEWLINE</span>
            <span>BACKEND: 127.0.0.1:5000</span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM STATUS BAR ── */}
      <div style={{
        position: "relative", zIndex: 10,
        background: "rgba(0,0,0,0.95)", borderTop: "1px solid #00ff4111",
        padding: "0.3rem 1.5rem",
        display: "flex", justifyContent: "space-between",
        fontSize: "0.5rem", color: "#00ff4133", letterSpacing: "0.1em",
        flexShrink: 0,
      }}>
        <span>AGRI//AI v2.1.0 — SMART FARMING INTELLIGENCE</span>
        <span>MODEL: GPT-AGRI — CONTEXT: ACTIVE</span>
        <span style={{ animation: "blink 2s step-end infinite", color: "#00ff4166" }}>SECURE CHANNEL ACTIVE</span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #000; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:none} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes sweep { from{left:-100%} to{left:100%} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.3);opacity:0.6} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        textarea::placeholder { color: #00ff4133; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #00ff4133; }
        ::-webkit-scrollbar-thumb:hover { background: #00ff41; }
        ::selection { background: #00ff4133; color: #00ff41; }
      `}</style>
    </div>
  );
}