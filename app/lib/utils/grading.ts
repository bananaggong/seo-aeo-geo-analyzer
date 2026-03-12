export function getGrade(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "우수", color: "#22c55e" };
  if (score >= 65) return { label: "양호", color: "#84cc16" };
  if (score >= 50) return { label: "보통", color: "#f59e0b" };
  return { label: "개선 필요", color: "#ef4444" };
}
