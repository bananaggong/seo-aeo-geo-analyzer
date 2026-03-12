"use client";
import { useState } from "react";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const preview = expanded ? content : content.slice(0, 600);

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <h3 className="font-semibold text-white">AI가 보는 화면 미리보기</h3>
        </div>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Markdown</span>
      </div>
      <div className="p-5">
        <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
          {preview}
          {!expanded && content.length > 600 && "..."}
        </pre>
        {content.length > 600 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            {expanded ? "접기 ▲" : `전체 보기 (${content.length.toLocaleString()}자) ▼`}
          </button>
        )}
      </div>
    </div>
  );
}
