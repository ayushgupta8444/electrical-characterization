import { createContext, useMemo, useState } from "react";

const API_URL = "https://electrical-characterization.onrender.com";

const AnalysisContext = createContext(null);

function parseManualInput(vgs, vds, id) {
  const vgsVals = vgs.split(",").map(v => Number(v.trim())).filter(v => !Number.isNaN(v));
  const vdsVals = vds.split(",").map(v => Number(v.trim())).filter(v => !Number.isNaN(v));
  const idVals = id.split(",").map(v => Number(v.trim())).filter(v => !Number.isNaN(v));

  const len = Math.min(vgsVals.length, vdsVals.length, idVals.length);

  return Array.from({ length: len }, (_, i) => ({
    Vgs: vgsVals[i],
    Vds: vdsVals[i],
    Id: idVals[i],
  }));
}

export function AnalysisProvider({ children }) {
  const [manualVgs, setManualVgs] = useState("0,1,2,3,4,5");
  const [manualVds, setManualVds] = useState("0.1,0.1,0.1,0.1,0.1,0.1");
  const [manualId, setManualId] = useState("1e-7,1e-6,2e-5,1e-4,2.5e-4,4e-4");

  const [rows, setRows] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const constants = useMemo(() => ({
    cox: 1e-2,
    width: 100e-6,
    length: 1e-6,
    cgs: 1e-12,
    cgd: 0.5e-12,
  }), []);

  const analyze = async () => {
    setError("");
    setLoading(true);

    try {
      const payloadRows =
        rows.length > 0
          ? rows
          : parseManualInput(manualVgs, manualVds, manualId);

      if (payloadRows.length < 3) {
        throw new Error("Please provide at least 3 valid points.");
      }

      const res = await fetch(`${API_URL}/analyze`, {   // ✅ FIXED
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: payloadRows,
          constants,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Server error");
      }

      const json = await res.json();
      setResult(json);

    } catch (e) {
      console.error("Error:", e);
      setError(e.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    manualVgs,
    setManualVgs,
    manualVds,
    setManualVds,
    manualId,
    setManualId,
    rows,
    setRows,
    result,
    loading,
    error,
    setError,
    analyze,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export { AnalysisContext };