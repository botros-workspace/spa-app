'use client'

import { FunctionComponent, useMemo, useState } from 'react'
import {
  Box,
  Table,
  Badge,
  Text,
  HStack,
  VStack,
  Flex,
  Heading
} from '@chakra-ui/react'
import { Ticket } from '@/types/ticket'
import { useSpaStore } from '@/store/useSpaStore'
import CalculatePriceDialog from './CalculatePriceDialog'
import PayTicketDialog from './PayTicketDialog'
import GetTicketStateDialog from './GetTicketStateDialog'
import CapacityStats from './CapacityStats'

type SelectedTicketFilter = 'all' | 'active' | 'inactive'
type TicketFilterConfig = {
  key: SelectedTicketFilter
  label: string
  count: number
}
const TicketsTable: FunctionComponent = () => {
  const tickets = useSpaStore((state) => state.tickets)

  const { activeTickets, inactiveTickets } = useMemo(
    () => ({
      activeTickets: tickets.filter((ticket) => !ticket.returnedAt),
      inactiveTickets: tickets.filter((ticket) => ticket.returnedAt)
    }),
    [tickets]
  )

  const [filter, setFilter] = useState<SelectedTicketFilter>('all')

  const visibleTickets = useMemo(() => {
    switch (filter) {
      case 'active':
        return activeTickets
      case 'inactive':
        return inactiveTickets
      case 'all':
      default:
        return tickets
    }
  }, [filter, tickets, activeTickets, inactiveTickets])

  const getStatusBadge = (ticket: Ticket) => {
    if (ticket.returnedAt) {
      return (
        <Badge
          colorPalette='blue'
          p={2}
          variant={'solid'}
          fontWeight={700}
          fontSize={'sm'}
        >
          Exited
        </Badge>
      )
    }
    if (ticket.isPaid) {
      return (
        <Badge
          colorPalette='green'
          p={2}
          variant={'solid'}
          fontWeight={700}
          fontSize={'sm'}
        >
          Paid
        </Badge>
      )
    }
    if (ticket.penaltyPrice && ticket.penaltyPrice.length > 0) {
      return (
        <Badge
          colorPalette='red'
          variant={'solid'}
          fontWeight={700}
          fontSize={'sm'}
          p={2}
        >
          Penalty
        </Badge>
      )
    }
    return (
      <Badge
        colorPalette='orange'
        p={2}
        variant={'solid'}
        fontWeight={700}
        fontSize={'sm'}
      >
        Unpaid
      </Badge>
    )
  }
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  const filterConfig: TicketFilterConfig[] = useMemo(
    () => [
      {
        key: 'all',
        label: 'All Tickets',
        count: tickets.length
      },
      {
        key: 'active',
        label: 'Active Tickets',
        count: activeTickets.length
      },
      {
        key: 'inactive',
        label: 'Inactive Tickets',
        count: inactiveTickets.length
      }
    ],
    [tickets.length, activeTickets.length, inactiveTickets.length]
  )

  return (
    <Box
      borderRadius='lg'
      boxShadow='md'
      border='1px'
      borderColor='gray.200'
      overflow='hidden'
      mx={4}
    >
      <Flex justifyContent={'space-between'} alignItems='center' p={4}>
        <Flex gap={4}>
          {filterConfig.map(({ key, label, count }) => (
            <Heading
              key={key}
              size='md'
              cursor='pointer'
              onClick={() => setFilter(key)}
              textDecor={filter === key ? 'underline' : 'none'}
            >
              {label} ({count})
            </Heading>
          ))}
        </Flex>
        <CapacityStats />
      </Flex>

      {tickets.length === 0 ? (
        <Flex justify='center' align='center' py={12}>
          <VStack gap={2}>
            <Text fontSize='lg' color='gray.500'>
              No tickets
            </Text>
            <Text fontSize='sm' color='gray.400'>
              Create your first ticket to get started
            </Text>
          </VStack>
        </Flex>
      ) : (
        <Box overflowX='auto'>
          <Table.Root variant='outline' size='sm'>
            <Table.Header bg={'white'}>
              <Table.Row h={10} bg={'gray.900'}>
                <Table.ColumnHeader
                  color='white'
                  w='14.28%'
                  textAlign={'center'}
                >
                  Barcode
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  color='white'
                  w='14.28%'
                  textAlign={'center'}
                >
                  Customer
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  color='white'
                  w='14.28%'
                  textAlign={'center'}
                >
                  Entry Time
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  color='white'
                  w='14.28%'
                  textAlign={'center'}
                >
                  Status
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  color='white'
                  w='14.28%'
                  textAlign={'center'}
                >
                  Payment Method
                </Table.ColumnHeader>

                <Table.ColumnHeader
                  color='white'
                  w='14.28%'
                  textAlign={'center'}
                >
                  Actions
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {visibleTickets.map((ticket) => (
                <Table.Row
                  key={ticket.barcode}
                  _hover={{ bg: 'gray.200' }}
                  h={16}
                >
                  <Table.Cell
                    fontFamily='mono'
                    fontSize='sm'
                    pl={4}
                    textAlign={'center'}
                  >
                    <HStack gap={2}>
                      <Text>{ticket.barcode}</Text>
                    </HStack>
                  </Table.Cell>

                  <Table.Cell fontWeight='medium' textAlign={'center'}>
                    {ticket.customerName}
                  </Table.Cell>

                  <Table.Cell
                    fontSize='sm'
                    color='gray.600'
                    textAlign={'center'}
                  >
                    {formatDate(ticket.entryTime)}
                  </Table.Cell>

                  <Table.Cell textAlign={'center'}>
                    {getStatusBadge(ticket)}
                  </Table.Cell>

                  <Table.Cell textAlign={'center'}>
                    {ticket.paymentMethod ? (
                      <Badge
                        variant='solid'
                        colorPalette='purple'
                        p={2}
                        fontWeight={700}
                      >
                        {ticket.paymentMethod.toUpperCase()}
                      </Badge>
                    ) : (
                      <Text fontSize='sm' color='gray.400'>
                        -
                      </Text>
                    )}
                  </Table.Cell>

                  <Table.Cell>
                    <Flex gap={3} pr={4}>
                      <CalculatePriceDialog ticket={ticket} />
                      <PayTicketDialog ticket={ticket} />
                      <GetTicketStateDialog ticket={ticket} />
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Box>
  )
}

export default TicketsTable
