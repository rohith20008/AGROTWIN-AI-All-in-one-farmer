export default function SensorCard({ title, value, unit, style }) {
  return (
    <div
      style={{
        position: "absolute",
        background: "#111",
        padding: "10px",
        borderRadius: "10px",
        fontSize: "12px",
        ...style
      }}
    >
      <div style={{ color: "#aaa" }}>{title}</div>
      <div style={{ fontWeight: "bold" }}>
        {value} {unit}
      </div>
    </div>
  );
}