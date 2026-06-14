import React from 'react';
import type { MockTemplate } from '../types';
import { Cpu, Users, Award, ShieldCheck, ArrowRight, BookOpen, UserCheck, Flame } from 'lucide-react';

interface DashboardProps {
  templates: MockTemplate[];
  onSelectCandidate: (candidateId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ templates, onSelectCandidate }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header and Welcome */}
      <div className="glass-card p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-3xl">
          <span className="text-xs text-indigo-400 font-mono tracking-widest uppercase bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            Developer Sandbox
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight leading-tight">
            Evidence-Based Candidate Matching
          </h1>
          <p className="text-slate-300 mt-3 leading-relaxed text-sm md:text-base">
            Welcome to the <strong>Skill Evidence Engine Console</strong>. Traditional ATS systems rank candidates based on keyword stuffing. Our engine measures **demonstrated capability** by extracting evidence from projects, open-source work, and professional roles, making decisions fully explainable.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Templates Loaded</p>
            <p className="text-2xl font-bold text-white mt-0.5">3 Candidates</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Extraction Pipeline</p>
            <p className="text-2xl font-bold text-white mt-0.5">5 Stages Active</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-lg">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Average Match Score</p>
            <p className="text-2xl font-bold text-white mt-0.5">85 / 100</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Explainability</p>
            <p className="text-2xl font-bold text-white mt-0.5">100% Auditable</p>
          </div>
        </div>
      </div>

      {/* Core Philosophy Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl border-l-4 border-indigo-500">
          <div className="flex items-center gap-2 text-indigo-400 mb-3">
            <Flame className="h-5 w-5" />
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Capability Model</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            We compute:
            <span className="block mt-2 font-mono text-indigo-300 font-semibold bg-indigo-950/40 p-2 rounded text-center border border-indigo-900/30">
              Capability = Knowledge + Experience + Demonstrated Application
            </span>
            Claims are not enough; candidate portfolios must demonstrate hands-on application to build evidence.
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl border-l-4 border-emerald-500">
          <div className="flex items-center gap-2 text-emerald-400 mb-3">
            <UserCheck className="h-5 w-5" />
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Potential Over Tenure</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Freshers with zero years of professional tenure are not automatically penalised. The system scores their open-source contributions, project complexity, and learning velocity to measure raw capability.
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl border-l-4 border-violet-500">
          <div className="flex items-center gap-2 text-violet-400 mb-3">
            <BookOpen className="h-5 w-5" />
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Full Audit Trail</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Decision logic is transparent. Recruiters can view exactly which project descriptions and skills contributed to the final score, resolving the black-box issue of traditional LLM matchers.
          </p>
        </div>
      </div>

      {/* Templates / Candidates List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Select a Demo Candidate Template</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {templates.map((candidate) => {
            const isFresher = candidate.stageDetection.detectedStage === 'fresher';
            const isMid = candidate.stageDetection.detectedStage === 'mid';
            
            return (
              <div 
                key={candidate.id} 
                className="glass-card glass-card-hover p-6 rounded-xl flex flex-col justify-between cursor-pointer group transition-all duration-300"
                onClick={() => onSelectCandidate(candidate.id)}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isFresher ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      isMid ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {candidate.stageDetection.detectedStage.toUpperCase()} ({candidate.stageDetection.detectedYearsOfExperience} Yrs)
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-indigo-400 transition-colors">
                      {candidate.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {candidate.resumeParsed.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{candidate.jdParsed.title}</p>
                  <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                    {candidate.description}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    {candidate.skillEvidence.length} Evidence Points
                  </span>
                  <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Run Analysis <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
