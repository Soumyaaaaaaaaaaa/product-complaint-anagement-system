import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  circle?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  circle = false,
}) => {
  const style = {
    width: width,
    height: height,
    borderRadius: circle ? '50%' : undefined,
  }

  return (
    <div
      style={style}
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`}
    />
  )
}

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="w-full">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-t-lg w-full mb-2 animate-pulse" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 mb-2">
          {[...Array(columns)].map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton circle width={40} height={40} />
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}
