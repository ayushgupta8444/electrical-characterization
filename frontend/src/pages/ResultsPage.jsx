import jsPDF from "jspdf";
import { useAnalysis } from "../context/useAnalysis";

export default function ResultsPage() {
  const { result } = useAnalysis();

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mosfet-analysis.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    if (!result) return;
    const pdf = new jsPDF();
    pdf.setFontSize(14);
    pdf.text("MOSFET Parameter Extraction Results", 10, 15);
    let y = 30;
    Object.entries(result.parameters).forEach(([key, value]) => {
      pdf.text(`${key}: ${Number(value).toExponential(4)}`, 10, y);
      y += 8;
    });
    pdf.save("mosfet-analysis.pdf");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-900">Results Panel</h3>
        <div className="space-x-2">
          <button onClick={downloadJson} className="rounded-lg bg-slate-700 px-3 py-2 text-white">
            Download JSON
          </button>
          <button onClick={downloadPdf} className="rounded-lg bg-slate-900 px-3 py-2 text-white">
            Download PDF
          </button>
        </div>
      </div>

      {result?.parameters ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(result.parameters).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm text-slate-500">{key}</p>
              <p className="font-semibold text-slate-900">{Number(value).toExponential(4)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500">No extracted parameters yet. Run analysis from the Analyze Data page.</p>
      )}
    </div>
  );
}
