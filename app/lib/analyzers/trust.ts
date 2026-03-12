import * as cheerio from "cheerio";

export interface TrustIssue {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  score: number;
  maxScore: number;
}

export interface TrustResult {
  score: number;
  issues: TrustIssue[];
}

export function analyzeTrust(html: string): TrustResult {
  const $ = cheerio.load(html);
  const issues: TrustIssue[] = [];

  // ── 1. 저자 정보 (Author Info) ────────────────────────────
  const metaAuthor = $('meta[name="author"]').attr("content")?.trim();
  const relAuthor = $('[rel="author"]').first().text().trim();
  const itempropAuthor = $('[itemprop="author"]').first().text().trim();
  const classAuthor = $(".author, .byline, .post-author").first().text().trim();

  let hasAuthorSchema = false;
  let hasAuthorLink = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const check = (obj: Record<string, unknown>) => {
        const author = obj["author"] as Record<string, unknown> | undefined;
        if (author?.["@type"] === "Person" || author?.["name"]) {
          hasAuthorSchema = true;
        }
      };
      if (Array.isArray(json)) json.forEach(check);
      else check(json as Record<string, unknown>);
    } catch { /* ignore */ }
  });

  hasAuthorLink = $('[rel="author"]').length > 0;

  const authorName = metaAuthor || relAuthor || itempropAuthor || classAuthor;
  const authorStatus: "pass" | "warn" | "fail" =
    authorName && (hasAuthorSchema || hasAuthorLink)
      ? "pass"
      : authorName
      ? "warn"
      : "fail";

  issues.push({
    id: "author-info",
    label: "저자 정보",
    status: authorStatus,
    detail:
      authorStatus === "pass"
        ? `저자: "${authorName}" (Schema/링크 포함)`
        : authorName
        ? `저자명 발견: "${authorName}" — Person Schema 또는 저자 링크 추가 권장`
        : "저자 정보 없음 — AI는 저자가 명확한 콘텐츠를 더 신뢰",
    score: authorStatus === "pass" ? 10 : authorStatus === "warn" ? 5 : 0,
    maxScore: 10,
  });

  // ── 2. 회사/브랜드 정보 (Company Info) ───────────────────
  let hasOrgSchema = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const check = (obj: Record<string, unknown>) => {
        if (
          ["Organization", "Corporation", "LocalBusiness", "Brand"].includes(
            String(obj["@type"] || "")
          )
        ) {
          hasOrgSchema = true;
        }
      };
      if (Array.isArray(json)) json.forEach(check);
      else check(json as Record<string, unknown>);
    } catch { /* ignore */ }
  });

  const aboutLinks = $("a[href]").filter((_, el) => {
    const href = ($(el).attr("href") || "").toLowerCase();
    const text = $(el).text().toLowerCase();
    return (
      href.includes("/about") ||
      href.includes("/about-us") ||
      href.includes("/company") ||
      text.includes("about") ||
      text.includes("회사소개") ||
      text.includes("about us")
    );
  }).length;

  const hasAboutLink = aboutLinks > 0;
  const companyStatus: "pass" | "warn" | "fail" =
    hasOrgSchema && hasAboutLink ? "pass" : hasOrgSchema || hasAboutLink ? "warn" : "fail";

  issues.push({
    id: "company-info",
    label: "회사/브랜드 정보",
    status: companyStatus,
    detail:
      companyStatus === "pass"
        ? `Organization Schema + About 페이지 링크 확인됨`
        : companyStatus === "warn"
        ? `${hasOrgSchema ? "Organization Schema ✓" : "Organization Schema ✗"} / ${hasAboutLink ? "About 링크 ✓" : "About 링크 ✗"}`
        : "Organization Schema 없음, About 페이지 링크 없음 — 브랜드 신뢰도 낮음",
    score: companyStatus === "pass" ? 15 : companyStatus === "warn" ? 7 : 0,
    maxScore: 15,
  });

  // ── 3. 연락처 정보 (Contact Info) ────────────────────────
  const bodyText = $("body").text();
  const hasEmail =
    $('a[href^="mailto:"]').length > 0 ||
    /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(bodyText);
  const hasTel =
    $('a[href^="tel:"]').length > 0 ||
    /(\+82|0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}|\(\d{3}\)\s?\d{3}-\d{4})/.test(bodyText);

  let hasContactSchema = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const check = (obj: Record<string, unknown>) => {
        if (obj["contactPoint"] || obj["@type"] === "ContactPoint") {
          hasContactSchema = true;
        }
      };
      if (Array.isArray(json)) json.forEach(check);
      else check(json as Record<string, unknown>);
    } catch { /* ignore */ }
  });

  const hasSocialOnly =
    !hasEmail &&
    !hasTel &&
    $("a[href]").filter((_, el) => {
      const href = $(el).attr("href") || "";
      return /twitter\.com|linkedin\.com|facebook\.com|instagram\.com/.test(href);
    }).length > 0;

  const contactStatus: "pass" | "warn" | "fail" =
    hasEmail || hasTel ? "pass" : hasSocialOnly ? "warn" : "fail";

  issues.push({
    id: "contact-info",
    label: "연락처 정보",
    status: contactStatus,
    detail:
      contactStatus === "pass"
        ? `${hasEmail ? "이메일 ✓" : ""} ${hasTel ? "전화번호 ✓" : ""} ${hasContactSchema ? "ContactPoint Schema ✓" : ""}`.trim()
        : contactStatus === "warn"
        ? "SNS 링크만 존재 — 이메일 또는 전화번호 추가 권장"
        : "연락처 정보 없음 — 신뢰 신호 부재",
    score: contactStatus === "pass" ? 10 : contactStatus === "warn" ? 4 : 0,
    maxScore: 10,
  });

  // ── 4. 날짜 정보 (Publish Date / Freshness) ───────────────
  const articlePublished = $('meta[property="article:published_time"]').attr("content");
  const articleModified = $('meta[property="article:modified_time"]').attr("content");
  const timeTag = $("time[datetime]").first().attr("datetime");

  let schemaDatePublished = "";
  let schemaDateModified = "";
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const check = (obj: Record<string, unknown>) => {
        if (obj["datePublished"]) schemaDatePublished = String(obj["datePublished"]);
        if (obj["dateModified"]) schemaDateModified = String(obj["dateModified"]);
      };
      if (Array.isArray(json)) json.forEach(check);
      else check(json as Record<string, unknown>);
    } catch { /* ignore */ }
  });

  const publishDate = articlePublished || schemaDatePublished || timeTag;
  const modifiedDate = articleModified || schemaDateModified;

  const dateStatus: "pass" | "warn" | "fail" =
    publishDate && modifiedDate ? "pass" : publishDate ? "warn" : "fail";

  issues.push({
    id: "publish-date",
    label: "날짜 정보 (콘텐츠 최신성)",
    status: dateStatus,
    detail:
      dateStatus === "pass"
        ? `발행일 + 수정일 모두 확인됨 — AI가 최신 정보로 인식`
        : dateStatus === "warn"
        ? `발행일만 있음: ${publishDate?.slice(0, 10)} — 수정일(dateModified) 추가 권장`
        : "날짜 정보 없음 — AI는 최신 정보를 우선 인용",
    score: dateStatus === "pass" ? 15 : dateStatus === "warn" ? 7 : 0,
    maxScore: 15,
  });

  // ── 점수 계산 ─────────────────────────────────────────────
  const totalScore = issues.reduce((sum, i) => sum + i.score, 0);
  const maxTotal = issues.reduce((sum, i) => sum + i.maxScore, 0);
  const normalizedScore = Math.round((totalScore / maxTotal) * 100);

  return { score: normalizedScore, issues };
}
