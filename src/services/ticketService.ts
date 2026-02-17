import { generateBarcode } from '../utils/barcodeGenerator'
import { PaymentMethod, Ticket } from '../types/ticket'
import { useSpaStore } from '../store/useSpaStore'
import {
  calculatePenaltyPrice,
  calculatePriceFromTime
} from '@/utils/calculateTicketPrice'
import { isPaymentValid } from '@/utils/validators'
import { SPA_CONFIG } from '@/constant/spa'
import {
  CapacityResult,
  PaymentResult,
  PriceResult,
  StateResult,
  TicketResult
} from '@/types/result'

export function getTicket(customerName: string): TicketResult {
  const tickets = useSpaStore.getState().tickets
  const activeCount = tickets.filter((ticket) => !ticket.returnedAt).length
  const freeSpaces = SPA_CONFIG.TOTAL_CAPACITY - activeCount

  if (freeSpaces <= 0) {
    const errorMessage =
      'Spa is FULL! No tickets available. Please wait for someone to exit.'
    return {
      success: false,
      error: errorMessage
    }
  }
  const ticket: Ticket = {
    barcode: generateBarcode(),
    entryTime: Date.now(),
    customerName: customerName
  }
  useSpaStore.getState().addTicket(ticket)
  return {
    success: true,
    data: {
      ticket,
      freeSpaces: freeSpaces - 1
    },
    message: `Ticket issued successfully for ${customerName}`
  }
}

export function findTicketByBarcode(barcode: string): Ticket | undefined {
  const tickets = useSpaStore.getState().tickets
  return tickets.find((t) => t.barcode === barcode)
}

export function calculatePrice(barcode: string): PriceResult {
  const ticket = findTicketByBarcode(barcode)

  if (!ticket) {
    const error = `Ticket not found: ${barcode}`
    console.error(error)
    return {
      success: false,
      error: `Ticket ${barcode} not found`
    }
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
    return {
      success: true,
      data: {
        price: 0,
        isPaid: true,
        hasPenalty: false,
        receipt
      },
      message: 'Ticket is paid'
    }
  }
  if (!ticket.isPaid && ticket.penaltyPrice && ticket.paidAt) {
    const latestPenalty = ticket.penaltyPrice.at(-1) || 0
    const message = `Ticket ${barcode} has an expired payment. Please pay the penalty of €${latestPenalty} to exit.`
    return {
      success: true,
      data: {
        price: latestPenalty,
        isPaid: false,
        hasPenalty: true
      },
      message: message
    }
  }
  const price = calculatePriceFromTime(ticket.entryTime)

  const hours = Math.ceil((Date.now() - ticket.entryTime) / (1000 * 60 * 60))

  return {
    success: true,
    data: {
      price,
      isPaid: false,
      hasPenalty: false,
      hours
    },
    message: `Price: €${price} for ${hours} hour(s)`
  }
}
export function payTicket(
  barcode: string,
  paymentMethod: PaymentMethod
): PaymentResult {
  const ticket = findTicketByBarcode(barcode)

  if (!ticket) {
    const errorMessage = `Ticket not found: ${barcode}`
    return {
      success: false,
      error: errorMessage
    }
  }
  if (!paymentMethod) {
    return {
      success: false,
      error: 'Payment method is required'
    }
  }
  if (ticket.isPaid) {
    return {
      success: false,
      error: 'Ticket is already paid'
    }
  }
  if (!ticket.isPaid && ticket.penaltyPrice && ticket.paidAt) {
    useSpaStore.getState().updateTicket(barcode, {
      isPaid: true,
      paidAt: Date.now(),
      paymentMethod: paymentMethod
    })
    const penaltyAmount = ticket.penaltyPrice.at(-1) || 0
    return {
      success: true,
      data: {
        amountPaid: penaltyAmount,
        newBalance: 0
      },
      message: `Penalty of €${penaltyAmount} paid successfully`
    }
  }
  const price = calculatePriceFromTime(ticket.entryTime)

  useSpaStore.getState().updateTicket(barcode, {
    isPaid: true,
    paidAt: Date.now(),
    paymentMethod: paymentMethod
  })

  return {
    success: true,
    data: {
      amountPaid: price,
      newBalance: 0
    },
    message: `Payment of €${price} successful`
  }
}

export function getTicketState(barcode: string): StateResult {
  const ticket = findTicketByBarcode(barcode)

  if (!ticket) {
    return {
      success: false,
      error: `Ticket ${barcode} not found`
    }
  }
  if (ticket.returnedAt) {
    return {
      success: false,
      error: `Ticket already exited at ${new Date(
        ticket.returnedAt
      ).toLocaleString()}`
    }
  }
  if (ticket.isPaid && isPaymentValid(ticket)) {
    useSpaStore.getState().updateTicket(barcode, {
      returnedAt: Date.now()
    })
    return {
      success: true,
      data: {
        canExit: true,
        details: {
          isPaid: true,
          hasPenalty: false,
          exitTime: Date.now()
        }
      },
      message: `Exit approved! Have a nice day, ${ticket.customerName}!`
    }
  }

  if (ticket.isPaid && !isPaymentValid(ticket) && ticket.paidAt) {
    const penaltyAmount = calculatePenaltyPrice(ticket.paidAt)
    useSpaStore.getState().updateTicket(barcode, {
      isPaid: false,
      penaltyPrice: ticket.penaltyPrice
        ? [...ticket.penaltyPrice, penaltyAmount]
        : [penaltyAmount]
    })

    const minutesExpired = Math.floor(
      (Date.now() - ticket.paidAt) / (1000 * 60) -
        SPA_CONFIG.GRACE_PERIOD_MINUTES
    )
    return {
      success: false,
      error: `Grace period expired ${minutesExpired} minute(s) ago`,
      data: {
        canExit: false,
        details: {
          isPaid: false,
          hasPenalty: true,
          penaltyAmount,
          minutesExpired
        }
      }
    }
  }
  if (!ticket.isPaid && ticket.penaltyPrice) {
    const penaltyAmount = ticket.penaltyPrice[ticket.penaltyPrice.length - 1]
    return {
      success: false,
      error: 'Penalty payment required',
      data: {
        canExit: false,
        details: {
          isPaid: false,
          hasPenalty: true,
          penaltyAmount
        }
      }
    }
  }
  const fullPrice = calculatePriceFromTime(ticket.entryTime)
  return {
    success: false,
    error: 'Payment required',
    data: {
      canExit: false,
      details: {
        isPaid: false,
        hasPenalty: false,
        fullPrice
      }
    }
  }
}

export function getFreeSpaces(): CapacityResult {
  const tickets = useSpaStore.getState().tickets
  const activeCount = tickets.filter((ticket) => !ticket.returnedAt).length
  const freeSpaces = SPA_CONFIG.TOTAL_CAPACITY - activeCount
  return {
    success: true,
    data: {
      total: SPA_CONFIG.TOTAL_CAPACITY,
      occupied: activeCount,
      free: freeSpaces
    },
    message: `${freeSpaces} spaces available`
  }
}
