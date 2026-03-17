import type { IdeaFormAnswers, IdeaDimensionResult, IdeaCheck } from '../types/idea';
import { meetsMinLength, containsActionableKeyword } from '../utils/textParser';

export function analyzeDistributionStrategy(answers: IdeaFormAnswers): IdeaDimensionResult {
  const checks: IdeaCheck[] = [];
  const channels = answers.channels ?? [];
  const plan = answers.channelPlan ?? '';

  const channelScore = Math.min(channels.length * 10, 40);
  const channelStatus = channels.length === 0 ? 'fail' : channels.length < 3 ? 'warn' : 'pass';
  checks.push({
    id: 'channel_count',
    label: '고객 확보 채널 수',
    status: channelStatus,
    score: channelScore,
    maxScore: 40,
    detail: channels.length === 0
      ? '채널을 선택하지 않았습니다 — 최소 1개 이상 선택하세요'
      : `${channels.length}개 채널 선택: ${channels.join(', ')}`,
  });

  const hasPlan = meetsMinLength(plan, 20);
  checks.push({
    id: 'has_concrete_plan',
    label: '채널 실행 계획',
    status: !meetsMinLength(plan, 1) ? 'partial' : hasPlan ? 'pass' : 'warn',
    score: hasPlan ? 30 : 0,
    maxScore: 30,
    detail: !meetsMinLength(plan, 1)
      ? '채널 계획을 입력하면 더 정확한 분석이 가능합니다'
      : hasPlan
      ? '구체적인 채널 실행 계획 작성됨'
      : '20자 이상 구체적인 계획을 작성하세요',
  });

  const isActionable = meetsMinLength(plan, 1) && containsActionableKeyword(plan);
  checks.push({
    id: 'plan_actionable',
    label: '실행 가능한 액션 포함',
    status: !meetsMinLength(plan, 1) ? 'partial' : isActionable ? 'pass' : 'warn',
    score: isActionable ? 30 : 0,
    maxScore: 30,
    detail: !meetsMinLength(plan, 1)
      ? '채널 계획을 입력해야 평가할 수 있습니다'
      : isActionable
      ? '구체적인 실행 수단 키워드 포함'
      : '"랜딩페이지", "이메일", "포스팅" 등 구체적 수단을 포함하세요',
  });

  const rawScore = checks.reduce((s, c) => s + c.score, 0);
  const maxRawScore = checks.reduce((s, c) => s + c.maxScore, 0);
  const score = maxRawScore > 0 ? Math.round((rawScore / maxRawScore) * 100) : 0;

  return { score, rawScore, maxRawScore, checks };
}
