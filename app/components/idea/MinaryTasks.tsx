'use client';

import type { MinaryPriorityTask, IdeaDimension } from '@/app/lib/idea/types/idea';
import { DIMENSION_LABELS } from '@/app/lib/idea/scoring/loamScore';

const DIMENSION_COLORS: Record<IdeaDimension, { hex: string; bg: string; border: string }> = {
  problemClarity:      { hex: '#6366f1', bg: 'rgba(99,102,241,0.10)',  border: 'rgba(99,102,241,0.30)'  },
  marketDemand:        { hex: '#06b6d4', bg: 'rgba(6,182,212,0.10)',   border: 'rgba(6,182,212,0.30)'   },
  differentiation:     { hex: '#a855f7', bg: 'rgba(168,85,247,0.10)',  border: 'rgba(168,85,247,0.30)'  },
  distributionStrategy:{ hex: '#22c55e', bg: 'rgba(34,197,94,0.10)',   border: 'rgba(34,197,94,0.30)'   },
  executionReadiness:  { hex: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.30)'  },
};

interface MinaryTasksProps {
  tasks: MinaryPriorityTask[];
}

const SEVERITY_LABEL: Record<string, string> = {
  high: '중요',
  medium: '보통',
  low: '낮음',
};

export function MinaryTasks({ tasks }: MinaryTasksProps) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <h3 className="font-semibold text-white">지금 바로 시작할 과제</h3>
        <span className="text-xs text-slate-500">우선순위 높은 순서</span>
      </div>
      <div className="divide-y divide-slate-700/30">
        {tasks.map(task => {
          const col = DIMENSION_COLORS[task.dimension];
          const hrs = task.estimatedMinutes < 60
            ? `${task.estimatedMinutes}분`
            : `${Math.round(task.estimatedMinutes / 60)}시간`;

          return (
            <div
              key={task.checkId}
              className="px-5 py-4"
              style={{ borderLeft: `3px solid ${col.border}`, backgroundColor: col.bg }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: col.hex, color: '#fff' }}
                >
                  {task.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ backgroundColor: col.bg, color: col.hex, border: `1px solid ${col.border}` }}
                    >
                      {DIMENSION_LABELS[task.dimension]}
                    </span>
                    <span className="text-sm font-semibold text-white">{task.title}</span>
                    <span
                      className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: col.bg, color: col.hex, border: `1px solid ${col.border}` }}
                    >
                      {hrs}
                    </span>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg px-3 py-2 mt-2">
                    <p className="text-xs text-amber-400 font-semibold mb-1">
                      &rarr; 실행 방법:
                    </p>
                    <p className="text-sm text-slate-200 leading-relaxed">{task.body}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500">중요도: {SEVERITY_LABEL[task.severity] ?? task.severity}</span>
                    <span className="text-xs text-slate-500">회수 가능: +{Math.round(task.gap)}pt</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
