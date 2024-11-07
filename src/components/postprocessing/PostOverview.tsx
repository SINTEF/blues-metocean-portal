import React, { ReactNode, useState } from 'react'

import { Grid2 as Grid } from '@mui/material'
import Box from '@mui/material/Box'
import { Menu } from 'antd'
import '../../layout/Menu.css'
import { cardBgColor } from '../../layout/Colors'
import ScatterView from './ScatterView'
import ReturnValueStats from './ReturnValueStats'
import ContourView from './ContourView'
import HindcastView from './HindcastView'

export const PostOverview = () => {

  const items = [
    { "key": "scatter", "title": "Scatter tables", content: <ScatterView/> },
    { "key": "returnperiod", "title": "Return values", content: <ReturnValueStats/> },
    { "key": "contours", "title": "Contour plot", content: <ContourView/> },
    // { "key": "report", "title": "Report generation", content: <ReportView/> },
    { "key": "sima", "title": "Hindcast", content: <HindcastView/> },
  ]

  const [selected, setSelected] = useState<{ "key": string, "title": string, content?: ReactNode  }>(items[0])

  return (
    <>
      <div>
        Select from different post processing options that are available for the selected datasets.
      </div>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid size={2}>
              <Box>
                <Menu mode="inline" style={{backgroundColor:cardBgColor}}>
                  {items.map(item => (
                    <Menu.Item key={item.title} onClick={() => setSelected(item)}>
                      {item.title}
                    </Menu.Item>
                  ))}
                </Menu>
              </Box>
          </Grid>
          <Grid size={10} sx={{ flexGrow: 1 }}>
            {selected && <>
              {selected.content}
            </>}
          </Grid>
        </Grid>
      </Box>
    </>
  )
}
