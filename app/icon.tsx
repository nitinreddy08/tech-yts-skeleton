import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0066FF',
          borderRadius: 8,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <path d="M17.5 6L10 18h5.5L14 26l7.5-12H16z" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
