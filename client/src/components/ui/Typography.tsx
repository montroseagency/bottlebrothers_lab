import React from 'react'

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const Heading = ({ children, as = 'h2', className = '', ...props }: HeadingProps) => {
  const Tag = as
  const baseClasses = 'font-display font-bold text-white'
  const sizeClasses = {
    h1: 'text-5xl md:text-6xl lg:text-7xl',
    h2: 'text-4xl md:text-5xl lg:text-6xl',
    h3: 'text-3xl md:text-4xl lg:text-5xl',
    h4: 'text-2xl md:text-3xl lg:text-4xl',
    h5: 'text-xl md:text-2xl lg:text-3xl',
    h6: 'text-lg md:text-xl lg:text-2xl',
  }

  return (
    <Tag className={`${baseClasses} ${sizeClasses[as]} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  size?: 'sm' | 'base' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'muted'
}

export const Text = ({ children, size = 'base', variant = 'primary', className = '', ...props }: TextProps) => {
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }

  const variantClasses = {
    primary: 'text-white',
    secondary: 'text-neutral-200',
    muted: 'text-neutral-400',
  }

  return (
    <p className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </p>
  )
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
  required?: boolean
}

export const Label = ({ children, required, className = '', ...props }: LabelProps) => {
  return (
    <label className={`block text-sm font-medium text-neutral-300 mb-2 ${className}`} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}
