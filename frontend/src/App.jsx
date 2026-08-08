import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/ui/Sidebar";
import Dashboard from "./pages/Dashboard";

import DiseaseDetection from "./pages/DiseaseDetection";
import CropPrediction from "./pages/CropPrediction";

import SoilIntelligence from "./pages/SoilIntelligence";
import Weather from "./pages/Weather";
import Assistant from "./pages/Assistant";
import RiskAnalysis from "./pages/RiskAnalysis";
import ProfitEstimator from "./pages/ProfitEstimator";
import Alerts from "./pages/Alerts";
import LandReport from "./pages/LandReport";
import VoiceCommander from "./pages/VoiceCommander";

export default function App() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      <Sidebar />

      <div style={{ flex: 1, padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/disease" element={<DiseaseDetection />} />
          <Route path="/crop" element={<CropPrediction />} />

          <Route path="/nutrient" element={<SoilIntelligence />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/risk" element={<RiskAnalysis />} />
          <Route path="/profit" element={<ProfitEstimator />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/LandReport" element={<LandReport />} />
          <Route path="/water" element={<VoiceCommander />} />


        </Routes>
      </div>

    </div>
  );
}