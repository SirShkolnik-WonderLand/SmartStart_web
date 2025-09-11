import * as React from 'react'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

export function Progress({ value = 0, max = 100, className = '', ...props }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      className={`w-full h-2 rounded-full bg-[rgb(var(--border-light))] overflow-hidden ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(percentage)}
      {...props}
    >
      <div
        className="h-full bg-[rgb(var(--btn-primary-bg))] transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export default Progress


