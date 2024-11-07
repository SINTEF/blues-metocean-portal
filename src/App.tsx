import React, { createContext, useEffect, useState } from 'react'
import { HashRouter  } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'
import { backgroundColorDefault } from './layout/Colors'
import Portal from './Portal'
import { LinearProgress } from '@mui/material'
import { DatasetProvider } from './Types'

const GlobalStyle = createGlobalStyle`
  body {
    padding: 0;
    margin: 0;
    background-color: ${backgroundColorDefault};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`

interface MetPortal {
  providers: DatasetProvider[]
}

const init = { providers: [] }


export const AppCtx = createContext<MetPortal>(init);


const App = () => {
  const [app, setApp] = useState<MetPortal>(init)
  const [isLoading, setIsLoading] = useState<Boolean>(true)

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/portal.json`)
      .then((response) => response.json())
      .then((jsonData) => setApp(jsonData))
      .then(() => setIsLoading(false))
      .catch((error) => console.error('Error fetching the JSON file:', error));
  }, []);

  if (isLoading) {
    return <LinearProgress />
  }
  return (
    <AppCtx.Provider value={app}>
      <HashRouter>
        <GlobalStyle />
        <Portal />
      </HashRouter >
    </AppCtx.Provider>
  )
}

export default App
