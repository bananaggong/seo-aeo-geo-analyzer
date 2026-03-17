'use client';

import { useState } from 'react';
import type { IdeaAnalysisResult, IdeaDimension, IdeaCheck } from '@/app/lib/idea/types/idea';
import { DIMENSION_LABELS, DIMENSION_WEIGHTS } from '@/app/lib/idea/scoring/loamScore';
import { getGrade } from '@/app/lib/utils/grading';
import { RadarChart } from './RadarChart';
import { MinaryTasks } from './MinaryTasks';

const DIMENSION_COLORS: Record<IdeaDimension, { hex: string; bg: string; border: string }> = {
  problemClarity:      { hex: '#6366f1', bg: 'rgba(99,102,241,0.10)',  border: 'rgba(99,102,241,0.30)'  },
  marketDemand:        { hex: '#06b6d4', bg: 'rgba(6,182,212,0.10)',   border: 'rgba(6,182,212,0.30)'   },
  differentiation:     { hex: '#a855f7', bg: 'rgba(168,85,247,0.10)',  border: 'rgba(168,85,247,0.30)'  },
  distributionStrategy:{ hex: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.30)'   },
  executionReadiness:  { hex: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.30)'  },
};

const STATUS_CONFIG = {
  pass:    { icon: '✓', text: 'text-green-400',  border: 'border-green-500/30',  bg: 'bg-green-500/10'  },
  warn:    { icon: '⚠', text: 'text-amber-400',  border: 'border-amber-500/30',  bg: 'bg-amber-500/10'  },
  fail:    { icon: '✗', text: 'text-red-400',    border: 'border-red-500/30',    bg: 'bg-red-500/10'    },
  partial: { icon: '?', text: 'text-slate-400',  border: 'border-slate-600/30',  bg: 'bg-slate-700/20'  },
};

function IdeaGauge({ score }: { score: number }) {
  const grade = getGrade(score);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle
            cx="70" cy="70" r={r} fill="none"
            stroke={grade.color} strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-slate-400">Loam Score</span>
        </div>
      </div>
      <div
        className="px-3 py-1 rounded-full text-xs font-bold"
        style={{ backgroundColor: `${grade.color}22`, color: grade.color, border: `1px solid ${grade.color}55` }}
      >
        {grade.label}
      </div>
    </div>
  );
}

function DimensionCheckList({ dimension, result }: { dimension: IdeaDimension; result: { checks: IdeaCheck[] } }) {
  const [collapsed, setCollapsed] = useState(true);
  const col = DIMENSION_COLORS[dimension];
  const failCount = result.checks.filter(c => c.status === 'fail').length;
  const warnCount = result.checks.filter(c => c.status === 'warn').length;

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.hex }} />
          <span className="font-semibold text-white text-sm">{DIMENSION_LABELS[dimension]}</span>
          <span className="text-xs text-slate-500">
            ({Math.round(DIMENSION_WEIGHTS[dimension] * 100)}% 가중치)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {failCount > 0 && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">{failCount}</span>
          )}
          {warnCount > 0 && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{warnCount}</span>
          )}
          <span className="text-slate-500 text-sm">{collapsed ? '▼' : '▲'}</span>
        </div>
      </div>
      {!collapsed && (
        <div className="divide-y divide-slate-700/30">
          {[...result.checks]
            .sort((a, b) => (a.status === 'fail' ? -1 : b.status === 'fail' ? 1 : 0))
            .map(check => {
              const cfg = STATUS_CONFIG[check.status] ?? STATUS_CONFIG.partial;
              return (
                <div
                  key={check.id}
                  className={`px-5 py-3.5 border-l-2 ${cfg.border} ${cfg.bg}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 text-sm font-bold flex-shrink-0 ${cfg.text}`}>{cfg.icon}</span>
                      <div>
                        <p className={`text-sm font-medium ${check.status === 'fail' ? 'text-white' : 'text-slate-200'}`}>
                          {check.label}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{check.detail}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ${cfg.text}`}>
                      {check.score}/{check.maxScore}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

interface IdeaDashboardProps {
  result: IdeaAnalysisResult;
  onReset: () => void;
}

export function IdeaDashboard({ result, onReset }: IdeaDashboardProps) {
  const dimensions = Object.keys(result.dimensions) as IdeaDimension[];
  const radarData = dimensions.map(d => ({
    label: DIMENSION_LABELS[d],
    score: result.dimensions[d].score,
    color: DIMENSION_COLORS[d].hex,
  }));

  return (
    <div className="space-y-6">
      {/* Partial warning */}
      {result.partialWarning && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-amber-400 text-sm">⚠</span>
          <p className="text-sm text-amber-300">
            일부 선택 항목이 비어 있습니다. 모든 항목을 입력하면 더 정확한 분석 결과를 받을 수 있습니다.
          </p>
        </div>
      )}

      {/* Zone 1 — Verdict */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <IdeaGauge score={result.ideaScore} />
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-1 gap-2 w-full">
            {dimensions.map(d => {
              const col = DIMENSION_COLORS[d];
              const dim = result.dimensions[d];
              return (
                <div
                  key={d}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ backgroundColor: col.bg, border: `1px solid ${col.border}` }}
                >
                  <span className="text-xs font-medium text-slate-300">{DIMENSION_LABELS[d]}</span>
                  <span className="text-sm font-bold" style={{ color: col.hex }}>{dim.score}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
          <span>분석 시각: {new Date(result.analyzedAt).toLocaleString('ko-KR')}</span>
          <button
            onClick={onReset}
            className="text-slate-400 hover:text-white transition-colors"
          >
            다시 분석하기 →
          </button>
        </div>
      </div>

      {/* Zone 2 — Radar */}
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-6 flex flex-col items-center gap-4">
        <h3 className="font-semibold text-white self-start">전략 영역별 레이더</h3>
        <RadarChart data={radarData} size={280} />
      </div>

      {/* Zone 3 — Action */}
      <MinaryTasks tasks={result.topTasks} />

      {/* Zone 4 — Detail */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1">
          <div className="h-px flex-1 bg-slate-700/50" />
          <p className="text-xs text-slate-600 uppercase tracking-widest">영역별 상세 진단</p>
          <div className="h-px flex-1 bg-slate-700/50" />
        </div>
        {dimensions.map(d => (
          <DimensionCheckList key={d} dimension={d} result={result.dimensions[d]} />
        ))}
      </div>
    </div>
  );
}
