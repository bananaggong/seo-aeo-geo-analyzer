import { NextRequest, NextResponse } from "next/server";
import { analyzeSEO } from "@/app/lib/analyzers/seo";
import { analyzeAEO } from "@/app/lib/analyzers/aeo";
import { analyzeGEO } from "@/app/lib/analyzers/geo";

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
      if (robotsRes.ok) {
        robotsTxt = await robotsRes.text();
      }
    } catch {
      // robots.txt 없는 경우 무시
    }

    // 3) PageSpeed Insights API (무료, 키 불필요)
    let pageSpeedData: Record<string, unknown> | null = null;
    try {
      const psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(normalizedUrl)}&strategy=mobile&category=PERFORMANCE`;
      const psRes = await fetchWithTimeout(psUrl);
      if (psRes.ok) {
        pageSpeedData = await psRes.json() as Record<string, unknown>;
      }
    } catch {
      // PageSpeed 실패 시 무시
    }

    // 4) 분석 실행
    const seoResult = analyzeSEO(html, normalizedUrl);
    const aeoResult = analyzeAEO(html);
    const geoResult = analyzeGEO(html, robotsTxt, normalizedUrl);

    // 5) PageSpeed 데이터 통합
    let pageSpeed: Record<string, unknown> | null = null;
    if (pageSpeedData) {
      const cats = (pageSpeedData as Record<string, Record<string, unknown>>).lighthouseResult?.categories as Record<string, unknown> | undefined;
      const audits = (pageSpeedData as Record<string, Record<string, unknown>>).lighthouseResult?.audits as Record<string, unknown> | undefined;

      if (cats) {
        const perfScore = Math.round(Number((cats.performance as Record<string, unknown>)?.score ?? 0) * 100);
        const lcp = (audits?.["largest-contentful-paint"] as Record<string, unknown>)?.displayValue as string;
        const cls = (audits?.["cumulative-layout-shift"] as Record<string, unknown>)?.displayValue as string;
        const tbt = (audits?.["total-blocking-time"] as Record<string, unknown>)?.displayValue as string;
        const fcp = (audits?.["first-contentful-paint"] as Record<string, unknown>)?.displayValue as string;

        pageSpeed = { score: perfScore, lcp, cls, tbt, fcp };

        // PageSpeed 점수를 SEO 점수에 반영
        const psBonus = Math.round(perfScore * 0.1);
        seoResult.score = Math.min(100, seoResult.score + psBonus);
      }
    }

    // 6) 통합 Visibility Score
    const visibilityScore = Math.round(
      seoResult.score * 0.4 + aeoResult.score * 0.3 + geoResult.score * 0.3
    );

    return NextResponse.json({
      url: normalizedUrl,
      analyzedAt: new Date().toISOString(),
      visibilityScore,
      seo: seoResult,
      aeo: aeoResult,
      geo: geoResult,
      pageSpeed,
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
