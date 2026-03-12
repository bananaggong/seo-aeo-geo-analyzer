"use client";

import { useState } from "react";

interface MetaDrawerProps {
  url: string;
  analyzedAt: string;
  siteType: { type: string; label: string; confidence: number } | null;
  pageSpeed: { score: number; lcp: string; cls: string; tbt: string; fcp: string } | null;
}

export function MetaDrawer({ url, analyzedAt, siteType, pageSpeed }: MetaDrawerProps) {
  const [open, setOpen] = useState(false);
  const date = new Date(analyzedAt).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="font-medium text-slate-300">상세 정보</span>
          <span className="text-slate-600">·</span>
          <span className="truncate max-w-[280px] text-blue-400">{url}</span>
          <span className="text-slate-600">·</span>
          <span>{date}</span>
        </span>
        <span className="flex-shrink-0 ml-3">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-5 pb-4 pt-1 border-t border-slate-700/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {siteType && (
            <div>
              <p className="text-xs text-slate-500 mb-1.5">사이트 유형</p>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-700 text-slate-200 px-2.5 py-1 rounded-full font-medium">
                  {siteType.label}
                </span>
                <span className="text-xs text-slate-500">신뢰도 {siteType.confidence}%</span>
              </div>
            </div>
          )}

          {pageSpeed && (
            <div>
              <p className="text-xs text-slate-500 mb-1.5">PageSpeed (Mobile)</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "성능", value: `${pageSpeed.score}`, highlight: true },
                  { label: "LCP", value: pageSpeed.lcp },
                  { label: "CLS", value: pageSpeed.cls },
                  { label: "FCP", value: pageSpeed.fcp },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="bg-slate-800 rounded-lg px-2 py-1.5 text-center">
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
      )}
    </div>
  );
}
