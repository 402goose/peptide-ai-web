'use client'

import { cn } from '@/lib/utils'

interface SequenceLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'mark' | 'wordmark'
  animated?: boolean
}

const sizes = {
  sm: { mark: 24, text: 'text-base' },
  md: { mark: 32, text: 'text-lg' },
  lg: { mark: 40, text: 'text-xl' },
  xl: { mark: 56, text: 'text-2xl' },
}

/**
 * Sequence Logo Component
 *
 * The Sequence Helix Mark represents:
 * - DNA/peptide molecular structure (amino acid sequences)
 * - Upward progression and optimization
 * - The three pillars: Research → Protocol → Results
 */
export function SequenceLogo({
  className,
  size = 'md',
  variant = 'full',
  animated = false
}: SequenceLogoProps) {
  const { mark: markSize, text: textSize } = sizes[size]

  const HelixMark = () => (
    <svg
      width={markSize}
      height={markSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(animated && 'animate-helix')}
      aria-label="Sequence logo mark"
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="sequence-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--sequence-primary, #4F46E5)" />
          <stop offset="100%" stopColor="var(--sequence-teal, #14B8A6)" />
        </linearGradient>
        <linearGradient id="sequence-gradient-light" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--sequence-primary, #4F46E5)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--sequence-teal, #14B8A6)" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Helix structure - ascending double spiral forming abstract "S" */}
      {/* Main helix path */}
      <path
        d="M14 38C14 38 20 32 24 28C28 24 34 18 34 18"
        stroke="url(#sequence-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M34 38C34 38 28 32 24 28C20 24 14 18 14 18"
        stroke="url(#sequence-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* Node circles - representing data points / research / protocol / results */}
      {/* Top node */}
      <circle
        cx="24"
        cy="10"
        r="5"
        fill="url(#sequence-gradient)"
      />
      {/* Middle node */}
      <circle
        cx="24"
        cy="24"
        r="5"
        fill="url(#sequence-gradient)"
      />
      {/* Bottom node */}
      <circle
        cx="24"
        cy="38"
        r="5"
        fill="url(#sequence-gradient)"
      />

      {/* Connection lines between nodes */}
      <line
        x1="24"
        y1="15"
        x2="24"
        y2="19"
        stroke="url(#sequence-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="29"
        x2="24"
        y2="33"
        stroke="url(#sequence-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )

  const Wordmark = () => (
    <span
      className={cn(
        'font-semibold tracking-tight',
        textSize
      )}
    >
      SEQUENCE
    </span>
  )

  if (variant === 'mark') {
    return (
      <div className={cn('flex items-center', className)}>
        <HelixMark />
      </div>
    )
  }

  if (variant === 'wordmark') {
    return (
      <div className={cn('flex items-center', className)}>
        <Wordmark />
      </div>
    )
  }

  // Full logo (mark + wordmark)
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <HelixMark />
      <Wordmark />
    </div>
  )
}

/**
 * Simple icon-only version for favicons, app icons, etc.
 * Returns just the SVG without React component wrapper
 */
export function SequenceIcon({
  size = 32,
  className
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sequence"
    >
      <defs>
        <linearGradient id="seq-icon-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>

      {/* Helix paths */}
      <path
        d="M14 38C14 38 20 32 24 28C28 24 34 18 34 18"
        stroke="url(#seq-icon-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M34 38C34 38 28 32 24 28C20 24 14 18 14 18"
        stroke="url(#seq-icon-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* Nodes */}
      <circle cx="24" cy="10" r="5" fill="url(#seq-icon-gradient)" />
      <circle cx="24" cy="24" r="5" fill="url(#seq-icon-gradient)" />
      <circle cx="24" cy="38" r="5" fill="url(#seq-icon-gradient)" />

      {/* Connectors */}
      <line x1="24" y1="15" x2="24" y2="19" stroke="url(#seq-icon-gradient)" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="29" x2="24" y2="33" stroke="url(#seq-icon-gradient)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default SequenceLogo
