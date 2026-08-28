import { subscribeEmail } from '@/lib/mock/newsletter'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email : ''

  const result = subscribeEmail(email)
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 })
  }

  return Response.json({ success: true })
}
