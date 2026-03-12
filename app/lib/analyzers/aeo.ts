import * as cheerio from "cheerio";

export interface AEOIssue {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  score: number;
  maxScore: number;
}

export interface AEOResult {
  score: number;
  issues: AEOIssue[];
  breakdown: {
    structure: number;
    content: number;
    schema: number;
  };
}

export function analyzeAEO(html: string): AEOResult {
  const $ = cheerio.load(html);
  const issues: AEOIssue[] = [];

  // ── Schema 기반 ─────────────────────────────────────────
  // FAQ Schema
  let hasFAQSchema = false;
  let faqCount = 0;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const check = (obj: Record<string, unknown>) => {
        if (obj["@type"] === "FAQPage") {
          hasFAQSchema = true;
          const items = (obj["mainEntity"] as unknown[]) || [];
          faqCount = Array.isArray(items) ? items.length : 0;
        }
        if (obj["@type"] === "Question") hasFAQSchema = true;
      };
      if (Array.isArray(json)) json.forEach(check);
      else check(json as Record<string, unknown>);
    } catch { /* ignore */ }
  });
  issues.push({
    id: "faq-schema",
    label: "FAQ Schema (JSON-LD)",
    status: hasFAQSchema ? "pass" : "fail",
    detail: hasFAQSchema
      ? `FAQPage 스키마 발견 (${faqCount}개 Q&A)`
      : "FAQ 스키마 없음 — AI 답변 인용 가능성 낮음",
    score: hasFAQSchema ? 20 : 0,
    maxScore: 20,
  });

  // HowTo Schema
  let hasHowToSchema = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const check = (obj: Record<string, unknown>) => {
        if (obj["@type"] === "HowTo") hasHowToSchema = true;
      };
      if (Array.isArray(json)) json.forEach(check);
      else check(json as Record<string, unknown>);
    } catch { /* ignore */ }
  });
  issues.push({
    id: "howto-schema",
    label: "HowTo Schema",
    status: hasHowToSchema ? "pass" : "warn",
    detail: hasHowToSchema
      ? "HowTo 스키마 발견 — 단계별 답변 최적화 됨"
      : "HowTo 스키마 없음 (절차/방법 콘텐츠라면 추가 권장)",
    score: hasHowToSchema ? 10 : 5,
    maxScore: 10,
  });

  // ── 헤딩 구조 (Q&A 형식) ─────────────────────────────────
  const headings: string[] = [];
  $("h2, h3").each((_, el) => headings.push($(el).text().trim()));

  const questionPatterns = /^(무엇|어떻게|왜|언제|어디|누가|how|what|why|when|where|who|is |are |can |does |do |should |\?)/i;
  const questionHeadings = headings.filter((h) => questionPatterns.test(h) || h.endsWith("?") || h.endsWith("이란?") || h.endsWith("란?"));
  const qRatio = headings.length > 0 ? Math.round((questionHeadings.length / headings.length) * 100) : 0;

  issues.push({
    id: "question-headings",
    label: "질문형 Heading 비율",
    status: qRatio >= 30 ? "pass" : qRatio >= 10 ? "warn" : "fail",
    detail: `H2/H3 ${headings.length}개 중 ${questionHeadings.length}개가 질문형 (${qRatio}%)`,
    score: qRatio >= 30 ? 15 : qRatio >= 10 ? 8 : 0,
    maxScore: 15,
  });

  // ── 콘텐츠 품질 ─────────────────────────────────────────
  // 첫 문단 직접 답변 밀도
  const firstPara = $("p").first().text().trim();
  const firstParaLen = firstPara.length;
  const isDirectAnswer = firstParaLen >= 40 && firstParaLen <= 200;
  issues.push({
    id: "direct-answer",
    label: "첫 문단 직접 답변",
    status: isDirectAnswer ? "pass" : firstParaLen > 0 ? "warn" : "fail",
    detail: isDirectAnswer
      ? `${firstParaLen}자 — AI 스니펫에 적합한 길이`
      : firstParaLen > 200
      ? `첫 문단 ${firstParaLen}자 — 너무 김 (40~200자 권장)`
      : firstParaLen > 0
      ? `첫 문단 ${firstParaLen}자 — 너무 짧음`
      : "본문 내용 없음",
    score: isDirectAnswer ? 15 : firstParaLen > 0 ? 5 : 0,
    maxScore: 15,
  });

  // 평균 단락 길이 (짧을수록 AI가 인용하기 좋음)
  const paragraphs = $("p")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((p) => p.length > 20);
  const avgParaLen =
    paragraphs.length > 0
      ? Math.round(paragraphs.reduce((s, p) => s + p.length, 0) / paragraphs.length)
      : 0;
  issues.push({
    id: "paragraph-length",
    label: "평균 단락 길이",
    status: avgParaLen <= 150 ? "pass" : avgParaLen <= 250 ? "warn" : "fail",
    detail:
      paragraphs.length === 0
        ? "단락 없음"
        : `평균 ${avgParaLen}자 (권장: 150자 이하, AI 인용에 유리)`,
    score: avgParaLen <= 150 ? 10 : avgParaLen <= 250 ? 5 : 2,
    maxScore: 10,
  });

  // 통계/수치/날짜 포함 여부
  const bodyText = $("body").text();
  const statsMatches =
    bodyText.match(/\d+(\.\d+)?(%|개|명|건|배|배|원|달러|\$|회|위|년|월)/g) || [];
  issues.push({
    id: "statistics",
    label: "수치/통계 데이터",
    status: statsMatches.length >= 3 ? "pass" : statsMatches.length >= 1 ? "warn" : "fail",
    detail: `${statsMatches.length}개 수치 발견 (AI는 구체적 수치 포함 콘텐츠를 더 많이 인용)`,
    score: statsMatches.length >= 3 ? 10 : statsMatches.length >= 1 ? 5 : 0,
    maxScore: 10,
  });

  // 출처/링크 밀도
  const externalLinks = $("a[href]").filter((_, el) => {
    const href = $(el).attr("href") || "";
    return href.startsWith("http") && !href.includes("localhost");
  }).length;
  issues.push({
    id: "citations",
    label: "외부 출처 링크",
    status: externalLinks >= 3 ? "pass" : externalLinks >= 1 ? "warn" : "fail",
    detail: `외부 링크 ${externalLinks}개 (출처 명시는 AI 인용 신뢰도 향상)`,
    score: externalLinks >= 3 ? 10 : externalLinks >= 1 ? 5 : 0,
    maxScore: 10,
  });

  const totalScore = issues.reduce((sum, i) => sum + i.score, 0);
  const maxTotal = issues.reduce((sum, i) => sum + i.maxScore, 0);
  const normalizedScore = Math.round((totalScore / maxTotal) * 100);

  const schemaIds = ["faq-schema", "howto-schema"];
  const structureIds = ["question-headings"];
  const contentIds = ["direct-answer", "paragraph-length", "statistics", "citations"];

  const calcGroup = (ids: string[]) => {
    const group = issues.filter((i) => ids.includes(i.id));
    const got = group.reduce((s, i) => s + i.score, 0);
    const max = group.reduce((s, i) => s + i.maxScore, 0);
    return max > 0 ? Math.round((got / max) * 100) : 0;
  };

  return {
    score: normalizedScore,
    issues,
    breakdown: {
      structure: calcGroup(structureIds),
      content: calcGroup(contentIds),
      schema: calcGroup(schemaIds),
    },
  };
}
