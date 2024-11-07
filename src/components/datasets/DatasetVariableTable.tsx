import React, { useEffect, useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { DatasetVariable,Dataset } from '../../Types'
import { Checkbox } from '@mui/material';

import { LatLng } from 'leaflet'
import CodeBox from '../CodeBox'

function toCodeString(set: Dataset, pos: LatLng,selected: DatasetVariable[]): string {
  return `
from metocean_api.ts import TimeSeries

# Coordinates we want to get data for
lat_pos = ${pos.lat.toFixed(4)}
lon_pos = ${pos.lng.toFixed(4)}

start_date = "2020-10-21"
end_date = "2020-10-22"

variables = [
${selected.map(p => "\t\"" + p.name + "\"").join(",\n")}
]

ts = TimeSeries(
    lon=lon_pos,
    lat=lat_pos,
    start_time=start_date,
    end_time=end_date,
    variable=variables,
    product="${set.name}",
)

ts.import_data(save_csv=True, save_nc=False)

# Coordinates we actually do get data for (nearest grid point)
alat = ts.lat_data
alon = ts.lon_data
print(f"Actual coordinates: {alat} lon: {alon}")

data = ts.data

for name,vardata in data.items():
    value = vardata.values
    if value.shape:
        print(f"Mean of {name}: {value.mean()}")
    else:
        print(f"{name}: {value}")
`
}

export const DatasetVariableTable = (props: {
  set: Dataset,
  position: LatLng
}): JSX.Element => {
  const { set, position } = props

  const [selected, setSelected] = useState<DatasetVariable[]>([])
  const [code, setCode] = useState<string>("")

  useEffect(() => {
    setCode(toCodeString(set, position,selected))
  }, [set, position,selected])

  function onChange(event: any, property: DatasetVariable) {
    if (event.target.checked) {
      setSelected([...selected, property])
    } else {
      setSelected(selected.filter(p => p.name !== property.name))
    }
  }

  function CodeComponent() {
    if (selected.length > 0) {
      return <CodeBox text={code}></CodeBox>
    } else {
      return <div style={{ padding: "10px" }}>Select variables to see code</div>;
    }
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table style={{ width: '100%', height: "100%" }}>
          <TableHead>
            <TableRow key="header">
              <TableCell>name</TableCell>
              <TableCell>description</TableCell>
              <TableCell>unit</TableCell>
              <TableCell>dimensions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {set.variables.map((variable) => (
              <TableRow key={variable.name}>
                <TableCell>
                <Checkbox disabled={variable.name === "time"} onChange={event => onChange(event, variable)}></Checkbox>{variable.name}
                </TableCell>
                <TableCell>{variable.description}</TableCell>
                <TableCell>{variable.unit}</TableCell>
                <TableCell>{variable.dimensions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <CodeComponent />
      </TableContainer>
    </>
  )
}
