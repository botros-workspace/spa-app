import { SPA_CONFIG } from '@/constant/spa'

export function calculateDuration(entryTime: number, exitTime: number): number {
  const durationMs = exitTime - entryTime
  const durationHours = durationMs / (1000 * 60 * 60)

  return Math.ceil(durationHours)
}

export function calculatePriceFromTime(
  entryTime: number,
  exitTime: number = Date.now()
): number {
  const hours = calculateDuration(entryTime, exitTime)

  if (hours <= SPA_CONFIG.FIXED_HOURS) {
    return SPA_CONFIG.FIXED_PRICE
  }

  const additionalHours = hours - SPA_CONFIG.FIXED_HOURS
  return SPA_CONFIG.FIXED_PRICE + additionalHours * SPA_CONFIG.HOURLY_RATE
}
export function calculatePenaltyPrice(paidAt: number): number {
  const now = Date.now()
  const timeSincePayment = now - paidAt
  const hoursSincePayment = timeSincePayment / (1000 * 60 * 60)

  const penaltyHours = Math.ceil(
    hoursSincePayment - SPA_CONFIG.GRACE_PERIOD_MINUTES / 60
  )
  return penaltyHours * SPA_CONFIG.HOURLY_RATE
}
