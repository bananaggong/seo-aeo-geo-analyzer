import type { IdeaFormAnswers, IdeaDimensionResult, IdeaCheck } from '../types/idea';
import {
  meetsMinLength,
  containsQuantifier,
  containsDiffVerb,
  containsUniquenessKeyword,
} from '../utils/textParser';

export function analyzeDifferentiation(answers: IdeaFormAnswers): IdeaDimensionResult {
  const checks: IdeaCheck[] = [];
  const vp = answers.valueProp ?? '';

  const dlPass = meetsMinLength(vp, 20);
  checks.push({
    id: 'diff_length',
    label: '차별점 설명 구체성',
    status: dlPass ? 'pass' : 'fail',
    score: dlPass ? 20 : 0,
    maxScore: 20,
    detail: dlPass ? `${vp.trim().length}자 작성 완료` : `현재 ${vp.trim().length}자 — 20자 이상 구체적으로 작성 필요`,
  });

  const dsPass = containsDiffVerb(vp);
  checks.push({
    id: 'diff_specific',
    label: '차별화 동사 포함',
    status: dsPass ? 'pass' : 'warn',
    score: dsPass ? 30 : 0,
    maxScore: 30,
    detail: dsPass ? '구체적인 차별화 동사/형용사 포함' : '"더 빠르게", "자동으로", "쉽게" 등 구체적인 개선 방향을 표현하세요',
  });

  const duPass = containsUniquenessKeyword(vp);
  checks.push({
    id: 'diff_unique',
    label: '독자성 표현',
    status: duPass ? 'pass' : 'warn',
    score: duPass ? 20 : 0,
    maxScore: 20,
    detail: duPass ? '유일성/독자성 키워드 포함' : '"유일한", "처음", "새로운" 등 독자성을 표현하면 점수가 높아집니다',
  });

  const dmPass = containsQuantifier(vp);
  checks.push({
    id: 'diff_measurable',
    label: '차별점 수치화',
    status: dmPass ? 'pass' : 'warn',
    score: dmPass ? 30 : 0,
    maxScore: 30,
    detail: dmPass ? '수치/비율로 차별점 표현됨' : '"N배 빠른", "N% 저렴한"처럼 수치로 차별점을 표현하세요',
  });

  const rawScore = checks.reduce((s, c) => s + c.score, 0);
  const maxRawScore = checks.reduce((s, c) => s + c.maxScore, 0);
  const score = maxRawScore > 0 ? Math.round((rawScore / maxRawScore) * 100) : 0;

  return { score, rawScore, maxRawScore, checks };
}
