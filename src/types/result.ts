import { Ticket } from './ticket'

export type SuccessResult<T = void> = {
  success: true
  data: T
  message?: string
}

export type ErrorResult<T = void> = {
  success: false
  error: string
  data?: T
}

export type Result<T = void> = SuccessResult<T> | ErrorResult<T>

export type TicketResult = Result<{
  ticket: Ticket
  freeSpaces: number
}>

export type PriceResult = Result<{
  price: number
  isPaid: boolean
  hasPenalty: boolean
  penaltyAmount?: number
  receipt?: string
  hours?: number
}>

export type PaymentResult = Result<{
  amountPaid: number
  newBalance: number
}>

export type StateResult =
  | SuccessResult<{
      canExit: boolean
      details: {
        isPaid: boolean
        hasPenalty: boolean
        exitTime?: number
      }
    }>
  | ErrorResult<{
      canExit: boolean
      details: {
        isPaid: boolean
        hasPenalty: boolean
        penaltyAmount?: number
        fullPrice?: number
        minutesExpired?: number
      }
    }>

export type CapacityResult = Result<{
  total: number
  occupied: number
  free: number
}>
