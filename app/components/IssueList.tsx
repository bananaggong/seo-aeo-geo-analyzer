"use client";
import { useState } from "react";

interface Issue {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail" | "skip";
  detail: string;
  score: number;
  maxScore: number;
  skipped?: boolean;
}

interface IssueListProps {
  issues: Issue[];
  title: string;
  accentColor: string;
}

const STATUS_CONFIG = {
  pass: { icon: "✓", bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", badge: "통과" },
  warn: { icon: "⚠", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "개선" },
  fail: { icon: "✗", bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", badge: "실패" },
  skip: { icon: "—", bg: "bg-slate-800/40", border: "border-slate-700/30", text: "text-slate-500", badge: "해당없음" },
};

export function IssueList({ issues, title, accentColor }: IssueListProps) {
  const [filter, setFilter] = useState<"all" | "pass" | "warn" | "fail">("all");
  const [collapsed, setCollapsed] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);

  const activeIssues = issues.filter((i) => !i.skipped);
  const skippedIssues = issues.filter((i) => i.skipped);

  const counts = {
    pass: activeIssues.filter((i) => i.status === "pass").length,
    warn: activeIssues.filter((i) => i.status === "warn").length,
    fail: activeIssues.filter((i) => i.status === "fail").length,
  };

  const filtered = (filter === "all" ? activeIssues : activeIssues.filter((i) => i.status === filter));
  const displayList = showSkipped ? [...filtered, ...skippedIssues] : filtered;

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
          <h3 className="font-semibold text-white">{title}</h3>
          <span className="text-xs text-slate-500">{activeIssues.length}개 항목</span>
          {skippedIssues.length > 0 && (
            <span className="text-xs text-slate-600">({skippedIssues.length}개 해당없음)</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-xs">
            <span className="text-green-400">{counts.pass}통과</span>
            <span className="text-amber-400">{counts.warn}개선</span>
            <span className="text-red-400">{counts.fail}실패</span>
          </div>
          <span className="text-slate-500 text-sm">{collapsed ? "▼" : "▲"}</span>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-5 pb-3 border-b border-slate-700/50 flex-wrap">
            {(["all", "pass", "warn", "fail"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filter === f ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
                style={filter === f ? { backgroundColor: accentColor } : {}}
              >
                {f === "all" ? "전체" : f === "pass" ? "통과" : f === "warn" ? "개선" : "실패"}
                {f !== "all" && <span className="ml-1 opacity-70">{counts[f]}</span>}
              </button>
            ))}
            {skippedIssues.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowSkipped(!showSkipped); }}
                className={`ml-auto px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  showSkipped ? "bg-slate-700 text-slate-300" : "text-slate-600 hover:text-slate-400"
                }`}
              >
                해당없음 {showSkipped ? "숨기기" : `보기 (${skippedIssues.length})`}
              </button>
            )}
          </div>

          {/* Issues */}
          <div className="divide-y divide-slate-700/30">
            {displayList.map((issue) => {
              const cfg = STATUS_CONFIG[issue.status] ?? STATUS_CONFIG.skip;
              return (
                <div
                  key={issue.id}
                  className={`px-5 py-3 ${cfg.bg} border-l-2 ${cfg.border} transition-all ${issue.skipped ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`mt-0.5 text-sm font-bold ${cfg.text}`}>
                        {cfg.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {issue.label}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {issue.detail}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {issue.skipped ? (
                        <span className="text-xs text-slate-600">N/A</span>
                      ) : (
                        <span className={`text-xs font-bold ${cfg.text}`}>
                          {issue.score}/{issue.maxScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
