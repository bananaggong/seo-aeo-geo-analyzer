import type { IdeaDimension, IdeaDimensionResult, IdeaAnalysisResult, MinaryPriorityTask, MinaryTask } from '../types/idea';

export const DIMENSION_WEIGHTS: Record<IdeaDimension, number> = {
  problemClarity: 0.20,
  marketDemand: 0.25,
  differentiation: 0.20,
  distributionStrategy: 0.20,
  executionReadiness: 0.15,
};

export const DIMENSION_LABELS: Record<IdeaDimension, string> = {
  problemClarity: '문제 명확성',
  marketDemand: '시장 수요',
  differentiation: '차별성',
  distributionStrategy: '고객 확보',
  executionReadiness: '실행 준비',
};

export function computeIdeaScore(dimensions: Record<IdeaDimension, IdeaDimensionResult>): number {
  return Math.round(
    (Object.keys(DIMENSION_WEIGHTS) as IdeaDimension[]).reduce(
      (sum, key) => sum + dimensions[key].score * DIMENSION_WEIGHTS[key],
      0
    )
  );
}

export function buildTopTasks(
  dimensions: Record<IdeaDimension, IdeaDimensionResult>,
  templates: Record<string, MinaryTask>
): MinaryPriorityTask[] {
  const candidates: Omit<MinaryPriorityTask, 'rank'>[] = [];

  for (const dimKey of Object.keys(DIMENSION_WEIGHTS) as IdeaDimension[]) {
    const dimResult = dimensions[dimKey];
    const weight = DIMENSION_WEIGHTS[dimKey];

    for (const check of dimResult.checks) {
      if (check.status === 'pass') continue;
      const gap = check.maxScore - check.score;
      if (gap <= 0) continue;

      const task = templates[check.id];
      if (!task) continue;

      const estimatedHours = Math.max(0.1, task.estimatedMinutes / 60);
      const priority = (weight * 100 * gap) / (estimatedHours + task.effort);

      candidates.push({
        checkId: check.id,
        dimension: dimKey,
        title: task.title,
        body: task.body,
        estimatedMinutes: task.estimatedMinutes,
        gap,
        priority,
        severity: task.severity,
      });
    }
  }

  return candidates
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
    .map((t, i) => ({ ...t, rank: i + 1 }));
}

// Re-export type to satisfy consumers that import IdeaAnalysisResult via this module
export type { IdeaAnalysisResult };
