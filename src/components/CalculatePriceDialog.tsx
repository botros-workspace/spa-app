'use client'
import {
  CloseButton,
  Dialog,
  Portal,
  Button,
  Text,
  VStack,
  Box,
  Card,
  HStack,
  Separator,
  Flex
} from '@chakra-ui/react'
import { FunctionComponent, useCallback, useState } from 'react'
import { calculatePrice } from '@/services/ticketService'
import { Ticket } from '@/types/ticket'
import { PriceResult } from '@/types/result'
import { LuCalculator, LuClock, LuReceipt } from 'react-icons/lu'
import { FiAlertCircle } from 'react-icons/fi'
import { BiCheckCircle } from 'react-icons/bi'
import DialogHeroTemplate from './DialogHeroTemplate'
type Props = {
  ticket: Ticket
}
const CalculatePriceDialog: FunctionComponent<Props> = ({ ticket }) => {
  const [open, setOpen] = useState(false)
  const [response, setResponse] = useState<PriceResult | null>(null)

  const handleOpenChange = useCallback((details: { open: boolean }) => {
    setOpen(details.open)
    if (details.open) {
      const result = calculatePrice(ticket.barcode)
      setResponse(result)
    } else {
      setResponse(null)
    }
  }, [])
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
          bg='green.500/15'
          borderColor='green.500/30'
          borderWidth={1}
          color='green.500'
          borderRadius={8}
          _hover={{ scale: 1.05 }}
        >
          <LuCalculator />
          Calculate Price
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content p={6} bg={'white'} color={'gray.800'}>
            <Dialog.Header mb={4} display='flex' alignItems='center'>
              <Dialog.Title fontSize='xl' fontWeight='bold'>
                Price Calculation
              </Dialog.Title>
              <CloseButton onClick={() => setOpen(false)} ml={'auto'} />
            </Dialog.Header>

            <Dialog.Body>
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

              {response?.success === false && (
                <Card.Root
                  bg='red.50'
                  borderColor='red.200'
                  variant='outline'
                  p={4}
                  alignItems={'center'}
                >
                  <Card.Body>
                    <HStack gap={3} justifyContent={'center'}>
                      <Box color='red.500'>
                        <FiAlertCircle size={20} />
                      </Box>
                      <Text fontSize='sm' color='red.600'>
                        {response.error}
                      </Text>
                    </HStack>
                  </Card.Body>
                </Card.Root>
              )}

              {response?.success && response.data && (
                <VStack align='stretch' gap={4}>
                  <Card.Root
                    bg={response.data.isPaid ? 'green.50' : 'orange.50'}
                    borderColor={
                      response.data.isPaid ? 'green.200' : 'orange.200'
                    }
                    variant='outline'
                  >
                    <HStack gap={3} p={2}>
                      <Box
                        color={
                          response.data.isPaid ? 'green.500' : 'orange.500'
                        }
                      >
                        {response.data.isPaid ? (
                          <BiCheckCircle size={24} />
                        ) : (
                          <FiAlertCircle size={24} />
                        )}
                      </Box>
                      <VStack align='start' gap={0}>
                        <Text
                          fontWeight='bold'
                          color={
                            response.data.isPaid ? 'green.700' : 'orange.700'
                          }
                        >
                          {response.data.isPaid
                            ? 'Ticket Paid'
                            : 'Payment Required'}
                        </Text>
                        <Text
                          fontSize='sm'
                          color={
                            response.data.isPaid ? 'green.600' : 'orange.600'
                          }
                        >
                          {response.data.isPaid
                            ? 'This ticket has been fully paid'
                            : 'Payment is required to exit'}
                        </Text>
                      </VStack>
                    </HStack>
                  </Card.Root>

                  <VStack align='stretch' gap={3}>
                    <Flex justify='space-between' align='center'>
                      <Text fontSize='sm'>
                        {response.data.hasPenalty
                          ? 'Penalty Price'
                          : 'Current Price'}
                      </Text>
                      <Text
                        fontSize='2xl'
                        fontWeight='bold'
                        color={
                          response.data.price === 0 ? 'green.500' : 'blue.600'
                        }
                      >
                        €{response.data.price}
                      </Text>
                    </Flex>

                    {response.data.hours !== undefined && (
                      <>
                        <Separator />
                        <HStack justify='space-between'>
                          <HStack gap={2}>
                            <LuClock size={16} />
                            <Text fontSize='sm' color='gray.600'>
                              Duration
                            </Text>
                          </HStack>
                          <Text fontSize='sm' fontWeight='medium'>
                            {response.data.hours} hour
                            {response.data.hours !== 1 ? 's' : ''}
                          </Text>
                        </HStack>
                      </>
                    )}
                  </VStack>

                  {response.data.receipt && (
                    <VStack align='stretch' gap={2} mt={4}>
                      <HStack gap={2}>
                        <LuReceipt size={18} />
                        <Text fontWeight='semibold' fontSize='sm'>
                          Payment Receipt
                        </Text>
                      </HStack>

                      <Box
                        bg='gray.50'
                        p={4}
                        borderRadius='md'
                        border='1px solid'
                        borderColor='gray.200'
                        fontFamily='mono'
                        fontSize='xs'
                        whiteSpace='pre-wrap'
                        lineHeight='tall'
                        color='gray.700'
                      >
                        {response.data.receipt}
                      </Box>
                    </VStack>
                  )}
                </VStack>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default CalculatePriceDialog
