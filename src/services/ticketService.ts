import { generateBarcode } from '../utils/barcodeGenerator'
import { PaymentMethod, Ticket } from '../types/ticket'
import { useSpaStore } from '../store/useSpaStore'
import {
  calculatePenaltyPrice,
  calculatePriceFromTime
} from '@/utils/calculateTicketPrice'
import { isPaymentValid } from '@/utils/validators'
import { SPA_CONFIG } from '@/constant/spa'

export function getTicket(customerName: string): Ticket | string {
  const tickets = useSpaStore.getState().tickets
  const activeCount = tickets.filter((ticket) => !ticket.returnedAt).length
  const freeSpaces = SPA_CONFIG.TOTAL_CAPACITY - activeCount

  if (freeSpaces <= 0) {
    const error =
      'Spa is FULL! No tickets available. Please wait for someone to exit.'
    console.error(error)
    return error
  }
  const ticket: Ticket = {
    barcode: generateBarcode(),
    entryTime: Date.now(),
    customerName: customerName
  }

  useSpaStore.getState().addTicket(ticket)

  console.log('Ticket issued:', ticket)

  return ticket
}

export function findTicketByBarcode(barcode: string): Ticket | undefined {
  const tickets = useSpaStore.getState().tickets
  return tickets.find((t) => t.barcode === barcode)
}

export function calculatePrice(barcode: string): number | string {
  const ticket = findTicketByBarcode(barcode)

  if (!ticket) {
    const error = `Ticket not found: ${barcode}`
    console.error(error)
    return error
  }

  if (ticket.isPaid && ticket.paidAt && ticket.paymentMethod) {
    const originalPrice = calculatePriceFromTime(
      ticket.entryTime,
      ticket.paidAt
    )
    const totalAmount = ticket.penaltyPrice
      ? ticket.penaltyPrice.reduce((sum, p) => sum + p, originalPrice)
      : originalPrice
    const receipt = `
        Already PAID - Receipt
        Barcode:     ${ticket.barcode}
        Customer:    ${ticket.customerName}
        Entry:       ${new Date(ticket.entryTime).toLocaleString()}
        Paid at:     ${new Date(ticket.paidAt).toLocaleString()}
        Method:      ${ticket.paymentMethod.toUpperCase()}
        Amount Paid: €${totalAmount}
        Current Price: €0
        Status: PAID 
    `.trim()

    console.log(receipt)
    return receipt
  }
  if (!ticket.isPaid && ticket.penaltyPrice && ticket.paidAt) {
    const message = `Ticket ${barcode} has an expired payment. Please pay the penalty of €${ticket.penaltyPrice.at(
      -1
    )} to exit.`
    return message
  }
  const price = calculatePriceFromTime(ticket.entryTime)

  const hours = Math.ceil((Date.now() - ticket.entryTime) / (1000 * 60 * 60))
  const priceDetails = `
  Price for ticket ${barcode}
  Customer: ${ticket.customerName}
  Duration: ${hours} hour(s)
  Price: €${price}
  `.trim()
  console.log(priceDetails)
  return priceDetails
}
export function payTicket(
  barcode: string,
  paymentMethod: PaymentMethod
): string {
  const ticket = findTicketByBarcode(barcode)

  if (!ticket) {
    const error = `Ticket not found: ${barcode}`
    console.error(error)
    return error
  }
  if (!paymentMethod) {
    const error = `Payment method is required to pay for ticket ${barcode}`
    console.error(error)
    return error
  }
  if (!['credit', 'debit', 'cash'].includes(paymentMethod)) {
    const error = `Invalid payment method: ${paymentMethod}. Must be 'credit', 'debit', or 'cash'.`
    console.error(error)
    return error
  }
  if (ticket.isPaid) {
    const message = `Ticket ${barcode} is already paid`
    console.warn(message)
    return message
  }
  if (!ticket.isPaid && ticket.penaltyPrice && ticket.paidAt) {
    useSpaStore.getState().updateTicket(barcode, {
      isPaid: true,
      paidAt: Date.now(),
      paymentMethod: paymentMethod
    })
    const message = `Ticket ${barcode} had an expired payment. Penalty of €${ticket.penaltyPrice?.at(
      -1
    )} has been paid. Thank you!`
    return message
  }
  const price = calculatePriceFromTime(ticket.entryTime)

  useSpaStore.getState().updateTicket(barcode, {
    isPaid: true,
    paidAt: Date.now(),
    paymentMethod: paymentMethod
  })

  const success = `
      Payment Successful!
      Amount: €${price}
      Method: ${paymentMethod.toUpperCase()}
      See you next time, ${ticket.customerName}!
    `.trim()

  console.log(success)
  return success
}

export function getTicketState(barcode: string): string {
  const ticket = findTicketByBarcode(barcode)

  if (!ticket) {
    const error = `Ticket not found: ${barcode}`
    console.error(error)
    return error
  }
  if (ticket.returnedAt) {
    const message = `Ticket ${barcode} has already exited at ${new Date(
      ticket.returnedAt
    ).toLocaleString()}.`
    console.warn(message)
    calculatePrice(barcode)
    return message
  }
  if (ticket.isPaid && isPaymentValid(ticket)) {
    useSpaStore.getState().updateTicket(barcode, {
      returnedAt: Date.now()
    })
    const success = `Exit Approved!\nHave a nice day, we hope you enjoyed your time with us, ${ticket.customerName}!`
    console.log(success)
    return success
  }

  if (ticket.isPaid && !isPaymentValid(ticket) && ticket.paidAt) {
    useSpaStore.getState().updateTicket(barcode, {
      isPaid: false,
      penaltyPrice: ticket.penaltyPrice
        ? [...ticket.penaltyPrice, calculatePenaltyPrice(ticket.paidAt)]
        : [calculatePenaltyPrice(ticket.paidAt)]
    })

    const minutesExpired = Math.floor(
      (Date.now() - ticket.paidAt) / (1000 * 60) -
        SPA_CONFIG.GRACE_PERIOD_MINUTES
    )
    const message = `Grace Period Expired\nYour payment expired ${minutesExpired} minute(s) ago.\nPlease pay the penalty to exit.`
    console.warn(message)
    return message
  }
  if (!ticket.isPaid && ticket.penaltyPrice) {
    const message = `Penalty Payment Required\nYour previous payment expired.\nPenalty: €${ticket.penaltyPrice?.at(
      -1
    )}\nPlease pay to exit.`
    console.warn(message)
    return message
  }
  const fullPrice = calculatePriceFromTime(ticket.entryTime)
  const message = `Payment Required\nTicket not paid.\nAmount due: €${fullPrice}\nPlease pay to exit.`
  console.warn(message)
  return message
}

export function getFreeSpaces(): number {
  const tickets = useSpaStore.getState().tickets
  const activeCount = tickets.filter((ticket) => !ticket.returnedAt).length
  const freeSpaces = SPA_CONFIG.TOTAL_CAPACITY - activeCount
  console.log(
    `Capacity: ${activeCount}/${SPA_CONFIG.TOTAL_CAPACITY} occupied, ${freeSpaces} free`
  )
  return freeSpaces
}
