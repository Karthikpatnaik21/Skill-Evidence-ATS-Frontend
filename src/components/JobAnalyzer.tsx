import React, { useState, useEffect } from 'react';
import type { JobDescriptionProfile, MockTemplate } from '../types';
import { Loader2, Play, Sparkles, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface JobAnalyzerProps {
  activeTemplate: MockTemplate;
  onUpdateJD: (jdText: string, parsedJD: JobDescriptionProfile) => void;
  templates: MockTemplate[];
  onLoadTemplate: (templateId: string) => void;
  isBackendActive?: boolean;
}

export const JobAnalyzer: React.FC<JobAnalyzerProps> = ({
  activeTemplate,
  onUpdateJD,
  templates,
  onLoadTemplate,
  isBackendActive,
}) => {
  const [jdText, setJdText] = useState(activeTemplate.jdText);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync JD text when template changes
  useEffect(() => {
    setJdText(activeTemplate.jdText);
  }, [activeTemplate]);

  const handleExtract = async () => {
    if (!jdText.trim()) {
      setError('Please enter a job description to extract.');
      return;
    }
    setError(null);
    setIsExtracting(true);

    if (isBackendActive) {
      try {
        const response = await fetch('/api/v1/job/understand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jd_text: jdText })
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Failed to understand job description.');
        }
        const parsed = await response.json();
        onUpdateJD(jdText, parsed);
      } catch (err: any) {
        console.error('Job analysis API error:', err);
        setError(`Backend Error: ${err.message || err}`);
      } finally {
        setIsExtracting(false);
      }
      return;
    }

    // Simulate LLM Processing time
    setTimeout(() => {
      setIsExtracting(false);

      // Check if it matches a template
      const matched = templates.find(
        (t) => jdText.trim().toLowerCase() === t.jdText.trim().toLowerCase()
      );

      if (matched) {
        onUpdateJD(jdText, matched.jdParsed);
      } else {
        // Dynamic client-side parsing for custom text
        const lowerText = jdText.toLowerCase();
        const detectedSkills: string[] = [];
        
        // Simple heuristic search for demo
        const skillList = [
          'Python', 'FastAPI', 'Flask', 'PostgreSQL', 'AWS', 'Redis', 'Docker',
          'Kubernetes', 'Kafka', 'gRPC', 'React', 'TypeScript', 'Tailwind',
          'Zustand', 'Redux', 'Vite', 'Next.js', 'Jest', 'Git', 'Java', 'Go',
          'MongoDB', 'SQL', 'HTML', 'CSS'
        ];

        skillList.forEach(skill => {
          if (lowerText.includes(skill.toLowerCase())) {
            detectedSkills.push(skill);
          }
        });

        // Split into required vs preferred
        const required = detectedSkills.slice(0, Math.ceil(detectedSkills.length * 0.7));
        const preferred = detectedSkills.slice(Math.ceil(detectedSkills.length * 0.7));

        // Attempt to guess title
        let title = 'Software Engineer';
        if (lowerText.includes('frontend')) title = 'Frontend Developer';
        else if (lowerText.includes('backend')) title = 'Backend Engineer';
        else if (lowerText.includes('architect')) title = 'Solutions Architect';
        else if (lowerText.includes('lead')) title = 'Lead Engineer';

        // Attempt to guess seniority
        let seniority = 'Mid-level (2-5 years)';
        if (/\b(senior|lead|principal|staff|5\+?\s*years|7\+?\s*years|8\+?\s*years|9\+?\s*years)\b/.test(lowerText)) {
          seniority = 'Senior / Lead (5+ years)';
        } else if (/\b(fresher|entry[- ]level|0[- ]2\s*years|0\s+to\s+2\s*years|intern(ship)?s?)\b/.test(lowerText)) {
          seniority = 'Fresher / Entry-level (0-2 years)';
        }

        const parsed: JobDescriptionProfile = {
          title,
          requiredSkills: required.length > 0 ? required : ['Software Engineering', 'Problem Solving'],
          preferredSkills: preferred.length > 0 ? preferred : ['System Design', 'Agile Methodologies'],
          responsibilities: [
            'Collaborate with developers, designers, and managers to build features.',
            'Maintain and deploy software updates using version control.',
            'Optimize applications for maximum performance and stability.',
            'Write clean, readable, and well-tested code.'
          ],
          seniority,
          idealProfile: `An adaptable developer with skills in ${detectedSkills.slice(0, 3).join(', ')}. They demonstrate strong problem solving, attention to clean architecture, and standard engineering tooling.`
        };

        onUpdateJD(jdText, parsed);
      }
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
      {/* Left Column: Editor */}
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col h-[520px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <FileText className="h-5 w-5" />
              <h2 className="font-bold text-white text-base">Job Description Input</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-slate-400 font-mono">Load Template:</label>
              <select
                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                onChange={(e) => onLoadTemplate(e.target.value)}
                value={activeTemplate.id}
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name.split(' (')[0]}</option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            className="flex-1 w-full bg-slate-950/80 border border-slate-850 p-4 rounded-xl text-xs leading-relaxed text-slate-200 resize-none font-mono focus:outline-none focus:border-indigo-500/50 transition-colors"
            placeholder="Paste Job Description here..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />

          {error && (
            <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={isExtracting}
            className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs py-3 rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-200 cursor-pointer"
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Stage 1 Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Extract Job Specifications</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Visualization */}
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-2xl h-[520px] flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/60">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="h-5 w-5" />
              <h2 className="font-bold text-white text-base">Stage 1: Job Understanding</h2>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
              LLM Schema Parser
            </span>
          </div>

          {isExtracting ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-slate-300 font-mono animate-pulse">Scanning requirements...</p>
              <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                Structuring title, segregating mandatory vs preferred skills, and identifying key corporate duties.
              </p>
            </div>
          ) : (
            <div className="space-y-5 flex-1">
              {/* Validation Warnings */}
              {activeTemplate.jdParsed.validationWarnings && activeTemplate.jdParsed.validationWarnings.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs font-mono uppercase tracking-wider">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Impossible / Contradictory Requirements Detected</span>
                  </div>
                  <ul className="space-y-1.5 list-disc pl-4">
                    {activeTemplate.jdParsed.validationWarnings.map((warning, index) => (
                      <li key={index} className="text-xs text-rose-300 leading-relaxed font-mono">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Header Title */}
              <div className="flex justify-between items-start gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
                <div>
                  <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Identified Position</p>
                  <h3 className="text-lg font-bold text-white mt-0.5">{activeTemplate.jdParsed.title}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Seniority Profile</p>
                  <span className="inline-block mt-1 text-[11px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                    {activeTemplate.jdParsed.seniority}
                  </span>
                </div>
              </div>

              {/* Skills Segregation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/30 border border-slate-800/40 p-4 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider flex items-center gap-1.5 mb-3">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Required Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTemplate.jdParsed.requiredSkills.map((skill, index) => (
                      <span key={index} className="text-xs bg-slate-950 border border-indigo-500/20 text-slate-200 px-2.5 py-1 rounded-md font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-800/40 p-4 rounded-xl">
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider flex items-center gap-1.5 mb-3">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    Preferred Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTemplate.jdParsed.preferredSkills.map((skill, index) => (
                      <span key={index} className="text-xs bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-md font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Duties / Responsibilities */}
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-2">
                  Extracted Core Responsibilities
                </span>
                <ul className="space-y-2">
                  {activeTemplate.jdParsed.responsibilities.map((resp, index) => (
                    <li key={index} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ideal Profile */}
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-1">
                  Ideal Candidate Persona
                </span>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-900">
                  {activeTemplate.jdParsed.idealProfile}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
