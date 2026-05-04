import { useState, useRef, useEffect } from "react";
import { Cpu, Activity, Sun, UploadCloud, BarChart3, Zap, Sparkles, Loader2, ArrowLeft, AlertCircle, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const devices = [
  { id: "mosfet", name: "MOSFET", params: "Vgs, Vds, Id", icon: Cpu, desc: "Transfer & output curves" },
  { id: "moscap", name: "MOSCAP", params: "Vg, C", icon: Activity, desc: "C–V characterization" },
  { id: "solar", name: "Solar Cell", params: "Voltage, Current", icon: Sun, desc: "I–V & efficiency" },
];

export default function App() {
  const [device, setDevice] = useState("mosfet");
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a CSV file.");
      return;
    }
    setError(null);
    setStep(2);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("device_type", device);

    try {
      const response = await fetch("https://electrical-characterization-1.onrender.com/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Analysis failed");
      }

      const data = await response.json();
      setResults(data);
      setTimeout(() => setStep(3), 500);
    } catch (err) {
      setError(err.message);
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/20 blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 text-xs bg-cyan-500/10 border border-cyan-400/30 rounded-full mb-4">
            ✨ Precision semiconductor analytics
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Electrical Characterization
          </h1>

          <p className="text-slate-400 mt-3">
            Upload measurement data and extract device parameters, curves, and insights
          </p>
        </div>

        {/* MAIN CARD */}
        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-8 bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl">

          {/* LEFT SIDE */}
          <div>
            <div className="text-xs tracking-widest text-slate-400 mb-4 flex items-center gap-3">
              <span className="flex-1 h-px bg-white/10" />
              SELECT DEVICE
              <span className="flex-1 h-px bg-white/10" />
            </div>

            {devices.map((d) => {
              const Icon = d.icon;
              const active = device === d.id;

              return (
                <div
                  key={d.id}
                  onClick={() => setDevice(d.id)}
                  className={`p-4 mb-4 rounded-xl cursor-pointer border transition ${active
                      ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_25px_rgba(34,211,238,0.4)]"
                      : "border-white/10 hover:border-cyan-400/40"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${active ? "bg-cyan-500/20" : "bg-white/5"}`}>
                      <Icon className="text-cyan-400" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{d.name}</p>
                        <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded">
                          {d.params}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{d.desc}</p>
                    </div>

                    {active && (
                      <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col gap-6">

            {/* UPLOAD */}
            <div>
              <div className="text-xs tracking-widest text-slate-400 mb-4 flex items-center gap-3">
                <span className="flex-1 h-px bg-white/10" />
                UPLOAD CSV
                <span className="flex-1 h-px bg-white/10" />
              </div>

              <div
                onClick={() => inputRef.current.click()}
                className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-cyan-400 transition"
              >
                <UploadCloud className="text-cyan-400 mb-2" />
                <p className="text-sm">
                  {file ? file.name : "Click or drag a .csv file"}
                </p>
                <p className="text-xs text-slate-500">
                  Drop measurement data to begin
                </p>

                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            </div>

            {/* FORMAT */}
            <div className="grid grid-cols-3 gap-3">
              <MiniCard title="MOSFET" value="Vgs, Vds, Id" />
              <MiniCard title="MOSCAP" value="Vg, C" />
              <MiniCard title="SOLAR" value="V, I" />
            </div>

            {/* OUTPUT */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <p className="text-xs text-slate-400 mb-3">OUTPUT</p>

              <div className="grid grid-cols-3 gap-3">
                <Output icon={BarChart3} label="Graphs" />
                <Output icon={Zap} label="Parameters" />
                <Output icon={Sparkles} label="Insights" />
              </div>
            </div>

            {/* BUTTON */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 mb-4">
                <AlertCircle size={16} />
                <p className="text-sm">{error}</p>
              </div>
            )}
            <button 
              onClick={handleAnalyze}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black py-3 rounded-xl font-bold hover:opacity-90 transition w-full">
              ⚡ Run Analysis
            </button>

          </div>
          </div>
        )}

        {/* LOADING STATE */}
        {step === 2 && (
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-16 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center animate-pulse">
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Analyzing Data...</h2>
            <p className="text-cyan-200/60">Extracting electrical parameters and generating curves</p>
          </div>
        )}

        {/* RESULTS STATE */}
        {step === 3 && results && (
          <ResultsView device={device} results={results} onReset={() => setStep(1)} />
        )}
      </div>
    </div>
  );
}

function ResultsView({ device, results, onReset }) {
  const downloadPNG = async () => {
    const element = document.getElementById("graphs-container");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#020617" });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${device}_analysis_graphs.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error("Failed to generate PNG", err);
    }
  };

  const downloadReport = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    
    // Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text(`${device.toUpperCase()} Analysis Report`, 15, 20);
    
    // Parameters
    pdf.setFontSize(16);
    pdf.text("Extracted Parameters", 15, 35);
    
    let y = 45;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    Object.entries(results.parameters).forEach(([key, value]) => {
      pdf.text(`${key}: ${value}`, 15, y);
      y += 8;
    });
    
    // Graphs
    const element = document.getElementById("graphs-container");
    if (element) {
      const plots = element.querySelectorAll('.js-plotly-plot');
      const lightLayout = {
        font: { color: '#0f172a' },
        'title.font.color': '#0f172a',
        'xaxis.gridcolor': '#e2e8f0',
        'xaxis.zerolinecolor': '#cbd5e1',
        'xaxis.title.font.color': '#0f172a',
        'yaxis.gridcolor': '#e2e8f0',
        'yaxis.zerolinecolor': '#cbd5e1',
        'yaxis.title.font.color': '#0f172a',
      };
      plots.forEach(plot => window.Plotly.relayout(plot, lightLayout));
      element.classList.remove('bg-[#020617]');
      element.classList.add('bg-white');

      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // wait for Plotly re-render
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        
        const pdfWidth = pdf.internal.pageSize.getWidth() - 30;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Interactive Curves", 15, y + 5);
        pdf.addImage(imgData, "PNG", 15, y + 15, pdfWidth, pdfHeight);
      } catch (err) {
        console.error("Failed to generate PDF Graphs", err);
      } finally {
        const darkLayout = {
          font: { color: '#94a3b8' },
          'title.font.color': '#ffffff',
          'xaxis.gridcolor': '#1e293b',
          'xaxis.zerolinecolor': '#334155',
          'xaxis.title.font.color': '#cbd5e1',
          'yaxis.gridcolor': '#1e293b',
          'yaxis.zerolinecolor': '#334155',
          'yaxis.title.font.color': '#cbd5e1',
        };
        plots.forEach(plot => window.Plotly.relayout(plot, darkLayout));
        element.classList.add('bg-[#020617]');
        element.classList.remove('bg-white');
      }
    }
    
    pdf.save(`${device}_full_report.pdf`);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
      <button 
        onClick={onReset}
        className="flex items-center text-cyan-400/70 hover:text-cyan-400 transition gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg w-fit"
      >
        <ArrowLeft size={16} /> Analyze Another Device
      </button>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Parameters */}
        <div className="lg:col-span-1 space-y-4 flex flex-col">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl flex-1">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <Zap className="text-cyan-400" />
              Parameters
            </h2>
            <div className="space-y-4">
              {Object.entries(results.parameters).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-slate-400 mb-1 tracking-wider uppercase">{key}</p>
                  <p className="text-xl font-mono text-cyan-400 bg-black/20 px-3 py-2 rounded-lg border border-white/5 break-words">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Graphs */}
        <div className="lg:col-span-3 bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-2xl flex flex-col">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <BarChart3 className="text-cyan-400" />
                Interactive Curves
              </h2>
              <div className="flex gap-2">
                <button onClick={downloadReport} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition border border-emerald-500/30 text-sm">
                  <Download size={16} />
                  Full Report (PDF)
                </button>
                <button onClick={downloadPNG} className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition border border-cyan-500/30 text-sm">
                  <Download size={16} />
                  Export PNG
                </button>
              </div>
           </div>
            <div id="graphs-container" className="bg-[#020617] border border-white/10 rounded-xl p-2 min-h-[500px] flex-1 relative overflow-hidden">
               <GraphsRenderer device={device} data={results.graph_data} />
            </div>
        </div>
      </div>
    </div>
  );
}

function GraphsRenderer({ device, data }) {
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const chart3Ref = useRef(null);

  useEffect(() => {
    if (!window.Plotly) return;

    const layoutBase = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#94a3b8', family: 'Inter, sans-serif' },
      margin: { t: 40, r: 20, l: 60, b: 60 },
      xaxis: { gridcolor: '#1e293b', zerolinecolor: '#334155', titlefont: { size: 12, color: '#cbd5e1' } },
      yaxis: { gridcolor: '#1e293b', zerolinecolor: '#334155', titlefont: { size: 12, color: '#cbd5e1' } },
      autosize: true,
    };

    const config = { responsive: true, displayModeBar: false };

    if (device === 'mosfet') {
      window.Plotly.newPlot(chart1Ref.current, 
        [{ x: data.Vgs, y: data.Id_vgs, type: 'scattergl', mode: 'markers', marker: { size: 4, color: '#22d3ee' } }],
        { ...layoutBase, title: { text: 'Id vs Vgs', font: { color: '#fff' } }, xaxis: { ...layoutBase.xaxis, title: 'Vgs (V)' }, yaxis: { ...layoutBase.yaxis, title: 'Id (A)' } },
        config
      );
      window.Plotly.newPlot(chart2Ref.current, 
        [{ x: data.Vds, y: data.Id_vds, type: 'scattergl', mode: 'markers', marker: { size: 4, color: '#3b82f6' } }],
        { ...layoutBase, title: { text: 'Id vs Vds', font: { color: '#fff' } }, xaxis: { ...layoutBase.xaxis, title: 'Vds (V)' }, yaxis: { ...layoutBase.yaxis, title: 'Id (A)' } },
        config
      );
      window.Plotly.newPlot(chart3Ref.current, 
        [{ x: data.Vgs, y: data.sqrt_Id, type: 'scattergl', mode: 'markers', marker: { size: 4, color: '#a855f7' } }],
        { ...layoutBase, title: { text: 'sqrt(Id) vs Vgs', font: { color: '#fff' } }, xaxis: { ...layoutBase.xaxis, title: 'Vgs (V)' }, yaxis: { ...layoutBase.yaxis, title: 'sqrt(Id)' } },
        config
      );
    } else if (device === 'moscap') {
      window.Plotly.newPlot(chart1Ref.current, 
        [{ x: data.Vg, y: data.C, type: 'scattergl', mode: 'lines+markers', marker: { size: 6, color: '#22d3ee' }, line: { color: '#22d3ee' } }],
        { ...layoutBase, title: { text: 'C-V Characteristics', font: { color: '#fff' } }, xaxis: { ...layoutBase.xaxis, title: 'Vg (V)' }, yaxis: { ...layoutBase.yaxis, title: 'Capacitance (F)' } },
        config
      );
    } else if (device === 'solar') {
      window.Plotly.newPlot(chart1Ref.current, 
        [{ x: data.Voltage, y: data.Current, type: 'scattergl', mode: 'lines+markers', marker: { size: 6, color: '#facc15' }, line: { color: '#facc15' } }],
        { ...layoutBase, title: { text: 'I-V Characteristics', font: { color: '#fff' } }, xaxis: { ...layoutBase.xaxis, title: 'Voltage (V)' }, yaxis: { ...layoutBase.yaxis, title: 'Current (A)' } },
        config
      );
    }

    return () => {
      if (chart1Ref.current) window.Plotly.purge(chart1Ref.current);
      if (chart2Ref.current) window.Plotly.purge(chart2Ref.current);
      if (chart3Ref.current) window.Plotly.purge(chart3Ref.current);
    };
  }, [device, data]);

  if (device === 'mosfet') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full w-full">
        <div ref={chart1Ref} className="h-[300px] w-full" />
        <div ref={chart2Ref} className="h-[300px] w-full" />
        <div ref={chart3Ref} className="h-[300px] w-full lg:col-span-2" />
      </div>
    );
  }

  return <div ref={chart1Ref} className="w-full h-full min-h-[500px]" />;
}

function MiniCard({ title, value }) {
  return (
    <div className="border border-white/10 bg-white/5 rounded-lg p-3 text-center">
      <p className="text-xs text-cyan-400">{title}</p>
      <p className="text-xs text-slate-400">{value}</p>
    </div>
  );
}

function Output({ icon: Icon, label }) {
  return (
    <div className="border border-white/10 bg-white/5 rounded-lg p-4 text-center">
      <Icon className="mx-auto text-cyan-400 mb-1" />
      <p className="text-xs">{label}</p>
    </div>
  );
}