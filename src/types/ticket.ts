export type PaymentMethod = 'credit' | 'debit' | 'cash'

export type Ticket = {
  barcode: string
  entryTime: number
  customerName: string
  isPaid?: boolean
  paidAt?: number
  paymentMethod?: PaymentMethod
  returnedAt?: number
  penaltyPrice?: number[]
}
