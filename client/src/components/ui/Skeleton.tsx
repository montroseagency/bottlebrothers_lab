import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export const Skeleton = ({ className = '', variant = 'rectangular', width, height }: SkeletonProps) => {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  }

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  }

  return (
    <div
      className={`animate-pulse bg-neutral-700 ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

export const SkeletonCard = () => (
  <div className="bg-neutral-800 rounded-2xl p-6 space-y-4">
    <Skeleton variant="rectangular" height={200} />
    <div className="space-y-3">
      <Skeleton variant="text" width="75%" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="50%" />
    </div>
  </div>
)
