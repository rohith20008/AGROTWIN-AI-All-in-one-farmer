export default function GlassCard({ children, style }) {
  return (
    <div
      style={{
        position: "absolute",
        backdropFilter: "blur(12px)",
        background: "rgba(0,0,0,0.4)",
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