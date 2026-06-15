export type CareerStage = 'fresher' | 'mid' | 'senior';

export interface StageWeights {
  projectRelevance: number;
  skillEvidence: number;
  knowledgeDepth: number;
  learningVelocity: number;
  experienceMatch: number;
  leadershipImpact: number;
}

export interface WeightsConfig {
  fresher: Partial<StageWeights>;
  mid: Partial<StageWeights>;
  senior: Partial<StageWeights>;
}

export interface JobDescriptionProfile {
  title: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  seniority: string;
  idealProfile: string;
}

export interface ProjectDetail {
  title: string;
  description: string;
  technologies: string[];
}

export interface ExperienceDetail {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface EducationDetail {
  degree: string;
  school: string;
  year: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  website?: string;
}

export interface CandidateProfile {
  name: string;
  skills: string[];
  projects: ProjectDetail[];
  experience: ExperienceDetail[];
  education: EducationDetail[];
  certifications: string[];
  achievements: string[];
  socialLinks?: SocialLinks;
}

export interface SkillEvidenceMetrics {
  skillName: string;
  isMentioned: boolean;
  projectUsageCount: number;
  professionalExperienceYears: number;
  leadershipUsage: boolean;
  evidencePoints: string[];
  score: number; // 0 - 100
}

export interface ProjectRelevanceDetail {
  projectTitle: string;
  matchScore: number; // 0 - 100
  justification: string;
  alignedSkills: string[];
}

export interface CareerStageDetection {
  detectedStage: CareerStage;
  detectedYearsOfExperience: number;
  reasoning: string;
}

export interface FinalExplainabilityReport {
  candidateName: string;
  careerStage: CareerStage;
  finalScore: number;
  potentialScore?: number;
  breakdown: {
    projectRelevance: number;
    skillEvidence: number;
    knowledgeDepth: number;
    learningVelocity: number;
    experienceMatch?: number;
    leadershipImpact?: number;
  };
  weightedBreakdown: {
    projectRelevance: number;
    skillEvidence: number;
    knowledgeDepth: number;
    learningVelocity: number;
    experienceMatch: number;
    leadershipImpact: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendation: 'Strong Fit' | 'Moderate Fit' | 'No Fit';
  reasoning: string;
}

export interface MockTemplate {
  id: string;
  name: string;
  description: string;
  jdText: string;
  resumeText: string;
  jdParsed: JobDescriptionProfile;
  resumeParsed: CandidateProfile;
  skillEvidence: SkillEvidenceMetrics[];
  projectRelevance: ProjectRelevanceDetail[];
  stageDetection: CareerStageDetection;
  scores: {
    knowledgeDepth: number;
    learningVelocity: number;
    leadershipImpact: number;
    experienceMatch: number;
  };
  deepReviewSignals?: {
    githubChecked: boolean;
    linkedinChecked: boolean;
    portfolioChecked: boolean;
    websiteChecked: boolean;
  };
  socialAuditResult?: SocialAuditResponse;
}

export interface GithubRepoInfo {
  name: string;
  description?: string;
  primary_language?: string;
  stars: number;
  url: string;
}

export interface LLMSocialAnalysis {
  code_complexity_score: number;
  portfolio_quality_score: number;
  strengths: string[];
  weaknesses: string[];
}

export interface SocialAuditResponse {
  github_verified: boolean;
  portfolio_verified: boolean;
  detected_languages: string[];
  repositories: GithubRepoInfo[];
  llm_analysis: LLMSocialAnalysis;
  discrepancies: string[];
  justification: string;
}
