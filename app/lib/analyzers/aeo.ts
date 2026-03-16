import * as cheerio from "cheerio";
import { SiteType } from "./siteType";

export interface AEOIssue {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail" | "skip";
  detail: string;
  score: number;
  maxScore: number;
  skipped?: boolean;
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

/**
 * 사이트 유형별 항목 관련성 가중치
 * 1.0 = 정상 평가, 0.5 = 부분 적용, 0 = 해당 없음(스킵)
 */
const TYPE_WEIGHTS: Record<
  string,
  Record<string, number>
> = {
  blog: {
    "faq-schema": 0.5,
    "howto-schema": 0.5,
    "question-headings": 0.5,
    "direct-answer": 1.0,
    "paragraph-length": 1.0,
    statistics: 1.0,
    citations: 1.0,
  },
  ecommerce: {
    "faq-schema": 0.5,
    "howto-schema": 0,
    "question-headings": 0,
    "direct-answer": 0.5,
    "paragraph-length": 0.5,
    statistics: 1.0,
    citations: 0.5,
  },
  qa: {
    "faq-schema": 1.0,
    "howto-schema": 1.0,
    "question-headings": 1.0,
    "direct-answer": 1.0,
    "paragraph-length": 1.0,
    statistics: 1.0,
    citations: 1.0,
  },
  marketing: {
    "faq-schema": 0.5,
    "howto-schema": 0,
    "question-headings": 0,
    "direct-answer": 0.5,
    "paragraph-length": 0.5,
    statistics: 1.0,
    citations: 0,
  },
  corporate: {
    "faq-schema": 0.5,
    "howto-schema": 0,
    "question-headings": 0,
    "direct-answer": 0.5,
    "paragraph-length": 0.5,
    statistics: 1.0,
    citations: 0.5,
  },
  unknown: {
    "faq-schema": 0.7,
    "howto-schema": 0.5,
    "question-headings": 0.7,
    "direct-answer": 1.0,
    "paragraph-length": 1.0,
    statistics: 1.0,
    citations: 0.7,
  },
};

export function analyzeAEO(html: string, siteType: SiteType = "unknown"): AEOResult {
  const $ = cheerio.load(html);
  const issues: AEOIssue[] = [];
  const weights = TYPE_WEIGHTS[siteType] ?? TYPE_WEIGHTS.unknown;

  const pushIssue = (issue: Omit<AEOIssue, "score" | "maxScore" | "skipped"> & { rawScore: number; rawMax: number }) => {
    const w = weights[issue.id] ?? 1.0;
    if (w === 0) {
      issues.push({
        ...issue,
        score: 0,
        maxScore: 0,
        skipped: true,
        status: "skip",
        detail: `${issue.label}은 ${siteType} 사이트에서 해당 없음`,
      });
    } else {
      issues.push({
        ...issue,
        score: Math.round(issue.rawScore * w),
        maxScore: Math.round(issue.rawMax * w),
      });
    }
  };

  // ── FAQ Schema ──────────────────────────────────────────
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

  pushIssue({
    id: "faq-schema",
    label: "FAQ Schema (JSON-LD)",
    status: hasFAQSchema ? "pass" : "fail",
    detail: hasFAQSchema
      ? `FAQPage 스키마 발견 (${faqCount}개 Q&A)`
      : "FAQ 스키마 없음 — AI 답변 인용 가능성 낮음",
    rawScore: hasFAQSchema ? 20 : 0,
    rawMax: 20,
  });

  // ── HowTo Schema ─────────────────────────────────────────
  // 없으면 0점 (이전에 5점 공짜 주던 로직 제거)
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

  pushIssue({
    id: "howto-schema",
    label: "HowTo Schema",
    status: hasHowToSchema ? "pass" : "fail",
    detail: hasHowToSchema
      ? "HowTo 스키마 발견 — 단계별 답변 최적화 됨"
      : "HowTo 스키마 없음",
    rawScore: hasHowToSchema ? 10 : 0,
    rawMax: 10,
  });

  // ── 질문형 Heading ────────────────────────────────────────
  const headings: string[] = [];
  $("h2, h3").each((_, el) => { headings.push($(el).text().trim()); });

  const questionPatterns = /^(무엇|어떻게|왜|언제|어디|누가|how|what|why|when|where|who|is |are |can |does |do |should |\?)/i;
  const questionHeadings = headings.filter(
    (h) => questionPatterns.test(h) || h.endsWith("?") || h.endsWith("이란?") || h.endsWith("란?")
  );
  const qRatio = headings.length > 0 ? Math.round((questionHeadings.length / headings.length) * 100) : 0;

  pushIssue({
    id: "question-headings",
    label: "질문형 Heading 비율",
    status: qRatio >= 30 ? "pass" : qRatio >= 10 ? "warn" : "fail",
    detail: `H2/H3 ${headings.length}개 중 ${questionHeadings.length}개가 질문형 (${qRatio}%)`,
    rawScore: qRatio >= 30 ? 15 : qRatio >= 10 ? 8 : 0,
    rawMax: 15,
  });

  // ── 첫 문단 직접 답변 ────────────────────────────────────
  const firstPara = $("p").first().text().trim();
  const firstParaLen = firstPara.length;
  const isDirectAnswer = firstParaLen >= 40 && firstParaLen <= 300;

  pushIssue({
    id: "direct-answer",
    label: "첫 문단 직접 답변",
    status: isDirectAnswer ? "pass" : firstParaLen > 0 ? "warn" : "fail",
    detail: isDirectAnswer
      ? `${firstParaLen}자 — AI 스니펫에 적합한 길이`
      : firstParaLen > 300
      ? `첫 문단 ${firstParaLen}자 — 너무 김 (40~300자 권장)`
      : firstParaLen > 0
      ? `첫 문단 ${firstParaLen}자 — 너무 짧음`
      : "본문 내용 없음",
    rawScore: isDirectAnswer ? 15 : firstParaLen > 0 ? 5 : 0,
    rawMax: 15,
  });

  // ── 평균 단락 길이 ────────────────────────────────────────
  const paragraphs = $("p")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((p) => p.length > 20);
  const avgParaLen =
    paragraphs.length > 0
      ? Math.round(paragraphs.reduce((s, p) => s + p.length, 0) / paragraphs.length)
      : 0;

  pushIssue({
    id: "paragraph-length",
    label: "평균 단락 길이",
    status: avgParaLen <= 200 ? "pass" : avgParaLen <= 350 ? "warn" : "fail",
    detail:
      paragraphs.length === 0
        ? "단락 없음"
        : `평균 ${avgParaLen}자 (권장: 200자 이하, AI 인용에 유리)`,
    rawScore: avgParaLen <= 200 ? 10 : avgParaLen <= 350 ? 5 : 2,
    rawMax: 10,
  });

  // ── 수치/통계 데이터 ──────────────────────────────────────
  // nav/header/footer 날짜·가격이 오탐되지 않도록 본문 영역으로 텍스트 범위를 제한
  const statsSelectors = ["main", "article", ".content", "#content", ".post", ".entry-content", "section"];
  let statsArea = $("body");
  for (const sel of statsSelectors) {
    if ($(sel).length > 0) {
      statsArea = $(sel) as unknown as typeof $["prototype"] & ReturnType<typeof $>;
      break;
    }
  }
  const statsText = statsArea.text();
  const statsMatches =
    statsText.match(/\d+(\.\d+)?(%|개|명|건|배|원|달러|\$|회|위|년|월|kb|mb|gb|ms|px|kg|km)/gi) || [];

  pushIssue({
    id: "statistics",
    label: "데이터 근거",
    status: statsMatches.length >= 3 ? "pass" : statsMatches.length >= 1 ? "warn" : "fail",
    detail:
      statsMatches.length >= 3
        ? `${statsMatches.length}개 정량 수치 확인 — 비율, 수량, 금액 데이터 근거 충분`
        : statsMatches.length >= 1
        ? `수치 ${statsMatches.length}개 — ${3 - statsMatches.length}개 더 필요. 퍼센트·수량·금액 같은 구체적 데이터가 AI 인용을 높입니다`
        : "정량 수치 없음 — '응답률 90%', '3가지 방법' 같은 구체적 데이터가 없으면 AI가 인용하지 않습니다",
    rawScore: statsMatches.length >= 3 ? 10 : statsMatches.length >= 1 ? 5 : 0,
    rawMax: 10,
  });

  // ── 외부 출처 링크 (콘텐츠 영역 내로 한정) ──────────────
  // nav, header, footer 제외하고 본문 내 외부 링크만 카운트
  const contentSelectors = ["main", "article", ".content", "#content", ".post", ".entry-content", "section"];
  let contentArea = $("body");
  for (const sel of contentSelectors) {
    if ($(sel).length > 0) {
      contentArea = $(sel) as unknown as typeof $["prototype"] & ReturnType<typeof $>;
      break;
    }
  }

  const citationLinks = $("main, article, section, .content, body").find("a[href]").filter((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    // 외부 링크이고, 텍스트가 있고, 소셜/공유 버튼이 아닌 것
    return (
      href.startsWith("http") &&
      !href.includes("localhost") &&
      text.length > 2 &&
      !/twitter\.com\/intent|facebook\.com\/sharer|linkedin\.com\/share|t\.co\//.test(href)
    );
  }).length;

  pushIssue({
    id: "citations",
    label: "외부 출처 링크",
    status: citationLinks >= 3 ? "pass" : citationLinks >= 1 ? "warn" : "fail",
    detail: `본문 외부 링크 ${citationLinks}개 (출처 명시는 AI 인용 신뢰도 향상)`,
    rawScore: citationLinks >= 3 ? 10 : citationLinks >= 1 ? 5 : 0,
    rawMax: 10,
  });

  // ── 정의형 문장 감지 ──────────────────────────────────────
  // '~란', '~을 의미하', '~를 뜻합니다', '~라고 불립니다' 등 정의형 표현 감지
  // 주의: '이라고 합니다/한다'는 인용 표지(quotation marker)로 오탐 위험 높아 제외
  const bodyText = $("body").text();
  const definitionPattern = /(이란\s*(무엇|what)?|란\s*(무엇)?|\s+is\s+a\s+|\s+refers\s+to\s+|을\s*의미하|를\s*의미하|means\s+that|defined\s+as|(?:을|를)\s*뜻(?:합니다|한다)|(?:이라고|라고)\s+불립니다)/gi;
  const definitionMatches = bodyText.match(definitionPattern) || [];

  pushIssue({
    id: "definition-sentences",
    label: "정의형 문장",
    status: definitionMatches.length >= 3 ? "pass" : definitionMatches.length >= 1 ? "warn" : "fail",
    detail:
      definitionMatches.length >= 3
        ? `${definitionMatches.length}개 정의형 표현 발견 ('~란', '~을 의미합니다', '~를 뜻합니다' 등 — AI가 직접 인용 가능)`
        : definitionMatches.length >= 1
        ? `정의형 표현 ${definitionMatches.length}개 — AI 인용 기준(3개)까지 ${3 - definitionMatches.length}개 더 필요. '~란', '~을 의미합니다', '~를 뜻합니다' 형식으로 추가하세요`
        : "정의형 문장 없음 — AI는 'X란 Y를 의미합니다'처럼 명확한 정의 문장을 직접 인용합니다. 핵심 용어를 정의하는 문장 3개를 첫 단락에 추가하세요",
    rawScore: definitionMatches.length >= 3 ? 15 : definitionMatches.length >= 1 ? 7 : 0,
    rawMax: 15,
  });

  // ── 비교/표 구조 ──────────────────────────────────────────
  const tableCount = $("table").length;
  const thCount = $("th").length;
  const hasProperTable = tableCount > 0 && thCount > 0;
  const vsHeadings = $("h2, h3").filter((_, el) => {
    const text = $(el).text().toLowerCase();
    return text.includes(" vs ") || text.includes("비교") || text.includes("차이") || text.includes("versus");
  }).length;

  const comparisonStatus: "pass" | "warn" | "fail" =
    hasProperTable ? "pass" : vsHeadings > 0 ? "warn" : "fail";

  pushIssue({
    id: "comparison-structure",
    label: "비교/표 구조",
    status: comparisonStatus,
    detail:
      hasProperTable
        ? `<table> ${tableCount}개 (헤더 포함) — AI가 표 데이터를 직접 인용 가능`
        : vsHeadings > 0
        ? `비교 헤딩 ${vsHeadings}개 — 표(<table>) 형식으로 변환하면 AI 인용 극대화`
        : "비교/표 구조 없음 — 경쟁 비교 콘텐츠는 표 형식이 AI 인용에 유리",
    rawScore: hasProperTable ? 10 : vsHeadings > 0 ? 4 : 0,
    rawMax: 10,
  });

  // ── 단계별 설명 구조 ──────────────────────────────────────
  const olCount = $("ol").length;
  const olItemCount = $("ol li").length;
  const hasHowToSchemaPass = issues.some((i) => i.id === "howto-schema" && i.status === "pass");

  const stepStatus: "pass" | "warn" | "fail" =
    olCount >= 2 || hasHowToSchemaPass ? "pass" : olCount === 1 && olItemCount >= 3 ? "warn" : "fail";

  pushIssue({
    id: "step-structure",
    label: "단계별 설명 구조 (<ol>)",
    status: stepStatus,
    detail:
      stepStatus === "pass"
        ? `<ol> ${olCount}개, ${olItemCount}개 항목 — 단계별 구조 명확`
        : olCount === 1
        ? `<ol> 1개 (${olItemCount}개 항목) — 절차형 콘텐츠 추가 권장`
        : "<ol> 태그 없음 — 순서형 목록이 AI의 단계별 답변 인용에 유리",
    rawScore: stepStatus === "pass" ? 10 : stepStatus === "warn" ? 4 : 0,
    rawMax: 10,
  });

  // ── 점수 계산 (스킵된 항목 제외) ─────────────────────────
  const activeIssues = issues.filter((i) => !i.skipped);
  const totalScore = activeIssues.reduce((sum, i) => sum + i.score, 0);
  const maxTotal = activeIssues.reduce((sum, i) => sum + i.maxScore, 0);
  const normalizedScore = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 0;

  const schemaIds = ["faq-schema", "howto-schema"];
  const structureIds = ["question-headings", "comparison-structure", "step-structure"];
  const contentIds = ["direct-answer", "paragraph-length", "statistics", "citations", "definition-sentences"];

  const calcGroup = (ids: string[]) => {
    const group = activeIssues.filter((i) => ids.includes(i.id));
    const got = group.reduce((s, i) => s + i.score, 0);
    const max = group.reduce((s, i) => s + i.maxScore, 0);
    return max > 0 ? Math.round((got / max) * 100) : 100; // 모두 스킵이면 N/A → 100
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
