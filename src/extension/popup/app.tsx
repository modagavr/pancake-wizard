import { ColorModeScript } from '@chakra-ui/color-mode'
import { Box } from '@chakra-ui/layout'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import React from 'react'
import ReactDOM from 'react-dom'

import Main from './components/Main'

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false
}

const theme = extendTheme({ config })

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box p="4" w="lg">
        <Main />
      </Box>
    </ChakraProvider>
  )
}

ReactDOM.render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </>,
  document.getElementById('root')
)
