'use client';

import { useReducer } from 'react';
import { SurveyStep } from '@/app/components/idea/SurveyStep';
import { StepIndicator } from '@/app/components/idea/StepIndicator';
import { IdeaDashboard } from '@/app/components/idea/IdeaDashboard';
import type { IdeaFormAnswers, IdeaAnalysisResult } from '@/app/lib/idea/types/idea';
import Link from 'next/link';

type SurveyPhase = 'survey' | 'loading' | 'result' | 'error';

interface SurveyState {
  phase: SurveyPhase;
  currentStep: number;
  answers: Partial<IdeaFormAnswers>;
  result: IdeaAnalysisResult | null;
  error: string | null;
}

type SurveyAction =
  | { type: 'SET_ANSWER'; field: keyof IdeaFormAnswers; value: IdeaFormAnswers[keyof IdeaFormAnswers] }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SUBMIT' }
  | { type: 'SET_RESULT'; result: IdeaAnalysisResult }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RESET' };

const TOTAL_STEPS = 5;

const INITIAL_STATE: SurveyState = {
  phase: 'survey',
  currentStep: 1,
  answers: {
    channels: [],
    resources: [],
    marketSize: '',
    channelPlan: '',
  },
  result: null,
  error: null,
};

function surveyReducer(state: SurveyState, action: SurveyAction): SurveyState {
  switch (action.type) {
    case 'SET_ANSWER':
      return { ...state, answers: { ...state.answers, [action.field]: action.value } };
    case 'NEXT_STEP':
      return state.currentStep < TOTAL_STEPS
        ? { ...state, currentStep: state.currentStep + 1 }
        : state;
    case 'PREV_STEP':
      return state.currentStep > 1
        ? { ...state, currentStep: state.currentStep - 1 }
        : state;
    case 'SUBMIT':
      return { ...state, phase: 'loading' };
    case 'SET_RESULT':
      return { ...state, phase: 'result', result: action.result };
    case 'SET_ERROR':
      return { ...state, phase: 'error', error: action.error };
    case 'RESET':
      return INITIAL_STATE;
    default:
      return state;
  }
}

const STEP_LABELS = ['문제', '시장', '차별성', '확보', '실행'];

const STEP_TITLES: Record<number, { title: string; desc: string }> = {
  1: { title: '어떤 문제를 해결하나요?', desc: '해결하려는 문제와 고객을 구체적으로 설명하세요' },
  2: { title: '시장 환경은 어떤가요?', desc: '기존 대안과 시장 규모를 파악하고 있나요' },
  3: { title: '우리의 차별점은 무엇인가요?', desc: '기존 대안 대비 핵심 가치를 명확히 하세요' },
  4: { title: '첫 고객을 어떻게 확보하나요?', desc: '고객 확보 채널과 구체적인 실행 계획을 작성하세요' },
  5: { title: '실행 준비는 되어 있나요?', desc: '현재 단계, 투입 시간, 보유 자원을 알려주세요' },
};

export default function IdeaPage() {
  const [state, dispatch] = useReducer(surveyReducer, INITIAL_STATE);

  const handleSubmit = async () => {
    dispatch({ type: 'SUBMIT' });
    try {
      const res = await fetch('/api/idea/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: state.answers }),
      });
      const data = await res.json() as IdeaAnalysisResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? '분석 오류');
      dispatch({ type: 'SET_RESULT', result: data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err instanceof Error ? err.message : '알 수 없는 오류' });
    }
  };

  const handleNext = () => {
    if (state.currentStep === TOTAL_STEPS) {
      void handleSubmit();
    } else {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Foresting OS</h1>
            <p className="text-xs text-slate-400">아이디어 진단 · Loam Score</p>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            &larr; 웹사이트 분석
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Loading */}
        {state.phase === 'loading' && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-400">아이디어를 분석하고 있습니다...</p>
          </div>
        )}

        {/* Error */}
        {state.phase === 'error' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center space-y-4">
            <p className="text-red-400 font-medium">분석 중 오류가 발생했습니다</p>
            <p className="text-sm text-slate-400">{state.error}</p>
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="px-5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              다시 시작하기
            </button>
          </div>
        )}

        {/* Result */}
        {state.phase === 'result' && state.result && (
          <IdeaDashboard result={state.result} onReset={() => dispatch({ type: 'RESET' })} />
        )}

        {/* Survey */}
        {state.phase === 'survey' && (
          <div className="space-y-8">
            {/* Step indicator */}
            <StepIndicator
              currentStep={state.currentStep}
              totalSteps={TOTAL_STEPS}
              stepLabels={STEP_LABELS}
            />

            {/* Question card */}
            <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {state.currentStep} / {TOTAL_STEPS}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">
                  {STEP_TITLES[state.currentStep]?.title}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {STEP_TITLES[state.currentStep]?.desc}
                </p>
              </div>

              <SurveyStep
                step={state.currentStep}
                answers={state.answers}
                onAnswer={(field, value) => dispatch({ type: 'SET_ANSWER', field, value })}
                onNext={handleNext}
                onPrev={() => dispatch({ type: 'PREV_STEP' })}
                isFirstStep={state.currentStep === 1}
                isLastStep={state.currentStep === TOTAL_STEPS}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
