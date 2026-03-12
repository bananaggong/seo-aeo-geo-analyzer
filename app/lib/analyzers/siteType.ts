import * as cheerio from "cheerio";

export type SiteType = "blog" | "ecommerce" | "qa" | "marketing" | "corporate" | "unknown";

export interface SiteTypeResult {
  type: SiteType;
  label: string;
  confidence: number; // 0~100
  signals: string[];
}

/**
 * HTML과 URL을 분석해 사이트 유형을 자동 감지합니다.
 *
 * - blog: 블로그/미디어 (기사, 날짜, 저자 존재)
 * - ecommerce: 쇼핑몰 (상품, 장바구니, 가격)
 * - qa: Q&A / 문서 / 지식베이스 (FAQ, 헬프센터)
 * - marketing: 마케팅/랜딩 페이지 (CTA 중심, 제품 홈)
 * - corporate: 기업 정보 사이트 (About, 연락처 중심)
 * - unknown: 판단 불가
 */
export function detectSiteType(html: string, url: string): SiteTypeResult {
  const $ = cheerio.load(html);
  const signals: string[] = [];
  const scores: Record<SiteType, number> = {
    blog: 0,
    ecommerce: 0,
    qa: 0,
    marketing: 0,
    corporate: 0,
    unknown: 0,
  };

  const bodyText = $("body").text().toLowerCase();
  const urlLower = url.toLowerCase();

  // ── Schema 기반 (가장 신뢰도 높음) ─────────────────────────
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const check = (obj: Record<string, unknown>) => {
        const type = String(obj["@type"] || "").toLowerCase();
        if (["article", "blogposting", "newsarticle"].includes(type)) {
          scores.blog += 30;
          signals.push(`Schema: ${obj["@type"]}`);
        }
        if (["product", "offer", "itemlist"].includes(type)) {
          scores.ecommerce += 30;
          signals.push(`Schema: ${obj["@type"]}`);
        }
        if (["faqpage", "qapage", "howto"].includes(type)) {
          scores.qa += 30;
          signals.push(`Schema: ${obj["@type"]}`);
        }
        if (["organization", "corporation", "localbusiness"].includes(type)) {
          scores.corporate += 15;
          signals.push(`Schema: ${obj["@type"]}`);
        }
        if (["website", "webpage", "softwareapplication"].includes(type)) {
          scores.marketing += 10;
        }
      };
      if (Array.isArray(json)) json.forEach(check);
      else check(json as Record<string, unknown>);
    } catch { /* ignore */ }
  });

  // ── URL 패턴 ─────────────────────────────────────────────
  if (/\/(blog|post|article|news|story|매거진|뉴스|블로그)/.test(urlLower)) {
    scores.blog += 20;
    signals.push("URL: 블로그/뉴스 패턴");
  }
  if (/\/(shop|store|product|item|cart|checkout|스토어|쇼핑)/.test(urlLower)) {
    scores.ecommerce += 20;
    signals.push("URL: 쇼핑몰 패턴");
  }
  if (/\/(help|support|faq|docs|kb|wiki|guide|도움말|고객센터)/.test(urlLower)) {
    scores.qa += 20;
    signals.push("URL: 헬프/문서 패턴");
  }

  // ── 메타 태그 ────────────────────────────────────────────
  const ogType = $('meta[property="og:type"]').attr("content") || "";
  if (ogType === "article") { scores.blog += 20; signals.push("og:type=article"); }
  if (ogType === "product") { scores.ecommerce += 20; signals.push("og:type=product"); }
  if (ogType === "website") { scores.marketing += 5; }

  // ── HTML 구조 신호 ───────────────────────────────────────
  // 블로그 신호
  const hasAuthor = $('[rel="author"], .author, [itemprop="author"], .byline').length > 0;
  const hasDatetime = $("time[datetime], [itemprop='datePublished']").length > 0;
  const hasArticleTag = $("article").length > 0;
  if (hasAuthor) { scores.blog += 10; signals.push("저자 정보 존재"); }
  if (hasDatetime) { scores.blog += 10; signals.push("발행 날짜 존재"); }
  if (hasArticleTag) { scores.blog += 5; }

  // 이커머스 신호
  const hasCart = $('[class*="cart"], [id*="cart"], [class*="basket"]').length > 0;
  const hasPrice = $('[class*="price"], [itemprop="price"], [class*="가격"]').length > 0
    || /\$[\d,]+|\d+,\d{3}원|₩[\d,]+/.test(bodyText.slice(0, 5000));
  const hasAddToCart = bodyText.includes("add to cart") || bodyText.includes("장바구니") || bodyText.includes("구매하기");
  if (hasCart) { scores.ecommerce += 15; signals.push("장바구니 요소 존재"); }
  if (hasPrice) { scores.ecommerce += 10; signals.push("가격 정보 존재"); }
  if (hasAddToCart) { scores.ecommerce += 10; signals.push("구매 버튼 존재"); }

  // Q&A / 문서 신호
  const h2h3Texts = $("h2, h3").map((_, el) => $(el).text().toLowerCase()).get();
  const questionCount = h2h3Texts.filter(t =>
    /^(what|how|why|when|where|who|is |are |can |does |무엇|어떻게|왜|언제|어디|누가|\?)/.test(t) ||
    t.endsWith("?") || t.includes("이란") || t.includes("란?")
  ).length;
  if (questionCount >= 3) { scores.qa += 20; signals.push(`질문형 헤딩 ${questionCount}개`); }
  else if (questionCount >= 1) { scores.qa += 8; }

  const hasFaqSection = bodyText.includes("faq") || bodyText.includes("자주 묻는 질문") || bodyText.includes("frequently asked");
  if (hasFaqSection) { scores.qa += 15; signals.push("FAQ 섹션 존재"); }

  // 마케팅/랜딩 신호
  const ctaCount = $("a, button").filter((_, el) => {
    const text = $(el).text().toLowerCase();
    return /get started|시작하기|무료|free trial|sign up|가입|try|체험|download|다운로드/.test(text);
  }).length;
  if (ctaCount >= 2) { scores.marketing += 15; signals.push(`CTA 버튼 ${ctaCount}개`); }

  const hasHeroSection = $('[class*="hero"], [class*="banner"], [class*="jumbotron"]').length > 0;
  if (hasHeroSection) { scores.marketing += 10; signals.push("히어로 섹션 존재"); }

  // 기업 신호
  const hasAboutNav = bodyText.includes("about us") || bodyText.includes("회사소개") || bodyText.includes("our story");
  const hasContactNav = bodyText.includes("contact") || bodyText.includes("문의") || bodyText.includes("연락처");
  if (hasAboutNav) { scores.corporate += 10; signals.push("About 페이지 링크"); }
  if (hasContactNav) { scores.corporate += 10; signals.push("Contact 링크 존재"); }

  // 콘텐츠 밀도 — 긴 글은 블로그/qa
  const paragraphs = $("p").map((_, el) => $(el).text().trim()).get().filter(p => p.length > 50);
  const avgParaLen = paragraphs.length > 0
    ? paragraphs.reduce((s, p) => s + p.length, 0) / paragraphs.length
    : 0;
  if (avgParaLen > 200 && paragraphs.length > 5) {
    scores.blog += 10;
    scores.qa += 5;
    signals.push("긴 콘텐츠 구조");
  }

  // ── 최종 결정 ─────────────────────────────────────────────
  const sorted = (Object.entries(scores) as [SiteType, number][])
    .filter(([k]) => k !== "unknown")
    .sort(([, a], [, b]) => b - a);

  const [topType, topScore] = sorted[0];
  const [, secondScore] = sorted[1] ?? ["unknown", 0];

  // 총 신호가 너무 약하면 unknown
  if (topScore < 10) {
    return { type: "unknown", label: "분류 불가", confidence: 0, signals };
  }

  // 신뢰도: 1위와 2위 점수 차이로 계산
  const gap = topScore - secondScore;
  const confidence = Math.min(100, Math.round(50 + gap * 1.5));

  const labelMap: Record<SiteType, string> = {
    blog: "블로그 / 미디어",
    ecommerce: "쇼핑몰 / 이커머스",
    qa: "Q&A / 문서",
    marketing: "마케팅 / 랜딩",
    corporate: "기업 정보",
    unknown: "분류 불가",
  };

  return { type: topType, label: labelMap[topType], confidence, signals };
}
