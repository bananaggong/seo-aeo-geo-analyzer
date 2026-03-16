export interface ActionTemplate {
  title: string;
  body: string;
  impact: number;   // 1~10
  effort: number;   // 1~10, Math.max(1, effort) guaranteed at usage site
  severity: 'high' | 'medium' | 'low';
}

export const ACTION_TEMPLATES: Record<string, ActionTemplate> = {
  // SEO
  "https": {
    title: "HTTPS 미적용 — SSL 인증서 즉시 설치",
    body: "SSL 인증서를 적용하고 모든 HTTP 요청을 HTTPS로 리다이렉트하세요.",
    impact: 9, effort: 6, severity: 'high',
  },
  "robots-meta": {
    title: "noindex 해제 — 검색 색인 차단 확인",
    body: "robots meta 태그에서 noindex를 제거하거나, 색인되어야 할 페이지인지 확인하세요.",
    impact: 9, effort: 2, severity: 'high',
  },
  "canonical": {
    title: "canonical 태그 누락 — 중복 페이지 방지",
    body: "<link rel='canonical'> 태그를 추가해 중복 페이지 문제를 방지하세요.",
    impact: 6, effort: 2, severity: 'medium',
  },
  "title": {
    title: "타이틀 최적화 — 30~60자, 핵심 키워드 앞 배치",
    body: "타이틀을 30~60자로 조정하고, 핵심 키워드를 앞쪽에 배치하세요.",
    impact: 8, effort: 2, severity: 'high',
  },
  "meta-description": {
    title: "메타 디스크립션 추가 — 행동 유도 문구 포함",
    body: "60~165자의 메타 디스크립션을 작성하고, 행동 유도 문구를 포함하세요.",
    impact: 7, effort: 2, severity: 'medium',
  },
  "h1": {
    title: "H1 태그 정확히 1개 — 핵심 키워드 포함",
    body: "페이지당 H1 태그를 정확히 1개만 사용하고, 핵심 키워드를 포함하세요.",
    impact: 7, effort: 2, severity: 'medium',
  },
  "heading-structure": {
    title: "H2 태그 2개 이상 — 콘텐츠 논리적 분절",
    body: "H2 태그를 2개 이상 사용해 콘텐츠를 논리적으로 분절하세요.",
    impact: 5, effort: 3, severity: 'medium',
  },
  "image-alt": {
    title: "이미지 alt 텍스트 추가 — 모든 img 태그 대상",
    body: "모든 img 태그에 내용을 설명하는 alt 텍스트를 추가하세요.",
    impact: 6, effort: 3, severity: 'medium',
  },
  "schema-markup": {
    title: "Schema 마크업 추가 — Article/Product/LocalBusiness",
    body: "페이지 유형에 맞는 Schema(Article, Product, LocalBusiness 등)를 JSON-LD로 추가하세요.",
    impact: 8, effort: 5, severity: 'high',
  },
  "og-tags": {
    title: "OG 태그 3종 추가 — title/description/image",
    body: "og:title, og:description, og:image 세 가지 OG 태그를 모두 추가하세요.",
    impact: 6, effort: 2, severity: 'medium',
  },
  "internal-links": {
    title: "내부 링크 5개 이상 — 관련 페이지 연결",
    body: "관련 페이지로 연결되는 내부 링크를 5개 이상 추가하세요.",
    impact: 5, effort: 3, severity: 'medium',
  },
  "content-length": {
    title: "본문 분량 확대 — 300단어(한국어 500어절) 이상",
    body: "본문 분량을 300단어(한국어 약 500어절) 이상으로 늘려 콘텐츠 충실도를 높이세요.",
    impact: 7, effort: 5, severity: 'medium',
  },
  "topic-concentration": {
    title: "핵심 키워드 정렬 — 타이틀·H1·H2 일관성 확보",
    body: "타이틀의 핵심 단어를 H1에 그대로 사용하고, H2 소제목 2–3개에도 동일 단어나 동의어를 포함하세요. 예: 타이틀 '무료 배송 서비스' → H1 '무료 배송 안내' → H2 '무료 배송 조건'.",
    impact: 6, effort: 4, severity: 'medium',
  },
  // AEO
  "faq-schema": {
    title: "FAQPage 스키마 추가 — AI 답변 인용 가능성 최대화",
    body: "FAQ 섹션에 JSON-LD FAQPage 스키마를 추가하세요. AI 답변 인용 가능성이 가장 크게 높아집니다.",
    impact: 9, effort: 4, severity: 'high',
  },
  "howto-schema": {
    title: "HowTo 스키마 추가 — 절차형 콘텐츠 구조화",
    body: "절차형 콘텐츠에 HowTo JSON-LD 스키마와 step 배열을 추가하세요.",
    impact: 7, effort: 5, severity: 'medium',
  },
  "question-headings": {
    title: "질문형 헤딩 30% 이상 — AI 답변 매칭 강화",
    body: "H2/H3 헤딩의 30% 이상을 '~란?', '어떻게 ~하나요?' 형식의 질문형으로 바꾸세요.",
    impact: 6, effort: 3, severity: 'medium',
  },
  "direct-answer": {
    title: "첫 단락에 직접 답변 배치 — 40~300자 핵심 문장",
    body: "첫 문단에 핵심 질문에 대한 40~300자의 명확한 답변 문장을 배치하세요.",
    impact: 8, effort: 2, severity: 'high',
  },
  "paragraph-length": {
    title: "단락을 200자 이하로 분리 — AI 인용 구조 최적화",
    body: "단락을 200자 이하로 나눠 AI가 인용하기 쉬운 구조로 분리하세요.",
    impact: 6, effort: 3, severity: 'medium',
  },
  "statistics": {
    title: "정량 수치 3개 이상 — 콘텐츠 신뢰도 확보",
    body: "비율(%), 수량, 금액 등 정량 수치를 3개 이상 포함해 콘텐츠 신뢰도를 높이세요.",
    impact: 7, effort: 3, severity: 'medium',
  },
  "citations": {
    title: "외부 출처 링크 3개 이상 — 권위 있는 참조 추가",
    body: "본문에 외부 권위 있는 출처 링크를 3개 이상 추가하세요.",
    impact: 7, effort: 3, severity: 'medium',
  },
  "definition-sentences": {
    title: "정의 문장 3개 추가 — AI 직접 인용 확률 상승",
    body: "핵심 용어를 정의하는 문장 3개를 첫 단락에 추가하세요. 예: 'X란 Y를 의미합니다', 'X는 Y를 뜻합니다', 'X라고도 불립니다'. AI 답변 엔진은 이 형식의 문장을 직접 인용합니다.",
    impact: 7, effort: 2, severity: 'medium',
  },
  "comparison-structure": {
    title: "비교 표 구조화 — <table> 태그로 AI 직접 인용",
    body: "경쟁 비교 콘텐츠를 <table> 태그로 구조화하세요. AI가 표 데이터를 직접 인용합니다.",
    impact: 6, effort: 4, severity: 'medium',
  },
  "step-structure": {
    title: "절차형 콘텐츠 <ol> 구조화 — 단계별 명확화",
    body: "절차형 콘텐츠를 <ol> 태그로 감싸 단계별 구조를 명확히 하세요.",
    impact: 5, effort: 3, severity: 'low',
  },
  // GEO
  "ai-crawlers": {
    title: "AI 크롤러 허용 — GPTBot/ClaudeBot/PerplexityBot",
    body: "robots.txt에서 GPTBot, ClaudeBot, PerplexityBot의 Disallow 규칙을 제거하세요.",
    impact: 9, effort: 3, severity: 'high',
  },
  "robots-txt": {
    title: "robots.txt 생성 — AI 크롤러 허용 규칙 명시",
    body: "robots.txt 파일을 생성하고 AI 크롤러 허용 규칙을 명시하세요.",
    impact: 5, effort: 2, severity: 'medium',
  },
  "markdown-quality": {
    title: "본문 태그 구조화 — main/article + H2 2개 이상",
    body: "main/article 태그로 본문을 감싸고 H2 이상의 헤딩을 2개 이상 사용하세요.",
    impact: 5, effort: 4, severity: 'medium',
  },
  "sentence-complexity": {
    title: "문장 길이 100자 이하 — AI 인용 구조 단순화",
    body: "평균 문장 길이를 100자 이하로 줄여 AI가 인용하기 쉬운 구조로 만드세요.",
    impact: 5, effort: 3, severity: 'low',
  },
  "org-schema": {
    title: "Organization Schema 추가 — 브랜드명/URL/로고 명시",
    body: "<head>에 Organization JSON-LD를 추가해 브랜드명, URL, 로고를 명시하세요.",
    impact: 7, effort: 4, severity: 'high',
  },
  "viewport": {
    title: "viewport 메타 태그 추가 — 모바일 대응",
    body: "<meta name='viewport' content='width=device-width, initial-scale=1'>를 추가하세요.",
    impact: 4, effort: 1, severity: 'low',
  },
  "lang-attr": {
    title: "HTML lang 속성 추가 — <html lang='ko'>",
    body: "<html lang='ko'>처럼 HTML 루트 태그에 언어 속성을 추가하세요.",
    impact: 4, effort: 1, severity: 'low',
  },
  "sitemap-declaration": {
    title: "robots.txt에 Sitemap 선언 추가",
    body: "robots.txt에 'Sitemap: https://yoursite.com/sitemap.xml' 줄을 추가하세요.",
    impact: 5, effort: 2, severity: 'medium',
  },
  // Trust
  "author-info": {
    title: "저자 정보 추가 — Person Schema + 프로필 링크",
    body: "게시물에 저자명과 프로필 링크를 추가하고, Person Schema로 마크업하세요.",
    impact: 7, effort: 3, severity: 'medium',
  },
  "company-info": {
    title: "/about 페이지 생성 — Organization Schema 적용",
    body: "/about 페이지를 만들고 푸터에 링크를 추가하세요. Organization Schema도 함께 적용하세요.",
    impact: 6, effort: 4, severity: 'medium',
  },
  "contact-info": {
    title: "연락처 정보 명시 — 이메일/전화번호 푸터 배치",
    body: "이메일 또는 전화번호를 푸터나 Contact 페이지에 명시하세요.",
    impact: 6, effort: 2, severity: 'medium',
  },
  "publish-date": {
    title: "발행일 마크업 — article:published_time + datePublished",
    body: "<meta property='article:published_time'>와 datePublished Schema를 추가하세요.",
    impact: 7, effort: 2, severity: 'medium',
  },
};

// Backward-compatible re-export: existing callers using ACTION_GUIDE continue to work.
export const ACTION_GUIDE: Record<string, string> = Object.fromEntries(
  Object.entries(ACTION_TEMPLATES).map(([k, v]) => [k, v.body])
);
