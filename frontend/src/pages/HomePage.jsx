import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
        <h3 className="text-xl font-semibold text-slate-900">Welcome</h3>
        <p className="mt-2 text-sm text-slate-600">
          This workspace is structured like a real engineering dashboard. Use the side menu to move between input, plots,
          and extracted metrics.
        </p>
        <div className="mt-4 flex gap-3">
          <Link to="/analyze" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Start Analysis
          </Link>
          <Link to="/graphs" className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900">
            View Graphs
          </Link>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Workflow</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-slate-600">
          <li>Enter or upload CSV data</li>
          <li>Run extraction from backend</li>
          <li>Inspect plots and parameters</li>
          <li>Download JSON/PDF report</li>
        </ol>
      </div>
    </div>
  );
}
