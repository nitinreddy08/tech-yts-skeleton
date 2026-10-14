'use client'

/** Last-resort boundary for errors in the root layout itself (no app CSS or providers available). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ marginTop: '0.5rem', color: '#585365' }}>Please try again in a moment.</p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: '1.5rem', height: 44, padding: '0 20px', borderRadius: 8, border: 0, background: '#5722D3', color: '#fff', fontWeight: 600 }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}
