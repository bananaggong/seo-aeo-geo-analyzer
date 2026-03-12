"use client";
import { useState } from "react";
import { ScoreGauge } from "./components/ScoreGauge";
import { IssueList } from "./components/IssueList";
import { MarkdownPreview } from "./components/MarkdownPreview";

interface AnalysisResult {
  url: string;
  analyzedAt: string;
  visibilityScore: number;
  seo: {
    score: number;
    issues: {
      id: string;
      label: string;
      status: "pass" | "warn" | "fail";
      detail: string;
      score: number;
      maxScore: number;
    }[];
    breakdown: { technical: number; onpage: number; structure: number };
  };
  aeo: {
    score: number;
    issues: {
      id: string;
      label: string;
      status: "pass" | "warn" | "fail";
      detail: string;
      score: number;
      maxScore: number;
    }[];
    breakdown: { structure: number; content: number; schema: number };
  };
  geo: {
    score: number;
    issues: {
      id: string;
      label: string;
      status: "pass" | "warn" | "fail";
      detail: string;
      score: number;
      maxScore: number;
    }[];
    markdownPreview: string;
    breakdown: { accessibility: number; readability: number; entity: number };
  };
  pageSpeed: {
    score: number;
    lcp: string;
    cls: string;
    tbt: string;
    fcp: string;
  } | null;
}

const EXAMPLE_URLS = ["https://www.apple.com", "https://vercel.com", "https://linear.app"];

function BreakdownBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono text-slate-300 w-8 text-right">{value}</span>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"seo" | "aeo" | "geo">("seo");

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
      if (!res.ok) {
        setError(data.error || "분석 중 오류가 발생했습니다.");
        return;
      }
      setResult(data);
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityGrade = (score: number) => {
    if (score >= 80) return { text: "Excellent", color: "#22c55e" };
    if (score >= 65) return { text: "Good", color: "#84cc16" };
    if (score >= 50) return { text: "Fair", color: "#f59e0b" };
    return { text: "Poor", color: "#ef4444" };
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
              S
            </div>
            <span className="font-semibold text-white">Visibility Analyzer</span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              SEO · AEO · GEO
            </span>
          </div>
          <span className="text-xs text-slate-600">Level 1+2 · Free</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero + Input */}
        {!result && !loading && (
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI 시대의 웹 가시성 분석기
            </h1>
            <p className="text-slate-400 text-lg">
              SEO · AEO · GEO 점수를 한 번에 측정하고 개선 포인트를 찾아보세요
            </p>
          </div>
        )}

        {/* URL Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="https://yoursite.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !url.trim()}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all"
            >
              {loading ? "분석 중..." : "분석"}
            </button>
          </div>

          {/* Example URLs */}
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

        {/* Loading State */}
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
        {result && (
          <div className="space-y-8">
            {/* Visibility Score + 3 Scores */}
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Big Visibility Score */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-36 h-36">
                    <svg width="144" height="144" className="-rotate-90">
                      <circle cx="72" cy="72" r="60" fill="none" stroke="#1e293b" strokeWidth="10" />
                      <circle
                        cx="72" cy="72" r="60" fill="none"
                        stroke={getVisibilityGrade(result.visibilityScore).color}
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 60}`}
                        strokeDashoffset={`${2 * Math.PI * 60 * (1 - result.visibilityScore / 100)}`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold" style={{ color: getVisibilityGrade(result.visibilityScore).color }}>
                        {result.visibilityScore}
                      </span>
                      <span className="text-xs font-semibold mt-1" style={{ color: getVisibilityGrade(result.visibilityScore).color }}>
                        {getVisibilityGrade(result.visibilityScore).text}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white">Visibility Score</p>
                    <p className="text-xs text-slate-500">SEO 40% · AEO 30% · GEO 30%</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-px h-32 bg-slate-700/50 hidden lg:block" />

                {/* 3 Scores */}
                <div className="flex gap-8 flex-1 justify-center">
                  <ScoreGauge score={result.seo.score} label="SEO" color="#3b82f6" size="lg" />
                  <ScoreGauge score={result.aeo.score} label="AEO" color="#a855f7" size="lg" />
                  <ScoreGauge score={result.geo.score} label="GEO" color="#06b6d4" size="lg" />
                </div>

                {/* Divider */}
                <div className="w-px h-32 bg-slate-700/50 hidden lg:block" />

                {/* Meta + PageSpeed */}
                <div className="flex flex-col gap-4 min-w-[180px]">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">분석 URL</p>
                    <p className="text-xs text-blue-400 truncate max-w-[180px]">{result.url}</p>
                  </div>
                  {result.pageSpeed && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">PageSpeed (Mobile)</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { label: "Performance", value: `${result.pageSpeed.score}`, highlight: true },
                          { label: "LCP", value: result.pageSpeed.lcp },
                          { label: "CLS", value: result.pageSpeed.cls },
                          { label: "FCP", value: result.pageSpeed.fcp },
                        ].map(({ label, value, highlight }) => (
                          <div key={label} className="bg-slate-800 rounded-lg px-2 py-1.5">
                            <p className="text-xs text-slate-500">{label}</p>
                            <p className={`text-xs font-semibold ${highlight ? "text-green-400" : "text-white"}`}>
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "SEO 세부",
                  color: "#3b82f6",
                  bars: [
                    { label: "기술적", value: result.seo.breakdown.technical },
                    { label: "온페이지", value: result.seo.breakdown.onpage },
                    { label: "구조", value: result.seo.breakdown.structure },
                  ],
                },
                {
                  title: "AEO 세부",
                  color: "#a855f7",
                  bars: [
                    { label: "스키마", value: result.aeo.breakdown.schema },
                    { label: "구조", value: result.aeo.breakdown.structure },
                    { label: "콘텐츠", value: result.aeo.breakdown.content },
                  ],
                },
                {
                  title: "GEO 세부",
                  color: "#06b6d4",
                  bars: [
                    { label: "접근성", value: result.geo.breakdown.accessibility },
                    { label: "가독성", value: result.geo.breakdown.readability },
                    { label: "엔티티", value: result.geo.breakdown.entity },
                  ],
                },
              ].map(({ title, color, bars }) => (
                <div key={title} className="bg-slate-900 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                  </div>
                  <div className="space-y-3">
                    {bars.map((b) => (
                      <BreakdownBar key={b.label} label={b.label} value={b.value} color={color} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tab Issue Lists */}
            <div>
              <div className="flex gap-1 mb-4">
                {(["seo", "aeo", "geo"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === tab
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-200 bg-slate-900"
                    }`}
                    style={
                      activeTab === tab
                        ? {
                            backgroundColor:
                              tab === "seo" ? "#3b82f6" : tab === "aeo" ? "#a855f7" : "#06b6d4",
                          }
                        : {}
                    }
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>

              {activeTab === "seo" && (
                <IssueList
                  issues={result.seo.issues}
                  title="SEO 항목별 분석"
                  accentColor="#3b82f6"
                />
              )}
              {activeTab === "aeo" && (
                <IssueList
                  issues={result.aeo.issues}
                  title="AEO 항목별 분석"
                  accentColor="#a855f7"
                />
              )}
              {activeTab === "geo" && (
                <div className="space-y-4">
                  <IssueList
                    issues={result.geo.issues}
                    title="GEO 항목별 분석"
                    accentColor="#06b6d4"
                  />
                  {result.geo.markdownPreview && (
                    <MarkdownPreview content={result.geo.markdownPreview} />
                  )}
                </div>
              )}
            </div>

            {/* Re-analyze */}
            <div className="text-center pt-4">
              <button
                onClick={() => { setResult(null); setError(null); }}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← 다른 URL 분석하기
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
