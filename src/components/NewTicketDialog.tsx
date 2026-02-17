'use client'
import { Dialog, Portal, Button, Field, Input } from '@chakra-ui/react'
import { FunctionComponent, useCallback, useState } from 'react'
import { toaster } from '@/components/ui/toaster'
import { getFreeSpaces, getTicket } from '@/services/ticketService'

const NewTicketDialog: FunctionComponent = () => {
  const [customerName, setCustomerName] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)
  const [freeSpaces, setFreeSpaces] = useState<number | undefined>()
  const onSubmit = (e: React.SyntheticEvent<HTMLElement, Event>) => {
    e.preventDefault()
    handleSubmit()
  }
  const handleSubmit = useCallback(() => {
    if (!customerName.trim()) {
      toaster.create({
        title: 'Name required',
        description: 'Please enter customer name',
        type: 'warning',
        duration: 3000
      })
      return
    }

    const result = getTicket(customerName)

    if (result.success) {
      toaster.create({
        title: 'Ticket issued',
        description: `Ticket for ${customerName} created successfully`,
        type: 'success',
        duration: 3000
      })
      setCustomerName('')
      setOpen(false)
    } else {
      toaster.create({
        title: 'Error',
        description: result.error,
        type: 'error',
        duration: 5000
      })
    }
  }, [customerName])

  const handleOpenChange = useCallback((details: { open: boolean }) => {
    setOpen(details.open)
    if (details.open) {
      const spaces = getFreeSpaces()
      setFreeSpaces(spaces.data?.free)
      setCustomerName('')
    } else {
      setFreeSpaces(undefined)
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
          variant='solid'
          size='sm'
          px={4}
          colorPalette={'blue'}
          borderRadius={8}
          _hover={{ scale: 1.05 }}
        >
          Create ticket
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
            as={'form'}
            onSubmit={onSubmit}
          >
            <Dialog.Header>
              <Dialog.Title>
                Issue New Ticket - {freeSpaces} spaces left
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pt={4}>
              <Field.Root>
                <Field.Label>Customer Name</Field.Label>
                <Input
                  placeholder='Enter customer name'
                  value={customerName}
                  px={2}
                  onChange={(e) => setCustomerName(e.target.value)}
                  autoFocus
                />
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer pt={4}>
              <Dialog.ActionTrigger asChild>
                <Button
                  variant='solid'
                  colorPalette={'red'}
                  w={32}
                  onClick={() => {
                    setOpen(false)
                  }}
                >
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button colorPalette='blue' variant='solid' w={32} type='submit'>
                Issue Ticket
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

export default NewTicketDialog
