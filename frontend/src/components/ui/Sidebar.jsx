import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={{
      width: "240px",
      height: "100vh",
      background: "#0b0f14",
      borderRight: "1px solid #111",
      padding: "20px",
      color: "white"
    }}>
      <h2 style={{ marginBottom: "30px" }}>RealAgro</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <Link to="/">Dashboard</Link>
        <Link to="/crop">Crop Prediction</Link>
        <Link to="/disease">Disease Detection</Link>
        <Link to="/water"> Field Voice Commander</Link>
        <Link to="/nutrient">Nutrient Detection</Link>
        <Link to="/weather">Weather</Link>
        <Link to="/risk">Risk Analysis</Link>
        <Link to="/profit">Profit Estimator</Link>
        <Link to="/alerts">Alerts</Link>
        <Link to="/assistant">AI Assistant</Link>
        <Link to="/LandReport">Land Report</Link>
      </nav>
    </div>
  );
}