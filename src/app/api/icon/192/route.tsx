import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #14B8A6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 40,
        }}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Sequence helix icon - three ascending nodes */}
          {/* Helix spiral path */}
          <path
            d="M30 75 Q50 65 70 75 Q50 85 30 75"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M30 50 Q50 40 70 50 Q50 60 30 50"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M30 25 Q50 15 70 25 Q50 35 30 25"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="3"
            fill="none"
          />
          {/* Connecting strand */}
          <path
            d="M50 20 L50 80"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          {/* Three ascending nodes */}
          <circle cx="50" cy="75" r="10" fill="rgba(255,255,255,0.6)" />
          <circle cx="50" cy="50" r="10" fill="rgba(255,255,255,0.8)" />
          <circle cx="50" cy="25" r="10" fill="white" />
          {/* Inner glow on top node */}
          <circle cx="50" cy="25" r="5" fill="rgba(79,70,229,0.3)" />
        </svg>
      </div>
    ),
    {
      width: 192,
      height: 192,
    }
  )
}
