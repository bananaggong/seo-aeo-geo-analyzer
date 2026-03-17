export type ExistingSolutionOption = '없음' | '부족함' | '있지만 불편함' | '충분히 있음';
export type StageOption = '아이디어' | '가설검증중' | 'MVP개발중' | '초기고객보유';
export type WeeklyHoursOption = '5시간미만' | '5~15시간' | '15~30시간' | '풀타임';
export type DistributionChannel = '랜딩페이지' | '소셜미디어' | '콜드메일' | '커뮤니티' | '지인네트워크' | '기타';
export type ResourceType = '자본금' | '팀원' | '도메인지식' | '네트워크' | '기술스택';
export type IdeaDimension = 'problemClarity' | 'marketDemand' | 'differentiation' | 'distributionStrategy' | 'executionReadiness';

export interface IdeaFormAnswers {
  problem: string;
  targetCustomer: string;
  existingSolution: ExistingSolutionOption;
  marketSize: string;           // '' = 미응답
  valueProp: string;
  channels: DistributionChannel[];
  channelPlan: string;          // '' = 미응답
  stage: StageOption;
  weeklyHours: WeeklyHoursOption;
  resources: ResourceType[];
}

export interface IdeaCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail' | 'partial';
  score: number;
  maxScore: number;
  detail: string;
}

export interface IdeaDimensionResult {
  score: number;
  rawScore: number;
  maxRawScore: number;
  checks: IdeaCheck[];
}

export interface MinaryTask {
  checkId: string;
  dimension: IdeaDimension;
  title: string;
  body: string;
  estimatedMinutes: number;
  impact: number;
  effort: number;
  severity: 'high' | 'medium' | 'low';
}

export interface MinaryPriorityTask {
  rank: number;
  checkId: string;
  dimension: IdeaDimension;
  title: string;
  body: string;
  estimatedMinutes: number;
  gap: number;
  priority: number;
  severity: 'high' | 'medium' | 'low';
}

export interface IdeaAnalysisResult {
  analyzedAt: string;
  ideaScore: number;
  dimensions: Record<IdeaDimension, IdeaDimensionResult>;
  topTasks: MinaryPriorityTask[];
  partialWarning: boolean;
}
