'use client'
import {
  Dialog,
  Portal,
  Button,
  Text,
  CloseButton,
  Box,
  VStack,
  HStack,
  SimpleGrid,
  Card
} from '@chakra-ui/react'
import { FunctionComponent, useCallback, useState } from 'react'
import { PaymentMethod, Ticket } from '@/types/ticket'
import { calculatePrice, payTicket } from '@/services/ticketService'
import { PaymentResult } from '@/types/result'
import { LuBanknote, LuCreditCard, LuReceipt, LuWallet } from 'react-icons/lu'
import { FiAlertCircle } from 'react-icons/fi'
import { BiCheckCircle } from 'react-icons/bi'
import { useSpaStore } from '@/store/useSpaStore'
import DialogHeroTemplate from './DialogHeroTemplate'
type Props = {
  ticket: Ticket
}
const PayTicketDialog: FunctionComponent<Props> = ({ ticket }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [response, setResponse] = useState<PaymentResult | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  )
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const liveTicket = useSpaStore((state) =>
    state.tickets.find((t) => t.barcode === ticket.barcode)
  )
  const handleOpenChange = useCallback(
    (details: { open: boolean }) => {
      setOpen(details.open)

      if (details.open) {
        const priceResult = calculatePrice(
          liveTicket?.barcode ?? ticket.barcode
        )
        if (priceResult.success && priceResult.data) {
          setCurrentPrice(priceResult.data.price)
        }
      } else {
        setResponse(null)
        setSelectedMethod(null)
      }
    },
    [ticket.barcode]
  )

  const paymentMethods = [
    {
      id: 'credit' as PaymentMethod,
      label: 'Credit Card',
      icon: LuCreditCard,
      color: 'blue',
      description: 'Pay with credit card'
    },
    {
      id: 'debit' as PaymentMethod,
      label: 'Debit Card',
      icon: LuWallet,
      color: 'purple',
      description: 'Pay with debit card'
    },
    {
      id: 'cash' as PaymentMethod,
      label: 'Cash',
      icon: LuBanknote,
      color: 'green',
      description: 'Pay with cash'
    }
  ]

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
          gap={2}
          disabled={liveTicket?.isPaid}
          bg='purple.500/15'
          borderRadius={8}
          _hover={{ scale: 1.05 }}
          borderColor='purple.500/30'
          borderWidth={1}
          color='purple.500'
        >
          <LuCreditCard />
          {liveTicket?.isPaid ? 'Already Paid' : 'Pay Ticket'}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content p={6} bg={'white'} color={'gray.800'}>
            <Dialog.Header mb={4} display='flex' alignItems='center'>
              <Dialog.Title>Pay Ticket for {ticket.customerName}</Dialog.Title>
              <CloseButton ml={'auto'} onClick={() => setOpen(false)} />
            </Dialog.Header>
            <Dialog.Body>
              <VStack align='stretch' gap={2}>
                <DialogHeroTemplate
                  customerName={ticket.customerName}
                  barcode={ticket.barcode}
                  entryTime={new Date(ticket.entryTime).toLocaleString()}
                />
                {currentPrice > 0 && !response?.success && (
                  <HStack
                    justify='space-between'
                    pt={2}
                    borderTop='1px solid'
                    borderColor='gray.200'
                  >
                    <Text fontSize='md' fontWeight='semibold' color='gray.700'>
                      Amount Due
                    </Text>
                    <Text fontSize='2xl' fontWeight='bold' color='blue.600'>
                      €{currentPrice}
                    </Text>
                  </HStack>
                )}
              </VStack>

              {!selectedMethod && !response && (
                <VStack align='stretch' gap={4}>
                  <Text fontSize='sm' fontWeight='medium' color='gray.700'>
                    Select Payment Method
                  </Text>

                  <SimpleGrid columns={3} gap={3}>
                    {paymentMethods.map((method) => {
                      const Icon = method.icon
                      return (
                        <Button
                          key={method.id}
                          onClick={() => {
                            setSelectedMethod(method.id)
                            const result = payTicket(ticket.barcode, method.id)
                            setResponse(result)
                          }}
                          variant='outline'
                          colorPalette={method.color}
                          size='lg'
                          h='auto'
                          py={6}
                          borderRadius={8}
                          flexDirection='column'
                          gap={3}
                          _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg'
                          }}
                          transition='all 0.2s'
                        >
                          <Box fontSize='3xl'>
                            <Icon />
                          </Box>
                          <VStack gap={0}>
                            <Text fontSize='sm' fontWeight='semibold'>
                              {method.label}
                            </Text>
                            <Text fontSize='xs' color='gray.500'>
                              {method.description}
                            </Text>
                          </VStack>
                        </Button>
                      )
                    })}
                  </SimpleGrid>
                </VStack>
              )}

              {response && !response.success && (
                <VStack
                  gap={5}
                  mt={4}
                  borderRadius={8}
                  borderWidth={1}
                  borderColor={'red.200'}
                  bg='red.50'
                  p={4}
                >
                  <HStack
                    gap={3}
                    align='center'
                    w={'full'}
                    justify='center'
                    pt={4}
                  >
                    <Box color='red.500'>
                      <FiAlertCircle size={24} />
                    </Box>
                    <Text fontWeight='semibold' color='red.500' fontSize='lg'>
                      Payment Failed
                    </Text>
                  </HStack>
                  <Text fontSize='sm' color='red.600'>
                    {response.error}
                  </Text>
                  <Button
                    size='sm'
                    colorPalette='red'
                    variant='solid'
                    borderRadius={8}
                    w={'full'}
                    onClick={() => {
                      setResponse(null)
                      setSelectedMethod(null)
                    }}
                  >
                    Try Again
                  </Button>
                </VStack>
              )}

              {response?.success && response.data && (
                <VStack align='stretch' gap={4} my={4}>
                  <Card.Root
                    bg='green.50'
                    borderColor='green.200'
                    variant='outline'
                    px={2}
                    py={4}
                  >
                    <Card.Body>
                      <HStack gap={3}>
                        <Box color='green.500'>
                          <BiCheckCircle size={32} />
                        </Box>
                        <VStack align='start' gap={0}>
                          <Text
                            fontWeight='bold'
                            fontSize='lg'
                            color='green.700'
                          >
                            Payment Successful!
                          </Text>
                          <Text fontSize='sm' color='green.600'>
                            {response.message}
                          </Text>
                        </VStack>
                      </HStack>
                    </Card.Body>
                  </Card.Root>

                  <HStack gap={2}>
                    <LuReceipt size={18} />
                    <Text fontWeight='semibold' fontSize='sm'>
                      Payment Summary
                    </Text>
                  </HStack>

                  <VStack align='stretch' gap={3}>
                    <HStack justify='space-between'>
                      <Text fontSize='sm' color='gray.600'>
                        Amount Paid
                      </Text>
                      <Text fontSize='xl' fontWeight='bold' color='green.600'>
                        €{response.data.amountPaid}
                      </Text>
                    </HStack>

                    <HStack justify='space-between'>
                      <Text fontSize='sm' color='gray.600'>
                        Payment Method
                      </Text>
                      <Text
                        fontSize='sm'
                        fontWeight='medium'
                        textTransform='uppercase'
                      >
                        {selectedMethod}
                      </Text>
                    </HStack>

                    <HStack justify='space-between'>
                      <Text fontSize='sm' color='gray.600'>
                        Remaining Balance
                      </Text>
                      <Text
                        fontSize='sm'
                        fontWeight='semibold'
                        color='green.600'
                      >
                        €{response.data.newBalance}
                      </Text>
                    </HStack>
                  </VStack>

                  <Box
                    p={3}
                    bg='orange.100'
                    borderRadius='md'
                    border='1px solid'
                    borderColor='orange.400'
                  >
                    <Text fontSize='xs' color='orange.700' lineHeight='tall'>
                      <strong>Grace Period:</strong> You have 15 minutes from
                      payment time to exit the spa. After that, a penalty will
                      apply.
                    </Text>
                  </Box>
                </VStack>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default PayTicketDialog
