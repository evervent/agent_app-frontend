'use client';

interface StepProgressProps {
  current: number; // 1-based
  total: number;
  labels?: string[];
}

export default function StepProgress({ current, total, labels }: StepProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">
          Step {current} of {total}
        </span>
        {labels && labels[current - 1] && (
          <span className="text-xs font-medium text-blue-700">{labels[current - 1]}</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
