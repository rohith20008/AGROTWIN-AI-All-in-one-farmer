export default function SensorPopup({ sensor }) {
  if (!sensor) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "30px",
        right: "30px",
        width: "250px",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(10px)",
        padding: "15px",
        borderRadius: "12px",
        border: "1px solid #00ffcc",
      }}
    >
      <h3>{sensor.name}</h3>
      <p>Value: {sensor.value}</p>
      <p>Status: Normal</p>
    </div>
  );
}