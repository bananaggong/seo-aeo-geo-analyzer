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
  actionGuide?: Record<string, string>;
}

type Filter = "fail+warn" | "fail" | "warn" | "pass" | "all";

const STATUS_CONFIG = {
  pass: { icon: "✓", border: "border-green-500/30", text: "text-green-400",  bg: "bg-green-500/10"  },
  warn: { icon: "⚠", border: "border-amber-500/30", text: "text-amber-400",  bg: "bg-amber-500/10"  },
  fail: { icon: "✗", border: "border-red-500/30",   text: "text-red-400",    bg: "bg-red-500/10"    },
  skip: { icon: "—", border: "border-slate-700/30", text: "text-slate-500",  bg: "bg-slate-800/40"  },
};

export function IssueList({ issues, title, accentColor, actionGuide }: IssueListProps) {
  const [filter, setFilter] = useState<Filter>("fail+warn");
  const [collapsed, setCollapsed] = useState(true);

  const activeIssues = issues.filter((i) => !i.skipped);
  const skippedIssues = issues.filter((i) => i.skipped);

  const counts = {
    fail: activeIssues.filter((i) => i.status === "fail").length,
    warn: activeIssues.filter((i) => i.status === "warn").length,
    pass: activeIssues.filter((i) => i.status === "pass").length,
  };
  const actionableCount = counts.fail + counts.warn;

  const failFirst = (arr: Issue[]) =>
    [...arr].sort((a, b) => {
      if (a.status === 'fail' && b.status !== 'fail') return -1;
      if (a.status !== 'fail' && b.status === 'fail') return 1;
      return 0;
    });

  const filtered = (() => {
    switch (filter) {
      case "fail+warn": return failFirst(activeIssues.filter((i) => i.status === "fail" || i.status === "warn"));
      case "fail":      return activeIssues.filter((i) => i.status === "fail");
      case "warn":      return activeIssues.filter((i) => i.status === "warn");
      case "pass":      return activeIssues.filter((i) => i.status === "pass");
      case "all":       return failFirst([...activeIssues, ...skippedIssues]);
    }
  })();

  const FILTER_BUTTONS: { key: Filter; label: string; count?: number }[] = [
    { key: "fail+warn", label: "실패+개선", count: actionableCount },
    { key: "fail",      label: "실패",      count: counts.fail },
    { key: "warn",      label: "개선",      count: counts.warn },
    { key: "pass",      label: "통과",      count: counts.pass },
    { key: "all",       label: "전체" },
  ];

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
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-xs">
            {counts.fail > 0  && <span className="text-red-400">{counts.fail}실패</span>}
            {counts.warn > 0  && <span className="text-amber-400">{counts.warn}개선</span>}
            {counts.pass > 0  && <span className="text-green-400">{counts.pass}통과</span>}
          </div>
          <span className="text-slate-500 text-sm">{collapsed ? "▼" : "▲"}</span>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Filter tabs */}
          <div className="flex items-center gap-1 px-5 pb-3 border-b border-slate-700/50 flex-wrap">
            {FILTER_BUTTONS.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filter === key ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
                style={filter === key ? { backgroundColor: accentColor } : {}}
              >
                {label}
                {count !== undefined && (
                  <span className="ml-1 opacity-70">{count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Issue rows */}
          <div className="divide-y divide-slate-700/30">
            {filtered.length === 0 && (
              <div className="px-5 py-6 text-center">
                {filter === "fail+warn" ? (
                  <>
                    <p className="text-sm text-green-400 font-medium">모든 항목이 통과되었습니다 ✓</p>
                    <button
                      onClick={() => setFilter("all")}
                      className="text-xs text-slate-500 hover:text-slate-300 mt-2 transition-colors"
                    >
                      통과 항목 보기
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">해당 필터의 항목이 없습니다</p>
                )}
              </div>
            )}
            {filtered.map((issue) => {
              const cfg = STATUS_CONFIG[issue.status] ?? STATUS_CONFIG.skip;
              const action = !issue.skipped && (issue.status === "fail" || issue.status === "warn")
                ? (actionGuide?.[issue.id] ?? "")
                : "";

              // Visual weight by status
              const rowPy =
                issue.status === "fail" ? "py-4" :
                issue.status === "warn" ? "py-3.5" :
                "py-2.5";
              const borderW = issue.status === "fail" ? "border-l-4" : "border-l-2";
              const labelWeight =
                issue.status === "fail" ? "font-semibold text-white" :
                issue.status === "warn" ? "font-medium text-slate-100" :
                "text-slate-400";

              return (
                <div
                  key={issue.id}
                  className={`px-5 ${rowPy} ${cfg.bg} ${borderW} ${cfg.border} transition-all ${issue.skipped ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`mt-0.5 text-sm font-bold flex-shrink-0 ${cfg.text}`}>
                        {cfg.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${labelWeight}`}>{issue.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{issue.detail}</p>
                        {action && (
                          <p className="text-xs text-blue-300 mt-1 leading-relaxed">{action}</p>
                        )}
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
