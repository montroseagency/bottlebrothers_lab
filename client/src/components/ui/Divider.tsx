import React from 'react'

interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
  label?: string
}

export const Divider = ({ orientation = 'horizontal', className = '', label }: DividerProps) => {
  if (orientation === 'vertical') {
    return <div className={`w-px bg-neutral-700 ${className}`} />
  }

  if (label) {
    return (
      <div className={`relative flex items-center ${className}`}>
        <div className="flex-grow border-t border-neutral-700" />
        <span className="mx-4 text-sm text-neutral-400 font-medium">{label}</span>
        <div className="flex-grow border-t border-neutral-700" />
      </div>
    )
  }

  return <div className={`h-px bg-neutral-700 ${className}`} />
}
