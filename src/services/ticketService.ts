import { generateBarcode } from '../utils/barcodeGenerator'
import { PaymentMethod, Ticket } from '../types/ticket'
import { useSpaStore } from '../store/useSpaStore'
import { calculatePriceFromTime } from '@/utils/calculateTicketPrice'

export function getTicket(customerName: string): Ticket {
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
    const receipt = `
        Already PAID - Receipt
        Barcode:     ${ticket.barcode}
        Customer:    ${ticket.customerName}
        Entry:       ${new Date(ticket.entryTime).toLocaleString()}
        Paid at:     ${new Date(ticket.paidAt).toLocaleString()}
        Method:      ${ticket.paymentMethod.toUpperCase()}
        Amount Paid: €${originalPrice}
        Current Price: €0
        Status: PAID 
    `.trim()

    console.log(receipt)
    return receipt
  }
  const price = calculatePriceFromTime(ticket.entryTime)

  const hours = Math.ceil((Date.now() - ticket.entryTime) / (1000 * 60 * 60))
  console.log(`Price for ticket ${barcode}:`)
  console.log(`Customer: ${ticket.customerName}`)
  console.log(`Duration: ${hours} hour(s)`)
  console.log(`Price: €${price}`)

  return price
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

  if (ticket.isPaid) {
    const message = `Ticket ${barcode} is already paid`
    console.warn(message)
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
