export const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#7c3aed", "#ea580c", "#0f766e"];

export function groupByRoundedKey(points, key) {
  return points.reduce((acc, point) => {
    const groupKey = Number(point[key]).toFixed(3);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(point);
    return acc;
  }, {});
}

export function sortedXY(points, xKey, yKey) {
  return [...points]
    .map((p) => ({ x: Number(p[xKey]), y: Number(p[yKey]) }))
    .sort((a, b) => a.x - b.x);
}

export function buildChartData(result) {
  if (!result?.processedData) return null;

  const points = result.processedData;
  const groupedByVds = groupByRoundedKey(points, "Vds");
  const groupedByVgs = groupByRoundedKey(points, "Vgs");
  const thresholdCurve = sortedXY(points, "Vgs", "sqrtId");
  const vthX = Number(result.thresholdMeta.vth);

  const nearestThresholdPoint =
    thresholdCurve.length > 0
      ? thresholdCurve.reduce((best, current) =>
          Math.abs(current.x - vthX) < Math.abs(best.x - vthX) ? current : best
        )
      : { x: vthX, y: 0 };

  return {
    transfer: {
      datasets: Object.entries(groupedByVds).map(([vdsValue, group], index) => ({
        label: `Vds=${vdsValue} V`,
        data: sortedXY(group, "Vgs", "Id"),
        borderColor: COLORS[index % COLORS.length],
        backgroundColor: COLORS[index % COLORS.length],
        parsing: false,
        pointRadius: 3,
        tension: 0,
      })),
    },
    output: {
      datasets: Object.entries(groupedByVgs).map(([vgsValue, group], index) => ({
        label: `Vgs=${vgsValue} V`,
        data: sortedXY(group, "Vds", "Id"),
        borderColor: COLORS[index % COLORS.length],
        backgroundColor: COLORS[index % COLORS.length],
        parsing: false,
        pointRadius: 3,
        tension: 0,
      })),
    },
    threshold: {
      datasets: [
        {
          label: "sqrt(Id) vs Vgs",
          data: thresholdCurve,
          borderColor: "#dc2626",
          backgroundColor: "#dc2626",
          parsing: false,
          pointRadius: 3,
          tension: 0,
        },
        {
          label: "Vth Point",
          data: [nearestThresholdPoint],
          borderColor: "#0f172a",
          backgroundColor: "#0f172a",
          parsing: false,
          pointRadius: 6,
          showLine: false,
        },
      ],
    },
  };
}

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" },
  },
  scales: {
    x: {
      type: "linear",
      ticks: { maxTicksLimit: 8 },
    },
    y: {
      type: "linear",
      ticks: { maxTicksLimit: 8 },
    },
  },
};
