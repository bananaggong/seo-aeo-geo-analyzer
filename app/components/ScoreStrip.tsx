"use client";

import { getGrade } from "@/app/lib/utils/grading";
import { CATEGORY_COLORS } from "@/app/lib/utils/colors";

interface ScoreStripProps {
  visibilityScore: number;
  seo: number;
  aeo: number;
  geo: number;
  trust: number;
}

function LoamGauge({ score }: { score: number }) {
  const grade = getGrade(score);
  const R = 50;
  const circumference = 2 * Math.PI * R;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl px-6 py-5 bg-slate-900 border border-slate-700/50">
      <span className="text-xs font-bold tracking-widest text-slate-400 mb-3 uppercase">
        LOAM SCORE
      </span>
      <div className="relative w-[120px] h-[120px]">
        <svg width="120" height="120" className="-rotate-90">
          <circle cx="60" cy="60" r={R} fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={R} fill="none"
            stroke={grade.color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold leading-none" style={{ color: grade.color }}>
            {score}
          </span>
          <span className="text-xs font-semibold mt-1" style={{ color: grade.color }}>
            {grade.label}
          </span>
        </div>
      </div>
    </div>
  );
}

function ScoreChip({
  label,
  score,
  color,
  accentColor,
}: {
  label: string;
  score: number;
  color: string;
  accentColor: string;
}) {
  const grade = getGrade(score);
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl px-4 py-4 flex-1 min-w-0"
      style={{ backgroundColor: accentColor, border: `1px solid ${color}30` }}
    >
      <span className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color }}>
        {label}
      </span>
      <span className="text-4xl font-bold leading-none" style={{ color: grade.color }}>
        {score}
      </span>
      <span className="text-xs mt-1.5 font-medium" style={{ color: grade.color }}>
        {grade.label}
      </span>
    </div>
  );
}

export function ScoreStrip({ visibilityScore, seo, aeo, geo, trust }: ScoreStripProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* LOAM SCORE — SVG circular gauge */}
      <LoamGauge score={visibilityScore} />
      {/* Sub-scores */}
      <div className="flex gap-3 flex-1">
        <ScoreChip label="SEO"   score={seo}   color={CATEGORY_COLORS.seo.hex}   accentColor={CATEGORY_COLORS.seo.bg} />
        <ScoreChip label="AEO"   score={aeo}   color={CATEGORY_COLORS.aeo.hex}   accentColor={CATEGORY_COLORS.aeo.bg} />
        <ScoreChip label="GEO"   score={geo}   color={CATEGORY_COLORS.geo.hex}   accentColor={CATEGORY_COLORS.geo.bg} />
        <ScoreChip label="Trust" score={trust} color={CATEGORY_COLORS.trust.hex} accentColor={CATEGORY_COLORS.trust.bg} />
      </div>
    </div>
  );
}
