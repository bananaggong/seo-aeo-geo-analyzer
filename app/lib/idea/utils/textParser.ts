export function meetsMinLength(text: string, minChars: number): boolean {
  return text.trim().length >= minChars;
}

export function containsQuantifier(text: string): boolean {
  return /\d+|%|배|명|원|개|회|번|달러|만|억/.test(text);
}

export function containsUrgencyKeyword(text: string): boolean {
  const keywords = ['매일', '자주', '불편', '힘들', '어렵', '문제', '고통', '답답', '시간낭비', '비효율', '불만', '짜증'];
  return keywords.some(k => text.includes(k));
}

export function containsTargetKeyword(text: string): boolean {
  const keywords = [
    '개발자', '디자이너', '스타트업', '학생', '프리랜서', '직장인', '창업자',
    '30대', '20대', '40대', '50대', 'CEO', '마케터', 'B2B', 'B2C', '소상공인',
    '사업자', '대학생', '취준생', '직업', '업무', '매일', '주기적', '정기적'
  ];
  return keywords.some(k => text.includes(k));
}

export function containsDiffVerb(text: string): boolean {
  const keywords = ['더', '빠르게', '빠른', '자동', '저렴', '쉽게', '쉬운', '즉시', '간편', '정확', '효율', '절약', '자동화'];
  return keywords.some(k => text.includes(k));
}

export function containsUniquenessKeyword(text: string): boolean {
  const keywords = ['유일', '처음', '없는', '새로운', '최초', '독자', '혁신', '특허', '독보'];
  return keywords.some(k => text.includes(k));
}

export function containsActionableKeyword(text: string): boolean {
  const keywords = ['페이지', '광고', '이메일', '메시지', '포스팅', '커뮤니티', '소개', '발송', '운영', '예약', '인스타', '유튜브', '블로그', '카카오', '네이버'];
  return keywords.some(k => text.includes(k));
}
