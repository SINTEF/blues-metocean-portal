import { Grid } from '@mui/material'
import Box from '@mui/material/Box'
import React from 'react'
import CodeBox from './components/CodeBox'
import { Link } from 'react-router-dom';
import { backgroundColorDefault, cardBgColor } from './layout/Colors'
import './layout/Menu.css'

const AppOverview = () => {
  return (
    <>

      <Box sx={{ flexGrow: 1 }} style={{backgroundColor:cardBgColor, margin: '0px 0px 10px 0px', color: backgroundColorDefault }}>
        <div>
          The Metocean Portal is a companion site to the open source <a href='https://metocean-api.readthedocs.io/'>metocean-api</a> and <a href='https://metocean-stats.readthedocs.io/'>metocean-stats</a> python libraries 
          that allows you to import and analyze oceanographic and meteorological data.<br/>
          It supports data from various sources. The library can be useful for researchers, students, and professionals interested in fetching and visualizing metocean data.<br/>
          For example of usage in SIMA, see the <a href='https://github.com/SINTEF/simapy-examples/tree/main/src/metocean'>example repository </a> or the examples in the code repositories of the libraries.
        </div>
        <div>
          To start, you can head over to the <Link to="/datasets">datasets</Link> section and select some data of interest or directly to <Link to="/postprocessing">post processing</Link> to find different applications of the library
        </div>
        <b/>
        <p>To install the library and its dependencies, you can use the following command:</p>
        <Grid item xs>
          <CodeBox text="pip install -U metocean-api metocean-stats simapy openpyxl"></CodeBox>
        </Grid>
        
      </Box>

    </>
  )
}
export default AppOverview