import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Ticket } from '../types/ticket'

interface SpaStore {
  tickets: Ticket[]
  addTicket: (ticket: Ticket) => void
  updateTicket: (barcode: string, updates: Partial<Ticket>) => void
}
export const useSpaStore = create<SpaStore>()(
  persist(
    (set) => ({
      tickets: [],

      addTicket: (ticket) =>
        set((state) => ({
          tickets: [...state.tickets, ticket]
        })),
      updateTicket: (barcode, updates) =>
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.barcode === barcode ? { ...ticket, ...updates } : ticket
          )
        }))
    }),

    {
      name: 'spa-storage'
    }
  )
)
