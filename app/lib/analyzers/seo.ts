import * as cheerio from "cheerio";

export interface SEOIssue {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  score: number;
  maxScore: number;
}

export interface SEOResult {
  score: number;
  issues: SEOIssue[];
  breakdown: {
    technical: number;
    onpage: number;
    structure: number;
  };
}

/**
 * 텍스트의 단어/어절 수를 추정합니다.
 * 한국어: 공백 기준 어절 카운트 (영어보다 밀도가 높아 0.6 보정)
 * 영어: 공백 기준 단어 카운트
 */
function estimateWordCount(text: string): number {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return 0;

  // 한글 포함 비율로 언어 판단
  const koreanChars = (cleaned.match(/[\uAC00-\uD7A3]/g) || []).length;
  const totalChars = cleaned.replace(/\s/g, "").length;
  const koreanRatio = totalChars > 0 ? koreanChars / totalChars : 0;

  const tokens = cleaned.split(" ").filter((w) => w.length > 0);

  if (koreanRatio > 0.3) {
    // 한국어: 어절 1개 ≒ 영어 단어 1.7개 수준이므로 상향 보정
    return Math.round(tokens.length * 1.7);
  }
  return tokens.filter((w) => w.length > 1).length;
}

export function analyzeSEO(html: string, url: string): SEOResult {
  const $ = cheerio.load(html);
  const issues: SEOIssue[] = [];

  // ── Technical ────────────────────────────────────────────
  // HTTPS
  const isHttps = url.startsWith("https://");
  issues.push({
    id: "https",
    label: "HTTPS 보안 연결",
    status: isHttps ? "pass" : "fail",
    detail: isHttps ? "HTTPS 사용 중" : "HTTP 사용 중 — SSL 인증서 적용 필요",
    score: isHttps ? 10 : 0,
    maxScore: 10,
  });

  // robots meta
  const robotsMeta = $('meta[name="robots"]').attr("content") || "";
  const noindex = robotsMeta.toLowerCase().includes("noindex");
  issues.push({
    id: "robots-meta",
    label: "Robots Meta 태그",
    status: noindex ? "fail" : "pass",
    detail: noindex
      ? `noindex 설정됨 — 검색 엔진이 이 페이지를 색인하지 않음`
      : robotsMeta
      ? `설정: ${robotsMeta}`
      : "기본값 (색인 허용)",
    score: noindex ? 0 : 8,
    maxScore: 8,
  });

  // Canonical
  const canonical = $('link[rel="canonical"]').attr("href");
  issues.push({
    id: "canonical",
    label: "Canonical URL",
    status: canonical ? "pass" : "warn",
    detail: canonical ? canonical : "canonical 태그 없음 — 중복 페이지 문제 가능성",
    score: canonical ? 7 : 2,
    maxScore: 7,
  });

  // ── On-Page ───────────────────────────────────────────────
  // Title
  const title = $("title").text().trim();
  const titleLen = title.length;
  const titleStatus =
    titleLen >= 20 && titleLen <= 70 ? "pass" : titleLen > 0 ? "warn" : "fail";
  issues.push({
    id: "title",
    label: "Title 태그",
    status: titleStatus,
    detail: title
      ? `"${title.slice(0, 60)}${title.length > 60 ? "..." : ""}" (${titleLen}자)`
      : "title 태그 없음",
    score: titleStatus === "pass" ? 12 : titleStatus === "warn" ? 6 : 0,
    maxScore: 12,
  });

  // Meta Description
  const metaDesc = $('meta[name="description"]').attr("content")?.trim() || "";
  const descLen = metaDesc.length;
  const descStatus =
    descLen >= 60 && descLen <= 165 ? "pass" : descLen > 0 ? "warn" : "fail";
  issues.push({
    id: "meta-description",
    label: "Meta Description",
    status: descStatus,
    detail: metaDesc
      ? `${descLen}자 (권장: 60~165자)`
      : "meta description 없음 — 검색 결과 스니펫 미표시",
    score: descStatus === "pass" ? 10 : descStatus === "warn" ? 5 : 0,
    maxScore: 10,
  });

  // H1
  const h1s = $("h1");
  const h1Count = h1s.length;
  const h1Status = h1Count === 1 ? "pass" : h1Count === 0 ? "fail" : "warn";
  issues.push({
    id: "h1",
    label: "H1 태그",
    status: h1Status,
    detail:
      h1Count === 0
        ? "H1 태그 없음"
        : h1Count === 1
        ? `"${h1s.first().text().trim().slice(0, 60)}"`
        : `H1이 ${h1Count}개 — 1개만 권장`,
    score: h1Status === "pass" ? 10 : h1Status === "warn" ? 5 : 0,
    maxScore: 10,
  });

  // Heading 구조
  const h2Count = $("h2").length;
  issues.push({
    id: "heading-structure",
    label: "Heading 구조 (H2~H6)",
    status: h2Count >= 2 ? "pass" : h2Count === 1 ? "warn" : "fail",
    detail: `H2: ${h2Count}개, H3: ${$("h3").length}개, H4: ${$("h4").length}개`,
    score: h2Count >= 2 ? 8 : h2Count === 1 ? 4 : 0,
    maxScore: 8,
  });

  // Image Alt
  const allImgs = $("img");
  const missingAlt = $("img:not([alt])").length + $('img[alt=""]').length;
  const altRatio =
    allImgs.length > 0
      ? Math.round(((allImgs.length - missingAlt) / allImgs.length) * 100)
      : 100;
  const altStatus = altRatio === 100 ? "pass" : altRatio >= 70 ? "warn" : "fail";
  issues.push({
    id: "image-alt",
    label: "이미지 Alt 텍스트",
    status: allImgs.length === 0 ? "pass" : altStatus,
    detail:
      allImgs.length === 0
        ? "이미지 없음"
        : `${allImgs.length}개 중 ${missingAlt}개 누락 (${altRatio}% 충족)`,
    score:
      allImgs.length === 0
        ? 8
        : altStatus === "pass"
        ? 8
        : altStatus === "warn"
        ? 4
        : 0,
    maxScore: 8,
  });

  // Schema Markup
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const schemaTypes: string[] = [];
  jsonLdScripts.each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const extract = (obj: Record<string, unknown>) => {
        const t = obj["@type"];
        if (t) schemaTypes.push(Array.isArray(t) ? t.join("+") : String(t));
      };
      if (Array.isArray(json)) json.forEach(extract);
      else extract(json as Record<string, unknown>);
    } catch { /* ignore */ }
  });
  issues.push({
    id: "schema-markup",
    label: "Schema Markup (JSON-LD)",
    status:
      schemaTypes.length >= 2 ? "pass" : schemaTypes.length === 1 ? "warn" : "fail",
    detail:
      schemaTypes.length > 0
        ? `발견: ${schemaTypes.join(", ")}`
        : "Schema 마크업 없음 — 리치 결과 노출 불가",
    score: schemaTypes.length >= 2 ? 10 : schemaTypes.length === 1 ? 5 : 0,
    maxScore: 10,
  });

  // OG Tags
  const ogTitle = $('meta[property="og:title"]').attr("content");
  const ogDesc = $('meta[property="og:description"]').attr("content");
  const ogImage = $('meta[property="og:image"]').attr("content");
  const ogCount = [ogTitle, ogDesc, ogImage].filter(Boolean).length;
  issues.push({
    id: "og-tags",
    label: "Open Graph 태그",
    status: ogCount === 3 ? "pass" : ogCount >= 1 ? "warn" : "fail",
    detail:
      ogCount === 3
        ? "og:title, og:description, og:image 모두 설정됨"
        : `og:title ${ogTitle ? "✓" : "✗"}, og:description ${
            ogDesc ? "✓" : "✗"
          }, og:image ${ogImage ? "✓" : "✗"}`,
    score: ogCount === 3 ? 7 : ogCount >= 1 ? 3 : 0,
    maxScore: 7,
  });

  // Internal Links
  let hostname = "";
  try { hostname = new URL(url).hostname; } catch { /* ignore */ }
  const internalLinks = $("a[href]").filter((_, el) => {
    const href = $(el).attr("href") || "";
    return href.startsWith("/") || (!!hostname && href.includes(hostname));
  }).length;
  issues.push({
    id: "internal-links",
    label: "내부 링크",
    status: internalLinks >= 5 ? "pass" : internalLinks >= 2 ? "warn" : "fail",
    detail: `내부 링크 ${internalLinks}개 (권장: 5개 이상)`,
    score: internalLinks >= 5 ? 5 : internalLinks >= 2 ? 3 : 0,
    maxScore: 5,
  });

  // Word Count — 한국어/영어 보정 포함
  const bodyText = $("body").text();
  const wordCount = estimateWordCount(bodyText);
  issues.push({
    id: "content-length",
    label: "콘텐츠 분량",
    status: wordCount >= 300 ? "pass" : wordCount >= 100 ? "warn" : "fail",
    detail: `약 ${wordCount.toLocaleString()}단어 (권장: 300단어 이상)`,
    score: wordCount >= 300 ? 5 : wordCount >= 100 ? 2 : 0,
    maxScore: 5,
  });

  // ── 주제 집중도 (Topic Concentration) ────────────────────
  // title, H1, H2에서 2글자 이상 단어 추출 후 교집합으로 집중도 판단
  const extractKeywords = (text: string): Set<string> => {
    return new Set(
      text
        .toLowerCase()
        .replace(/[^\w\uAC00-\uD7A3\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 2)
    );
  };

  const titleKeywords = extractKeywords(title);
  const h1Keywords = extractKeywords(h1s.first().text());
  const h2Keywords = new Set<string>();
  $("h2").each((_, el) => {
    extractKeywords($(el).text()).forEach((k) => h2Keywords.add(k));
  });

  // title ∩ H1 교집합
  const titleH1Common = [...titleKeywords].filter((k) => h1Keywords.has(k));
  // title ∩ H1 ∩ 최소 2개 H2 교집합
  const titleH1H2Common = titleH1Common.filter((k) => h2Keywords.has(k));

  const topicStatus: "pass" | "warn" | "fail" =
    titleH1H2Common.length >= 1
      ? "pass"
      : titleH1Common.length >= 1
      ? "warn"
      : "fail";

  issues.push({
    id: "topic-concentration",
    label: "주제 집중도 (Topic Concentration)",
    status: title && h1Count > 0 ? topicStatus : "fail",
    detail:
      title && h1Count > 0
        ? topicStatus === "pass"
          ? `핵심 키워드 "${titleH1H2Common[0]}" 등이 타이틀·H1·H2 전반에 일관되게 사용됨`
          : topicStatus === "warn"
          ? `타이틀-H1 공통 키워드: "${titleH1Common[0]}" — H2에도 포함 권장`
          : "타이틀·H1·H2 간 공통 키워드 없음 — 주제 일관성 낮음"
        : "타이틀 또는 H1 없어 분석 불가",
    score: (title && h1Count > 0) ? (topicStatus === "pass" ? 10 : topicStatus === "warn" ? 5 : 0) : 0,
    maxScore: 10,
  });

  const totalScore = issues.reduce((sum, i) => sum + i.score, 0);
  const maxTotal = issues.reduce((sum, i) => sum + i.maxScore, 0);
  const normalizedScore = Math.round((totalScore / maxTotal) * 100);

  const techIds = ["https", "robots-meta", "canonical"];
  const onpageIds = ["title", "meta-description", "h1", "image-alt", "og-tags", "internal-links", "content-length"];
  const structureIds = ["heading-structure", "schema-markup", "topic-concentration"];

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
      technical: calcGroup(techIds),
      onpage: calcGroup(onpageIds),
      structure: calcGroup(structureIds),
    },
  };
}
