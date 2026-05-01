import { useMemo } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useAnalysis } from "../context/useAnalysis";
import { buildChartData, chartOptions } from "../lib/chartUtils";

ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function GraphsPage() {
  const { result } = useAnalysis();
  const chartData = useMemo(() => buildChartData(result), [result]);

  if (!chartData) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-slate-500">Run analysis first to visualize transfer, output, and threshold plots.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xl font-semibold text-slate-900">Graph Display</h3>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="h-72">
          <Line data={chartData.transfer} options={chartOptions} />
        </div>
        <div className="h-72">
          <Line data={chartData.output} options={chartOptions} />
        </div>
        <div className="h-72 md:col-span-2">
          <Line data={chartData.threshold} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
