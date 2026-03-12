"use client";

interface PriorityIssue {
  rank: number;
  category: "seo" | "aeo" | "geo" | "trust";
  id: string;
  label: string;
  currentScore: number;
  maxScore: number;
  gap: number;
  action: string;
}

interface TopIssuesProps {
  issues: PriorityIssue[];
}

const CATEGORY_CONFIG = {
  seo: { label: "SEO", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
  aeo: { label: "AEO", color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)" },
  geo: { label: "GEO", color: "#06b6d4", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.3)" },
  trust: { label: "Trust", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
};

function GapBar({ gap, maxScore, color }: { gap: number; maxScore: number; color: string }) {
  const pct = maxScore > 0 ? Math.round((gap / maxScore) * 100) : 0;
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 bg-slate-800 rounded-full h-1">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.7 }}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 w-14 text-right">
        +{gap}점 개선 가능
      </span>
    </div>
  );
}

export function TopIssues({ issues }: TopIssuesProps) {
  if (!issues || issues.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <h3 className="font-semibold text-white">개선 우선순위 TOP 5</h3>
        <span className="text-xs text-slate-500">점수 향상 효과가 가장 큰 항목</span>
      </div>

      <div className="divide-y divide-slate-700/30">
        {issues.map((issue) => {
          const cat = CATEGORY_CONFIG[issue.category];
          const scoreRatio = issue.maxScore > 0
            ? Math.round((issue.currentScore / issue.maxScore) * 100)
            : 0;

          return (
            <div
              key={issue.id}
              className="px-5 py-4"
              style={{ borderLeft: `2px solid ${cat.border}`, backgroundColor: cat.bg }}
            >
              <div className="flex items-start gap-4">
                {/* 순위 뱃지 */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: cat.color, color: "#fff" }}
                >
                  {issue.rank}
                </div>

                <div className="flex-1 min-w-0">
                  {/* 헤더 행 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
                    >
                      {cat.label}
                    </span>
                    <span className="text-sm font-medium text-slate-200">{issue.label}</span>
                    <span className="ml-auto text-xs text-slate-500 flex-shrink-0">
                      {issue.currentScore}/{issue.maxScore} ({scoreRatio}%)
                    </span>
                  </div>

                  {/* 점수 갭 바 */}
                  <GapBar gap={issue.gap} maxScore={issue.maxScore} color={cat.color} />

                  {/* 액션 가이드 */}
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {issue.action}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
