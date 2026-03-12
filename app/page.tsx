"use client";
import { useState } from "react";
import { IssueList } from "./components/IssueList";
import { MarkdownPreview } from "./components/MarkdownPreview";
import { TopIssues } from "./components/TopIssues";
import { ScoreStrip } from "./components/ScoreStrip";
import { MetaDrawer } from "./components/MetaDrawer";
import { CategoryTabs, type TabDef } from "./components/CategoryTabs";
import { ACTION_GUIDE } from "./lib/utils/actions";

interface AnalysisResult {
  url: string;
  analyzedAt: string;
  visibilityScore: number;
  siteType: { type: string; label: string; confidence: number; signals: string[] };
  seo: {
    score: number;
    issues: {
      id: string; label: string; status: "pass" | "warn" | "fail" | "skip";
      detail: string; score: number; maxScore: number; skipped?: boolean;
    }[];
    breakdown: { technical: number; onpage: number; structure: number };
  };
  aeo: {
    score: number;
    issues: {
      id: string; label: string; status: "pass" | "warn" | "fail" | "skip";
      detail: string; score: number; maxScore: number; skipped?: boolean;
    }[];
    breakdown: { structure: number; content: number; schema: number };
  };
  geo: {
    score: number;
    issues: {
      id: string; label: string; status: "pass" | "warn" | "fail" | "skip";
      detail: string; score: number; maxScore: number; skipped?: boolean;
    }[];
    markdownPreview: string;
    breakdown: { accessibility: number; readability: number; entity: number };
  };
  trust: {
    score: number;
    issues: {
      id: string; label: string; status: "pass" | "warn" | "fail";
      detail: string; score: number; maxScore: number;
    }[];
  };
  pageSpeed: { score: number; lcp: string; cls: string; tbt: string; fcp: string } | null;
  topIssues: {
    rank: number; category: "seo" | "aeo" | "geo" | "trust";
    id: string; label: string; currentScore: number; maxScore: number; gap: number; action: string;
  }[];
}

const EXAMPLE_URLS = ["https://www.apple.com", "https://vercel.com", "https://linear.app"];

function countIssues(issues: { status: string; skipped?: boolean }[], status: "fail" | "warn") {
  return issues.filter((i) => !i.skipped && i.status === status).length;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"seo" | "aeo" | "geo" | "trust">("seo");

  const handleAnalyze = async (targetUrl?: string) => {
    const analyzeUrl = targetUrl || url;
    if (!analyzeUrl.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: analyzeUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "분석 중 오류가 발생했습니다."); return; }
      setResult(data);
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
              S
            </div>
            <span className="font-semibold text-white">LOAM</span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              SEO · AEO · GEO
            </span>
          </div>
          <span className="text-xs text-slate-600">Level 1+2 · Free</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero — pre-analysis only */}
        {!result && !loading && (
          <div className="text-center mb-10">
            <h1 className="text-6xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
              LOAM
            </h1>
            <p className="text-slate-400 text-lg">
              AI 검색 시대의 웹 가시성 분석 플랫폼
            </p>
          </div>
        )}

        {/* URL Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="https://yoursite.com"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !url.trim()}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all"
            >
              {loading ? "분석 중..." : "분석"}
            </button>
          </div>
          {!result && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-slate-600">예시:</span>
              {EXAMPLE_URLS.map((u) => (
                <button
                  key={u}
                  onClick={() => { setUrl(u); handleAnalyze(u); }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {u.replace("https://", "")}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="flex gap-2">
              {["SEO", "AEO", "GEO"].map((label, i) => (
                <div
                  key={label}
                  className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-medium text-slate-400"
                  style={{ animation: `pulse 1.5s ${i * 0.3}s infinite` }}
                >
                  {label} 분석 중...
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm">HTML 크롤링 + robots.txt + PageSpeed 분석 중</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            ⚠ {error}
          </div>
        )}

        {/* Results */}
        {result && (() => {
          const tabs: TabDef[] = [
            { key: "seo",   label: "SEO",   failCount: countIssues(result.seo.issues,   "fail"), warnCount: countIssues(result.seo.issues,   "warn") },
            { key: "aeo",   label: "AEO",   failCount: countIssues(result.aeo.issues,   "fail"), warnCount: countIssues(result.aeo.issues,   "warn") },
            { key: "geo",   label: "GEO",   failCount: countIssues(result.geo.issues,   "fail"), warnCount: countIssues(result.geo.issues,   "warn") },
            { key: "trust", label: "Trust", failCount: countIssues(result.trust.issues, "fail"), warnCount: countIssues(result.trust.issues, "warn") },
          ];

          return (
            <div className="space-y-6">
              {/* Score strip */}
              <ScoreStrip
                visibilityScore={result.visibilityScore}
                seo={result.seo.score}
                aeo={result.aeo.score}
                geo={result.geo.score}
                trust={result.trust.score}
              />

              {/* Collapsible metadata */}
              <MetaDrawer
                url={result.url}
                analyzedAt={result.analyzedAt}
                siteType={result.siteType}
                pageSpeed={result.pageSpeed}
              />

              {/* Priority actions */}
              {result.topIssues && result.topIssues.length > 0 && (
                <TopIssues issues={result.topIssues} />
              )}

              {/* Detail tabs */}
              <div className="space-y-4">
                <CategoryTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                {activeTab === "seo" && (
                  <IssueList
                    issues={result.seo.issues}
                    title="SEO 항목별 분석"
                    accentColor="#3b82f6"
                    actionGuide={ACTION_GUIDE}
                  />
                )}
                {activeTab === "aeo" && (
                  <IssueList
                    issues={result.aeo.issues}
                    title="AEO 항목별 분석"
                    accentColor="#a855f7"
                    actionGuide={ACTION_GUIDE}
                  />
                )}
                {activeTab === "geo" && (
                  <div className="space-y-4">
                    <IssueList
                      issues={result.geo.issues}
                      title="GEO 항목별 분석"
                      accentColor="#06b6d4"
                      actionGuide={ACTION_GUIDE}
                    />
                    {result.geo.markdownPreview && (
                      <MarkdownPreview content={result.geo.markdownPreview} />
                    )}
                  </div>
                )}
                {activeTab === "trust" && (
                  <IssueList
                    issues={result.trust.issues}
                    title="Trust 신뢰 신호 분석"
                    accentColor="#f59e0b"
                    actionGuide={ACTION_GUIDE}
                  />
                )}
              </div>

              {/* Re-analyze */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => { setResult(null); setError(null); }}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all"
                >
                  ← 다른 URL 분석하기
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
