---
name: project_structure
description: 실제 파일 위치, 주요 함수명, 현재 타입 구조 — lib/types/ 디렉토리 없음, 타입이 각 analyzer에 분산됨
type: project
---

모든 analyzer와 컴포넌트는 `app/` 하위에 있음 (lib/ 루트가 아닌 app/lib/).
route.ts import 경로: `@/app/lib/analyzers/seo` 등.

**Why:** Next.js App Router 구조이고 app/ 하위에 모두 배치되어 있음.
**How to apply:** import 경로 작성 시 항상 `@/app/lib/...` 사용.

## 현재 타입 분산 문제
- SEOIssue: app/lib/analyzers/seo.ts에 로컬 선언
- AEOIssue: app/lib/analyzers/aeo.ts에 로컬 선언
- GEOIssue: app/lib/analyzers/geo.ts에 로컬 선언
- TrustIssue: app/lib/analyzers/trust.ts에 로컬 선언
- AnalysisResult: app/page.tsx에 인라인 선언 (공유 타입 없음)
- lib/types/ 디렉토리 존재하지 않음

## 현재 check ID 목록 (28개, 절대 변경 금지)
SEO: https, robots-meta, canonical, title, meta-description, h1, heading-structure, image-alt, schema-markup, og-tags, internal-links, content-length, topic-concentration
AEO: faq-schema, howto-schema, question-headings, direct-answer, paragraph-length, statistics, citations, definition-sentences, comparison-structure, step-structure
GEO: ai-crawlers, robots-txt, markdown-quality, sentence-complexity, org-schema, viewport, lang-attr, sitemap-declaration
Trust: author-info, company-info, contact-info, publish-date

## ACTION_GUIDE
app/lib/utils/actions.ts — 28개 모두 커버됨. flat string.
route.ts와 page.tsx 둘 다 import해서 사용.
