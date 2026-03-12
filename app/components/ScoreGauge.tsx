"use client";

interface ScoreGaugeProps {
  score: number;
  label: string;
  color: string;
  size?: "sm" | "lg";
}

function getGrade(score: number) {
  if (score >= 80) return { label: "Good", color: "#22c55e" };
  if (score >= 60) return { label: "Fair", color: "#f59e0b" };
  return { label: "Poor", color: "#ef4444" };
}

export function ScoreGauge({ score, label, color, size = "sm" }: ScoreGaugeProps) {
  const r = size === "lg" ? 54 : 40;
  const cx = size === "lg" ? 64 : 48;
  const cy = size === "lg" ? 64 : 48;
  const svgSize = size === "lg" ? 128 : 96;
  const strokeW = size === "lg" ? 8 : 6;

  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const grade = getGrade(score);
  const displayColor = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeW}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={displayColor}
            strokeWidth={strokeW}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1s ease-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={size === "lg" ? "text-3xl font-bold" : "text-xl font-bold"}
            style={{ color: displayColor }}
          >
            {score}
          </span>
          {size === "lg" && (
            <span className="text-xs font-medium mt-0.5" style={{ color: grade.color }}>
              {grade.label}
            </span>
          )}
        </div>
      </div>
      <span className={`font-semibold text-slate-300 ${size === "lg" ? "text-base" : "text-sm"}`}>
        {label}
      </span>
    </div>
  );
}
