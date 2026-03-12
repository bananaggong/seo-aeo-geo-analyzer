import * as cheerio from "cheerio";
import TurndownService from "turndown";

export interface GEOIssue {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  score: number;
  maxScore: number;
}

export interface GEOResult {
  score: number;
  issues: GEOIssue[];
  markdownPreview: string;
  breakdown: {
    accessibility: number;
    readability: number;
    entity: number;
  };
}

const AI_BOTS = [
  { id: "gptbot", name: "GPTBot (OpenAI)", pattern: /gptbot/i },
  { id: "claudebot", name: "ClaudeBot (Anthropic)", pattern: /claudebot|anthropic/i },
  { id: "perplexitybot", name: "PerplexityBot", pattern: /perplexitybot/i },
  { id: "googlebot-extended", name: "Google-Extended", pattern: /google-extended/i },
  { id: "bytespider", name: "Bytespider (ByteDance)", pattern: /bytespider/i },
];

export function analyzeGEO(
  html: string,
  robotsTxt: string,
  url: string
): GEOResult {
  const $ = cheerio.load(html);
  const issues: GEOIssue[] = [];

  // ── AI 크롤러 접근 가능성 ─────────────────────────────────
  // robots.txt 파싱
  const disallowedBots: string[] = [];
  const allowedBots: string[] = [];

  if (robotsTxt) {
    const lines = robotsTxt.split("\n").map((l) => l.trim());
    let currentAgent = "";
    let isDisallowAll = false;

    for (const line of lines) {
      if (line.startsWith("User-agent:")) {
        currentAgent = line.replace("User-agent:", "").trim().toLowerCase();
        isDisallowAll = false;
      } else if (line.startsWith("Disallow:")) {
        const path = line.replace("Disallow:", "").trim();
        if (path === "/" || path === "*") {
          isDisallowAll = true;
          const matched = AI_BOTS.find((b) => b.pattern.test(currentAgent));
          if (matched) disallowedBots.push(matched.name);
        }
      }
    }

    AI_BOTS.forEach((bot) => {
      if (!disallowedBots.includes(bot.name)) allowedBots.push(bot.name);
    });
  } else {
    AI_BOTS.forEach((bot) => allowedBots.push(bot.name));
  }

  const blockedCount = disallowedBots.length;
  const allowedCount = allowedBots.length;

  issues.push({
    id: "ai-crawlers",
    label: "AI 크롤러 접근 허용",
    status: blockedCount === 0 ? "pass" : blockedCount < 3 ? "warn" : "fail",
    detail:
      blockedCount === 0
        ? `모든 주요 AI 크롤러 허용 (${allowedBots.slice(0, 3).join(", ")} 등)`
        : `차단됨: ${disallowedBots.join(", ")} — GEO 노출 불가`,
    score: blockedCount === 0 ? 25 : Math.max(0, 25 - blockedCount * 8),
    maxScore: 25,
  });

  // robots.txt 자체 존재 여부
  issues.push({
    id: "robots-txt",
    label: "robots.txt 파일",
    status: robotsTxt ? "pass" : "warn",
    detail: robotsTxt
      ? `robots.txt 발견 (${robotsTxt.split("\n").length}줄)`
      : "robots.txt 없음 — AI 봇이 크롤 규칙을 파악할 수 없음",
    score: robotsTxt ? 5 : 2,
    maxScore: 5,
  });

  // ── 콘텐츠 가독성 (AI 소화율) ────────────────────────────
  // Markdown 변환 품질
  const tdService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });
  let markdownPreview = "";
  try {
    const mainContent =
      $("main").html() ||
      $("article").html() ||
      $('[role="main"]').html() ||
      $("body").html() ||
      "";
    markdownPreview = tdService.turndown(mainContent).slice(0, 2000);
  } catch {
    markdownPreview = "변환 실패";
  }

  const mdLines = markdownPreview.split("\n").filter((l) => l.trim());
  const mdHeadings = markdownPreview.match(/^#{1,6}\s/gm) || [];
  const mdQuality =
    mdLines.length > 10 && mdHeadings.length >= 2 ? "pass" : mdLines.length > 3 ? "warn" : "fail";

  issues.push({
    id: "markdown-quality",
    label: "Markdown 변환 품질 (AI 가독성)",
    status: mdQuality,
    detail:
      mdQuality === "pass"
        ? `${mdLines.length}줄, ${mdHeadings.length}개 헤딩 — AI 소화 적합`
        : mdQuality === "warn"
        ? `${mdLines.length}줄 — 구조가 부족하거나 콘텐츠가 적음`
        : "콘텐츠가 너무 부족하거나 렌더링 불가",
    score: mdQuality === "pass" ? 15 : mdQuality === "warn" ? 7 : 0,
    maxScore: 15,
  });

  // 문장 복잡도 (문장 평균 길이)
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const sentences = bodyText.split(/[.!?。]\s+/).filter((s) => s.length > 10);
  const avgSentenceLen =
    sentences.length > 0
      ? Math.round(sentences.reduce((s, sen) => s + sen.length, 0) / sentences.length)
      : 0;
  issues.push({
    id: "sentence-complexity",
    label: "문장 복잡도",
    status: avgSentenceLen <= 80 ? "pass" : avgSentenceLen <= 120 ? "warn" : "fail",
    detail:
      avgSentenceLen === 0
        ? "분석 불가"
        : `평균 문장 길이 ${avgSentenceLen}자 (80자 이하 권장 — AI 인용에 유리)`,
    score: avgSentenceLen <= 80 ? 10 : avgSentenceLen <= 120 ? 5 : 2,
    maxScore: 10,
  });

  // ── 브랜드 엔티티 명확성 ────────────────────────────────
  // Organization / Brand Schema
  let hasOrgSchema = false;
  let orgName = "";
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const check = (obj: Record<string, unknown>) => {
        if (["Organization", "LocalBusiness", "Corporation", "Brand"].includes(String(obj["@type"] || ""))) {
          hasOrgSchema = true;
          orgName = String(obj["name"] || "");
        }
      };
      if (Array.isArray(json)) json.forEach(check);
      else check(json as Record<string, unknown>);
    } catch { /* ignore */ }
  });
  issues.push({
    id: "org-schema",
    label: "Organization / Brand Schema",
    status: hasOrgSchema ? "pass" : "fail",
    detail: hasOrgSchema
      ? `${orgName ? `"${orgName}" ` : ""}Organization 스키마 발견 — AI가 브랜드 식별 가능`
      : "Organization 스키마 없음 — AI가 브랜드를 엔티티로 인식하지 못할 수 있음",
    score: hasOrgSchema ? 20 : 0,
    maxScore: 20,
  });

  // Meta viewport (모바일 최적화 → AI 크롤러도 모바일 환경 고려)
  const viewport = $('meta[name="viewport"]').attr("content");
  issues.push({
    id: "viewport",
    label: "Viewport / 모바일 최적화",
    status: viewport ? "pass" : "warn",
    detail: viewport
      ? `viewport: ${viewport}`
      : "viewport meta 없음 — 모바일 크롤링 시 레이아웃 문제 가능",
    score: viewport ? 5 : 2,
    maxScore: 5,
  });

  // 언어 설정
  const htmlLang = $("html").attr("lang");
  issues.push({
    id: "lang-attr",
    label: "HTML lang 속성",
    status: htmlLang ? "pass" : "warn",
    detail: htmlLang
      ? `lang="${htmlLang}" — AI가 언어/지역 컨텍스트 파악 가능`
      : "lang 속성 없음 — AI 언어 인식 불확실",
    score: htmlLang ? 5 : 2,
    maxScore: 5,
  });

  // Sitemap 링크 (robots.txt에서 Sitemap: 지시어)
  const hasSitemapInRobots = /^Sitemap:/im.test(robotsTxt);
  issues.push({
    id: "sitemap-declaration",
    label: "Sitemap 선언 (robots.txt)",
    status: hasSitemapInRobots ? "pass" : "warn",
    detail: hasSitemapInRobots
      ? "robots.txt에 Sitemap URL 선언됨 — AI 크롤러가 전체 구조 파악 가능"
      : "robots.txt에 Sitemap URL 없음 (Sitemap: https://... 추가 권장)",
    score: hasSitemapInRobots ? 10 : 4,
    maxScore: 10,
  });

  const totalScore = issues.reduce((sum, i) => sum + i.score, 0);
  const maxTotal = issues.reduce((sum, i) => sum + i.maxScore, 0);
  const normalizedScore = Math.round((totalScore / maxTotal) * 100);

  const accessIds = ["ai-crawlers", "robots-txt", "sitemap-declaration"];
  const readabilityIds = ["markdown-quality", "sentence-complexity", "viewport"];
  const entityIds = ["org-schema", "lang-attr"];

  const calcGroup = (ids: string[]) => {
    const group = issues.filter((i) => ids.includes(i.id));
    const got = group.reduce((s, i) => s + i.score, 0);
    const max = group.reduce((s, i) => s + i.maxScore, 0);
    return max > 0 ? Math.round((got / max) * 100) : 0;
  };

  return {
    score: normalizedScore,
    issues,
    markdownPreview,
    breakdown: {
      accessibility: calcGroup(accessIds),
      readability: calcGroup(readabilityIds),
      entity: calcGroup(entityIds),
    },
  };
}
