"use client";

import { CATEGORY_COLORS, CategoryKey } from "@/app/lib/utils/colors";

interface PriorityIssue {
  rank: number;
  category: CategoryKey;
  id: string;
  label: string;
  currentScore: number;
  maxScore: number;
  gap: number;
  action: string;
  actionTitle?: string;
  priority?: number;
}

interface TopIssuesProps {
  issues: PriorityIssue[];
}

export function TopIssues({ issues }: TopIssuesProps) {
  if (!issues || issues.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <h3 className="font-semibold text-white">지금 바로 해야 할 것</h3>
        <span className="text-xs text-slate-500">점수 향상 효과가 가장 큰 순서</span>
      </div>

      <div className="divide-y divide-slate-700/30">
        {issues.map((issue) => {
          const cat = CATEGORY_COLORS[issue.category];
          const gapPct = issue.maxScore > 0 ? Math.round((issue.gap / issue.maxScore) * 100) : 0;

          return (
            <div
              key={issue.id}
              className="px-5 py-4"
              style={{ borderLeft: `3px solid ${cat.border}`, backgroundColor: cat.bg }}
            >
              <div className="flex items-start gap-4">
                {/* Rank badge */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: cat.hex, color: "#fff" }}
                >
                  {issue.rank}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ backgroundColor: cat.bg, color: cat.hex, border: `1px solid ${cat.border}` }}
                    >
                      {issue.category.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-white">{issue.label}</span>
                    <span
                      className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.bg, color: cat.hex, border: `1px solid ${cat.border}` }}
                      title="항목 내 회수 가능 점수"
                    >
                      +{Math.round(issue.gap)}pt
                    </span>
                  </div>

                  {/* Gap bar */}
                  <div className="mt-2 mb-2 h-1 rounded-full bg-slate-700/50">
                    <div
                      className="h-1 rounded-full opacity-70"
                      style={{ width: `${Math.min(100, gapPct)}%`, backgroundColor: cat.hex }}
                    />
                  </div>

                  {/* Action text — visually separated */}
                  <div className="bg-slate-800/60 rounded-lg px-3 py-2 mt-1">
                    <p className="text-xs text-blue-400 font-semibold mb-1">
                      → {issue.actionTitle ?? "해결 방법"}:
                    </p>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {issue.action}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
