import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { SocialLinks, SocialAuditResponse } from '../types';
import { 
  Loader2, X, Terminal, Briefcase, Link as LinkIcon, Globe, 
  AlertCircle, ArrowRight, Star, Cpu, Award
} from 'lucide-react';

interface SocialAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  candidateId: string;
  socialLinks?: SocialLinks;
  onSaveAudit: (candidateId: string, auditResult: SocialAuditResponse, autoVerify: boolean) => void;
  initialAuditResult?: SocialAuditResponse;
}

export const SocialAuditModal: React.FC<SocialAuditModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  candidateId,
  socialLinks,
  onSaveAudit,
  initialAuditResult
}) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [auditResult, setAuditResult] = useState<SocialAuditResponse | undefined>(initialAuditResult);
  const [error, setError] = useState<string | null>(null);
  const [autoVerifyToggled, setAutoVerifyToggled] = useState(true);

  // Sync initial audit results when opened
  useEffect(() => {
    if (isOpen) {
      setAuditResult(initialAuditResult);
      setError(null);
      setAuditLogs([]);
    }
  }, [isOpen, initialAuditResult]);

  if (!isOpen) return null;

  const hasLinks = socialLinks && (socialLinks.github || socialLinks.linkedin || socialLinks.portfolio || socialLinks.website);

  const startAudit = async () => {
    if (!hasLinks) return;
    
    setIsAuditing(true);
    setError(null);
    setAuditLogs(["[100ms] Initializing socket scraper threads..."]);
    
    const logsSequence = [
      { delay: 600, text: "[600ms] Locating candidate credentials..." },
      { delay: 1200, text: `[1200ms] Connecting to public GitHub API for user profile...` },
      { delay: 1800, text: "[1800ms] Scraping repositories list & active branch languages..." },
      { delay: 2400, text: "[2400ms] Requesting portfolio markup content... stripping tags..." },
      { delay: 3000, text: "[3000ms] Invoking Local LLM engine for project alignment audit..." },
      { delay: 3500, text: "[3500ms] Synthesizing code complexity & cross-checking resume discrepancies..." }
    ];

    // Simulate logs in sequence
    logsSequence.forEach(log => {
      setTimeout(() => {
        setAuditLogs(prev => [...prev, log.text]);
      }, log.delay);
    });

    // Fire the actual API fetch concurrently
    try {
      const response = await fetch('http://localhost:8000/api/v1/social/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_url: socialLinks.github,
          linkedin_url: socialLinks.linkedin,
          portfolio_url: socialLinks.portfolio,
          website_url: socialLinks.website,
          candidate_id: candidateId,
          candidate_name: candidateName
        })
      });

      // Wait a minimum time for the log sequence animation to feel natural
      await new Promise(resolve => setTimeout(resolve, 3700));

      if (!response.ok) {
        throw new Error(`Social Audit API returned error status: ${response.status}`);
      }

      const result = await response.json();
      setAuditResult(result);
      setAuditLogs(prev => [...prev, "[SUCCESS] Social scraping and LLM audit complete!"]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during social auditing.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApply = () => {
    if (auditResult) {
      onSaveAudit(candidateId, auditResult, autoVerifyToggled);
      onClose();
    }
  };

  const getComplexityColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass-card max-w-3xl w-full rounded-2xl border border-slate-800/80 bg-slate-900/95 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400 animate-pulse" />
            <h3 className="font-bold text-white text-base">Candidate Social Audit & LLM Verification</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60">
            <p className="text-xs text-slate-400 font-mono">Target Candidate: <span className="text-white font-semibold">{candidateName}</span></p>
            
            {/* Social Links List */}
            <div className="mt-3 flex flex-wrap gap-2.5">
              {socialLinks?.github && (
                <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded-lg">
                  <Terminal className="h-3 w-3 text-slate-400" />
                  {socialLinks.github}
                </span>
              )}
              {socialLinks?.linkedin && (
                <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded-lg">
                  <LinkIcon className="h-3 w-3 text-indigo-400" />
                  {socialLinks.linkedin}
                </span>
              )}
              {socialLinks?.portfolio && (
                <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded-lg">
                  <Briefcase className="h-3 w-3 text-emerald-400" />
                  {socialLinks.portfolio}
                </span>
              )}
              {socialLinks?.website && (
                <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded-lg">
                  <Globe className="h-3 w-3 text-cyan-400" />
                  {socialLinks.website}
                </span>
              )}
            </div>
          </div>

          {/* Audit Actions */}
          {!isAuditing && !auditResult && !error && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Globe className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Automated Scraping & Skills Verification</h4>
                <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                  Proceed to scrape the candidate's GitHub repositories and portfolio content. An LLM audit will validate claims and highlight differences.
                </p>
              </div>
              {hasLinks ? (
                <button
                  onClick={startAudit}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-indigo-600/10 transition-all flex items-center gap-1.5"
                >
                  Start Automated Social Audit <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <div className="text-amber-500 border border-amber-500/20 bg-amber-500/5 px-4 py-3 rounded-xl flex items-center gap-2 max-w-md text-xs leading-relaxed text-left">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>No social profiles extracted from resume yet. Please upload a resume with GitHub/LinkedIn links first.</span>
                </div>
              )}
            </div>
          )}

          {/* Progress Logs */}
          {isAuditing && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                <span className="text-xs text-slate-300 font-semibold">Active Web Crawlers Running...</span>
              </div>
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-[10px] leading-relaxed text-indigo-400 space-y-1.5 h-44 overflow-y-auto shadow-inner">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className={log.startsWith('[SUCCESS]') ? 'text-emerald-400 font-bold' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-rose-400 border border-rose-500/20 bg-rose-500/10 p-4 rounded-xl flex items-center gap-3 text-xs">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
              <div className="flex-1">
                <p className="font-bold">Extraction Error</p>
                <p className="mt-0.5 text-slate-300 font-mono">{error}</p>
              </div>
              <button 
                onClick={startAudit} 
                className="bg-slate-900 border border-slate-800 text-xs px-3 py-1.5 rounded-lg hover:text-white transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Audit Results Presentation */}
          {auditResult && !isAuditing && (
            <div className="space-y-6 animate-fadeIn text-xs leading-relaxed">
              {/* Warnings / Discrepancy checks */}
              {auditResult.discrepancies.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span>Discrepancies / Mismatch Signals Detected</span>
                  </div>
                  <ul className="list-disc list-inside pl-1 space-y-1 font-mono text-[10px] text-slate-300">
                    {auditResult.discrepancies.map((disc, idx) => (
                      <li key={idx}>{disc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verified Badges & Language capsules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold text-slate-300">GitHub Verified Repos</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    auditResult.github_verified 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' 
                    : 'text-slate-500 bg-slate-950 border-slate-800'
                  }`}>
                    {auditResult.github_verified ? 'Verified ✓' : 'No Repos'}
                  </span>
                </div>
                
                <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-slate-300">Portfolio Active Code</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    auditResult.portfolio_verified 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' 
                    : 'text-slate-500 bg-slate-950 border-slate-800'
                  }`}>
                    {auditResult.portfolio_verified ? 'Verified ✓' : 'No Site'}
                  </span>
                </div>
              </div>

              {/* Detected Languages capsule bar */}
              {auditResult.detected_languages.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-bold text-white text-[11px] uppercase tracking-wider font-mono text-slate-400">Scraped Language Ecosystem</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {auditResult.detected_languages.map((lang, idx) => (
                      <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[10px] font-mono shadow-inner">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Repository Breakdown List */}
              {auditResult.repositories.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-bold text-white text-[11px] uppercase tracking-wider font-mono text-slate-400">Parsed Public Repositories</h5>
                  <div className="bg-slate-950 border border-slate-850 rounded-xl divide-y divide-slate-850/60 overflow-hidden max-h-44 overflow-y-auto">
                    {auditResult.repositories.map((repo, idx) => (
                      <div key={idx} className="p-3 hover:bg-slate-900/40 flex items-start justify-between gap-4 transition-colors">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <a 
                            href={repo.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-bold text-white text-xs hover:text-indigo-400 transition-colors truncate block"
                          >
                            {repo.name}
                          </a>
                          {repo.description && (
                            <p className="text-[10px] text-slate-400 truncate">{repo.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {repo.primary_language && (
                            <span className="text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                              {repo.primary_language}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400">
                            <Star className="h-3.5 w-3.5 fill-amber-400/20" />
                            {repo.stars}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LLM Audit Review Report */}
              <div className="space-y-4 border-t border-slate-850 pt-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Award className="h-4 w-4" />
                  <h4 className="font-bold text-white text-[11px] uppercase tracking-wider font-mono">LLM Code & Portfolio Assessment</h4>
                </div>
                
                {/* Visual Score Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 bg-slate-950/20 border border-slate-850 p-3.5 rounded-xl">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Code Complexity Rating:</span>
                      <span className={`font-bold ${getComplexityColor(auditResult.llm_analysis.code_complexity_score).split(' ')[0]}`}>{auditResult.llm_analysis.code_complexity_score}/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full ${
                          auditResult.llm_analysis.code_complexity_score >= 85 ? 'bg-emerald-500' :
                          auditResult.llm_analysis.code_complexity_score >= 70 ? 'bg-indigo-500' : 'bg-rose-500'
                        }`} 
                        style={{ width: `${auditResult.llm_analysis.code_complexity_score}%` }}
                      />
                    </div>
                  </div>
                  
                  {auditResult.portfolio_verified && (
                    <div className="space-y-1 bg-slate-950/20 border border-slate-850 p-3.5 rounded-xl">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-400">Portfolio Presentation Score:</span>
                        <span className={`font-bold ${getComplexityColor(auditResult.llm_analysis.portfolio_quality_score).split(' ')[0]}`}>{auditResult.llm_analysis.portfolio_quality_score}/100</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full rounded-full ${
                            auditResult.llm_analysis.portfolio_quality_score >= 85 ? 'bg-emerald-500' :
                            auditResult.llm_analysis.portfolio_quality_score >= 70 ? 'bg-indigo-500' : 'bg-rose-500'
                          }`} 
                          style={{ width: `${auditResult.llm_analysis.portfolio_quality_score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bullet Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-850/60 pt-4">
                  <div className="space-y-2">
                    <h6 className="font-semibold text-emerald-400 text-[10px] font-mono uppercase tracking-wider">Verified Strengths</h6>
                    <ul className="list-disc list-inside space-y-1.5 text-[10px] text-slate-300">
                      {auditResult.llm_analysis.strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h6 className="font-semibold text-rose-400 text-[10px] font-mono uppercase tracking-wider">Auditor Gaps & focus</h6>
                    <ul className="list-disc list-inside space-y-1.5 text-[10px] text-slate-300">
                      {auditResult.llm_analysis.weaknesses.map((weak, idx) => (
                        <li key={idx}>{weak}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Justification summary */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 font-mono text-[10px] text-indigo-300">
                  <span className="font-bold text-slate-400 uppercase mr-1">Summary justification:</span>
                  {auditResult.justification}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-6 border-t border-slate-850 flex items-center justify-between bg-slate-950/20">
          <div>
            {auditResult && !isAuditing && (
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                <input 
                  type="checkbox"
                  checked={autoVerifyToggled}
                  onChange={(e) => setAutoVerifyToggled(e.target.checked)}
                  className="rounded border-slate-850 text-indigo-600 focus:ring-indigo-500 bg-slate-950 focus:ring-offset-0 focus:ring-0 focus:outline-none"
                />
                <span className="text-[10px] font-mono">Auto-verify checklist signals</span>
              </label>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              className="bg-slate-900 border border-slate-800 hover:text-white transition-colors text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
            >
              Close
            </button>
            {auditResult && !isAuditing && (
              <button 
                onClick={handleApply}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-lg shadow-indigo-650/15"
              >
                Accept & Apply Audit
              </button>
            )}
            {!auditResult && !isAuditing && hasLinks && (
              <button 
                onClick={startAudit}
                className="bg-indigo-650 hover:bg-indigo-550 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Run Audit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
