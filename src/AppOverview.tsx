import { Grid } from '@mui/material'
import Box from '@mui/material/Box'
import React from 'react'
import CodeBox from './components/CodeBox'
import { backgroundColorDefault, cardBgColor } from './layout/Colors'
import './layout/Menu.css'

const AppOverview = () => {
  return (
    <>

      <Box sx={{ flexGrow: 1 }} style={{backgroundColor:cardBgColor, margin: '0px 0px 10px 0px', color: backgroundColorDefault }}>
        <div>
          The Metocean Portal is a companion site to the open source <a href='https://github.com/SINTEF/blues-metocean-lib'>SFI Blues Metocean python library</a> that allows you to view and analyze oceanographic and meteorological data.<b />
          It supports data from various sources. The library can be useful for researchers, students, and professionals interested in fetching and visualizing metocean data.<b />
          For example of usage, see the <a href='https://github.com/SINTEF/blues-metocean-lib-examples'>example repository </a>
        </div>
        <div>
          To start, you can head over to the <a href='/datasets'>datasets</a> section and select some data of interest or directly to <a href='/postprocessing'>post processing</a> to find different applications of the library
        </div>
        <b/>
        <p>To install the library and its dependencies, you can use the following command:</p>
        <Grid item xs>
          <CodeBox text="pip install -U bluesmet netCDF4==1.6.4 simapy==4.6.0 windrose==1.9.0 virocon==2.2.1 xclim==0.46.0 seaborn==0.13.0 openpyxl==3.1.2 python-docx==1.1.0"></CodeBox>
        </Grid>
        
      </Box>

    </>
  )
}
export default AppOverview