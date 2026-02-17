'use client'
import { HStack, VStack, Text } from '@chakra-ui/react'
import { FunctionComponent } from 'react'

type Props = {
  customerName: string
  barcode: string
  entryTime: string
  exitTime?: string
}
const DialogHeroTemplate: FunctionComponent<Props> = ({
  customerName,
  barcode,
  entryTime,
  exitTime
}) => {
  return (
    <VStack align='stretch' gap={2} mb={4}>
      <HStack justify='space-between'>
        <Text fontSize='sm'>Customer name</Text>
        <Text fontSize='sm' fontWeight='semibold'>
          {customerName}
        </Text>
      </HStack>
      <HStack justify='space-between'>
        <Text fontSize='sm'>Barcode</Text>
        <Text fontSize='xs' fontFamily='mono'>
          {barcode}
        </Text>
      </HStack>
      <HStack justify='space-between'>
        <Text fontSize='sm'>Entry Time</Text>
        <Text fontSize='sm'>{entryTime}</Text>
      </HStack>
      {exitTime && (
        <HStack justify='space-between'>
          <Text fontSize='sm'>Exit Time</Text>
          <Text fontSize='sm'>{exitTime}</Text>
        </HStack>
      )}
    </VStack>
  )
}

export default DialogHeroTemplate
