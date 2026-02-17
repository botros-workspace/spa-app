'use client'
import {
  CloseButton,
  Dialog,
  Portal,
  Button,
  Text,
  VStack,
  Box,
  Separator,
  HStack,
  Card,
  Flex
} from '@chakra-ui/react'
import { FunctionComponent, useCallback, useState } from 'react'
import { Ticket } from '@/types/ticket'
import { getTicketState } from '@/services/ticketService'
import { StateResult } from '@/types/result'
import { LuBanknote, LuClock, LuDoorClosed, LuDoorOpen } from 'react-icons/lu'
import { BiCheckCircle } from 'react-icons/bi'
import { FiAlertCircle, FiAlertTriangle } from 'react-icons/fi'
import DialogHeroTemplate from './DialogHeroTemplate'
import { useSpaStore } from '@/store/useSpaStore'

type Props = {
  ticket: Ticket
}
const GetTicketStateDialog: FunctionComponent<Props> = ({ ticket }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [response, setResponse] = useState<StateResult | null>(null)
  const liveTicket = useSpaStore((state) =>
    state.tickets.find((t) => t.barcode === ticket.barcode)
  )
  const handleOpenChange = useCallback(
    (details: { open: boolean }) => {
      setOpen(details.open)

      if (details.open) {
        setOpen(true)
        setResponse(getTicketState(ticket.barcode))
      } else {
        setOpen(false)
        setResponse(null)
      }
    },
    [ticket.barcode]
  )
  return (
    <Dialog.Root
      lazyMount
      open={open}
      onOpenChange={handleOpenChange}
      placement={'center'}
    >
      <Dialog.Trigger asChild>
        <Button
          px={4}
          bg='yellow.500/15'
          borderColor='yellow.500/30'
          color='yellow.500'
          borderWidth={1}
          borderRadius={8}
          _hover={{ scale: 1.05 }}
        >
          <LuDoorOpen />
          {liveTicket?.returnedAt ? 'Already Exited' : 'Check state'}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            p={6}
            bg={'white'}
            borderRadius='md'
            boxShadow='lg'
            color={'gray.800'}
          >
            <Dialog.Header display='flex' alignItems='center'>
              <Dialog.Title>
                Ticket State for {ticket.customerName}
              </Dialog.Title>
              <CloseButton ml={'auto'} onClick={() => setOpen(false)} />
            </Dialog.Header>
            <Dialog.Body pt={4}>
              <VStack align='stretch' gap={4}>
                <DialogHeroTemplate
                  customerName={ticket.customerName}
                  barcode={ticket.barcode}
                  entryTime={new Date(ticket.entryTime).toLocaleString()}
                  exitTime={
                    ticket.returnedAt
                      ? new Date(ticket.returnedAt).toLocaleString()
                      : undefined
                  }
                />

                {response?.success === false && !response.data && (
                  <Card.Root
                    variant='outline'
                    bg='red.50'
                    borderColor='red.200'
                    p={2}
                  >
                    <Card.Body>
                      <HStack gap={3} align='start'>
                        <Box color='red.500' mt={0.5}>
                          <FiAlertCircle size={20} />
                        </Box>
                        <Text
                          color='red.600'
                          fontWeight='semibold'
                          fontSize='sm'
                        >
                          {response.error}
                        </Text>
                      </HStack>
                    </Card.Body>
                  </Card.Root>
                )}

                {response && !response.success && response.data && (
                  <>
                    <Card.Root
                      variant='outline'
                      bg='red.50'
                      borderColor='red.200'
                      p={2}
                    >
                      <Card.Body>
                        <VStack gap={3}>
                          <Flex
                            w={16}
                            h={16}
                            borderRadius='full'
                            bg='red.100'
                            align='center'
                            justify='center'
                            mx='auto'
                          >
                            <Box color='red.500'>
                              <LuDoorClosed size={32} />
                            </Box>
                          </Flex>
                          <VStack gap={1}>
                            <Text
                              fontSize='lg'
                              fontWeight='bold'
                              color='red.700'
                            >
                              Door Closed
                            </Text>
                          </VStack>
                          <Text
                            fontSize='sm'
                            color='red.600'
                            fontWeight='medium'
                          >
                            {response.error}
                          </Text>
                        </VStack>
                      </Card.Body>
                    </Card.Root>

                    <VStack align='stretch' gap={3}>
                      <HStack justify='space-between'>
                        <Text fontSize='sm' color='gray.500'>
                          Can Exit
                        </Text>
                        <HStack gap={1}>
                          <Box color='red.500'>
                            <FiAlertCircle size={15} />
                          </Box>
                          <Text
                            fontSize='sm'
                            fontWeight='semibold'
                            color='red.600'
                          >
                            No
                          </Text>
                        </HStack>
                      </HStack>

                      {response.data.details.penaltyAmount !== undefined && (
                        <>
                          <Separator />
                          <HStack justify='space-between'>
                            <HStack gap={2}>
                              <Box color='orange.500'>
                                <FiAlertTriangle size={15} />
                              </Box>
                              <Text fontSize='sm' color='gray.500'>
                                Penalty Due
                              </Text>
                            </HStack>
                            <Text
                              fontSize='lg'
                              fontWeight='bold'
                              color='orange.600'
                            >
                              €{response.data.details.penaltyAmount}
                            </Text>
                          </HStack>
                        </>
                      )}

                      {response.data.details.fullPrice !== undefined && (
                        <>
                          <Separator />
                          <HStack justify='space-between'>
                            <HStack gap={2}>
                              <Box color='blue.500'>
                                <LuBanknote size={15} />
                              </Box>
                              <Text fontSize='sm' color='gray.500'>
                                Amount Due
                              </Text>
                            </HStack>
                            <Text
                              fontSize='lg'
                              fontWeight='bold'
                              color='blue.600'
                            >
                              €{response.data.details.fullPrice}
                            </Text>
                          </HStack>
                        </>
                      )}

                      {response.data.details.minutesExpired !== undefined && (
                        <>
                          <Separator />
                          <HStack justify='space-between'>
                            <HStack gap={2}>
                              <Box color='orange.500'>
                                <LuClock size={15} />
                              </Box>
                              <Text fontSize='sm' color='gray.500'>
                                Grace Expired
                              </Text>
                            </HStack>
                            <Text
                              fontSize='sm'
                              fontWeight='semibold'
                              color='orange.600'
                            >
                              {response.data.details.minutesExpired} min ago
                            </Text>
                          </HStack>
                        </>
                      )}
                    </VStack>

                    <Box
                      p={3}
                      bg='orange.50'
                      borderRadius='md'
                      border='1px solid'
                      borderColor='orange.100'
                    >
                      <Text fontSize='xs' color='orange.700' lineHeight='tall'>
                        Please proceed to the payment terminal before attempting
                        to exit.
                      </Text>
                    </Box>
                  </>
                )}

                {response && response.success && (
                  <>
                    <Card.Root
                      variant='outline'
                      bg='green.50'
                      borderColor='green.200'
                      p={2}
                    >
                      <Card.Body>
                        <VStack gap={3}>
                          <Flex
                            w={16}
                            h={16}
                            borderRadius='full'
                            bg='green.100'
                            align='center'
                            justify='center'
                            mx='auto'
                          >
                            <Box color='green.500'>
                              <LuDoorOpen size={32} />
                            </Box>
                          </Flex>
                          <VStack gap={1}>
                            <Text
                              fontSize='lg'
                              fontWeight='bold'
                              color='green.700'
                            >
                              Door Open
                            </Text>
                          </VStack>
                          <Text
                            fontSize='sm'
                            color='green.600'
                            fontWeight='medium'
                            textAlign='center'
                          >
                            {response.message}
                          </Text>
                        </VStack>
                      </Card.Body>
                    </Card.Root>

                    <VStack align='stretch' gap={3}>
                      <HStack justify='space-between'>
                        <Text fontSize='sm' color='gray.500'>
                          Can Exit
                        </Text>
                        <HStack gap={1}>
                          <Box color='green.500'>
                            <BiCheckCircle size={15} />
                          </Box>
                          <Text
                            fontSize='sm'
                            fontWeight='semibold'
                            color='green.600'
                          >
                            Yes
                          </Text>
                        </HStack>
                      </HStack>

                      {response.data.details.exitTime && (
                        <>
                          <Separator />
                          <HStack justify='space-between'>
                            <HStack gap={2}>
                              <Box color='gray.500'>
                                <LuClock size={15} />
                              </Box>
                              <Text fontSize='sm' color='gray.500'>
                                Exit Time
                              </Text>
                            </HStack>
                            <Text fontSize='sm' fontWeight='medium'>
                              {new Date(
                                response.data.details.exitTime
                              ).toLocaleString()}
                            </Text>
                          </HStack>
                        </>
                      )}
                    </VStack>
                  </>
                )}
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default GetTicketStateDialog
