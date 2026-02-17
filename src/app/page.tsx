'use client'
import TicketManagementHeader from '../components/TicketManagementHeader'
import TicketsTable from '../components/TicketsTable'
import { Provider } from '@/components/ui/provider'
import { Container } from '@chakra-ui/react'
import { Toaster } from '@/components/ui/toaster'

export default function Home() {
  return (
    <Provider>
      <Container
        maxW='container.xl'
        bg={'white'}
        minH={'100vh'}
        minW={'100vw'}
        color={'gray.800'}
        pb={12}
      >
        <TicketManagementHeader />
        <TicketsTable />
      </Container>
      <Toaster />
    </Provider>
  )
}
