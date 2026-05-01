import Papa from "papaparse";
import { useAnalysis } from "../context/useAnalysis";

export default function AnalyzePage() {
  const {
    manualVgs,
    setManualVgs,
    manualVds,
    setManualVds,
    manualId,
    setManualId,
    setRows,
    analyze,
    loading,
    error,
    setError,
  } = useAnalysis();

  const onCsvUpload = (file) => {
    setError("");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      complete: ({ data }) => setRows(data),
      error: (err) => setError(err.message),
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Input Panel</h3>
      <p className="mt-1 text-sm text-slate-500">Manual comma-separated entry or CSV upload with columns: Vgs, Vds, Id.</p>

      {error && <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mt-4 grid gap-3">
        <textarea className="w-full rounded-lg border border-slate-300 p-2" rows={2} value={manualVgs} onChange={(e) => setManualVgs(e.target.value)} />
        <textarea className="w-full rounded-lg border border-slate-300 p-2" rows={2} value={manualVds} onChange={(e) => setManualVds(e.target.value)} />
        <textarea className="w-full rounded-lg border border-slate-300 p-2" rows={2} value={manualId} onChange={(e) => setManualId(e.target.value)} />
        <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && onCsvUpload(e.target.files[0])} />
      </div>

      <button
        onClick={analyze}
        disabled={loading}
        className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? "Analyzing..." : "Analyze Data"}
      </button>
    </div>
  );
}
