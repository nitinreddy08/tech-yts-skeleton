/** Real network access for the CLI. Kept apart from refresh.ts so tests inject fakes instead. */

async function request(url: string, headers: Record<string, string>, attempts = 2): Promise<Response> {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 20000)
    try {
      const res = await fetch(url, { headers, redirect: 'follow', signal: ctrl.signal })
      if (res.status < 500 || i === attempts - 1) return res
    } catch (e) {
      lastErr = e
    } finally {
      clearTimeout(timer)
    }
    await new Promise((r) => setTimeout(r, 1500))
  }
  throw lastErr instanceof Error ? lastErr : new Error('request failed')
}

export async function fetchPage(url: string, headers: Record<string, string>) {
  const res = await request(url, headers)
  return { status: res.status, html: await res.text() }
}

export async function fetchJson(url: string, headers: Record<string, string>) {
  const res = await request(url, { accept: 'application/json', ...headers })
  let json: unknown = null
  try {
    json = await res.json()
  } catch {
    /* non-JSON body → treated as no data */
  }
  return { status: res.status, json }
}
