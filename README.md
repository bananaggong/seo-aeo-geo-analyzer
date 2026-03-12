# Visibility Analyzer — SEO · AEO · GEO

AI 시대의 웹 가시성을 한 번에 분석하는 Next.js 도구.

## 측정 항목

| 축 | 설명 | 가중치 |
|---|---|---|
| **SEO** | 기술적 SEO + 온페이지 최적화 | 40% |
| **AEO** | 답변 엔진 최적화 (FAQ 스키마, Q&A 구조) | 30% |
| **GEO** | AI 크롤러 접근성 + 브랜드 엔티티 | 30% |

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 기술 스택

- **Next.js 14** App Router (풀스택)
- **cheerio** — HTML 파싱
- **turndown** — HTML → Markdown 변환
- **Google PageSpeed Insights API** — 성능 지표 (무료)

## Level 업그레이드 로드맵

- **Level 3**: AI 브랜드 인식 측정 (GPT-4 / Claude API)
- **Level 4**: 경쟁사 비교 + DataForSEO 키워드 순위
