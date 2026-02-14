import { generateBarcode } from '../utils/barcodeGenerator'
import { Ticket } from '../types/ticket'
import { useSpaStore } from '../store/useSpaStore'
import { calculatePriceFromTime } from '@/utils/calculateTicketPrice'

export function getTicket(customerName: string): Ticket {
  const ticket: Ticket = {
    barcode: generateBarcode(),
    entryTime: Date.now(),
    customerName: customerName,
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

  const price = calculatePriceFromTime(ticket.entryTime)

  const hours = Math.ceil((Date.now() - ticket.entryTime) / (1000 * 60 * 60))
  console.log(`Price for ticket ${barcode}:`)
  console.log(`Customer: ${ticket.customerName}`)
  console.log(`Duration: ${hours} hour(s)`)
  console.log(`Price: €${price}`)

  return price
}
