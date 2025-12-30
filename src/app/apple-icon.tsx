import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata - Apple requires 180x180 for apple-touch-icon
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 36,
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Beaker icon */}
          <path
            d="M35 20V40L20 70C17.5 76 21 82 28 82H72C79 82 82.5 76 80 70L65 40V20"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M32 20H68"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="40" cy="60" r="6" fill="#60a5fa" />
          <circle cx="55" cy="66" r="4" fill="#60a5fa" />
          <circle cx="48" cy="52" r="4" fill="#93c5fd" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
