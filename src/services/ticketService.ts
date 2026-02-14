import { generateBarcode } from '../utils/barcodeGenerator'
import { Ticket } from '../types/ticket'
import { useSpaStore } from '../store/useSpaStore'

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
