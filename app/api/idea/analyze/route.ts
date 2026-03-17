import { NextRequest, NextResponse } from 'next/server';
import { analyzeProblemClarity } from '@/app/lib/idea/analyzers/problem';
import { analyzeMarketDemand } from '@/app/lib/idea/analyzers/market';
import { analyzeDifferentiation } from '@/app/lib/idea/analyzers/differentiation';
import { analyzeDistributionStrategy } from '@/app/lib/idea/analyzers/distribution';
import { analyzeExecutionReadiness } from '@/app/lib/idea/analyzers/execution';
import { computeIdeaScore, buildTopTasks } from '@/app/lib/idea/scoring/loamScore';
import { MINARY_TEMPLATES } from '@/app/lib/idea/actions/minaryTemplates';
import type { IdeaFormAnswers, IdeaAnalysisResult } from '@/app/lib/idea/types/idea';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { answers?: IdeaFormAnswers };
    const answers = body?.answers;

    if (!answers?.problem || !answers?.targetCustomer || !answers?.existingSolution || !answers?.valueProp || !answers?.stage || !answers?.weeklyHours) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const dimensions = {
      problemClarity: analyzeProblemClarity(answers),
      marketDemand: analyzeMarketDemand(answers),
      differentiation: analyzeDifferentiation(answers),
      distributionStrategy: analyzeDistributionStrategy(answers),
      executionReadiness: analyzeExecutionReadiness(answers),
    };

    const ideaScore = computeIdeaScore(dimensions);
    const topTasks = buildTopTasks(dimensions, MINARY_TEMPLATES);
    const partialWarning = Object.values(dimensions)
      .flatMap(d => d.checks)
      .some(c => c.status === 'partial');

    const result: IdeaAnalysisResult = {
      analyzedAt: new Date().toISOString(),
      ideaScore,
      dimensions,
      topTasks,
      partialWarning,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
