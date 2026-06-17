import React from 'react';
import { LayoutDashboard, FileText, Cpu, Settings, CodeXml, Layers } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Job JD Analyzer', icon: FileText },
    { id: 'parser', label: 'Candidate Parser', icon: Cpu },
    { id: 'batch_sandbox', label: 'Batch Sandbox', icon: Layers },
    { id: 'sandbox', label: 'Weight Sandbox', icon: Settings },
    { id: 'preview', label: 'JSON Schema API', icon: CodeXml },
  ];

  return (
    <nav className="glass border-b border-slate-800 sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Layers className="h-5 w-5 text-white animate-pulse" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-wider text-white flex items-center gap-1.5">
            SKILL EVIDENCE <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono">ATS</span>
          </span>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight">Explainable Candidate Ranking Engine</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Engine Status */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Engine Status: Active</span>
        </div>
        <div className="text-slate-400">
          v1.0.0-beta
        </div>
      </div>
    </nav>
  );
};
