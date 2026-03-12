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

  // robots.txt (페이지 내 robots meta)
  const robotsMeta = $('meta[name="robots"]').attr("content") || "";
  const noindex = robotsMeta.includes("noindex");
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

  // Canonical URL
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
    titleLen >= 30 && titleLen <= 60
      ? "pass"
      : titleLen > 0
      ? "warn"
      : "fail";
  issues.push({
    id: "title",
    label: "Title 태그",
    status: titleStatus,
    detail: title
      ? `"${title.slice(0, 50)}${title.length > 50 ? "..." : ""}" (${titleLen}자)`
      : "title 태그 없음",
    score: titleStatus === "pass" ? 12 : titleStatus === "warn" ? 6 : 0,
    maxScore: 12,
  });

  // Meta Description
  const metaDesc =
    $('meta[name="description"]').attr("content")?.trim() || "";
  const descLen = metaDesc.length;
  const descStatus =
    descLen >= 80 && descLen <= 160
      ? "pass"
      : descLen > 0
      ? "warn"
      : "fail";
  issues.push({
    id: "meta-description",
    label: "Meta Description",
    status: descStatus,
    detail: metaDesc
      ? `${descLen}자 (권장: 80~160자)`
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

  // Heading 구조 (H2 존재 여부)
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
  const altStatus =
    altRatio === 100 ? "pass" : altRatio >= 70 ? "warn" : "fail";
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
      const type = json["@type"] || (Array.isArray(json) ? "Array" : "Unknown");
      schemaTypes.push(type);
    } catch {
      // ignore parse error
    }
  });
  issues.push({
    id: "schema-markup",
    label: "Schema Markup (JSON-LD)",
    status:
      schemaTypes.length >= 2
        ? "pass"
        : schemaTypes.length === 1
        ? "warn"
        : "fail",
    detail:
      schemaTypes.length > 0
        ? `발견: ${schemaTypes.join(", ")}`
        : "Schema 마크업 없음 — 리치 결과 노출 불가",
    score:
      schemaTypes.length >= 2 ? 10 : schemaTypes.length === 1 ? 5 : 0,
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
  const internalLinks = $("a[href]").filter((_, el) => {
    const href = $(el).attr("href") || "";
    return href.startsWith("/") || href.includes(new URL(url).hostname);
  }).length;
  issues.push({
    id: "internal-links",
    label: "내부 링크",
    status: internalLinks >= 5 ? "pass" : internalLinks >= 2 ? "warn" : "fail",
    detail: `내부 링크 ${internalLinks}개 (권장: 5개 이상)`,
    score: internalLinks >= 5 ? 5 : internalLinks >= 2 ? 3 : 0,
    maxScore: 5,
  });

  // Word Count (콘텐츠 충분성)
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText.split(" ").filter((w) => w.length > 1).length;
  issues.push({
    id: "content-length",
    label: "콘텐츠 분량",
    status: wordCount >= 300 ? "pass" : wordCount >= 100 ? "warn" : "fail",
    detail: `약 ${wordCount.toLocaleString()}단어 (권장: 300단어 이상)`,
    score: wordCount >= 300 ? 5 : wordCount >= 100 ? 2 : 0,
    maxScore: 5,
  });

  const totalScore = issues.reduce((sum, i) => sum + i.score, 0);
  const maxTotal = issues.reduce((sum, i) => sum + i.maxScore, 0);
  const normalizedScore = Math.round((totalScore / maxTotal) * 100);

  const techIds = ["https", "robots-meta", "canonical"];
  const onpageIds = ["title", "meta-description", "h1", "image-alt", "og-tags", "internal-links", "content-length"];
  const structureIds = ["heading-structure", "schema-markup"];

  const calcGroup = (ids: string[]) => {
    const group = issues.filter((i) => ids.includes(i.id));
    const got = group.reduce((s, i) => s + i.score, 0);
    const max = group.reduce((s, i) => s + i.maxScore, 0);
    return Math.round((got / max) * 100);
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
