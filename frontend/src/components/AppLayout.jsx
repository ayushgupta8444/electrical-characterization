import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Overview", to: "/" },
  { label: "Analyze Data", to: "/analyze" },
  { label: "Graphs", to: "/graphs" },
  { label: "Results", to: "/results" },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-5">
          <h1 className="text-lg font-bold text-slate-900">MOSFET Tool</h1>
          <p className="mt-1 text-xs text-slate-500">Parameter Extraction</p>
          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="p-6">
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">MOSFET Parameter Extraction Platform</h2>
            <p className="text-sm text-slate-500">Upload data, visualize characteristics, and extract device parameters.</p>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
