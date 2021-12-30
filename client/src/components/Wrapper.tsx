import { Box } from '@chakra-ui/react';
import * as React from 'react';

export interface WrapperProps {
  children: React.ReactNode
}

export default function Wrapper ({children}: WrapperProps) {
  return (
    <Box maxW='400px' width='100%' mt={48} mx='auto'>
      {children}
    </Box>
  );
}
