import { NextRequest, NextResponse } from "next/server";
import { analyzeSEO } from "@/app/lib/analyzers/seo";
import { analyzeAEO } from "@/app/lib/analyzers/aeo";
import { analyzeGEO } from "@/app/lib/analyzers/geo";
import { analyzeTrust } from "@/app/lib/analyzers/trust";
import { detectSiteType } from "@/app/lib/analyzers/siteType";
import { ACTION_GUIDE } from "@/app/lib/utils/actions";

const FETCH_TIMEOUT = 10000;

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

interface AnyIssue {
  id: string;
  label: string;
  status: string;
  score: number;
  maxScore: number;
  skipped?: boolean;
}

function buildTopIssues(
  categories: { category: "seo" | "aeo" | "geo" | "trust"; issues: AnyIssue[] }[]
) {
  const allIssues: {
    rank: number;
    category: "seo" | "aeo" | "geo" | "trust";
    id: string;
    label: string;
    currentScore: number;
    maxScore: number;
    gap: number;
    action: string;
  }[] = [];

  for (const { category, issues } of categories) {
    for (const issue of issues) {
      if (issue.skipped || issue.maxScore === 0) continue;
      const gap = issue.maxScore - issue.score;
      if (gap <= 0) continue;
      allIssues.push({
        rank: 0,
        category,
        id: issue.id,
        label: issue.label,
        currentScore: issue.score,
        maxScore: issue.maxScore,
        gap,
        action: ACTION_GUIDE[issue.id] ?? "해당 항목을 개선하여 점수를 높이세요.",
      });
    }
  }

  // fail 우선 → warn 우선 → gap 내림차순
  allIssues.sort((a, b) => b.gap - a.gap);

  // 상위 5개 + 순위 부여
  return allIssues.slice(0, 5).map((item, idx) => ({ ...item, rank: idx + 1 }));
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    const parsedUrl = new URL(normalizedUrl);
    const origin = parsedUrl.origin;

    // 1) HTML 크롤링
    const htmlRes = await fetchWithTimeout(normalizedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SEO-Analyzer/1.0; +https://github.com/bananaggong/seo-aeo-geo-analyzer)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ko,en;q=0.9",
      },
    });

    if (!htmlRes.ok) {
      return NextResponse.json(
        { error: `페이지를 불러올 수 없습니다. (HTTP ${htmlRes.status})` },
        { status: 400 }
      );
    }

    const html = await htmlRes.text();

    // 2) robots.txt 크롤링
    let robotsTxt = "";
    try {
      const robotsRes = await fetchWithTimeout(`${origin}/robots.txt`);
      if (robotsRes.ok) robotsTxt = await robotsRes.text();
    } catch { /* ignore */ }

    // 3) PageSpeed Insights API
    let pageSpeedData: Record<string, unknown> | null = null;
    try {
      const psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&strategy=mobile&category=PERFORMANCE`;
      const psRes = await fetchWithTimeout(psUrl);
      if (psRes.ok) pageSpeedData = (await psRes.json()) as Record<string, unknown>;
    } catch { /* ignore */ }

    // 4) 사이트 유형 감지
    const siteTypeResult = detectSiteType(html, normalizedUrl);

    // 5) 분석 실행
    const seoResult = analyzeSEO(html, normalizedUrl);
    const aeoResult = analyzeAEO(html, siteTypeResult.type);
    const geoResult = analyzeGEO(html, robotsTxt, normalizedUrl);
    const trustResult = analyzeTrust(html);

    // 6) PageSpeed 데이터 정리 (점수에 별도 합산하지 않음)
    let pageSpeed: Record<string, unknown> | null = null;
    if (pageSpeedData) {
      const lhResult = (pageSpeedData as Record<string, Record<string, unknown>>).lighthouseResult;
      const cats = lhResult?.categories as Record<string, unknown> | undefined;
      const audits = lhResult?.audits as Record<string, unknown> | undefined;

      if (cats) {
        const perfScore = Math.round(
          Number((cats.performance as Record<string, unknown>)?.score ?? 0) * 100
        );
        const lcp = (audits?.["largest-contentful-paint"] as Record<string, unknown>)?.displayValue as string;
        const cls = (audits?.["cumulative-layout-shift"] as Record<string, unknown>)?.displayValue as string;
        const tbt = (audits?.["total-blocking-time"] as Record<string, unknown>)?.displayValue as string;
        const fcp = (audits?.["first-contentful-paint"] as Record<string, unknown>)?.displayValue as string;
        pageSpeed = { score: perfScore, lcp, cls, tbt, fcp };
      }
    }

    // 7) Visibility Score
    // Trust 15% 포함. PageSpeed가 있으면 소폭 반영 (Perf 5% 추가)
    let visibilityScore: number;
    if (pageSpeed) {
      const perfScore = pageSpeed.score as number;
      visibilityScore = Math.round(
        seoResult.score * 0.33 +
        aeoResult.score * 0.24 +
        geoResult.score * 0.23 +
        trustResult.score * 0.15 +
        perfScore * 0.05
      );
    } else {
      visibilityScore = Math.round(
        seoResult.score * 0.35 +
        aeoResult.score * 0.25 +
        geoResult.score * 0.25 +
        trustResult.score * 0.15
      );
    }

    // 8) 개선 우선순위 TOP 5
    const topIssues = buildTopIssues([
      { category: "seo", issues: seoResult.issues },
      { category: "aeo", issues: aeoResult.issues },
      { category: "geo", issues: geoResult.issues },
      { category: "trust", issues: trustResult.issues },
    ]);

    return NextResponse.json({
      url: normalizedUrl,
      analyzedAt: new Date().toISOString(),
      visibilityScore,
      siteType: siteTypeResult,
      seo: seoResult,
      aeo: aeoResult,
      geo: geoResult,
      trust: trustResult,
      pageSpeed,
      topIssues,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "분석 중 오류 발생";
    if (message.includes("fetch") || message.includes("ENOTFOUND")) {
      return NextResponse.json(
        { error: "URL에 접근할 수 없습니다. 주소를 확인해주세요." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
