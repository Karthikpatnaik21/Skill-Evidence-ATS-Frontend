import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, FileSpreadsheet, Play, AlertTriangle, 
  Settings, Clock, Zap, Search, Eye, Ban, ArrowDownToLine, Layers, Loader2, Sparkles
} from 'lucide-react';

interface DisqualifiedLog {
  candidate_id: string;
  name: string;
  score: number;
  stage: string;
  reason: string;
}

interface RankedCandidate {
  candidate_id: string;
  rank: number;
  score: number;
  potential: number;
  reasoning: string;
  name: string;
  stage: string;
  details: any;
}

interface BatchRankResponse {
  ranked_candidates: RankedCandidate[];
  disqualified_candidates: DisqualifiedLog[];
  total_processed: number;
  duration_ms: number;
  candidates_per_sec: number;
}

export const BatchSandbox: React.FC = () => {
  const [runMode, setRunMode] = useState<'upload' | 'server'>('server');
  const [serverFilePath, setServerFilePath] = useState<string>('[PUB] India_runs_data_and_ai_challenge/[PUB] India_runs_data_and_ai_challenge/India_runs_data_and_ai_challenge/candidates.jsonl');
  const [challengeJD, setChallengeJD] = useState<any | null>(null);
  const [isJdCollapsed, setIsJdCollapsed] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [deepSearch, setDeepSearch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'ranked' | 'disqualified' | 'market'>('ranked');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [marketData, setMarketData] = useState<any | null>(null);
  const [marketLoading, setMarketLoading] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<RankedCandidate | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [results, setResults] = useState<BatchRankResponse | null>(null);
  const PAGE_SIZE = 50;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Elapsed timer — starts/stops with loading state
  useEffect(() => {
    if (loading) {
      setElapsedMs(0);
      timerRef.current = setInterval(() => setElapsedMs(ms => ms + 100), 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading]);

  // Fetch challenge job description and market trends on mount
  useEffect(() => {
    fetch('/api/v1/sandbox/job-description')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to load challenge Job Description.');
      })
      .then(data => setChallengeJD(data))
      .catch(err => console.error(err));

    setMarketLoading(true);
    fetch('/api/v1/sandbox/market-analysis')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to load market analysis.');
      })
      .then(data => setMarketData(data))
      .catch(err => console.error(err))
      .finally(() => setMarketLoading(false));
  }, []);
  const [jdMode, setJdMode] = useState<'challenge' | 'custom'>('challenge');
  const [customJdText, setCustomJdText] = useState<string>('');
  const [customJD, setCustomJD] = useState<any | null>(null);
  const [isExtractingJd, setIsExtractingJd] = useState<boolean>(false);
  const [jdError, setJdError] = useState<string | null>(null);

  const extractCustomJD = async () => {
    if (!customJdText.trim()) {
      setJdError('Please enter a job description first.');
      return;
    }
    setIsExtractingJd(true);
    setJdError(null);
    try {
      const response = await fetch('/api/v1/job/understand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_text: customJdText })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to parse job description.');
      }
      const data = await response.json();
      setCustomJD(data);
    } catch (err: any) {
      console.error(err);
      setJdError(err.message || 'Failed to extract skills. Make sure the backend is active.');
      // Local fallback simulation if offline
      setCustomJD({
        title: "Custom Pasted Profile",
        seniority: "Custom Seniority",
        requiredSkills: ["Python", "FastAPI", "React"],
        preferredSkills: ["NLP", "Docker"],
        idealProfile: "Simulated fallback extraction."
      });
    } finally {
      setIsExtractingJd(false);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File exceeds 10MB safety limit. For the full 100K candidates dataset, please use the "Server-side Local Path" mode to prevent browser memory crashes.');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setFile(selectedFile);
        setError(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.name.endsWith('.json') && !droppedFile.name.endsWith('.jsonl')) {
        setError('Please upload a JSON or JSONL file.');
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('File exceeds 10MB safety limit. For the full 100K candidates dataset, please use the "Server-side Local Path" mode to prevent browser memory crashes.');
        setFile(null);
      } else {
        setFile(droppedFile);
        setError(null);
      }
    }
  };

  const runRanking = async () => {
    if (runMode === 'upload' && !file) {
      setError('Please select a candidate dataset file first.');
      return;
    }
    if (runMode === 'server' && !serverFilePath.trim()) {
      setError('Please specify a local server file path.');
      return;
    }

    let activeJdProfile = null;
    if (jdMode === 'custom') {
      if (!customJD && customJdText.trim()) {
        try {
          const res = await fetch('/api/v1/job/understand', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jd_text: customJdText })
          });
          if (res.ok) {
            const data = await res.json();
            setCustomJD(data);
            activeJdProfile = data;
          }
        } catch (e) {
          console.error("Auto-extract failed", e);
        }
      } else {
        activeJdProfile = customJD;
      }
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      if (runMode === 'upload' && file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const text = event.target?.result as string;
            let candidates: any[] = [];
            
            const trimmedText = text.trim();
            if (trimmedText.startsWith('[')) {
              candidates = JSON.parse(trimmedText);
            } else {
              candidates = trimmedText
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .map(line => JSON.parse(line));
            }

            const response = await fetch('/api/v1/sandbox/rank-batch', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                candidates,
                deep_search: deepSearch,
                jd_profile: activeJdProfile
              })
            });

            if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.detail || 'Failed to process ranking on backend.');
            }

            const data: BatchRankResponse = await response.json();
            setResults(data);
          } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to read or parse candidate file. Ensure it conforms to candidate schema.');
          } finally {
            setLoading(false);
          }
        };
        reader.readAsText(file);
      } else {
        // Server path mode
        const response = await fetch('/api/v1/sandbox/rank-batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_path: serverFilePath,
            deep_search: deepSearch,
            jd_profile: activeJdProfile
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Failed to process server-side ranking.');
        }

        const data: BatchRankResponse = await response.json();
        setResults(data);
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error executing ranking run.');
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!results || results.ranked_candidates.length === 0) return;

    // Build CSV Content
    const headers = ['candidate_id', 'rank', 'score', 'reasoning'];
    const rows = results.ranked_candidates.map((c: RankedCandidate) => [
      c.candidate_id,
      c.rank,
      c.score,
      `"${c.reasoning.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r: any[]) => r.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `submission_sandbox_${deepSearch ? 'deep' : 'offline'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRanked = results?.ranked_candidates.filter((c: RankedCandidate) => 
    c.candidate_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.stage.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.reasoning.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredDisqualified = results?.disqualified_candidates.filter((c: DisqualifiedLog) => 
    c.candidate_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.reason.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const honeypotsCount = results?.disqualified_candidates.filter((c: DisqualifiedLog) => 
    c.reason.toLowerCase().includes('honeypot')
  ).length || 0;

  const servicesExclusionsCount = results?.disqualified_candidates.filter((c: DisqualifiedLog) => 
    c.reason.toLowerCase().includes('consulting') || c.reason.toLowerCase().includes('service')
  ).length || 0;

  // Pagination helpers — only render PAGE_SIZE rows at a time
  const activeList = activeSubTab === 'ranked' ? filteredRanked : filteredDisqualified;
  const totalPages = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE));
  const pagedRanked = filteredRanked.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pagedDisqualified = filteredDisqualified.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (q: string) => { setSearchQuery(q); setCurrentPage(1); };
  const handleTabChange = (tab: 'ranked' | 'disqualified' | 'market') => { setActiveSubTab(tab); setCurrentPage(1); };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-500" /> Batch Sandbox & Evaluator
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Evaluate and rank candidate files against the job profile, track throughput speeds, filter honeypots, and export submission CSVs.
          </p>
        </div>
      </div>
      {/* Job Description Source Toggle */}
      <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
        {/* Toggle bar */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-900/30 border-b border-slate-800/60">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider mr-2">JD Source:</span>
          <button
            type="button"
            onClick={() => setJdMode('challenge')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              jdMode === 'challenge'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Challenge JD
          </button>
          <button
            type="button"
            onClick={() => setJdMode('custom')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              jdMode === 'custom'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Sparkles className="h-3 w-3" /> Paste Custom JD
          </button>
        </div>

        {/* Challenge JD panel */}
        {jdMode === 'challenge' && challengeJD && (
          <>
            <button
              type="button"
              onClick={() => setIsJdCollapsed(!isJdCollapsed)}
              className="w-full bg-slate-900/40 px-6 py-4 flex items-center justify-between hover:bg-slate-900/60 transition-colors text-left"
            >
              <div>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  Matching Target Profile (Challenge Context)
                </span>
                <h2 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                  Job Description: <span className="text-indigo-400 font-extrabold">{challengeJD.title}</span>
                </h2>
              </div>
              <span className="text-xs font-semibold text-indigo-400">
                {isJdCollapsed ? 'Show Details' : 'Hide Details'}
              </span>
            </button>

            {!isJdCollapsed && (
              <div className="px-6 pb-6 pt-4 border-t border-slate-850 bg-slate-950/20 space-y-4 text-xs animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Target Experience &amp; Seniority</span>
                    <p className="text-slate-300 font-semibold">{challengeJD.seniority}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Ideal Persona</span>
                    <p className="text-slate-400 leading-relaxed font-sans">{challengeJD.idealProfile}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/30 border border-slate-800/40 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider block font-bold">Required Tech Stack (Must Have)</span>
                    <ul className="space-y-1">
                      {challengeJD.requiredSkills.map((s: string, idx: number) => (
                        <li key={idx} className="text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900/30 border border-slate-800/40 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider block font-bold">Nice to Have / Preferred Details</span>
                    <ul className="space-y-1">
                      {challengeJD.preferredSkills.map((s: string, idx: number) => (
                        <li key={idx} className="text-slate-300 flex items-start gap-2">
                          <span className="text-indigo-400 font-bold shrink-0">+</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-1.5">Key Responsibilities</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
                    {challengeJD.responsibilities.map((r: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Custom JD paste panel */}
        {jdMode === 'custom' && (
          <div className="px-6 pb-6 pt-4 space-y-4 text-xs animate-fadeIn">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase text-violet-400 tracking-wider block font-bold">
                Paste Your Job Description Below
              </label>
              <textarea
                value={customJdText}
                onChange={(e) => setCustomJdText(e.target.value)}
                placeholder="Paste the full job description text here… The system will extract required skills, preferred skills, seniority level, and responsibilities automatically."
                className="w-full h-40 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-xs font-sans leading-relaxed placeholder-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20 resize-y transition-colors"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={extractCustomJD}
                  disabled={isExtractingJd || !customJdText.trim()}
                  className="px-4 py-2 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-lg text-xs font-semibold hover:bg-violet-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isExtractingJd ? (
                    <><Loader2 className="h-3 w-3 animate-spin" /> Extracting…</>
                  ) : (
                    <><Sparkles className="h-3 w-3" /> Extract Skills &amp; Profile</>
                  )}
                </button>
                {customJD && (
                  <span className="text-emerald-400 text-[10px] font-mono">✓ Extracted: {customJD.title || 'Custom Profile'}</span>
                )}
              </div>
              {jdError && (
                <p className="text-red-400 text-[10px] flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {jdError}
                </p>
              )}
            </div>

            {/* Show extracted custom JD details */}
            {customJD && (
              <div className="border-t border-slate-800/60 pt-4 space-y-3 animate-fadeIn">
                <h3 className="text-sm font-bold text-white">{customJD.title || 'Extracted Profile'}</h3>
                
                {/* Validation Warnings */}
                {customJD.validationWarnings && customJD.validationWarnings.length > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-mono uppercase tracking-wider">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Impossible / Contradictory Requirements Detected</span>
                    </div>
                    <ul className="space-y-1.5 list-disc pl-4">
                      {customJD.validationWarnings.map((warning: string, index: number) => (
                        <li key={index} className="text-xs text-rose-300 leading-relaxed font-mono">
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/30 border border-slate-800/40 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider block font-bold">Required Skills</span>
                    <ul className="space-y-1">
                      {(customJD.requiredSkills || []).map((s: string, idx: number) => (
                        <li key={idx} className="text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-900/30 border border-slate-800/40 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono uppercase text-violet-400 tracking-wider block font-bold">Preferred Skills</span>
                    <ul className="space-y-1">
                      {(customJD.preferredSkills || []).map((s: string, idx: number) => (
                        <li key={idx} className="text-slate-300 flex items-start gap-2">
                          <span className="text-violet-400 font-bold shrink-0">+</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings/Upload Side panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Settings className="h-4 w-4 text-slate-400" /> Configuration
            </h3>

            {/* Run Mode Selection */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800/80">
              <button
                type="button"
                onClick={() => { setRunMode('server'); setError(null); }}
                className={`flex-1 py-1.5 text-[10px] font-mono font-semibold rounded transition-all ${
                  runMode === 'server'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Server-side Path
              </button>
              <button
                type="button"
                onClick={() => { setRunMode('upload'); setError(null); }}
                className={`flex-1 py-1.5 text-[10px] font-mono font-semibold rounded transition-all ${
                  runMode === 'upload'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Upload File
              </button>
            </div>

            {runMode === 'upload' ? (
              /* Drag Drop Area */
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  file 
                    ? 'border-indigo-500/50 bg-indigo-500/5' 
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".json,.jsonl" 
                  className="hidden" 
                />
                <Upload className={`h-8 w-8 mx-auto mb-2 ${file ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold text-slate-300 block">
                  {file ? file.name : 'Upload candidates file'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Drag & drop .json or .jsonl files here (max 10MB)
                </span>
              </div>
            ) : (
              /* Server filepath input */
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">Local Dataset Filepath</label>
                <input 
                  type="text" 
                  value={serverFilePath}
                  onChange={(e) => setServerFilePath(e.target.value)}
                  placeholder="e.g. candidates.jsonl"
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2.5 font-mono focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <span className="text-[9px] text-slate-500 leading-relaxed block">
                  Streams the dataset line-by-line directly from server storage. Bypasses browser memory crashes.
                </span>
              </div>
            )}

            {/* Config Toggles */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300 block">Deep Search Mode</span>
                  <span className="text-[10px] text-slate-500 block">Scrape public GitHub & LinkedIn portfolios live</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={deepSearch} 
                    onChange={(e) => setDeepSearch(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                </label>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={runRanking}
              disabled={loading || (runMode === 'upload' && !file) || (runMode === 'server' && !serverFilePath)}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-medium text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 disabled:shadow-none transition-all duration-200 mt-2 cursor-pointer"
            >
                {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Running… {(elapsedMs / 1000).toFixed(1)}s</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Run Ranking Engine</span>
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-[11px] leading-relaxed flex gap-2 animate-fadeIn">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Dashboard metrics & results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Timing & Stats dashboard */}
          {results && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
              <div className="glass p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Duration</span>
                  <span className="text-lg font-bold text-white font-mono">{results.duration_ms} ms</span>
                </div>
              </div>

              <div className="glass p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Throughput</span>
                  <span className="text-lg font-bold text-white font-mono">{results.candidates_per_sec} /s</span>
                </div>
              </div>

              <div className="glass p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Ban className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Honeypots Blocked</span>
                  <span className="text-lg font-bold text-white font-mono">{honeypotsCount}</span>
                </div>
              </div>

              <div className="glass p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Services Exclusions</span>
                  <span className="text-lg font-bold text-white font-mono">{servicesExclusionsCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Results Table Area */}
          <div className="glass rounded-2xl border border-slate-800 overflow-hidden flex flex-col min-h-[400px]">
            {/* Table Control Header */}
            <div className="bg-slate-900/50 border-b border-slate-800/80 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 w-full md:w-72">
                <Search className="h-3.5 w-3.5 text-slate-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search candidate ID, name, stage..."
                  className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex rounded-lg border border-slate-800/80 p-0.5 bg-slate-950">
                  {results && (
                    <>
                      <button
                        onClick={() => handleTabChange('ranked')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          activeSubTab === 'ranked' 
                            ? 'bg-slate-800 text-white' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Ranked List ({filteredRanked.length})
                      </button>
                      <button
                        onClick={() => handleTabChange('disqualified')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                          activeSubTab === 'disqualified' 
                            ? 'bg-slate-800 text-white' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Disqualified ({filteredDisqualified.length})
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleTabChange('market')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      activeSubTab === 'market' 
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Market Analytics
                  </button>
                </div>

                {results && (
                  <button
                    onClick={downloadCSV}
                    className="bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 text-indigo-300 font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowDownToLine className="h-3.5 w-3.5" /> Export Top 100 CSV
                  </button>
                )}
              </div>
            </div>

            {/* Results views */}
            {loading ? (
              // ── Skeleton Loader ──
              <div className="flex-1 p-4 space-y-2 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-2 py-2.5">
                    <div className="h-3 w-8 bg-slate-800 rounded" />
                    <div className="h-3 w-24 bg-slate-800 rounded" />
                    <div className="h-3 flex-1 bg-slate-800/60 rounded" />
                    <div className="h-3 w-12 bg-slate-800 rounded" />
                    <div className="h-3 w-16 bg-slate-800 rounded" />
                    <div className="h-3 w-20 bg-slate-800/60 rounded" />
                    <div className="h-3 w-32 bg-slate-800/40 rounded" />
                    <div className="h-6 w-6 bg-slate-800 rounded-lg" />
                  </div>
                ))}
                <div className="text-center py-4">
                  <span className="text-[11px] font-mono text-indigo-400 animate-pulse">
                    ⚡ Ranking engine running… {(elapsedMs / 1000).toFixed(1)}s elapsed
                  </span>
                </div>
              </div>
            ) : !results ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 text-center">
                <FileSpreadsheet className="h-12 w-12 text-slate-700 mb-3" />
                <h4 className="font-semibold text-slate-400 text-sm">No evaluation results yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Upload a candidate pool file or choose a server filepath and click Run Ranking Engine.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto">
                {/* Results summary strip */}
                <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-900/20 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-mono">
                  <span className="text-slate-500">Total Processed: <strong className="text-white">{results.total_processed.toLocaleString()}</strong></span>
                  <span className="text-emerald-400">✓ Ranked: <strong>{filteredRanked.length}</strong></span>
                  <span className="text-red-400">✗ Disqualified: <strong>{results.disqualified_candidates.length.toLocaleString()}</strong></span>
                  <span className="text-slate-500">Speed: <strong className="text-indigo-300">{results.candidates_per_sec} /s</strong></span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-slate-500">Pass rate:</span>
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${results.total_processed > 0 ? ((results.ranked_candidates.length / results.total_processed) * 100).toFixed(1) : 0}%` }}
                      />
                    </div>
                    <span className="text-emerald-400 font-bold">
                      {results.total_processed > 0 ? ((results.ranked_candidates.length / results.total_processed) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
                {activeSubTab === 'ranked' ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 bg-slate-900/20 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-3 font-semibold">Rank</th>
                        <th className="px-6 py-3 font-semibold">Candidate ID</th>
                        <th className="px-6 py-3 font-semibold">Name</th>
                        <th className="px-6 py-3 font-semibold">Score</th>
                        <th className="px-6 py-3 font-semibold">Potential</th>
                        <th className="px-6 py-3 font-semibold">Stage</th>
                        <th className="px-6 py-3 font-semibold">Reasoning Highlight</th>
                        <th className="px-6 py-3 font-semibold text-right">Profile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-xs">
                       {pagedRanked.map((c: RankedCandidate) => (
                        <tr key={c.candidate_id} className="hover:bg-slate-900/30 text-slate-300">
                          <td className="px-6 py-3.5 font-bold text-indigo-400 font-mono">#{c.rank}</td>
                          <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400">{c.candidate_id}</td>
                          <td className="px-6 py-3.5 font-semibold text-white">{c.name}</td>
                          <td className="px-6 py-3.5 font-mono text-emerald-400 font-bold">{c.score}</td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-indigo-300 font-bold text-xs w-8">{c.potential}</span>
                              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden min-w-[48px]">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(100, c.potential)}%`,
                                    background: c.potential >= 80
                                      ? 'linear-gradient(90deg,#6366f1,#8b5cf6)'
                                      : c.potential >= 60
                                      ? 'linear-gradient(90deg,#0ea5e9,#6366f1)'
                                      : 'linear-gradient(90deg,#64748b,#94a3b8)'
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 capitalize">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              c.stage === 'fresher' 
                                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' 
                                : c.stage === 'junior'
                                ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                                : c.stage === 'senior'
                                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                                : 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20'
                            }`}>
                              {c.stage.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 max-w-md whitespace-normal break-words text-slate-400 leading-relaxed">
                            {c.reasoning}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedCandidate(c)}
                              className="text-slate-400 hover:text-white p-1 hover:bg-slate-800/80 rounded-lg transition-all cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredRanked.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-slate-500 font-mono">
                            No ranked candidates match search parameters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : activeSubTab === 'disqualified' ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 bg-slate-900/20 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-3 font-semibold">Candidate ID</th>
                        <th className="px-6 py-3 font-semibold">Name</th>
                        <th className="px-6 py-3 font-semibold">Stage</th>
                        <th className="px-6 py-3 font-semibold">Disqualification Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-xs">
                      {pagedDisqualified.map((c: DisqualifiedLog) => {
                        const isHoneypot = c.reason.toLowerCase().includes('honeypot');
                        return (
                          <tr key={c.candidate_id} className="hover:bg-slate-900/30 text-slate-300">
                            <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400">{c.candidate_id}</td>
                            <td className="px-6 py-3.5 font-semibold text-white">{c.name}</td>
                            <td className="px-6 py-3.5 capitalize">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                c.stage === 'fresher' 
                                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' 
                                  : c.stage === 'junior'
                                  ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20'
                                  : c.stage === 'senior'
                                  ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                                  : 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20'
                              }`}>
                                {c.stage.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1.5 w-fit font-medium ${
                                isHoneypot 
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {isHoneypot ? <Ban className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                                {c.reason}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredDisqualified.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-mono">
                            No disqualified candidates to display.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  /* ── Market Analytics view ── */
                  <div className="p-6 space-y-8 text-slate-300 animate-fadeIn">
                    {marketLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                        <span className="text-xs text-slate-400 font-mono">Compiling market trends...</span>
                      </div>
                    ) : !marketData ? (
                      <div className="text-center py-12 text-slate-500 font-mono">
                        Market metrics could not be loaded.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Stats widgets */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl">
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Profiles Scanned</span>
                            <span className="text-2xl font-bold text-white font-mono">{marketData.total_scanned.toLocaleString()}</span>
                          </div>
                          <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl">
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Average Experience</span>
                            <span className="text-2xl font-bold text-white font-mono">{marketData.avg_yoe} years</span>
                          </div>
                        </div>

                        {/* Stage Distribution chart */}
                        <div className="bg-slate-900/20 border border-slate-800/60 p-5 rounded-xl space-y-4">
                          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono">Talent Stage Distribution</h4>
                          <div className="space-y-3 text-xs font-mono">
                            {Object.entries(marketData.stages).map(([stage, count]: any) => {
                              const pct = marketData.total_scanned > 0 ? ((count / marketData.total_scanned) * 100).toFixed(1) : "0";
                              const color = stage === 'fresher' ? 'bg-cyan-500' : stage === 'junior' ? 'bg-teal-500' : stage === 'senior' ? 'bg-indigo-500' : 'bg-fuchsia-500';
                              return (
                                <div key={stage} className="space-y-1">
                                  <div className="flex justify-between items-center text-[11px]">
                                    <span className="capitalize">{stage.replace('_', ' ')}</span>
                                    <span className="text-slate-400">{count.toLocaleString()} ({pct}%)</span>
                                  </div>
                                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Top Hubs */}
                          <div className="bg-slate-900/20 border border-slate-800/60 p-5 rounded-xl space-y-3">
                            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono">Geographical Hubs</h4>
                            <div className="space-y-2 text-xs font-mono">
                              {marketData.top_locations.map((loc: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-900 last:border-0">
                                  <span className="text-slate-300">{loc.name}</span>
                                  <span className="text-indigo-400 font-bold">{loc.count.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Top Skills */}
                          <div className="bg-slate-900/20 border border-slate-800/60 p-5 rounded-xl space-y-3">
                            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider font-mono">Skill Market Density</h4>
                            <div className="space-y-2 text-xs font-mono">
                              {marketData.top_skills.slice(0, 10).map((sk: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-900 last:border-0">
                                  <span className="text-slate-300">{sk.name}</span>
                                  <span className="text-emerald-400 font-bold">{sk.count.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Pagination bar */}
            {results && activeSubTab !== 'market' && totalPages > 1 && (
              <div className="border-t border-slate-800/80 bg-slate-900/30 px-6 py-3 flex items-center justify-between gap-4">
                <span className="text-[11px] font-mono text-slate-500">
                  Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, activeList.length)} of {activeList.length.toLocaleString()}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-[10px] font-mono rounded border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >«</button>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-[10px] font-mono rounded border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >‹</button>

                  {/* page window */}
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(currentPage - 3, totalPages - 6));
                    const page = start + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-all ${
                          page === currentPage
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-[10px] font-mono rounded border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >›</button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-[10px] font-mono rounded border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >»</button>
                </div>
                <span className="text-[11px] font-mono text-slate-500 hidden md:block">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Profile Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-800 p-6 space-y-6 text-slate-300 relative shadow-2xl animate-scaleIn">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-all cursor-pointer"
            >
              ✕
            </button>

            {/* Profile header */}
            <div className="border-b border-slate-850 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {selectedCandidate.name} 
                <span className="text-[10px] font-mono text-slate-500 font-normal">({selectedCandidate.candidate_id})</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1 font-semibold">{selectedCandidate.details.profile.headline}</p>
              
              <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-mono">
                <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded">
                  Experience: {selectedCandidate.details.profile.years_of_experience} yrs
                </span>
                <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Score: {selectedCandidate.score}
                </span>
                <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded">
                  Potential: {selectedCandidate.potential}
                </span>
                <span className="bg-slate-850 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                  {selectedCandidate.details.profile.location}, {selectedCandidate.details.profile.country}
                </span>
              </div>
            </div>

            {/* Profile summary */}
            <div>
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Professional Summary</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedCandidate.details.profile.summary}</p>
            </div>

            {/* Candidate Skills */}
            <div>
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Stated Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedCandidate.details.skills.map((s: any) => (
                  <span 
                    key={s.name}
                    className="bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1 text-[11px] font-sans flex items-center gap-1.5"
                  >
                    <span className="text-slate-300 font-medium">{s.name}</span>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-1 py-0.2 rounded capitalize">{s.proficiency}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Candidate Experience */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">Employment History</h4>
              <div className="space-y-3.5">
                {selectedCandidate.details.career_history.map((j: any, idx: number) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-900 p-3.5 rounded-xl space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-white">{j.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">{j.start_date} to {j.end_date || 'Present'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400/80">
                      <span>{j.company}</span>
                      <span>{j.industry} | {j.company_size} emp</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-2">{j.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Explanation Reasoning details */}
            <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl space-y-1">
              <h4 className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">Explainability Reasoning</h4>
              <p className="text-xs font-sans text-slate-300 italic">"{selectedCandidate.reasoning}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
