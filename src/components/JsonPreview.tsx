import React, { useState } from 'react';
import type { MockTemplate, WeightsConfig, FinalExplainabilityReport } from '../types';
import { CodeXml, Copy, Check, Info, Server, ArrowRight } from 'lucide-react';

interface JsonPreviewProps {
  activeTemplate: MockTemplate;
  weights: WeightsConfig;
  calculatedReport: FinalExplainabilityReport;
}

export const JsonPreview: React.FC<JsonPreviewProps> = ({
  activeTemplate,
  weights,
  calculatedReport,
}) => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const getStageInfo = (stageNum: number) => {
    switch (stageNum) {
      case 1:
        return {
          title: 'Stage 1: Job Understanding',
          endpoint: 'POST /api/v1/job/understand',
          desc: 'Parses the raw job description string and returns structured metadata including required/preferred skills, duties, and predicted seniority tier.',
          request: { jd_text: activeTemplate.jdText.substring(0, 150) + '...' },
          response: activeTemplate.jdParsed,
        };
      case 2:
        return {
          title: 'Stage 2: Resume Profile Extraction',
          endpoint: 'POST /api/v1/resume/parse',
          desc: 'Extracts entities from the resume string: cataloging work experiences, educations, certifications, and technical skills into a structured JSON schema.',
          request: { resume_text: activeTemplate.resumeText.substring(0, 150) + '...' },
          response: activeTemplate.resumeParsed,
        };
      case 3:
        return {
          title: 'Stage 3: Evidence Score Mapping',
          endpoint: 'POST /api/v1/evidence/score',
          desc: 'Scans candidate portfolio, projects, and work history for each required job skill, evaluating project usage, years of experience, and leadership ownership to calculate a weighted evidence score.',
          request: {
            required_skills: activeTemplate.jdParsed.requiredSkills,
            candidate_profile: activeTemplate.resumeParsed,
          },
          response: activeTemplate.skillEvidence,
        };
      case 4:
        return {
          title: 'Stage 4: Project Semantic Relevance',
          endpoint: 'POST /api/v1/project/relevance',
          desc: 'Computes vector embeddings for candidate projects and maps them against JD roles and responsibilities to calculate semantic similarity percentages with human-readable justifications.',
          request: {
            responsibilities: activeTemplate.jdParsed.responsibilities,
            projects: activeTemplate.resumeParsed.projects,
          },
          response: activeTemplate.projectRelevance,
        };
      default:
        return {
          title: 'Stage 5 & Final: Explainable Match Report',
          endpoint: 'POST /api/v1/candidate/rank',
          desc: 'Consolidates evidence, project relevance, knowledge depth, learning velocity, and tenure. Dynamically adjusts coefficients based on the detected career stage, outputting the final report.',
          request: {
            candidate_id: activeTemplate.id,
            weights_config: weights,
          },
          response: calculatedReport,
        };
    }
  };

  const currentInfo = getStageInfo(activeStage);
  const responseJsonStr = JSON.stringify(currentInfo.response, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(responseJsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      {/* Left Column: API Contract Info (lg:col-span-5) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col h-[600px] justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 border-b border-slate-800 pb-4 mb-4">
              <Server className="h-5 w-5" />
              <h2 className="font-bold text-white text-base">Backend API Contracts</h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              This panel displays the exact JSON structures exchangeable between the React frontend and the future Python backend. Select a stage to view its endpoints.
            </p>

            {/* Stage Selector List */}
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((stageNum) => {
                const step = getStageInfo(stageNum);
                const isActive = activeStage === stageNum;
                return (
                  <button
                    key={stageNum}
                    onClick={() => setActiveStage(stageNum)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all duration-200 flex items-center justify-between ${
                      isActive
                        ? 'bg-slate-900 border-indigo-500/30 text-white shadow-indigo-950/20 shadow-md'
                        : 'bg-slate-900/20 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                    }`}
                  >
                    <div>
                      <p className="font-mono text-[10px] uppercase text-indigo-400 font-bold">Stage {stageNum}</p>
                      <p className="font-semibold mt-0.5">{step.title.split(': ')[1]}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Info className="h-4.5 w-4.5" />
              <span className="text-xs font-bold text-white font-mono">Endpoint Specs</span>
            </div>
            
            <div className="font-mono text-[10px] text-indigo-300 bg-slate-900/60 p-2 rounded border border-indigo-500/10">
              {currentInfo.endpoint}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {currentInfo.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Code block viewer (lg:col-span-7) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col h-[600px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
            <div className="flex items-center gap-2 text-indigo-400">
              <CodeXml className="h-5 w-5" />
              <h3 className="font-bold text-white text-sm font-mono">Response Payload (JSON)</h3>
            </div>

            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-850 p-2 rounded-lg border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400 font-mono">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="font-mono">Copy JSON</span>
                </>
              )}
            </button>
          </div>

          {/* Code Container */}
          <div className="flex-1 w-full bg-slate-950 rounded-xl border border-slate-900 p-4 font-mono text-[11px] leading-relaxed overflow-auto scrollbar-thin">
            <pre className="text-emerald-400">
              {responseJsonStr}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
