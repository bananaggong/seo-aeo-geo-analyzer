# LOAM — AI 검색 시대의 웹 가시성 분석 플랫폼

URL 하나로 SEO · AEO · GEO · Trust 점수를 측정하고, 즉시 실행 가능한 개선 가이드를 제공합니다.

## LOAM SCORE

4개 축을 가중 합산한 종합 가시성 점수 (0–100).

| 축 | 설명 | 가중치 |
|---|---|---|
| **SEO** | 기술적 SEO + 온페이지 최적화 + 구조 | 35% |
| **AEO** | 답변 엔진 최적화 — FAQ 스키마, 정의형 문장, 단계 구조 | 25% |
| **GEO** | AI 크롤러 접근성 + 마크다운 품질 + 브랜드 엔티티 | 25% |
| **Trust** | 저자/회사/연락처/날짜 신뢰 신호 | 15% |

등급 기준: **우수** ≥80 · **양호** ≥65 · **보통** ≥50 · **개선 필요** <50

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 주요 기능

- **LOAM SCORE 게이지** — 종합 점수를 원형 게이지로 시각화
- **지금 바로 해야 할 것** — 점수 향상 효과 순 TOP 5 우선순위 + 구체적 개선 가이드
- **카테고리 탭** — SEO / AEO / GEO / Trust 항목별 실패·개선 건수 배지
- **인라인 액션** — 실패·개선 항목마다 즉시 실행 가능한 수정 지침 표시
- **사이트 유형 감지** — blog / ecommerce / qa / marketing / corporate 분류 후 AEO 평가 가중치 자동 조정
- **GEO 마크다운 미리보기** — AI 검색엔진이 실제로 읽는 방식 미리보기
- **PageSpeed 지표** — Mobile LCP · CLS · FCP (Google API, 무료)

## 기술 스택

- **Next.js** App Router (풀스택, TypeScript strict)
- **cheerio** — 서버 사이드 HTML 파싱
- **turndown** — HTML → Markdown 변환 (GEO 미리보기)
- **Google PageSpeed Insights API** — 성능 지표 (무료, 키 불필요)
- **Tailwind CSS** — 스타일링

## 프로젝트 구조

```
app/
├── api/analyze/route.ts       # 분석 API 엔드포인트
├── lib/
│   ├── analyzers/
│   │   ├── seo.ts             # SEO 분석 (13개 항목)
│   │   ├── aeo.ts             # AEO 분석 (11개 항목, 사이트 유형 가중치)
│   │   ├── geo.ts             # GEO 분석 (8개 항목)
│   │   ├── trust.ts           # Trust 분석 (4개 항목)
│   │   └── siteType.ts        # 사이트 유형 감지
│   └── utils/
│       ├── actions.ts         # 항목별 개선 가이드 (30+ 항목)
│       ├── grading.ts         # 점수 등급 함수 (단일 소스)
│       └── colors.ts          # 카테고리 컬러 팔레트 (단일 소스)
└── components/
    ├── ScoreStrip.tsx         # LOAM SCORE 게이지 + 서브 점수 칩
    ├── TopIssues.tsx          # 우선순위 TOP 5 액션 카드
    ├── CategoryTabs.tsx       # 탭 바 (실패 건수 배지 포함)
    ├── IssueList.tsx          # 항목별 분석 목록 (인라인 액션 포함)
    ├── MetaDrawer.tsx         # 접을 수 있는 PageSpeed · 사이트 유형 패널
    └── MarkdownPreview.tsx    # GEO 마크다운 미리보기

## 로드맵

- **Level 3**: AI 브랜드 인식 측정 (GPT-4 / Claude API 연동)
- **Level 4**: 경쟁사 비교 + 키워드 순위 데이터
