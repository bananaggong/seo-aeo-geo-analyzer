'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-1 bg-slate-700 rounded-full mb-4">
        <div
          className="h-1 bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
      {/* Steps */}
      <div className="flex justify-between">
        {stepLabels.map((label, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <div key={stepNum} className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-indigo-500 text-white'
                    : isCurrent
                    ? 'bg-indigo-500/20 border-2 border-indigo-400 text-indigo-400'
                    : 'bg-slate-700 text-slate-500'
                }`}
              >
                {isDone ? '✓' : stepNum}
              </div>
              <span
                className={`text-xs hidden sm:block ${
                  isCurrent ? 'text-indigo-400 font-medium' : isDone ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
