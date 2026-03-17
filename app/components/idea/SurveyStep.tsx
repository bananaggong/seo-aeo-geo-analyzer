'use client';

import type {
  IdeaFormAnswers,
  ExistingSolutionOption,
  StageOption,
  WeeklyHoursOption,
  DistributionChannel,
  ResourceType,
} from '@/app/lib/idea/types/idea';

interface SurveyStepProps {
  step: number;
  answers: Partial<IdeaFormAnswers>;
  onAnswer: (field: keyof IdeaFormAnswers, value: IdeaFormAnswers[keyof IdeaFormAnswers]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const REQUIRED_FIELDS: Record<number, (keyof IdeaFormAnswers)[]> = {
  1: ['problem', 'targetCustomer'],
  2: ['existingSolution'],
  3: ['valueProp'],
  4: [],
  5: ['stage', 'weeklyHours'],
};

function isStepValid(step: number, answers: Partial<IdeaFormAnswers>): boolean {
  return REQUIRED_FIELDS[step]?.every(f => {
    const val = answers[f];
    if (typeof val === 'string') return val.trim().length > 0;
    return val !== undefined;
  }) ?? true;
}

function SelectButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
        selected
          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
          : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
      }`}
    >
      {label}
    </button>
  );
}

function ToggleButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
        selected
          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
          : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
      }`}
    >
      {selected ? '✓ ' : ''}{label}
    </button>
  );
}

export function SurveyStep({ step, answers, onAnswer, onNext, onPrev, isFirstStep, isLastStep }: SurveyStepProps) {
  const valid = isStepValid(step, answers);

  const SOLUTION_OPTIONS: ExistingSolutionOption[] = ['없음', '부족함', '있지만 불편함', '충분히 있음'];
  const STAGE_OPTIONS: StageOption[] = ['아이디어', '가설검증중', 'MVP개발중', '초기고객보유'];
  const HOURS_OPTIONS: WeeklyHoursOption[] = ['5시간미만', '5~15시간', '15~30시간', '풀타임'];
  const CHANNEL_OPTIONS: DistributionChannel[] = ['랜딩페이지', '소셜미디어', '콜드메일', '커뮤니티', '지인네트워크', '기타'];
  const RESOURCE_OPTIONS: ResourceType[] = ['자본금', '팀원', '도메인지식', '네트워크', '기술스택'];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                어떤 문제를 해결하려 하나요? <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-slate-400 mb-3">고객이 겪는 구체적인 어려움을 설명하세요. 빈도나 규모를 포함하면 좋습니다.</p>
              <textarea
                value={answers.problem ?? ''}
                onChange={e => onAnswer('problem', e.target.value)}
                placeholder="예: 중소기업 마케터들이 SNS 콘텐츠를 만들 때 매일 2~3시간을 소비하는데, 전문 디자이너가 없어서 퀄리티가 낮아 어려움을 겪습니다."
                rows={4}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                이 문제를 겪는 주요 고객은 누구인가요? <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-slate-400 mb-3">직업, 연령대, 행동 패턴을 포함하면 점수가 높아집니다.</p>
              <textarea
                value={answers.targetCustomer ?? ''}
                onChange={e => onAnswer('targetCustomer', e.target.value)}
                placeholder="예: 직원 10명 미만 스타트업의 30대 마케터. 매일 SNS를 운영하지만 디자인 툴이 익숙하지 않은 실무자."
                rows={3}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                현재 이 문제를 해결하는 기존 대안이 있나요? <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SOLUTION_OPTIONS.map(opt => (
                  <SelectButton
                    key={opt}
                    label={opt}
                    selected={answers.existingSolution === opt}
                    onClick={() => onAnswer('existingSolution', opt)}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                이 시장의 잠재 규모를 어떻게 추정하나요?
                <span className="text-xs text-slate-400 ml-2">(선택)</span>
              </label>
              <p className="text-xs text-slate-400 mb-3">구체적인 수치가 있으면 점수가 높아집니다. 예: "국내 중소기업 50만 개 × 월 구독료 5만원"</p>
              <textarea
                value={answers.marketSize ?? ''}
                onChange={e => onAnswer('marketSize', e.target.value)}
                placeholder="예: 국내 스타트업 약 3만 개, 각 팀당 월 10만원 지불 의향 가정 시 연간 약 360억 원 규모"
                rows={3}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                기존 대안 대비 가장 큰 차이점(핵심 가치)은 무엇인가요? <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-slate-400 mb-3">수치나 구체적인 동사로 표현하면 점수가 높아집니다. 예: "N배 빠른", "자동으로 ~하는"</p>
              <textarea
                value={answers.valueProp ?? ''}
                onChange={e => onAnswer('valueProp', e.target.value)}
                placeholder="예: 기존 Canva 대비 한국 SNS 포맷에 최적화된 템플릿을 자동 추천하고, 제작 시간을 3배 단축합니다. 국내 트렌드 반영 업데이트를 매주 제공합니다."
                rows={4}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                첫 고객을 어떻게 확보할 계획인가요?
                <span className="text-xs text-slate-400 ml-2">(복수 선택 가능)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CHANNEL_OPTIONS.map(opt => (
                  <ToggleButton
                    key={opt}
                    label={opt}
                    selected={(answers.channels ?? []).includes(opt)}
                    onClick={() => {
                      const curr = answers.channels ?? [];
                      onAnswer('channels', curr.includes(opt) ? curr.filter(c => c !== opt) : [...curr, opt]);
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                첫 고객 확보 채널에 대한 구체적 계획이 있나요?
                <span className="text-xs text-slate-400 ml-2">(선택)</span>
              </label>
              <textarea
                value={answers.channelPlan ?? ''}
                onChange={e => onAnswer('channelPlan', e.target.value)}
                placeholder="예: 스타트업 커뮤니티(스타트업 얼라이언스, 디스콰이엇)에 소개 포스팅 작성 후 DM으로 30명에게 무료 체험 제안"
                rows={3}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                현재 아이디어 단계는? <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {STAGE_OPTIONS.map(opt => (
                  <SelectButton
                    key={opt}
                    label={opt}
                    selected={answers.stage === opt}
                    onClick={() => onAnswer('stage', opt)}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                주당 투입 가능 시간은? <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {HOURS_OPTIONS.map(opt => (
                  <SelectButton
                    key={opt}
                    label={opt}
                    selected={answers.weeklyHours === opt}
                    onClick={() => onAnswer('weeklyHours', opt)}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                보유 자원을 선택하세요.
                <span className="text-xs text-slate-400 ml-2">(복수 선택 가능)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {RESOURCE_OPTIONS.map(opt => (
                  <ToggleButton
                    key={opt}
                    label={opt}
                    selected={(answers.resources ?? []).includes(opt)}
                    onClick={() => {
                      const curr = answers.resources ?? [];
                      onAnswer('resources', curr.includes(opt) ? curr.filter(r => r !== opt) : [...curr, opt]);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {renderStep()}
      <div className="flex justify-between pt-4 border-t border-slate-700/50">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirstStep}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-400 border border-slate-600 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          &larr; 이전
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!valid}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isLastStep ? '분석 시작 →' : '다음 →'}
        </button>
      </div>
    </div>
  );
}
