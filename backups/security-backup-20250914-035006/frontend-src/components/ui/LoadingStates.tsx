'use client'

import { motion } from 'framer-motion'
import { Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface LoadingStatesProps {
  type?: 'spinner' | 'skeleton' | 'dots' | 'pulse' | 'success' | 'error'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  onRetry?: () => void
  className?: string
}

export function LoadingSpinner({ 
  type = 'spinner', 
  size = 'md', 
  message, 
  onRetry,
  className = '' 
}: LoadingStatesProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  if (type === 'success') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`flex flex-col items-center justify-center space-y-2 ${className}`}
      >
        <div className={`${sizeClasses[size]} text-green-500`}>
          <CheckCircle className="w-full h-full" />
        </div>
        {message && (
          <p className={`text-green-600 ${textSizeClasses[size]}`}>{message}</p>
        )}
      </motion.div>
    )
  }

  if (type === 'error') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`flex flex-col items-center justify-center space-y-2 ${className}`}
      >
        <div className={`${sizeClasses[size]} text-red-500`}>
          <AlertCircle className="w-full h-full" />
        </div>
        {message && (
          <p className={`text-red-600 ${textSizeClasses[size]}`}>{message}</p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}
      </motion.div>
    )
  }

  if (type === 'skeleton') {
    return (
      <div className={`animate-pulse space-y-3 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    )
  }

  if (type === 'dots') {
    return (
      <div className={`flex items-center justify-center space-x-1 ${className}`}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`${sizeClasses[size]} bg-purple-500 rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>
    )
  }

  if (type === 'pulse') {
    return (
      <motion.div
        className={`${sizeClasses[size]} bg-purple-500 rounded-full ${className}`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1,
          repeat: Infinity
        }}
      />
    )
  }

  // Default spinner
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-500`} />
      {message && (
        <p className={`text-gray-600 ${textSizeClasses[size]}`}>{message}</p>
      )}
    </div>
  )
}

// Card Loading Skeleton
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}

// Table Loading Skeleton
export function TableSkeleton({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
            <div className="grid grid-cols-4 gap-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Button Loading State
export function ButtonLoading({ 
  isLoading, 
  children, 
  loadingText = 'Loading...',
  className = ''
}: {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
}) {
  return (
    <button
      disabled={isLoading}
      className={`relative ${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : ''}>
        {children}
      </span>
      {isLoading && (
        <span className="opacity-0">
          {loadingText}
        </span>
      )}
    </button>
  )
}

// Page Loading State
export function PageLoading({ 
  message = 'Loading page...',
  className = ''
}: {
  message?: string
  className?: string
}) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="text-center">
        <LoadingSpinner size="xl" message={message} />
      </div>
    </div>
  )
}

// Inline Loading State
export function InlineLoading({ 
  message = 'Loading...',
  className = ''
}: {
  message?: string
  className?: string
}) {
  return (
    <div className={`flex items-center space-x-2 text-gray-600 ${className}`}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">{message}</span>
    </div>
  )
}

// Progress Loading
export function ProgressLoading({ 
  progress = 0,
  message = 'Loading...',
  className = ''
}: {
  progress?: number
  message?: string
  className?: string
}) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{message}</span>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-purple-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}

// Shimmer Effect
export function ShimmerEffect({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
    </div>
  )
}

// Custom CSS for shimmer animation
export const shimmerStyles = `
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`
