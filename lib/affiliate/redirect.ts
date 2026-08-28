import type { NextRequest } from 'next/server'
import { findAffiliateLinkById, findDealById } from '@/lib/mock/db'
import { clickLogRepository } from '@/lib/repositories'

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  )
}

/**
 * Fire-and-forget by design (Requirement 4.6): the caller doesn't await this,
 * so the click write never adds latency to the redirect response.
 */
function logClick(
  request: NextRequest,
  entry: {
    affiliate_link_id: string
    product_id: string
    store_name: string
  }
) {
  const userAgent = request.headers.get('user-agent') ?? ''
  const referrer = request.headers.get('referer') ?? null
  const rawIp = getClientIp(request)

  hashIp(rawIp)
    .then(ipHash =>
      clickLogRepository.record({
        affiliate_link_id: entry.affiliate_link_id,
        product_id: entry.product_id,
        store_name: entry.store_name,
        user_agent: userAgent,
        referrer,
        ip_hash: ipHash,
      })
    )
    // Fire-and-forget: a failed click log must never surface as an unhandled
    // rejection or affect the redirect the visitor already received.
    .catch(err => console.error('[click-log] failed to record click', err))
}

export async function handleAffiliateRedirect(
  id: string,
  request: NextRequest
): Promise<Response> {
  const link = findAffiliateLinkById(id)
  if (link) {
    logClick(request, {
      affiliate_link_id: link.id,
      product_id: link.product_id,
      store_name: link.store_name,
    })
    return Response.redirect(link.affiliate_url, 302)
  }

  const deal = findDealById(id)
  if (deal) {
    logClick(request, {
      affiliate_link_id: `deal:${deal.id}`,
      product_id: deal.product_id,
      store_name: deal.store_name,
    })
    return Response.redirect(deal.affiliate_url, 302)
  }

  return new Response('Not found', { status: 404 })
}
