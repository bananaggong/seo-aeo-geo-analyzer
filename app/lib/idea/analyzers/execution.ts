import type { IdeaFormAnswers, IdeaDimensionResult, IdeaCheck, StageOption, WeeklyHoursOption } from '../types/idea';

const STAGE_SCORES: Record<StageOption, number> = {
  '아이디어': 20,
  '가설검증중': 40,
  'MVP개발중': 65,
  '초기고객보유': 90,
};

const TIME_SCORES: Record<WeeklyHoursOption, number> = {
  '5시간미만': 10,
  '5~15시간': 30,
  '15~30시간': 55,
  '풀타임': 80,
};

const MAX_RAW_SCORE = 220; // 90 + 80 + 40 + 10

function isGoodStageTimeMatch(stage: StageOption, hours: WeeklyHoursOption): boolean {
  if (stage === '아이디어' && hours === '풀타임') return false;
  if (stage === 'MVP개발중' && hours === '5시간미만') return false;
  if (stage === '초기고객보유' && hours === '5시간미만') return false;
  return true;
}

export function analyzeExecutionReadiness(answers: IdeaFormAnswers): IdeaDimensionResult {
  const checks: IdeaCheck[] = [];
  const stage = answers.stage;
  const hours = answers.weeklyHours;
  const resources = answers.resources ?? [];

  const stageScore = STAGE_SCORES[stage];
  checks.push({
    id: 'stage_score',
    label: '사업 진행 단계',
    status: stageScore >= 65 ? 'pass' : stageScore >= 40 ? 'warn' : 'fail',
    score: stageScore,
    maxScore: 90,
    detail: `현재 단계: ${stage} (${stageScore}/90점)`,
  });

  const timeScore = TIME_SCORES[hours];
  checks.push({
    id: 'time_score',
    label: '투입 가능 시간',
    status: timeScore >= 55 ? 'pass' : timeScore >= 30 ? 'warn' : 'fail',
    score: timeScore,
    maxScore: 80,
    detail: `주당 ${hours} (${timeScore}/80점)`,
  });

  const resourceScore = Math.min(resources.length * 8, 40);
  const resourceStatus = resources.length === 0 ? 'fail' : resources.length < 3 ? 'warn' : 'pass';
  checks.push({
    id: 'resource_count',
    label: '보유 자원',
    status: resourceStatus,
    score: resourceScore,
    maxScore: 40,
    detail: resources.length === 0
      ? '보유 자원을 선택하지 않았습니다'
      : `보유 자원 ${resources.length}개: ${resources.join(', ')}`,
  });

  const matchBonus = isGoodStageTimeMatch(stage, hours) ? 10 : 0;
  checks.push({
    id: 'stage_time_match',
    label: '단계-시간 현실성',
    status: matchBonus > 0 ? 'pass' : 'warn',
    score: matchBonus,
    maxScore: 10,
    detail: matchBonus > 0
      ? '사업 단계와 투입 시간이 현실적으로 매칭됨'
      : '사업 단계 대비 투입 시간이 불균형합니다 — 시간을 재검토하세요',
  });

  const rawScore = checks.reduce((s, c) => s + c.score, 0);
  const score = Math.round((rawScore / MAX_RAW_SCORE) * 100);

  return { score, rawScore, maxRawScore: MAX_RAW_SCORE, checks };
}
