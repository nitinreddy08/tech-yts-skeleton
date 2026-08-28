import { newsletterRepository, isRepositoryError } from '@/lib/repositories'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  try {
    await newsletterRepository.subscribe(body)
    return Response.json({ success: true })
  } catch (error) {
    if (isRepositoryError(error)) {
      const message = error.fieldErrors?.email?.[0] ?? error.message
      return Response.json({ error: message }, { status: error.httpStatus })
    }
    throw error
  }
}
