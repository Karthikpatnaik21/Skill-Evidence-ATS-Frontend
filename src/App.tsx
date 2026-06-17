import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { JobAnalyzer } from './components/JobAnalyzer';
import { ResumeParser } from './components/ResumeParser';
import { WeightSandbox } from './components/WeightSandbox';
import { JsonPreview } from './components/JsonPreview';
import { BatchSandbox } from './components/BatchSandbox';

import { mockTemplates, defaultWeights, calculateFinalScore } from './mockData';
import type { WeightsConfig, MockTemplate, JobDescriptionProfile } from './types';
import { Wifi, WifiOff, Sparkles } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [weights, setWeights] = useState<WeightsConfig>(defaultWeights);
  const [templates, setTemplates] = useState<MockTemplate[]>(mockTemplates);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(mockTemplates[0].id);
  
  // Connection states
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isGeminiActive, setIsGeminiActive] = useState<boolean>(false);
  const [backendReports, setBackendReports] = useState<Record<string, any>>({});

  // Check health of Python backend on mount
  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setIsBackendConnected(true);
          setIsGeminiActive(data.gemini_connected);
        }
      })
      .catch(() => {
        console.log('Backend connection failed. Falling back to local offline mock mode.');
        setIsBackendConnected(false);
        setIsGeminiActive(false);
      });
  }, []);

  // Find the active template
  const activeTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0];

  // Dynamically compute the final explainability report
  const reportInfo = calculateFinalScore(activeTemplate, weights);
  
  // Merge live backend results if available, otherwise use mock defaults
  const liveReport = backendReports[activeTemplateId];

  const calculatedReport = liveReport ? {
    ...liveReport,
    // Ensure finalScore recalculates deterministically on the fly when weights change in Sandbox!
    finalScore: calculateFinalScore(
      {
        ...activeTemplate,
        stageDetection: {
          detectedStage: liveReport.careerStage,
          detectedYearsOfExperience: activeTemplate.stageDetection.detectedYearsOfExperience,
          reasoning: activeTemplate.stageDetection.reasoning
        }
      }, 
      weights
    ).finalScore
  } : {
    candidateName: activeTemplate.resumeParsed.name,
    careerStage: activeTemplate.stageDetection.detectedStage,
    finalScore: reportInfo.finalScore,
    breakdown: reportInfo.breakdown,
    weightedBreakdown: reportInfo.weightedBreakdown,
    strengths: activeTemplate.id === 'fresher-python' ? [
      'Outstanding project complexity (created FastQuery Redis framework)',
      'Proven open-source capability (300+ stars, core contributor)',
      'Highly developed asynchronous Python knowledge (asyncio, WebSockets)'
    ] : activeTemplate.id === 'mid-react' ? [
      'Strong commercial React and TypeScript tenure (3 years)',
      'Proven test coverage expansion from 40% to 75%',
      'Experience optimizing state structures using Zustand'
    ] : [
      'Excellent systems architecture tenure (8+ years)',
      'Successfully migrated monolith to Go microservices serving 15M users',
      'Solid container governance experience (multi-region EKS, ArgoCD)',
      'Exceptional team leadership and mentorship track record'
    ],
    weaknesses: activeTemplate.id === 'fresher-python' ? [
      'Zero commercial developer experience (student status)',
      'No professional exposure to distributed message streams (Kafka)'
    ] : activeTemplate.id === 'mid-react' ? [
      'No next-generation server-rendering exposure (Next.js/Remix)',
      'Limited experience with visual styling tools outside Tailwind'
    ] : [
      'Fewer direct commits in recent years due to design/lead responsibilities',
      'Minor NoSQL database experience compared to relational SQL stores'
    ],
    recommendation: reportInfo.recommendation,
    reasoning: reportInfo.reasoning,
  };

  const handleToggleDeepReview = (candidateId: string, signalKey: 'githubChecked' | 'linkedinChecked' | 'portfolioChecked' | 'websiteChecked') => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === candidateId
          ? {
              ...t,
              deepReviewSignals: t.deepReviewSignals
                ? {
                    ...t.deepReviewSignals,
                    [signalKey]: !t.deepReviewSignals[signalKey],
                  }
                : {
                    githubChecked: false,
                    linkedinChecked: false,
                    portfolioChecked: false,
                    websiteChecked: false,
                    [signalKey]: true,
                  },
            }
          : t
      )
    );
  };

  const handleSaveSocialAudit = (candidateId: string, auditResult: any, autoVerify: boolean = false) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === candidateId) {
          const currentSignals = t.deepReviewSignals || {
            githubChecked: false,
            linkedinChecked: false,
            portfolioChecked: false,
            websiteChecked: false,
          };
          const updatedSignals = autoVerify
            ? {
                githubChecked: auditResult.github_verified || currentSignals.githubChecked,
                linkedinChecked: currentSignals.linkedinChecked || (t.resumeParsed.socialLinks?.linkedin ? true : false),
                portfolioChecked: auditResult.portfolio_verified || currentSignals.portfolioChecked,
                websiteChecked: currentSignals.websiteChecked || (t.resumeParsed.socialLinks?.website ? true : false),
              }
            : currentSignals;

          return {
            ...t,
            socialAuditResult: auditResult,
            deepReviewSignals: updatedSignals,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteCandidate = (candidateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== candidateId));
    const remaining = templates.filter((t) => t.id !== candidateId);
    if (activeTemplateId === candidateId && remaining.length > 0) {
      setActiveTemplateId(remaining[0].id);
    }
  };

  const handleAddCandidate = (newCandidate: MockTemplate) => {
    setTemplates((prev) => {
      if (prev.some((t) => t.id === newCandidate.id)) {
        return prev.map((t) => t.id === newCandidate.id ? newCandidate : t);
      }
      return [...prev, newCandidate];
    });
    setActiveTemplateId(newCandidate.id);
  };

  const handleUpdateJD = (jdText: string, parsedJD: JobDescriptionProfile) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === activeTemplateId ? { ...t, jdText, jdParsed: parsedJD } : t
      )
    );
  };

  const handleUpdateResume = (resumeText: string, updates: {
    resumeParsed: any;
    skillEvidence: any[];
    projectRelevance: any[];
    stageDetection: any;
    scores: any;
  }) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === activeTemplateId
          ? {
              ...t,
              resumeText,
              resumeParsed: updates.resumeParsed,
              skillEvidence: updates.skillEvidence,
              projectRelevance: updates.projectRelevance,
              stageDetection: updates.stageDetection,
              scores: updates.scores,
            }
          : t
      )
    );
  };

  const handleLoadTemplate = (id: string) => {
    setActiveTemplateId(id);
  };

  const handleSelectCandidateFromDashboard = (id: string) => {
    setActiveTemplateId(id);
    setActiveTab('parser'); // Directly redirect to parsing analysis
  };

  const isBackendActive = isBackendConnected && isGeminiActive;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Backend Status Banner */}
      <div className="w-full bg-slate-900 border-b border-slate-800/80 py-2.5 px-6 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Pipeline Backend:</span>
          {isBackendConnected ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <Wifi className="h-3.5 w-3.5" /> Online (FastAPI)
            </span>
          ) : (
            <span className="text-amber-500 flex items-center gap-1 animate-pulse">
              <WifiOff className="h-3.5 w-3.5" /> Offline Mode (Fallback active)
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Google Gemini LLM:</span>
          {isGeminiActive ? (
            <span className="text-indigo-400 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" /> gemini-1.5-flash Active
            </span>
          ) : (
            <span className="text-slate-500">Inactive (No API Key)</span>
          )}
        </div>
      </div>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            templates={templates} 
            onSelectCandidate={handleSelectCandidateFromDashboard}
            onToggleDeepReview={handleToggleDeepReview}
            onDeleteCandidate={handleDeleteCandidate}
            onAddCandidate={handleAddCandidate}
            activeTemplate={activeTemplate}
            isBackendActive={isBackendActive}
            weights={weights}
            onSaveSocialAudit={handleSaveSocialAudit}
          />
        )}
        
        {activeTab === 'analyzer' && (
          <JobAnalyzer
            activeTemplate={activeTemplate}
            templates={templates}
            onUpdateJD={handleUpdateJD}
            onLoadTemplate={handleLoadTemplate}
            isBackendActive={isBackendActive}
          />
        )}
        
        {activeTab === 'parser' && (
          <ResumeParser
            activeTemplate={activeTemplate}
            templates={templates}
            onUpdateResume={handleUpdateResume}
            onLoadTemplate={handleLoadTemplate}
            calculatedReport={calculatedReport}
            isBackendActive={isBackendActive}
            weights={weights}
            onSaveBackendReport={(report) => setBackendReports(prev => ({ ...prev, [activeTemplateId]: report }))}
            onToggleDeepReview={handleToggleDeepReview}
            onSaveSocialAudit={handleSaveSocialAudit}
          />
        )}
        
        {activeTab === 'batch_sandbox' && (
          <BatchSandbox />
        )}
        
        {activeTab === 'sandbox' && (
          <WeightSandbox
            weights={weights}
            templates={templates}
            onUpdateWeights={(w) => setWeights(w)}
          />
        )}
        
        {activeTab === 'preview' && (
          <JsonPreview
            activeTemplate={activeTemplate}
            weights={weights}
            calculatedReport={calculatedReport}
          />
        )}
      </main>

      <footer className="glass border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 Skill Evidence Engine. Created for recruitment transparency.</p>
      </footer>
    </div>
  );
}

export default App;
