import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  glassmorphic?: boolean
  hover?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', glassmorphic = false, hover = false, ...props }, ref) => {
    const baseClasses = 'rounded-2xl transition-all duration-300'
    const glassmorphicClasses = glassmorphic
      ? 'backdrop-blur-xl bg-white/10 border border-white/20'
      : 'bg-neutral-800 border border-neutral-700'
    const hoverClasses = hover
      ? 'hover:shadow-luxury hover:border-primary-500/50 hover:-translate-y-1'
      : ''

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${glassmorphicClasses} ${hoverClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
)

export const CardBody = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
)

export const CardFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 flex items-center justify-between ${className}`}>{children}</div>
)
