import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Ticket } from '../types/ticket'

interface SpaStore {
  tickets: Ticket[]
  addTicket: (ticket: Ticket) => void
}
export const useSpaStore = create<SpaStore>()(
  persist(
    (set) => ({
      tickets: [],

      addTicket: (ticket) =>
        set((state) => ({
          tickets: [...state.tickets, ticket],
        })),
    }),
    {
      name: 'spa-storage',
    }
  )
)
