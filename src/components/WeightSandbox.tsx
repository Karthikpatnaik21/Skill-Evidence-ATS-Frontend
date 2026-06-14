import React, { useState } from 'react';
import type { WeightsConfig, StageWeights, MockTemplate, CareerStage } from '../types';
import { calculateFinalScore, defaultWeights } from '../mockData';
import { Settings, RefreshCw, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface WeightSandboxProps {
  weights: WeightsConfig;
  onUpdateWeights: (newWeights: WeightsConfig) => void;
  templates: MockTemplate[];
}

export const WeightSandbox: React.FC<WeightSandboxProps> = ({
  weights,
  onUpdateWeights,
  templates,
}) => {
  const [localWeights, setLocalWeights] = useState<WeightsConfig>({ ...weights });
  const [activeStage, setActiveStage] = useState<CareerStage>('fresher');

  const defaultValues: WeightsConfig = {
    fresher: { projectRelevance: 35, skillEvidence: 30, knowledgeDepth: 25, learningVelocity: 10, experienceMatch: 0, leadershipImpact: 0 },
    mid: { skillEvidence: 30, experienceMatch: 25, projectRelevance: 25, knowledgeDepth: 10, learningVelocity: 10, leadershipImpact: 0 },
    senior: { experienceMatch: 40, skillEvidence: 25, projectRelevance: 15, knowledgeDepth: 10, leadershipImpact: 10, learningVelocity: 0 },
  };

  const getWeightSum = (stage: CareerStage, config: WeightsConfig): number => {
    const stageWeights = config[stage];
    return Object.values(stageWeights).reduce((sum, val) => sum + (val || 0), 0);
  };

  const handleSliderChange = (stage: CareerStage, key: keyof StageWeights, value: number) => {
    setLocalWeights((prev) => {
      const updatedStage = { ...prev[stage], [key]: value };
      const next = { ...prev, [stage]: updatedStage };
      
      // Auto-save if the sum is 100%
      const sum = getWeightSum(stage, next);
      if (sum === 100) {
        onUpdateWeights(next);
      }
      return next;
    });
  };

  const handleReset = (stage: CareerStage) => {
    const resetConfig = {
      ...localWeights,
      [stage]: { ...defaultValues[stage] }
    };
    setLocalWeights(resetConfig);
    onUpdateWeights(resetConfig);
  };

  const currentSum = getWeightSum(activeStage, localWeights);
  const isValid = currentSum === 100;

  const getStageTitle = (stage: CareerStage) => {
    switch (stage) {
      case 'fresher': return 'Fresher Candidates (0-2 Yrs)';
      case 'mid': return 'Mid-Level Candidates (2-5 Yrs)';
      case 'senior': return 'Senior Candidates (5+ Yrs)';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      {/* Left Column: Sliders Controller (lg:col-span-7) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2 text-indigo-400">
              <Settings className="h-5 w-5" />
              <h2 className="font-bold text-white text-base">Weight Configuration</h2>
            </div>
            
            {/* Stage Selector */}
            <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
              {(['fresher', 'mid', 'senior'] as CareerStage[]).map((stage) => (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded uppercase transition-colors ${
                    activeStage === stage
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">{getStageTitle(activeStage)}</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Parameters are parsed dynamically by candidate class</p>
              </div>
              <button
                onClick={() => handleReset(activeStage)}
                className="text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            {/* Sum indicator bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Allocation Weight</span>
                <span className={`font-mono font-bold ${isValid ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`}>
                  {currentSum} % / 100%
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-900">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${isValid ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(currentSum, 100)}%` }}
                />
              </div>
              
              {!isValid && (
                <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    The weights for <strong>{activeStage}</strong> sum to {currentSum}%. Please adjust the sliders to equal exactly 100% to save the configurations.
                  </span>
                </div>
              )}

              {isValid && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Configuration active. All scores for {activeStage} candidates will be dynamically calculated using this formula.</span>
                </div>
              )}
            </div>

            {/* Parameter Sliders */}
            <div className="space-y-4 pt-4 border-t border-slate-850">
              {Object.keys(localWeights[activeStage]).map((weightKey) => {
                const key = weightKey as keyof StageWeights;
                const value = localWeights[activeStage][key] || 0;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                
                return (
                  <div key={key} className="space-y-2 bg-slate-900/20 p-4 rounded-xl border border-slate-850/60">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-200">{label}</label>
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                        {value}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={value}
                      onChange={(e) => handleSliderChange(activeStage, key, parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Dynamic Candidate Previews (lg:col-span-5) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col h-full">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
            <h2 className="font-bold text-white text-sm uppercase tracking-wider font-mono">Live Ranking Simulator</h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Modify the sliders on the left to see how candidate rankings and matching status recalculate instantly.
          </p>

          <div className="space-y-4 flex-1">
            {templates.map((cand) => {
              const matchedWeights = localWeights[cand.stageDetection.detectedStage];
              const weightsSum = Object.values(matchedWeights).reduce((a, b) => a + (b || 0), 0);
              
              // Only compute if weights sum to 100%
              const currentRes = calculateFinalScore(cand, localWeights);
              const defaultRes = calculateFinalScore(cand, defaultWeights);
              const scoreChanged = currentRes.finalScore !== defaultRes.finalScore;

              const isCandStage = cand.stageDetection.detectedStage === activeStage;

              return (
                <div 
                  key={cand.id} 
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    isCandStage 
                      ? 'bg-slate-900/50 border-indigo-500/30 shadow-indigo-950/20 shadow-md' 
                      : 'bg-slate-900/20 border-slate-850 opacity-80'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">{cand.resumeParsed.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">
                        {cand.stageDetection.detectedStage} ({cand.stageDetection.detectedYearsOfExperience} yrs)
                      </p>
                    </div>

                    <div className="text-right">
                      {weightsSum === 100 ? (
                        <div className="flex items-center gap-1.5">
                          {scoreChanged && (
                            <span className="text-[10px] text-slate-500 line-through font-mono">
                              {defaultRes.finalScore}
                            </span>
                          )}
                          <span className={`text-sm font-bold font-mono ${
                            currentRes.finalScore >= 85 ? 'text-emerald-400' :
                            currentRes.finalScore >= 70 ? 'text-indigo-400' : 'text-rose-400'
                          }`}>
                            {currentRes.finalScore}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-mono">Invalid weights</span>
                      )}
                    </div>
                  </div>

                  {weightsSum === 100 && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        currentRes.recommendation === 'Strong Fit' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        currentRes.recommendation === 'Moderate Fit' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {currentRes.recommendation}
                      </span>
                      {scoreChanged && (
                        <span className="text-[9px] text-indigo-400 font-mono">
                          {currentRes.finalScore > defaultRes.finalScore ? '▲ Score increased' : '▼ Score decreased'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
