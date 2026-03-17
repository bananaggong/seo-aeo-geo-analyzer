# Foresting OS — Loam Idea Validation Module

> **라우트:** `/idea` | **API:** `POST /api/idea/analyze`
>
> 웹사이트가 없는 예비 창업가를 위한 **설문 기반 아이디어 진단 도구**.
> 단계별 설문에 응답하면 5대 전략 영역을 rule-based로 채점하고, 즉시 실행 가능한 Minary 과제 5개를 도출한다.

---

## 목차

1. [제품 개요](#1-제품-개요)
2. [접근 방법](#2-접근-방법)
3. [설문 구조 (10개 질문 × 5단계)](#3-설문-구조-10개-질문--5단계)
4. [채점 체계 — Loam Score 알고리즘](#4-채점-체계--loam-score-알고리즘)
5. [5대 분석 영역 상세](#5-5대-분석-영역-상세)
   - 5-1. Problem Clarity (문제 명확성)
   - 5-2. Market Demand (시장 수요)
   - 5-3. Differentiation (차별성)
   - 5-4. Distribution Strategy (고객 확보 전략)
   - 5-5. Execution Readiness (실행 준비도)
6. [Minary 우선순위 엔진](#6-minary-우선순위-엔진)
7. [Minary Task 템플릿 21개](#7-minary-task-템플릿-21개)
8. [텍스트 파서 — Heuristic 감지 엔진](#8-텍스트-파서--heuristic-감지-엔진)
9. [API 명세](#9-api-명세)
10. [UI 구조 — 대시보드 4-Zone](#10-ui-구조--대시보드-4-zone)
11. [코드 아키텍처](#11-코드-아키텍처)
12. [등급 기준 및 해석 가이드](#12-등급-기준-및-해석-가이드)
13. [Partial Analysis 처리](#13-partial-analysis-처리)
14. [기존 LOAM URL 분석과의 관계](#14-기존-loam-url-분석과의-관계)
15. [점수 예시 시뮬레이션](#15-점수-예시-시뮬레이션)
16. [Phase 2 확장 로드맵](#16-phase-2-확장-로드맵)

---

## 1. 제품 개요

| 항목 | 내용 |
|---|---|
| **목적** | 아이디어를 입력하면 취약점을 진단하고 즉각적인 실행 계획(Minary)을 제시 |
| **대상** | 웹사이트가 없는 예비 창업자, 아이디어 초기 단계의 1인 창업자 |
| **입력** | 단계별 설문 응답 (10개 질문, 약 5~10분 소요) |
| **출력** | Loam Score (0~100) + 영역별 점수 + 취약 항목 + Top 5 실행 과제 |
| **채점 방식** | Deterministic rule-based (동일 입력 → 항상 동일 출력, LLM 미사용) |
| **기술 스택** | Next.js App Router + TypeScript strict + Tailwind CSS |

---

## 2. 접근 방법

### 핵심 원칙

```
입력한 텍스트의 "내용"이 아닌 "구조"를 평가한다.
```

LLM이 응답의 의미를 해석하는 방식이 아니라, 아래 3가지 heuristic으로 채점한다:

| 평가 방식 | 설명 | 예시 |
|---|---|---|
| **길이 기준** | 텍스트가 충분히 구체적인지 최소 글자 수로 판단 | 문제 설명 ≥ 30자 |
| **키워드 포함** | 특정 단어군의 존재 여부로 구체성 판단 | 직업군 키워드, 긴급성 키워드 |
| **패턴 감지** | 정규식으로 수치/기호 포함 여부 감지 | `\d+`, `%`, `배`, `명`, `원` |

모든 함수는 **순수 함수** — 부수효과 없음, 같은 입력 → 같은 결과 보장.

---

## 3. 설문 구조 (10개 질문 × 5단계)

설문은 한 번에 전체를 보여주지 않고 **단계별(Step-by-step)** 로 진행하여 인지 부하를 줄인다.

### Step 1 — 문제 정의 (Problem)

| 번호 | 질문 | 유형 | 필수 여부 |
|---|---|---|---|
| Q1 | 어떤 문제를 해결하려 하나요? | 서술형 (textarea) | 필수 |
| Q2 | 이 문제를 겪는 주요 고객은 누구인가요? | 서술형 (textarea) | 필수 |

**채점 목적:** 문제의 구체성과 타겟 고객의 명확성 평가

---

### Step 2 — 시장 파악 (Market)

| 번호 | 질문 | 유형 | 필수 여부 |
|---|---|---|---|
| Q3 | 현재 이 문제를 해결하는 기존 대안이 있나요? | 단일 선택 | 필수 |
| Q4 | 이 시장의 잠재 규모를 어떻게 추정하나요? | 서술형 (textarea) | 선택 |

**Q3 선택지:**

| 선택지 | 점수 의미 |
|---|---|
| 없음 | 시장 수요 신호 없음 → fail |
| 부족함 | 시장 수요 있음 → pass |
| 있지만 불편함 | 차별화 기회 최대 → pass + 보너스 +15pt |
| 충분히 있음 | 시장 수요 있음 → pass |

---

### Step 3 — 차별성 (Differentiation)

| 번호 | 질문 | 유형 | 필수 여부 |
|---|---|---|---|
| Q5 | 기존 대안 대비 가장 큰 차이점(핵심 가치)은? | 서술형 (textarea) | 필수 |

**채점 목적:** 차별점의 구체성, 측정 가능성, 독자성 평가

---

### Step 4 — 고객 확보 (Distribution)

| 번호 | 질문 | 유형 | 필수 여부 |
|---|---|---|---|
| Q6 | 첫 고객을 어떻게 확보할 계획인가요? | 복수 선택 (checkbox) | 선택 |
| Q7 | 첫 고객 확보 채널에 대한 구체적 계획이 있나요? | 서술형 (textarea) | 선택 |

**Q6 선택지:** `랜딩페이지` / `소셜미디어` / `콜드메일` / `커뮤니티` / `지인네트워크` / `기타`

> Q6, Q7 미입력 시 해당 체크가 `partial` 처리되어 점수 0점이지만 분석은 계속 진행됨.

---

### Step 5 — 실행 준비 (Execution)

| 번호 | 질문 | 유형 | 필수 여부 |
|---|---|---|---|
| Q8 | 현재 아이디어 단계는? | 단일 선택 | 필수 |
| Q9 | 주당 투입 가능 시간은? | 단일 선택 | 필수 |
| Q10 | 보유 자원을 선택하세요. | 복수 선택 (checkbox) | 선택 |

**Q8 선택지 및 점수:**

| 단계 | 점수 (max 90) |
|---|---|
| 아이디어 | 20 |
| 가설검증중 | 40 |
| MVP개발중 | 65 |
| 초기고객보유 | 90 |

**Q9 선택지 및 점수:**

| 시간 | 점수 (max 80) |
|---|---|
| 5시간미만 | 10 |
| 5~15시간 | 30 |
| 15~30시간 | 55 |
| 풀타임 | 80 |

**Q10 선택지:** `자본금` / `팀원` / `도메인지식` / `네트워크` / `기술스택`
→ 선택 수 × 8점 (최대 40점)

---

## 4. 채점 체계 — Loam Score 알고리즘

### 총점 계산식

```
Loam Score = round(
  Problem Clarity × 0.20 +
  Market Demand   × 0.25 +
  Differentiation × 0.20 +
  Distribution    × 0.20 +
  Execution       × 0.15
)
```

각 영역 점수는 0~100 정수로 정규화한 후 가중 평균을 계산한다.

### 가중치 근거

| 영역 | 가중치 | 이유 |
|---|---|---|
| Market Demand | 25% | 수요 없는 문제를 해결하면 의미 없음. 가장 중요한 검증 |
| Problem Clarity | 20% | 문제 정의가 명확해야 올바른 솔루션이 나옴 |
| Differentiation | 20% | 경쟁이 있는 시장에서 차별점이 없으면 생존 불가 |
| Distribution | 20% | 좋은 제품도 고객을 못 찾으면 실패 |
| Execution | 15% | 아이디어 단계에서는 계획보다 방향성이 중요 |

### 등급 기준

| 점수 | 등급 | 해석 |
|---|---|---|
| 80 이상 | 우수 | 사업 실행 가능성 높음 — 즉시 MVP 개발 시작 권장 |
| 60~79 | 양호 | 보완 후 실행 가능 — 1~2개 취약 영역 집중 개선 필요 |
| 40~59 | 보통 | 전략 수정 필요 — 핵심 가설 재검증 권장 |
| 39 이하 | 개선 필요 | 아이디어 재검토 필요 — 고객 인터뷰부터 시작 |

---

## 5. 5대 분석 영역 상세

### 5-1. Problem Clarity (문제 명확성) — 가중치 20%

**평가 목적:** 해결하려는 문제가 얼마나 구체적이고 검증 가능한 형태로 정의되어 있는가

| Check ID | 레이블 | 배점 | 판정 기준 | 상태 |
|---|---|---|---|---|
| `problem_length` | 문제 설명 구체성 | 20pt | Q1 ≥ 30자 | pass/fail |
| `problem_specific` | 문제 정량화 | 25pt | Q1에 숫자/비율/빈도 포함 (`\d+`, `%`, `배`, `명` 등) | pass/warn |
| `target_clarity` | 타겟 고객 명확성 | 20pt | Q2 ≥ 20자 | pass/fail |
| `target_specific` | 타겟 고객 구체성 | 20pt | Q2에 직업/연령/행동 키워드 포함 | pass/warn |
| `problem_urgency` | 문제 긴급성 | 15pt | Q1에 긴급성 키워드 포함 (매일, 불편, 힘들 등) | pass/warn |

**최대 rawScore:** 100
**정규화 공식:** `score = round(rawScore / 100 * 100)`

---

### 5-2. Market Demand (시장 수요) — 가중치 25%

**평가 목적:** 해결하려는 문제에 실제 시장 수요가 있는가

| Check ID | 레이블 | 배점 | 판정 기준 | 상태 |
|---|---|---|---|---|
| `has_existing_solution` | 기존 대안 존재 여부 | 20pt | Q3 ≠ '없음' | pass/fail |
| `existing_solution_quality` | 기존 대안 불만족도 | 15pt (보너스) | Q3 = '있지만 불편함' | pass/warn |
| `market_size_provided` | 시장 규모 추정 작성 | 20pt | Q4 입력 있음 (≥ 1자) | pass/partial |
| `market_size_quantified` | 시장 규모 수치화 | 25pt | Q4에 숫자 포함 | pass/warn/partial |
| `market_validation` | 시장 수요 복합 검증 | 20pt | Q3 ≠ '없음' AND Q4 입력됨 | pass/warn |

**최대 rawScore:** 100 (보너스 포함 시 최대 115 → `Math.min(rawScore, maxRawScore)` 클램핑)

> ⚠️ **보너스 클램핑:** Q3 = '있지만 불편함' 선택 시 +15pt 보너스가 발생하지만, rawScore는 최대 maxRawScore(100)로 클램핑되므로 100점 초과가 발생하지 않는다.

---

### 5-3. Differentiation (차별성) — 가중치 20%

**평가 목적:** 기존 대안과 비교했을 때 명확하고 측정 가능한 차별점이 있는가

| Check ID | 레이블 | 배점 | 판정 기준 | 상태 |
|---|---|---|---|---|
| `diff_length` | 차별점 설명 구체성 | 20pt | Q5 ≥ 20자 | pass/fail |
| `diff_specific` | 차별화 동사 포함 | 30pt | Q5에 차별화 동사 포함 (더, 빠르게, 자동, 저렴 등) | pass/warn |
| `diff_unique` | 독자성 표현 | 20pt | Q5에 유일성 키워드 포함 (유일, 처음, 없는, 최초 등) | pass/warn |
| `diff_measurable` | 차별점 수치화 | 30pt | Q5에 숫자/비율 포함 | pass/warn |

**최대 rawScore:** 100

---

### 5-4. Distribution Strategy (고객 확보 전략) — 가중치 20%

**평가 목적:** 첫 고객을 실제로 확보할 수 있는 구체적인 계획이 있는가

| Check ID | 레이블 | 배점 | 판정 기준 | 상태 |
|---|---|---|---|---|
| `channel_count` | 고객 확보 채널 수 | 최대 40pt | Q6 선택 수 × 10pt (max 40) | pass/warn/fail |
| `has_concrete_plan` | 채널 실행 계획 | 30pt | Q7 ≥ 20자 | pass/warn/partial |
| `plan_actionable` | 실행 가능한 액션 포함 | 30pt | Q7에 실행 가능 키워드 포함 (페이지, 광고, 이메일 등) | pass/warn/partial |

**채널 수별 상태:**

| 선택 수 | 상태 |
|---|---|
| 0개 | fail (0pt) |
| 1~2개 | warn (10~20pt) |
| 3개 이상 | pass (30~40pt) |

---

### 5-5. Execution Readiness (실행 준비도) — 가중치 15%

**평가 목적:** 현재 단계와 투입 가능한 자원이 실제 실행에 충분한가

| Check ID | 레이블 | 배점 | 판정 기준 | 상태 |
|---|---|---|---|---|
| `stage_score` | 사업 진행 단계 | 최대 90pt | Q8 선택값에 따라 고정 점수 | pass/warn/fail |
| `time_score` | 투입 가능 시간 | 최대 80pt | Q9 선택값에 따라 고정 점수 | pass/warn/fail |
| `resource_count` | 보유 자원 | 최대 40pt | Q10 선택 수 × 8pt (max 40) | pass/warn/fail |
| `stage_time_match` | 단계-시간 현실성 | 10pt (보너스) | 단계와 시간이 현실적으로 매칭될 때 | pass/warn |

**단계-시간 불일치 패턴 (패널티):**

| 단계 | 시간 | 판정 | 이유 |
|---|---|---|---|
| 아이디어 | 풀타임 | warn (0pt) | 아이디어 단계에서 풀타임 투자는 현실 불일치 |
| MVP개발중 | 5시간미만 | warn (0pt) | MVP를 5시간 미만으로 개발하는 것은 불가 |
| 초기고객보유 | 5시간미만 | warn (0pt) | 고객이 있는 단계에서 5시간 미만은 방치 수준 |

**최대 rawScore:** 220 (90 + 80 + 40 + 10)
**정규화:** `score = round(rawScore / 220 * 100)`

---

## 6. Minary 우선순위 엔진

### 우선순위 계산식

```
priority = (dimensionWeight × 100 × gap) / (estimatedHours + effort)
```

| 변수 | 정의 | 값 범위 |
|---|---|---|
| `dimensionWeight` | 해당 영역의 가중치 | 0.15 ~ 0.25 |
| `gap` | 해당 check의 maxScore - score (회수 가능 점수) | ≥ 0 |
| `estimatedHours` | 해당 Task의 예상 소요 시간 (분 → 시간 변환) | ≥ 0.1 (min clamp) |
| `effort` | 해당 Task의 난이도 | 1 ~ 5 |

### 계산 과정

1. pass 상태인 check는 제외 (gap = 0이므로 의미 없음)
2. gap > 0인 fail/warn/partial check에 대해 priority 계산
3. priority 내림차순 정렬
4. 상위 5개 선택 → `rank` 1~5 부여

### 예시 계산

```
check: market_size_quantified
  gap = 25 (maxScore 25, score 0)
  dimensionWeight = 0.25 (Market Demand)
  estimatedHours = 60분 / 60 = 1.0시간
  effort = 4

priority = (0.25 × 100 × 25) / (1.0 + 4) = 625 / 5 = 125
```

---

## 7. Minary Task 템플릿 21개

각 check ID에 1:1로 매핑된 즉시 실행 가능한 과제 목록.

### Problem Clarity (5개)

| Check ID | Task 제목 | 예상 시간 | Impact | Effort | Severity |
|---|---|---|---|---|---|
| `problem_length` | 고객 인터뷰 질문지 3개 작성하기 | 30분 | 8 | 2 | high |
| `problem_specific` | 문제 발생 빈도와 규모를 수치로 정리하기 | 30분 | 7 | 2 | medium |
| `target_clarity` | 타겟 고객 페르소나 1장 카드 작성하기 | 60분 | 7 | 3 | high |
| `target_specific` | 타겟 고객 구체화 (직업/연령/행동 패턴 포함) | 30분 | 6 | 2 | medium |
| `problem_urgency` | 고객 불편 감정을 문제 설명에 반영하기 | 20분 | 5 | 1 | low |

### Market Demand (6개)

| Check ID | Task 제목 | 예상 시간 | Impact | Effort | Severity |
|---|---|---|---|---|---|
| `has_existing_solution` | 현재 고객이 사용하는 대안 서비스 3개 조사하기 | 60분 | 8 | 3 | high |
| `existing_solution_quality` | 기존 대안의 불편함 포인트 3개 정리하기 | 45분 | 8 | 2 | medium |
| `market_size_provided` | 유사 서비스 MAU/사용자 수 조사하기 | 90분 | 8 | 4 | high |
| `market_size_quantified` | 시장 규모 계산식 작성하기 (TAM/SAM/SOM) | 60분 | 9 | 4 | high |
| `market_validation` | 고객 반응 조사 (설문 5명 이상) | 120분 | 9 | 5 | high |

### Differentiation (4개)

| Check ID | Task 제목 | 예상 시간 | Impact | Effort | Severity |
|---|---|---|---|---|---|
| `diff_length` | 핵심 가치 제안 한 문장으로 정리하기 | 30분 | 7 | 2 | medium |
| `diff_specific` | 경쟁 비교표 작성하기 (우리 vs 경쟁사 A vs B) | 60분 | 8 | 3 | high |
| `diff_unique` | 우리만의 독자적 강점 1개 발굴하기 | 45분 | 7 | 3 | medium |
| `diff_measurable` | 차별점을 수치로 표현하기 | 30분 | 8 | 2 | high |

### Distribution Strategy (3개)

| Check ID | Task 제목 | 예상 시간 | Impact | Effort | Severity |
|---|---|---|---|---|---|
| `channel_count` | 첫 고객 확보 채널 1개 선정 + 실행 계획 작성 | 30분 | 9 | 2 | high |
| `has_concrete_plan` | 랜딩페이지 초안 작성하기 (헤드라인 + CTA) | 60분 | 8 | 3 | high |
| `plan_actionable` | 첫 주 고객 확보 액션 3개 구체화하기 | 30분 | 7 | 2 | medium |

### Execution Readiness (4개)

| Check ID | Task 제목 | 예상 시간 | Impact | Effort | Severity |
|---|---|---|---|---|---|
| `stage_score` | 가설 검증 체크리스트 1개 완성하기 | 45분 | 8 | 3 | high |
| `time_score` | 주간 작업 스케줄 블로킹하기 | 20분 | 6 | 1 | medium |
| `resource_count` | 보유 자원 인벤토리 작성 + 부족한 자원 파악 | 30분 | 5 | 2 | low |
| `stage_time_match` | 현재 단계에 맞는 마일스톤 3개 설정하기 | 30분 | 7 | 2 | medium |

---

## 8. 텍스트 파서 — Heuristic 감지 엔진

파일: `app/lib/idea/utils/textParser.ts`

모든 함수는 순수 함수(pure function). 외부 의존성 없음. 서버/클라이언트 양쪽에서 import 가능.

### `meetsMinLength(text, minChars)`

텍스트가 최소 글자 수를 충족하는지 확인.

```typescript
meetsMinLength("안녕하세요", 5)  // true
meetsMinLength("  짧음  ", 5)    // false (trim 후 2자)
```

### `containsQuantifier(text)`

숫자, 비율, 수량 표현이 포함되어 있는지 감지.

감지 패턴: `/\d+|%|배|명|원|개|회|번|달러|만|억/`

```typescript
containsQuantifier("매일 3회 발생")   // true (\d+)
containsQuantifier("50% 비율로")      // true (%)
containsQuantifier("100만 명 규모")   // true (\d+, 만)
containsQuantifier("자주 불편함")     // false
```

### `containsUrgencyKeyword(text)`

고객이 문제를 겪을 때의 부정적 감정/상황을 표현하는 키워드 감지.

감지 키워드: `매일`, `자주`, `불편`, `힘들`, `어렵`, `문제`, `고통`, `답답`, `시간낭비`, `비효율`, `불만`, `짜증`

### `containsTargetKeyword(text)`

타겟 고객의 특성(직업, 연령대, 행동 패턴)을 나타내는 키워드 감지.

감지 키워드:
- 직업군: `개발자`, `디자이너`, `스타트업`, `학생`, `프리랜서`, `직장인`, `창업자`, `CEO`, `마케터`, `소상공인`, `사업자`, `대학생`, `취준생`
- 연령대: `30대`, `20대`, `40대`, `50대`
- B2B/B2C: `B2B`, `B2C`
- 행동 패턴: `직업`, `업무`, `매일`, `주기적`, `정기적`

### `containsDiffVerb(text)`

차별화를 표현하는 동사/형용사 감지.

감지 키워드: `더`, `빠르게`, `빠른`, `자동`, `저렴`, `쉽게`, `쉬운`, `즉시`, `간편`, `정확`, `효율`, `절약`, `자동화`

### `containsUniquenessKeyword(text)`

유일성/독자성을 표현하는 키워드 감지.

감지 키워드: `유일`, `처음`, `없는`, `새로운`, `최초`, `독자`, `혁신`, `특허`, `독보`

### `containsActionableKeyword(text)`

실행 가능한 채널/수단을 나타내는 키워드 감지.

감지 키워드: `페이지`, `광고`, `이메일`, `메시지`, `포스팅`, `커뮤니티`, `소개`, `발송`, `운영`, `예약`, `인스타`, `유튜브`, `블로그`, `카카오`, `네이버`

---

## 9. API 명세

### `POST /api/idea/analyze`

#### 요청

```typescript
{
  "answers": {
    "problem": string,              // Q1 필수
    "targetCustomer": string,       // Q2 필수
    "existingSolution": "없음" | "부족함" | "있지만 불편함" | "충분히 있음",  // Q3 필수
    "marketSize": string,           // Q4 선택 (미응답 시 "")
    "valueProp": string,            // Q5 필수
    "channels": string[],           // Q6 선택 (미선택 시 [])
    "channelPlan": string,          // Q7 선택 (미응답 시 "")
    "stage": "아이디어" | "가설검증중" | "MVP개발중" | "초기고객보유",  // Q8 필수
    "weeklyHours": "5시간미만" | "5~15시간" | "15~30시간" | "풀타임",   // Q9 필수
    "resources": string[]           // Q10 선택 (미선택 시 [])
  }
}
```

#### 응답 (200 OK)

```typescript
{
  "analyzedAt": "2026-03-17T12:00:00.000Z",  // ISO 8601
  "ideaScore": 67,                            // 0~100 정수
  "dimensions": {
    "problemClarity": {
      "score": 60,          // 0~100 정수
      "rawScore": 60,       // 실제 획득 점수
      "maxRawScore": 100,   // 최대 가능 점수
      "checks": [
        {
          "id": "problem_length",
          "label": "문제 설명 구체성",
          "status": "pass",   // "pass" | "warn" | "fail" | "partial"
          "score": 20,
          "maxScore": 20,
          "detail": "45자 작성 완료"
        },
        // ... 나머지 4개 check
      ]
    },
    "marketDemand": { /* 동일 구조 */ },
    "differentiation": { /* 동일 구조 */ },
    "distributionStrategy": { /* 동일 구조 */ },
    "executionReadiness": { /* 동일 구조 */ }
  },
  "topTasks": [
    {
      "rank": 1,
      "checkId": "market_size_quantified",
      "dimension": "marketDemand",
      "title": "시장 규모 계산식 작성하기 (TAM/SAM/SOM)",
      "body": "\"국내 타겟 고객 N만 명 × 평균 지불 의향 월 N원 = 연간 N억 원\" 형태로 시장 규모 계산식을 작성하세요.",
      "estimatedMinutes": 60,
      "gap": 25,
      "priority": 125.0,
      "severity": "high"
    },
    // ... 최대 5개
  ],
  "partialWarning": false   // 선택 필드 미응답 시 true
}
```

#### 오류 응답

| 상태 코드 | 조건 | 응답 |
|---|---|---|
| 400 | 필수 필드 누락 (problem, targetCustomer, existingSolution, valueProp, stage, weeklyHours) | `{ "error": "필수 항목이 누락되었습니다." }` |
| 500 | 내부 처리 오류 | `{ "error": "분석 중 오류가 발생했습니다." }` |

#### 테스트 curl 예시

```bash
curl -X POST http://localhost:3000/api/idea/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "problem": "중소기업 마케터들이 SNS 콘텐츠를 만들 때 매일 2~3시간을 소비하는데 전문 디자이너가 없어 힘들어합니다",
      "targetCustomer": "직원 10명 미만 스타트업의 30대 마케터. 매일 SNS를 운영하지만 디자인 툴이 익숙하지 않은 실무자",
      "existingSolution": "있지만 불편함",
      "marketSize": "국내 스타트업 약 3만 개, 월 10만원 구독료 가정 시 연간 360억 원 규모",
      "valueProp": "기존 Canva 대비 한국 SNS 포맷에 최적화된 템플릿을 자동 추천하고 제작 시간을 3배 단축합니다",
      "channels": ["랜딩페이지", "커뮤니티"],
      "channelPlan": "스타트업 커뮤니티에 소개 포스팅 후 DM으로 30명에게 무료 체험 제안",
      "stage": "가설검증중",
      "weeklyHours": "5~15시간",
      "resources": ["도메인지식", "네트워크", "기술스택"]
    }
  }'
```

---

## 10. UI 구조 — 대시보드 4-Zone

결과 화면은 "중요도 높은 것이 먼저 보이도록" 4개 존으로 구성된다.

```
┌─────────────────────────────────────────┐
│  Zone 1 — Verdict (판정)                │
│  Loam Score 게이지 + 5개 영역 점수 칩    │
│  분석 시각 + "다시 분석하기" 버튼         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Zone 2 — Radar (레이더 차트)            │
│  5축 SVG 레이더 차트 (라이브러리 없음)    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Zone 3 — Action (실행 과제)             │
│  MinaryTasks: Top 5 우선 과제            │
│  각 카드: 영역 배지 + 제목 + 실행 방법   │
│           + 예상 시간 + 중요도 + gap     │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Zone 4 — Detail (상세 진단)             │
│  5개 영역별 DimensionCheckList           │
│  기본 접힘(collapsed) — 클릭 시 펼침     │
│  fail 항목이 warn보다 먼저 정렬됨         │
└─────────────────────────────────────────┘
```

### 설문 UI

```
┌─────────────────────────────────────────┐
│  StepIndicator: ●─●─○─○─○  (2/5)       │
│  진행 바 + 단계 레이블 (문제/시장/...)   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  2 / 5                                  │
│  시장 환경은 어떤가요?                   │
│  기존 대안과 시장 규모를 파악하고 있나요  │
│                                         │
│  Q3: [ 없음 ] [부족함] [있지만 불편함] ..│
│  Q4: [텍스트 입력 영역]                  │
│                                         │
│  [← 이전]               [다음 →]        │
└─────────────────────────────────────────┘
```

### RadarChart SVG 수학

```
N = 5, angleStep = 2π/5
각 축 각도 = -π/2 + (i × angleStep)  ← 12시 방향에서 시작
그리드 꼭짓점: (cx + level×R×cos(angle), cy + level×R×sin(angle))
데이터 꼭짓점: (cx + (score/100)×R×cos(angle), ...)
레이블 위치: (cx + (R+32)×cos(angle), ...)
text-anchor: 왼쪽축='end', 오른쪽축='start', 상하='middle'
viewBox: "-48 -48 356 356"  ← 레이블 잘림 방지용 여백
```

---

## 11. 코드 아키텍처

### 전체 파일 구조

```
app/
├── idea/
│   └── page.tsx                    ← /idea 라우트 (useReducer wizard)
│
├── api/idea/analyze/
│   └── route.ts                    ← POST /api/idea/analyze
│
├── components/idea/
│   ├── StepIndicator.tsx           ← 5단계 진행 표시 컴포넌트
│   ├── SurveyStep.tsx              ← 단계별 질문 렌더러 + 유효성 검사
│   ├── RadarChart.tsx              ← SVG 5축 레이더 차트
│   ├── MinaryTasks.tsx             ← Top 5 Priority Tasks 카드
│   └── IdeaDashboard.tsx           ← 결과 대시보드 (4-zone 통합)
│
└── lib/idea/
    ├── types/
    │   └── idea.ts                 ← 모든 공유 타입 (단일 진실 소스)
    ├── utils/
    │   └── textParser.ts           ← 순수 함수 파서 (6개 함수)
    ├── actions/
    │   └── minaryTemplates.ts      ← 21개 Minary Task 템플릿
    ├── analyzers/
    │   ├── problem.ts              ← analyzeProblemClarity()
    │   ├── market.ts               ← analyzeMarketDemand()
    │   ├── differentiation.ts      ← analyzeDifferentiation()
    │   ├── distribution.ts         ← analyzeDistributionStrategy()
    │   └── execution.ts            ← analyzeExecutionReadiness()
    └── scoring/
        └── loamScore.ts            ← computeIdeaScore() + buildTopTasks()
```

### 의존성 그래프

```
idea.ts (types)
    ↑
textParser.ts (utils)   minaryTemplates.ts (actions)
    ↑                           ↑
problem.ts  market.ts  differentiation.ts  distribution.ts  execution.ts
    ↑──────────────────────────────────────────────────────────↑
loamScore.ts (scoring)
    ↑
route.ts (API)
    ↑
page.tsx (UI) ← IdeaDashboard ← RadarChart, MinaryTasks
              ← SurveyStep ← StepIndicator
```

### 상태 관리 (`app/idea/page.tsx`)

```typescript
type SurveyPhase = 'survey' | 'loading' | 'result' | 'error';

interface SurveyState {
  phase: SurveyPhase;
  currentStep: number;          // 1 ~ 5
  answers: Partial<IdeaFormAnswers>;
  result: IdeaAnalysisResult | null;
  error: string | null;
}
```

**Phase 전환 흐름:**

```
survey → (마지막 단계 "분석 시작" 클릭) → loading → result
                                                   ↘ error
result → (다시 분석하기) → survey (RESET)
error  → (다시 시작하기) → survey (RESET)
```

---

## 12. 등급 기준 및 해석 가이드

`getGrade(score)` 함수 (`app/lib/utils/grading.ts`) 를 재사용하여 점수를 등급으로 변환.

| 점수 범위 | 등급 | 색상 | 다음 행동 |
|---|---|---|---|
| 80~100 | 우수 | 초록 (#22c55e) | MVP 개발 또는 베타 고객 모집 시작 |
| 65~79 | 양호 | 라임 (#84cc16) | Top 2 취약 영역 집중 보완 후 실행 |
| 50~64 | 보통 | 주황 (#f59e0b) | 핵심 가설 재검증, 고객 인터뷰 10명 이상 수행 |
| 0~49 | 개선 필요 | 빨강 (#ef4444) | 아이디어 피벗 검토, 문제 재정의부터 시작 |

---

## 13. Partial Analysis 처리

선택 필드(Q4, Q7, Q6, Q10)에 응답이 없어도 분석은 계속 진행된다.

| 항목 | 미응답 시 처리 |
|---|---|
| Q4 (시장 규모) | `market_size_provided`, `market_size_quantified` → status: `partial`, score: 0 |
| Q7 (채널 계획) | `has_concrete_plan`, `plan_actionable` → status: `partial`, score: 0 |
| Q6 (채널 선택) | `channel_count` → status: `fail`, score: 0 |
| Q10 (자원 선택) | `resource_count` → status: `fail`, score: 0 |

`partial` check가 하나라도 있으면 `partialWarning: true` 반환.
→ 대시보드 Zone 1 상단에 amber 배너 표시: "일부 항목이 비어 있습니다. 모든 항목을 입력하면 더 정확한 결과를 받을 수 있습니다."

**`partial` vs `fail` 차이:**

| 상태 | 의미 |
|---|---|
| `fail` | 입력했지만 기준 미달 (예: 30자 미만, 채널 0개) |
| `partial` | 아예 입력하지 않음 (선택 항목 미응답) |

---

## 14. 기존 LOAM URL 분석과의 관계

이 모듈은 기존 URL 분석 기능과 **완전히 독립적**이다.

| 구분 | 기존 LOAM URL 분석 | Idea Validation 모듈 |
|---|---|---|
| **라우트** | `/` | `/idea` |
| **API** | `POST /api/analyze` | `POST /api/idea/analyze` |
| **입력** | URL (웹사이트) | 설문 응답 (아이디어) |
| **출력** | Visibility Score | Loam Score |
| **분석 방식** | HTML 파싱 (cheerio) | Rule-based 텍스트 분석 |
| **대상** | 웹사이트 운영자 | 예비 창업자 |

**공유하는 코드:**
- `app/lib/utils/grading.ts` → `getGrade(score)` 함수만 import

**공유하지 않는 코드:** (타입 충돌 방지)
- `CATEGORY_COLORS` — idea 도메인은 독자적인 `DIMENSION_COLORS` 상수 사용
- `TopIssues.tsx` — `MinaryTasks.tsx`로 독립 구현
- `IssueList.tsx` — `partial` status가 없어 재사용 불가, `DimensionCheckList`로 독립 구현
- `ScoreStrip.tsx` — prop shape 불일치, `IdeaGauge` SVG 로직 재구현

---

## 15. 점수 예시 시뮬레이션

### 예시 입력 (잘 작성된 경우)

```
Q1: "중소기업 마케터들이 SNS 콘텐츠를 만들 때 매일 2~3시간을 소비하는데
     전문 디자이너가 없어 힘들어합니다" (53자)
Q2: "직원 10명 미만 스타트업의 30대 마케터" (21자)
Q3: 있지만 불편함
Q4: "국내 스타트업 약 3만 개, 월 10만원 × 12개월 = 연간 360억 원"
Q5: "기존 Canva 대비 한국 SNS 포맷에 최적화된 템플릿을 자동 추천하고
     제작 시간을 3배 단축합니다"
Q6: [랜딩페이지, 커뮤니티]
Q7: "스타트업 커뮤니티에 소개 포스팅 후 DM으로 30명 무료 체험 제안"
Q8: 가설검증중
Q9: 5~15시간
Q10: [도메인지식, 네트워크, 기술스택]
```

**예상 채점:**

| 영역 | rawScore | maxRaw | score | 가중 기여 |
|---|---|---|---|---|
| Problem Clarity | 75 | 100 | 75 | 15.0 |
| Market Demand | 100 | 100 | 100 | 25.0 |
| Differentiation | 80 | 100 | 80 | 16.0 |
| Distribution | 80 | 100 | 80 | 16.0 |
| Execution | 143 | 220 | 65 | 9.75 |
| **Loam Score** | | | **82** | |

**등급:** 우수 (80 이상)

---

### 예시 입력 (미흡한 경우)

```
Q1: "앱이 불편해요" (8자)
Q2: "20대" (3자)
Q3: 없음
Q4: (미입력)
Q5: "더 좋아요" (6자)
Q6: [] (미선택)
Q7: (미입력)
Q8: 아이디어
Q9: 5시간미만
Q10: [] (미선택)
```

**예상 채점:**

| 영역 | score | 가중 기여 |
|---|---|---|
| Problem Clarity | 0 | 0.0 |
| Market Demand | 0 | 0.0 |
| Differentiation | 0 | 0.0 |
| Distribution | 0 | 0.0 |
| Execution | 13 | 2.0 |
| **Loam Score** | **2** | |

**등급:** 개선 필요 — partialWarning: true

---

## 16. Phase 2 확장 로드맵

### Phase 2 — 저장 및 이력

| 기능 | 설명 |
|---|---|
| 분석 결과 DB 저장 | Prisma + PostgreSQL 또는 Supabase 도입 |
| 재분석 delta 비교 | 이전 분석 대비 점수 변화, 개선된 항목 수 표시 |
| 공유 링크 생성 | 고유 ID 기반 분석 결과 공유 URL |

### Phase 2 — 텍스트 분석 고도화

| 기능 | 설명 |
|---|---|
| 형태소 분석 도입 | 한국어 키워드 오탐 감소 (예: `형태소-분석기` 라이브러리) |
| 문장 구조 감지 | 육하원칙(5W1H) 포함 여부 체크 |
| 경쟁사 명시 여부 | 실제 서비스명 언급 여부 감지 |

### Phase 3 — Progress Tracking

| 기능 | 설명 |
|---|---|
| Minary Task 완료 체크 | 과제별 완료/진행중/미시작 상태 관리 |
| 주간 목표 설정 | 이번 주 완료할 Task 선택 및 알림 |
| 마일스톤 달성 추적 | 단계 진행도 시각화 |

---

*이 모듈은 `npx tsc --noEmit` 0 errors, `npm run build` 정상 빌드 확인 완료.*
*기존 `/` URL 분석 라우트와 완전히 독립적으로 동작하며, 기존 파일 수정 없음.*
