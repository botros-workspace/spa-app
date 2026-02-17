'use client'

import { Flex, Heading, VStack, Text } from '@chakra-ui/react'
import NewTicketDialog from './NewTicketDialog'
import { FunctionComponent } from 'react'

const TicketManagementHeader: FunctionComponent = () => {
  return (
    <Flex
      justify='space-between'
      align='center'
      mb={8}
      borderBottomWidth={1}
      borderColor='gray.200'
      pb={4}
      boxShadow={'md'}
      px={8}
      py={4}
    >
      <VStack align='start' gap={1}>
        <Heading size='xl'>Spa Ticket System</Heading>
        <Text color='gray.600'>Manage customer tickets </Text>
      </VStack>

      <NewTicketDialog />
    </Flex>
  )
}

export default TicketManagementHeader
