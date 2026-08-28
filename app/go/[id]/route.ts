import type { NextRequest } from 'next/server'
import { handleAffiliateRedirect } from '@/lib/affiliate/redirect'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return handleAffiliateRedirect(id, request)
}
