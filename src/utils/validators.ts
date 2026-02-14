import { Ticket } from '@/types/ticket'
import { SPA_CONFIG } from '@/constant/spa'

export function isPaymentValid(ticket: Ticket): boolean {
  if (!ticket.paidAt) {
    return false
  }

  const now = Date.now()
  const timeSincePayment = now - ticket.paidAt
  const gracePeriodMs = SPA_CONFIG.GRACE_PERIOD_MINUTES * 60 * 1000

  return timeSincePayment <= gracePeriodMs
}
