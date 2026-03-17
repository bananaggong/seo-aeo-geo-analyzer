import type { IdeaFormAnswers, IdeaDimensionResult, IdeaCheck } from '../types/idea';
import { meetsMinLength, containsQuantifier } from '../utils/textParser';

export function analyzeMarketDemand(answers: IdeaFormAnswers): IdeaDimensionResult {
  const checks: IdeaCheck[] = [];
  const marketSize = answers.marketSize ?? '';
  const solution = answers.existingSolution;

  // has_existing_solution
  const hesPass = solution !== '없음';
  checks.push({
    id: 'has_existing_solution',
    label: '기존 대안 존재 여부',
    status: hesPass ? 'pass' : 'fail',
    score: hesPass ? 20 : 0,
    maxScore: 20,
    detail: hesPass ? `기존 대안: "${solution}" — 시장 수요 신호 있음` : '기존 대안이 없다면 시장 수요 자체를 먼저 검증해야 합니다',
  });

  // existing_solution_quality (보너스 — 계산 후 클램핑으로 처리)
  const esqBonus = solution === '있지만 불편함';
  checks.push({
    id: 'existing_solution_quality',
    label: '기존 대안 불만족도',
    status: esqBonus ? 'pass' : 'warn',
    score: esqBonus ? 15 : 0,
    maxScore: 15,
    detail: esqBonus ? '기존 대안이 불편함 — 차별화 기회 높음' : '기존 대안의 구체적인 불만족 포인트를 파악하면 좋습니다',
  });

  // market_size_provided
  const mspPass = meetsMinLength(marketSize, 1);
  checks.push({
    id: 'market_size_provided',
    label: '시장 규모 추정 작성',
    status: mspPass ? 'pass' : 'partial',
    score: mspPass ? 20 : 0,
    maxScore: 20,
    detail: mspPass ? '시장 규모 정보 입력됨' : '시장 규모를 입력하면 더 정확한 분석이 가능합니다',
  });

  // market_size_quantified
  const msqPass = mspPass && containsQuantifier(marketSize);
  checks.push({
    id: 'market_size_quantified',
    label: '시장 규모 수치화',
    status: !mspPass ? 'partial' : msqPass ? 'pass' : 'warn',
    score: msqPass ? 25 : 0,
    maxScore: 25,
    detail: !mspPass ? '시장 규모를 입력해야 평가할 수 있습니다' : msqPass ? '구체적인 수치가 포함된 시장 규모 추정' : '시장 규모에 구체적인 숫자나 수치를 포함하세요',
  });

  // market_validation
  const mvPass = hesPass && mspPass;
  checks.push({
    id: 'market_validation',
    label: '시장 수요 복합 검증',
    status: mvPass ? 'pass' : 'warn',
    score: mvPass ? 20 : 0,
    maxScore: 20,
    detail: mvPass ? '기존 대안 + 시장 규모 양쪽 근거 있음' : '기존 대안과 시장 규모 정보를 함께 갖추면 신뢰도가 높아집니다',
  });

  const rawScore = Math.min(
    checks.reduce((s, c) => s + c.score, 0),
    checks.reduce((s, c) => s + c.maxScore, 0)
  );
  const maxRawScore = checks.reduce((s, c) => s + c.maxScore, 0);
  const score = maxRawScore > 0 ? Math.round((rawScore / maxRawScore) * 100) : 0;

  return { score, rawScore, maxRawScore, checks };
}
