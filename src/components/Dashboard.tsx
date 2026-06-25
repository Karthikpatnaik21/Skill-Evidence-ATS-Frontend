import React, { useState } from 'react';
import type { MockTemplate, WeightsConfig } from '../types';
import { 
  ArrowRight, Flame, Trash2, Plus, Globe, Loader2, AlertCircle, Briefcase, Terminal, Link, Cpu
} from 'lucide-react';
import { calculateFinalScore } from '../mockData';
import { SocialAuditModal } from './SocialAuditModal';

interface DashboardProps {
  templates: MockTemplate[];
  onSelectCandidate: (candidateId: string) => void;
  onToggleDeepReview: (candidateId: string, signalKey: 'githubChecked' | 'linkedinChecked' | 'portfolioChecked' | 'websiteChecked') => void;
  onDeleteCandidate: (candidateId: string) => void;
  onAddCandidate: (candidate: MockTemplate) => void;
  activeTemplate: MockTemplate;
  isBackendActive: boolean;
  weights: WeightsConfig;
  onSaveSocialAudit: (candidateId: string, auditResult: any, autoVerify: boolean) => void;
}

// Client-side parser helper (duplicate of logic in ResumeParser for offline standalone support)
const parseResumeClientSide = (text: string, filename: string) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // 1. Extract Name
  let name = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  // Capitalize name
  name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  // 1.5 Extract Social Links from raw text via regex heuristics
  const socialLinks: any = {};
  const linesForLinks = text.split('\n');
  
  for (let line of linesForLinks) {
    line = line.trim();
    if (!line) continue;
    
    // 1. LinkedIn
    if (/linkedin\.com\/in\//i.test(line)) {
      const match = line.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_\-%]+)/i);
      if (match) {
        socialLinks.linkedin = `https://www.linkedin.com/in/${match[1]}`;
      }
    } else if (/linkedin/i.test(line) && !socialLinks.linkedin) {
      const labelMatch = line.match(/linkedin\s*:\s*(.+)/i);
      if (labelMatch) {
        const val = labelMatch[1].trim().replace(/[|,\s]+$/, '');
        if (val) {
          if (val.includes('linkedin.com/in/')) {
            const m = val.match(/(?:linkedin\.com\/in\/)?([a-zA-Z0-9_\-%]+)/i);
            if (m) {
              socialLinks.linkedin = `https://www.linkedin.com/in/${m[1]}`;
            }
          } else if (!val.includes('/') && /^[a-zA-Z0-9_-]+$/.test(val)) {
            socialLinks.linkedin = `https://www.linkedin.com/in/${val}`;
          }
        }
      }
    }
    
    // 2. GitHub & github.io
    if (/github\.com\//i.test(line)) {
      const match = line.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
      if (match) {
        const username = match[1];
        if (!['features', 'pulls', 'pricing', 'explore', 'market', 'trending'].includes(username.toLowerCase())) {
          socialLinks.github = `https://github.com/${username}`;
        }
      }
    } else if (/github/i.test(line) && !socialLinks.github && !/github\.io/i.test(line)) {
      const labelMatch = line.match(/github\s*:\s*(.+)/i);
      if (labelMatch) {
        const val = labelMatch[1].trim().replace(/[|,\s]+$/, '');
        if (val) {
          if (val.includes('github.com')) {
            const m = val.match(/(?:github\.com\/)?([a-zA-Z0-9_-]+)/i);
            if (m) {
              socialLinks.github = `https://github.com/${m[1]}`;
            }
          } else if (!val.includes('/') && /^[a-zA-Z0-9_-]+$/.test(val)) {
            socialLinks.github = `https://github.com/${val}`;
          }
        }
      }
    }
    
    if (/github\.io/i.test(line)) {
      const match = line.match(/(?:https?:\/\/)?([a-zA-Z0-9_-]+)\.github\.io/i);
      if (match) {
        const username = match[1];
        socialLinks.github = `https://github.com/${username}`;
        
        const portfolioLabelMatch = line.match(/(?:portfolio|website|site|url|link)\s*:\s*(.+)/i);
        if (portfolioLabelMatch) {
          const rawUrl = portfolioLabelMatch[1].trim().replace(/[|,\s]+$/, '');
          if (rawUrl) {
            socialLinks.portfolio = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
          }
        } else {
          const httpIdx = line.toLowerCase().indexOf('http');
          if (httpIdx !== -1) {
            socialLinks.portfolio = line.substring(httpIdx).trim().replace(/[|,\s]+$/, '');
          } else {
            socialLinks.portfolio = `https://${username}.github.io`;
          }
        }
      }
    }
    
    // 3. General Portfolio (if not set by github.io yet)
    if (/portfolio/i.test(line) && !socialLinks.portfolio) {
      const match = line.match(/portfolio\s*:\s*(.+)/i);
      if (match) {
        const rawUrl = match[1].trim().replace(/[|,\s]+$/, '');
        if (rawUrl) {
          socialLinks.portfolio = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
        }
      }
    }
    
    if (/(?:website|site|personal page)\s*:\s*(.+)/i.test(line) && !socialLinks.website) {
      const match = line.match(/(?:website|site|personal page)\s*:\s*(.+)/i);
      if (match) {
        const rawUrl = match[1].trim().replace(/[|,\s]+$/, '');
        if (rawUrl && !rawUrl.includes('github.com') && !rawUrl.includes('linkedin.com')) {
          socialLinks.website = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
        }
      }
    }
  }

  // Remove any spaces in the extracted URLs
  for (const key in socialLinks) {
    if (socialLinks[key]) {
      socialLinks[key] = socialLinks[key].replace(/\s+/g, '');
    }
  }

  // 2. Extract Skills
  const commonSkills = [
    'Python', 'FastAPI', 'Flask', 'PostgreSQL', 'AWS', 'Redis', 'Docker',
    'Kubernetes', 'Kafka', 'gRPC', 'React', 'TypeScript', 'Tailwind',
    'Zustand', 'Redux', 'Vite', 'Next.js', 'Jest', 'Git', 'Java', 'Go',
    'MongoDB', 'SQL', 'HTML', 'CSS', 'JavaScript'
  ];
  const detectedSkills: string[] = [];
  const lowerText = text.toLowerCase();
  commonSkills.forEach(s => {
    if (lowerText.includes(s.toLowerCase())) {
      detectedSkills.push(s);
    }
  });

  // 3. Extract Experience
  const experiences: any[] = [];
  let totalExperienceYears = 0;
  const yearRangeRegex = /((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|present|current|now)/i;
  
  lines.forEach((line, idx) => {
    const match = line.match(yearRangeRegex);
    if (match) {
      let isEdu = false;
      const candidateLines = [line, lines[idx - 1] || '', lines[idx + 1] || ''];
      for (const cl of candidateLines) {
        if (/degree|school|university|college|polytechnic|diploma|b\.tech|ssc|hsc|education/i.test(cl)) {
          isEdu = true;
          break;
        }
      }
      if (isEdu) return;

      let role = 'Software Developer';
      let company = 'Company';
      const roleKeywords = ['engineer', 'developer', 'designer', 'architect', 'lead', 'specialist', 'intern', 'analyst', 'manager', 'programmer'];
      
      for (const cl of candidateLines) {
        const lowerCl = cl.toLowerCase();
        if (roleKeywords.some(rk => lowerCl.includes(rk))) {
          const parts = cl.split(/[\t|—–]|\s{2,}/).map(p => p.trim()).filter(p => p.length > 0);
          if (parts.length > 0) {
            const roleIdx = parts.findIndex(p => roleKeywords.some(rk => p.toLowerCase().includes(rk)));
            if (roleIdx !== -1) {
              role = parts[roleIdx].replace(/^(?:professional\s+)?experience\s+/i, '').trim();
              if (roleIdx + 1 < parts.length) {
                company = parts[roleIdx + 1];
              } else if (roleIdx - 1 >= 0) {
                company = parts[roleIdx - 1];
              }
              break;
            }
          }
        }
      }
      
      const startYear = parseInt(match[1]);
      const endYear = match[2].toLowerCase() === 'present' || match[2].toLowerCase() === 'current' ? 2026 : parseInt(match[2]);
      const durationYears = Math.max(endYear - startYear, 1);
      totalExperienceYears += durationYears;

      experiences.push({
        role,
        company,
        duration: `${match[1]} - ${match[2]} (${durationYears} yr${durationYears > 1 ? 's' : ''})`,
        description: `Hands-on work utilizing technical stack including ${detectedSkills.slice(0, 3).join(', ')}.`
      });
    }
  });

  let stage: 'fresher' | 'mid' | 'senior' = 'fresher';
  if (totalExperienceYears >= 5) {
    stage = 'senior';
  } else if (totalExperienceYears >= 2) {
    stage = 'mid';
  }

  const skillEvidence = detectedSkills.slice(0, 4).map(skill => {
    const projectUsage = Math.floor(Math.random() * 2) + 1;
    const score = 55 + (totalExperienceYears * 4) + (projectUsage * 8);
    return {
      skillName: skill,
      isMentioned: true,
      projectUsageCount: projectUsage,
      professionalExperienceYears: totalExperienceYears,
      leadershipUsage: totalExperienceYears >= 5,
      evidencePoints: [`Demonstrated application of ${skill} in projects and tasks.`],
      score: Math.min(score, 95)
    };
  });

  if (skillEvidence.length === 0) {
    skillEvidence.push({
      skillName: 'General Dev',
      isMentioned: true,
      projectUsageCount: 1,
      professionalExperienceYears: totalExperienceYears,
      leadershipUsage: false,
      evidencePoints: ['Basic development experience.'],
      score: 70
    });
  }

  return {
    resumeParsed: {
      name,
      skills: detectedSkills.length > 0 ? detectedSkills : ['General Engineering'],
      projects: [
        {
          title: 'Core Development Project',
          description: `Designed and built system features using ${detectedSkills.slice(0, 3).join(', ')}.`,
          technologies: detectedSkills.slice(0, 4)
        }
      ],
      experience: experiences,
      education: [{ degree: 'B.S. in Computer Science', school: 'University', year: '2024' }],
      certifications: [],
      achievements: [],
      socialLinks: socialLinks
    },
    skillEvidence,
    projectRelevance: [
      {
        projectTitle: 'Core Development Project',
        matchScore: 80,
        justification: 'Mapped engineering components against JD requirements.',
        alignedSkills: detectedSkills.slice(0, 3)
      }
    ],
    stageDetection: {
      detectedStage: stage,
      detectedYearsOfExperience: totalExperienceYears,
      reasoning: `Detected career stage: ${stage.toUpperCase()} based on computed years of experience (${totalExperienceYears} yrs).`
    },
    scores: {
      knowledgeDepth: 70 + (totalExperienceYears * 2),
      learningVelocity: 85 - (totalExperienceYears * 2),
      leadershipImpact: totalExperienceYears >= 5 ? 85 : 20,
      experienceMatch: totalExperienceYears * 10 + 10
    }
  };
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  templates, 
  onSelectCandidate,
  onToggleDeepReview,
  onDeleteCandidate,
  onAddCandidate,
  activeTemplate,
  isBackendActive,
  weights,
  onSaveSocialAudit
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditCandidate, setAuditCandidate] = useState<MockTemplate | null>(null);

  const handleTriggerAudit = (candidate: MockTemplate) => {
    setAuditCandidate(candidate);
    setIsAuditOpen(true);
  };

  const handleOpenLink = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank', 'noopener,noreferrer');
    }
  };

  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        if (pdfjsLib) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(pdfjsLib);
        } else {
          reject(new Error('pdfjsLib failed to load.'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load PDF library.'));
      document.head.appendChild(script);
    });
  };

  const parsePdfFile = async (file: File): Promise<string> => {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      let pageLines: string[] = [];
      let currentLine = '';
      let lastY = -1;
      
      for (const item of textContent.items as any[]) {
        const str = item.str || '';
        const y = item.transform ? item.transform[5] : -1;
        if (lastY !== -1 && Math.abs(y - lastY) > 5) {
          if (currentLine.trim()) pageLines.push(currentLine.trim());
          currentLine = str;
        } else {
          if (currentLine && !currentLine.endsWith(' ') && !str.startsWith(' ')) {
            currentLine += ' ';
          }
          currentLine += str;
        }
        if (item.hasEOL) {
          if (currentLine.trim()) pageLines.push(currentLine.trim());
          currentLine = '';
          lastY = -1;
        } else {
          lastY = y;
        }
      }
      if (currentLine.trim()) pageLines.push(currentLine.trim());
      fullText += pageLines.join('\n') + '\n';
    }
    return fullText;
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setUploadError(null);
    setProcessingStatus(`Reading file "${file.name}"...`);
    
    try {
      let text = '';
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        text = await parsePdfFile(file);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        text = await file.text();
      } else {
        throw new Error('Unsupported format. Please upload PDF or TXT files.');
      }

      if (!text.trim()) {
        throw new Error('File content is empty or contains no selectable text.');
      }

      const tempId = `candidate-${Date.now()}`;
      
      if (isBackendActive) {
        setProcessingStatus('Connecting to Gemini Pipeline Stage 2 (Parsing)...');
        const parseRes = await fetch('/api/v1/resume/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resume_text: text })
        });
        if (!parseRes.ok) throw new Error('Gemini Parsing step failed.');
        const resumeParsed = await parseRes.json();

        setProcessingStatus('Running Gemini Stage 3 (Evidence Scoring)...');
        const evidenceRes = await fetch('/api/v1/evidence/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            required_skills: activeTemplate.jdParsed.requiredSkills,
            candidate_profile: resumeParsed
          })
        });
        if (!evidenceRes.ok) throw new Error('Evidence extraction failed.');
        const skillEvidence = await evidenceRes.json();

        setProcessingStatus('Running Gemini Stage 4 (Project Matching)...');
        const relevanceRes = await fetch('/api/v1/project/relevance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responsibilities: activeTemplate.jdParsed.responsibilities,
            projects: resumeParsed.projects
          })
        });
        if (!relevanceRes.ok) throw new Error('Project matching failed.');
        const projectRelevance = await relevanceRes.json();

        setProcessingStatus('Running Gemini Stage 5 (Career Stage Detection)...');
        const stageRes = await fetch('/api/v1/stage/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resumeParsed)
        });
        if (!stageRes.ok) throw new Error('Stage detection failed.');
        const stageDetection = await stageRes.json();

        const candidateObj: MockTemplate = {
          id: tempId,
          name: `${resumeParsed.name} (Uploaded)`,
          description: `Uploaded candidate. Stage detected: ${stageDetection.detectedStage}`,
          jdText: activeTemplate.jdText,
          resumeText: text,
          jdParsed: activeTemplate.jdParsed,
          resumeParsed,
          skillEvidence,
          projectRelevance,
          stageDetection,
          scores: {
            knowledgeDepth: stageDetection.detectedStage === 'senior' ? 90 : stageDetection.detectedStage === 'mid' ? 80 : 70,
            learningVelocity: stageDetection.detectedStage === 'fresher' ? 90 : stageDetection.detectedStage === 'mid' ? 80 : 70,
            leadershipImpact: stageDetection.detectedStage === 'senior' ? 90 : stageDetection.detectedStage === 'mid' ? 50 : 20,
            experienceMatch: stageDetection.detectedYearsOfExperience * 10 + 10
          },
          deepReviewSignals: {
            githubChecked: false,
            linkedinChecked: false,
            portfolioChecked: false,
            websiteChecked: false
          }
        };
        onAddCandidate(candidateObj);
      } else {
        // Offline Parser Fallback
        setProcessingStatus('Running offline fallback matching rules...');
        const parsedResult = parseResumeClientSide(text, file.name);
        const candidateObj: MockTemplate = {
          id: tempId,
          name: `${parsedResult.resumeParsed.name} (Uploaded)`,
          description: `Uploaded candidate (Offline Mode). Stage: ${parsedResult.stageDetection.detectedStage}`,
          jdText: activeTemplate.jdText,
          resumeText: text,
          jdParsed: activeTemplate.jdParsed,
          resumeParsed: parsedResult.resumeParsed,
          skillEvidence: parsedResult.skillEvidence,
          projectRelevance: parsedResult.projectRelevance,
          stageDetection: parsedResult.stageDetection,
          scores: parsedResult.scores,
          deepReviewSignals: {
            githubChecked: false,
            linkedinChecked: false,
            portfolioChecked: false,
            websiteChecked: false
          }
        };
        // Small timeout for natural animation feel
        await new Promise((resolve) => setTimeout(resolve, 800));
        onAddCandidate(candidateObj);
      }
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'An error occurred during resume uploading.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        await handleFileUpload(file);
      }
    }
  };

  // Sort and compile candidates
  const scoredCandidates = templates.map((cand) => {
    const report = calculateFinalScore(cand, weights);
    return {
      candidate: cand,
      report
    };
  }).sort((a, b) => b.report.finalScore - a.report.finalScore);

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getRecommendationText = (score: number) => {
    if (score >= 85) return 'Strong Fit';
    if (score >= 70) return 'Moderate Fit';
    return 'No Fit';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Panel */}
      <div className="glass-card p-6 md:p-8 rounded-2xl relative overflow-hidden border border-slate-800/80">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs text-indigo-400 font-mono tracking-widest uppercase bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Explainable AI Dashboard
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight leading-tight">
              Candidate Leaderboard
            </h1>
            <p className="text-slate-300 mt-2 leading-relaxed text-sm">
              Rank candidates based on structural capabilities, verified project evidence, and potential. Overcome keyword-matching limitations by auditing precise evidence points.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shrink-0 w-full md:w-80">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Active Job Profile Target</span>
            <h4 className="text-sm font-bold text-white mt-1.5 truncate">{activeTemplate.jdParsed.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                {activeTemplate.jdParsed.seniority}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeTemplate.jdParsed.requiredSkills.length} Required Skills
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic line-clamp-2 leading-normal">
              "{activeTemplate.jdParsed.idealProfile}"
            </p>
          </div>
        </div>
      </div>

      {/* Upload & Global Progress Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Zone */}
        <div className="lg:col-span-4 flex flex-col justify-stretch">
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('dashboard-batch-uploader')?.click()}
            className="flex-1 min-h-36 border border-dashed border-slate-800 hover:border-indigo-500/40 rounded-xl p-6 bg-slate-900/20 flex flex-col items-center justify-center text-center cursor-pointer transition-colors relative"
          >
            <input 
              id="dashboard-batch-uploader"
              type="file"
              multiple
              accept=".pdf,.txt"
              className="hidden"
              onChange={async (e) => {
                if (e.target.files) {
                  const files = Array.from(e.target.files);
                  for (const file of files) {
                    await handleFileUpload(file);
                  }
                }
              }}
            />
            {isProcessing ? (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                <p className="text-xs text-slate-200 font-mono leading-normal">{processingStatus}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Plus className="h-6 w-6 text-indigo-400 mx-auto" />
                <h3 className="text-xs font-bold text-slate-200">Drag & Drop Resumes</h3>
                <p className="text-[10px] text-slate-500 font-mono">Select single or multiple PDF / TXT files</p>
              </div>
            )}
          </div>
          {uploadError && (
            <div className="mt-3 text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Candidates Listed</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-white">{scoredCandidates.length}</span>
              <span className="text-[10px] text-slate-400">total profiles</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Strong Match rate</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-emerald-400">
                {Math.round((scoredCandidates.filter(c => c.report.finalScore >= 85).length / Math.max(scoredCandidates.length, 1)) * 100)}%
              </span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Avg Match score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-indigo-400">
                {Math.round(scoredCandidates.reduce((sum, c) => sum + c.report.finalScore, 0) / Math.max(scoredCandidates.length, 1))}
              </span>
              <span className="text-[10px] text-slate-500">/ 100</span>
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Deep Audit Signals</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-violet-400">100%</span>
              <span className="text-[10px] text-slate-500">explainable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80">
        <div className="px-6 py-4 border-b border-slate-900 bg-slate-900/30 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Candidate Suitability Ranking</h2>
          <span className="text-[10px] text-slate-500 font-mono">Dynamically Sorted descending</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-[10px] font-mono uppercase text-slate-500 tracking-wider bg-slate-950/20">
                <th className="py-4 px-6 text-center w-16">Rank</th>
                <th className="py-4 px-4">Candidate & Stage</th>
                <th className="py-4 px-4 text-center">Potential Score</th>
                <th className="py-4 px-6 text-center">Deep Review Checklist</th>
                <th className="py-4 px-4 text-center">Recommendation</th>
                <th className="py-4 px-6 text-center w-28">Final Score</th>
                <th className="py-4 px-6 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scoredCandidates.map(({ candidate, report }, index) => {
                const rank = index + 1;
                const isFresher = candidate.stageDetection.detectedStage === 'fresher';
                
                // Rank Styling
                let rankBadge = 'bg-slate-900 text-slate-400 border-slate-800';
                if (rank === 1) rankBadge = 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/10 animate-pulse';
                if (rank === 2) rankBadge = 'bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-bold border-slate-200';
                if (rank === 3) rankBadge = 'bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-bold border-amber-700';

                return (
                  <tr 
                    key={candidate.id}
                    className="border-b border-slate-900/60 hover:bg-slate-900/20 transition-colors group"
                  >
                    {/* Rank Badge */}
                    <td className="py-5 px-6 text-center">
                      <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-mono border ${rankBadge}`}>
                        {rank}
                      </span>
                    </td>

                    {/* Candidate Identity */}
                    <td className="py-5 px-4">
                      <div className="font-bold text-white group-hover:text-indigo-400 transition-colors text-sm">
                        {candidate.resumeParsed.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                          candidate.stageDetection.detectedStage === 'fresher' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          candidate.stageDetection.detectedStage === 'mid' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {candidate.stageDetection.detectedStage} ({candidate.stageDetection.detectedYearsOfExperience} yrs)
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-xs font-medium">
                          {candidate.jdParsed.title}
                        </span>
                      </div>
                    </td>

                    {/* Potential Score */}
                    <td className="py-5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-center gap-1">
                          <span className={`text-sm font-bold font-mono ${isFresher ? 'text-indigo-400' : 'text-slate-300'}`}>
                            {report.potentialScore ?? 75}
                          </span>
                          {isFresher && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5 flex items-center gap-0.5 uppercase tracking-normal">
                          {isFresher && <Flame className="h-2.5 w-2.5 text-indigo-400 shrink-0" />} Potential
                        </span>
                      </div>
                    </td>

                    {/* Deep Review Toggles */}
                    <td className="py-5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* GitHub Toggle */}
                        <div className="relative group/btn">
                          <button
                            onClick={() => onToggleDeepReview(candidate.id, 'githubChecked')}
                            className={`p-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-center relative cursor-pointer ${
                              candidate.deepReviewSignals?.githubChecked 
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/5' 
                                : 'bg-slate-900/40 border-slate-800/80 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <Terminal className="h-4 w-4" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-950 border border-slate-800 text-[9px] text-slate-300 font-mono rounded px-2 py-1 whitespace-nowrap opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity z-10 shadow-lg">
                              GitHub: {candidate.resumeParsed.socialLinks?.github || 'Not found in resume'} (+{candidate.deepReviewSignals?.githubChecked ? ((candidate.socialAuditResult?.llm_analysis?.code_complexity_score ?? candidate.deepReviewSignals?.githubQualityScore ?? 0) / 100 * 3).toFixed(1) : '0'})
                            </span>
                          </button>
                          {candidate.resumeParsed.socialLinks?.github && (
                            <button
                              onClick={(e) => handleOpenLink(e, candidate.resumeParsed.socialLinks?.github)}
                              className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-slate-950 hover:bg-indigo-650 border border-slate-850 hover:border-indigo-400 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all text-[8px] cursor-pointer font-bold font-mono"
                              title="Open GitHub Profile"
                            >
                              ↗
                            </button>
                          )}
                        </div>

                        {/* LinkedIn Toggle */}
                        <div className="relative group/btn">
                          <button
                            onClick={() => onToggleDeepReview(candidate.id, 'linkedinChecked')}
                            className={`p-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-center relative cursor-pointer ${
                              candidate.deepReviewSignals?.linkedinChecked 
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/5' 
                                : 'bg-slate-900/40 border-slate-800/80 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <Link className="h-4 w-4" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-950 border border-slate-800 text-[9px] text-slate-300 font-mono rounded px-2 py-1 whitespace-nowrap opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity z-10 shadow-lg">
                              LinkedIn: {candidate.resumeParsed.socialLinks?.linkedin || 'Not found in resume'} (+{candidate.deepReviewSignals?.linkedinChecked ? '2' : '0'})
                            </span>
                          </button>
                          {candidate.resumeParsed.socialLinks?.linkedin && (
                            <button
                              onClick={(e) => handleOpenLink(e, candidate.resumeParsed.socialLinks?.linkedin)}
                              className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-slate-950 hover:bg-indigo-650 border border-slate-850 hover:border-indigo-400 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all text-[8px] cursor-pointer font-bold font-mono"
                              title="Open LinkedIn Profile"
                            >
                              ↗
                            </button>
                          )}
                        </div>

                        {/* Portfolio Toggle */}
                        <div className="relative group/btn">
                          <button
                            onClick={() => onToggleDeepReview(candidate.id, 'portfolioChecked')}
                            className={`p-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-center relative cursor-pointer ${
                              candidate.deepReviewSignals?.portfolioChecked 
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/5' 
                                : 'bg-slate-900/40 border-slate-800/80 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <Briefcase className="h-4 w-4" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-950 border border-slate-800 text-[9px] text-slate-300 font-mono rounded px-2 py-1 whitespace-nowrap opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity z-10 shadow-lg">
                              Portfolio: {candidate.resumeParsed.socialLinks?.portfolio || 'Not found in resume'} (+{candidate.deepReviewSignals?.portfolioChecked ? ((candidate.socialAuditResult?.llm_analysis?.portfolio_quality_score ?? candidate.deepReviewSignals?.portfolioQualityScore ?? 0) / 100 * 3).toFixed(1) : '0'})
                            </span>
                          </button>
                          {candidate.resumeParsed.socialLinks?.portfolio && (
                            <button
                              onClick={(e) => handleOpenLink(e, candidate.resumeParsed.socialLinks?.portfolio)}
                              className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-slate-950 hover:bg-indigo-650 border border-slate-850 hover:border-indigo-400 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all text-[8px] cursor-pointer font-bold font-mono"
                              title="Open Portfolio Link"
                            >
                              ↗
                            </button>
                          )}
                        </div>

                        {/* Website Toggle */}
                        <div className="relative group/btn">
                          <button
                            onClick={() => onToggleDeepReview(candidate.id, 'websiteChecked')}
                            className={`p-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-center relative cursor-pointer ${
                              candidate.deepReviewSignals?.websiteChecked 
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/5' 
                                : 'bg-slate-900/40 border-slate-800/80 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <Globe className="h-4 w-4" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-950 border border-slate-800 text-[9px] text-slate-300 font-mono rounded px-2 py-1 whitespace-nowrap opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity z-10 shadow-lg">
                              Website: {candidate.resumeParsed.socialLinks?.website || 'Not found in resume'} (+{candidate.deepReviewSignals?.websiteChecked ? '2' : '0'})
                            </span>
                          </button>
                          {candidate.resumeParsed.socialLinks?.website && (
                            <button
                              onClick={(e) => handleOpenLink(e, candidate.resumeParsed.socialLinks?.website)}
                              className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-slate-950 hover:bg-indigo-650 border border-slate-850 hover:border-indigo-400 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all text-[8px] cursor-pointer font-bold font-mono"
                              title="Open Website"
                            >
                              ↗
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Match Status Recommendation */}
                    <td className="py-5 px-4 text-center">
                      <span className={`inline-block text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${getScoreBg(report.finalScore)}`}>
                        {getRecommendationText(report.finalScore)}
                      </span>
                    </td>

                    {/* Final Score Circle */}
                    <td className="py-5 px-6 text-center">
                      <span className="text-sm font-extrabold font-mono text-white">
                        {report.finalScore}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono"> / 100</span>
                    </td>

                    {/* Actions */}
                    <td className="py-5 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleTriggerAudit(candidate)}
                          className="p-1.5 text-cyan-400 hover:text-white hover:bg-cyan-600/25 rounded-md border border-slate-850 hover:border-cyan-500/30 transition-all cursor-pointer animate-pulse"
                          title="Run Automated Social Scraper & LLM Audit"
                        >
                          <Cpu className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectCandidate(candidate.id)}
                          className="p-1.5 text-indigo-400 hover:text-white hover:bg-indigo-600/25 rounded-md border border-slate-850 hover:border-indigo-500/30 transition-all cursor-pointer"
                          title="Deep Candidate Details & Evidence Analysis"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCandidate(candidate.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md border border-slate-850 hover:border-rose-500/20 transition-all cursor-pointer"
                          title="Delete Candidate"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {scoredCandidates.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono text-xs">
                    No candidates loaded. Upload resume PDF or TXT files above to begin matching.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAuditOpen && auditCandidate && (
        <SocialAuditModal
          isOpen={isAuditOpen}
          onClose={() => {
            setIsAuditOpen(false);
            setAuditCandidate(null);
          }}
          candidateName={auditCandidate.resumeParsed.name}
          candidateId={auditCandidate.id}
          socialLinks={auditCandidate.resumeParsed.socialLinks}
          onSaveAudit={onSaveSocialAudit}
          initialAuditResult={auditCandidate.socialAuditResult}
        />
      )}
    </div>
  );
};
