'use client'

import { SPA_CONFIG } from '@/constant/spa'
import { useSpaStore } from '@/store/useSpaStore'
import { HStack, Text } from '@chakra-ui/react'

const CapacityStats = () => {
  const activeCount = useSpaStore(
    (state) => state.tickets.filter((t) => !t.returnedAt).length
  )
  const total = SPA_CONFIG.TOTAL_CAPACITY
  const occupied = activeCount
  const free = total - occupied
  const percentage = Math.round((occupied / total) * 100)
  return (
    <HStack gap={4}>
      <HStack>
        <Text fontSize='md' color='gray.500'>
          Totall Capacity
        </Text>
        <Text fontSize='lg' fontWeight='bold'>
          {total} guests
        </Text>
      </HStack>
      <HStack>
        <Text fontSize='md' color='gray.500'>
          Currently Occupied
        </Text>
        <Text fontSize='lg' fontWeight='bold' color={'red.500'}>
          {occupied} guests
        </Text>
        <Text fontSize='lg' fontWeight='bold' color={'red.500'}>
          ({percentage}% full)
        </Text>
      </HStack>
      <HStack>
        <Text fontSize='md' color='gray.500'>
          Free Spaces
        </Text>
        <Text fontSize='lg' fontWeight='bold' color={'green.500'}>
          {free} guests
        </Text>
      </HStack>
    </HStack>
  )
}

export default CapacityStats
