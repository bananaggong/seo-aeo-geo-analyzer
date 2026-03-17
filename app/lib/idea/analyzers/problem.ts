import type { IdeaFormAnswers, IdeaDimensionResult, IdeaCheck } from '../types/idea';
import {
  meetsMinLength,
  containsQuantifier,
  containsUrgencyKeyword,
  containsTargetKeyword,
} from '../utils/textParser';

export function analyzeProblemClarity(answers: IdeaFormAnswers): IdeaDimensionResult {
  const checks: IdeaCheck[] = [];
  const problem = answers.problem ?? '';
  const target = answers.targetCustomer ?? '';

  // problem_length
  const plPass = meetsMinLength(problem, 30);
  checks.push({
    id: 'problem_length',
    label: '문제 설명 구체성',
    status: plPass ? 'pass' : 'fail',
    score: plPass ? 20 : 0,
    maxScore: 20,
    detail: plPass ? `${problem.trim().length}자 작성 완료` : `현재 ${problem.trim().length}자 — 30자 이상 작성 필요`,
  });

  // problem_specific
  const psPass = containsQuantifier(problem);
  checks.push({
    id: 'problem_specific',
    label: '문제 정량화',
    status: psPass ? 'pass' : 'warn',
    score: psPass ? 25 : 0,
    maxScore: 25,
    detail: psPass ? '수치/비율/빈도가 포함되어 있음' : '구체적인 수치나 빈도를 추가하면 점수가 높아집니다',
  });

  // target_clarity
  const tcPass = meetsMinLength(target, 20);
  checks.push({
    id: 'target_clarity',
    label: '타겟 고객 명확성',
    status: tcPass ? 'pass' : 'fail',
    score: tcPass ? 20 : 0,
    maxScore: 20,
    detail: tcPass ? `${target.trim().length}자 작성 완료` : `현재 ${target.trim().length}자 — 20자 이상 구체적으로 작성 필요`,
  });

  // target_specific
  const tsPass = containsTargetKeyword(target);
  checks.push({
    id: 'target_specific',
    label: '타겟 고객 구체성',
    status: tsPass ? 'pass' : 'warn',
    score: tsPass ? 20 : 0,
    maxScore: 20,
    detail: tsPass ? '직업/연령/행동 패턴 키워드 포함' : '직업, 연령대, 행동 패턴을 포함하면 점수가 높아집니다',
  });

  // problem_urgency
  const puPass = containsUrgencyKeyword(problem);
  checks.push({
    id: 'problem_urgency',
    label: '문제 긴급성',
    status: puPass ? 'pass' : 'warn',
    score: puPass ? 15 : 0,
    maxScore: 15,
    detail: puPass ? '불편함/긴급성 키워드 포함' : '고객이 겪는 불편함이나 긴급성을 표현하면 점수가 높아집니다',
  });

  const rawScore = checks.reduce((s, c) => s + c.score, 0);
  const maxRawScore = checks.reduce((s, c) => s + c.maxScore, 0);
  const score = maxRawScore > 0 ? Math.round((rawScore / maxRawScore) * 100) : 0;

  return { score, rawScore, maxRawScore, checks };
}
