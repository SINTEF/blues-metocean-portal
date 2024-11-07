import { Grid, InputLabel, MenuItem, Select } from '@mui/material'
import Box from '@mui/material/Box'
import { Stack } from '@mui/system'
import { LatLng } from 'leaflet'
import React, { useContext, useEffect, useState } from 'react'
import { FeatureGroup, Polygon, TileLayer } from 'react-leaflet'
import { AppCtx } from '../../App'
import { Dataset,DatasetVariable } from '../../Types'
import { CardWrapper } from '../Card'
import CodeBox from '../CodeBox'
import { DraggableMarker } from '../DragableMarker'
import { StyledMapContainer } from '../Map'
import { TextMarker } from '../TextMarker'

const ReturnValueStats = () => {

  const app = useContext(AppCtx);

  const center = new LatLng(62.536484, 4.176969)
  const [position, setPosition] = useState<LatLng>(center)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedSet, setSelectedSet] = useState<Dataset>()
  const [variables, setVariables] = useState<DatasetVariable[]>([])


  const [selectedVariable, setSelectedVariable] = useState<DatasetVariable>()
  const [code, setCode] = useState<string>("")

  function includeDataset(set: Dataset){
    if(set.variables.find(includeVariable)){
      return true;
    }
    return false;
  }

  useEffect(() => {
    if (selectedSet && selectedVariable && position) {
      setCode(toCodeString(selectedSet,selectedVariable,position))
    }
  }, [position, selectedSet, selectedVariable])

  useEffect(() => {
    if (selectedSet) {
      const variables = selectedSet.variables.filter(includeVariable)
      setVariables(variables)
      const variable = variables.find(v => v.name === (selectedVariable ? selectedVariable.name :  variables[0].name))
      if(variable){
        setSelectedVariable(variable)
      }else{
        setSelectedVariable(variables[0])
      }
    }
  }, [selectedSet])

  useEffect(() => {
    if (app) {
      app.providers.forEach(container => {
        const availableSets = container.datasets.filter(includeDataset)
        setDatasets(availableSets)
        if (availableSets.length > 0) {
          setSelectedSet(availableSets[0])
        }
      })
    }
  }, [app])

  function toCodeString(set: Dataset, variable: DatasetVariable, position: LatLng) {
    const name = variable.name
    const pos = { lat: position.lat.toFixed(4), lng: position.lng.toFixed(4) }
    const start_date = "1999-01-01"
    const end_date = "2002-12-31"
   return `
"""
Calculate return values for selected datasets

"""
import xarray as xr
from metocean_api import ts
from metocean_stats.stats.extreme import return_levels_pot

# Coordinates we want to get data for
lat_pos = ${pos.lat}
lon_pos = ${pos.lng}
start_date = "${start_date}"
end_date = "${end_date}"

requested_values = [
    "${name}",
]

df_ts = ts.TimeSeries(
    lon=lon_pos,
    lat=lat_pos,
    start_time=start_date,
    end_time=end_date,
    variable=requested_values,
    product="${set.name}",
)

# If the requested variable is changed after running, the cache must be deleted manually before running again
df_ts.import_data(save_csv=False, save_nc=False,use_cache=True)

return_periods = [5,10]

data = df_ts.data
# Pick the first variable in the dataset
variable = data.columns[0]

ret =  return_levels_pot(df_ts.data, variable,periods=return_periods)

values = ret.return_levels

print(f"Return values for {variable}")
for rp,rv in zip(return_periods,values):
    print(f"{rp} years: {rv:.2f} m")
`
  }

  function getArea(set: Dataset): [number, number][] {
    const lats = set.latitudes
    const lons = set.longitudes
    const latlons: [number, number][] = [];
    lats.forEach((lat, index) => {
      const lon = lons[index];
      latlons.push([lat, lon])
    });
    return latlons
  }

  function Area(props: { set: Dataset }) {
    // const color = mset.color
    return <>
      <FeatureGroup>
        <Polygon positions={getArea(props.set)} />
      </FeatureGroup>
    </>
  }


  function includeVariable(variable: DatasetVariable) {
    const dims = variable.dimensions
    if (dims) {
      return dims.includes("time") && variable.name !== "time"
    }
    return false
  }

  return (
    <Box sx={{ flexGrow: 1, height: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <CardWrapper style={{ width: '100%', height: '100%' }}>
            <h4 style={{ margin: '15px' }}>
              Return values
            </h4>
            <TextMarker position={position} setPosition={setPosition} />
            <Stack>
              {selectedSet && <>
                <InputLabel>Dataset to find return values for:</InputLabel>
                <Select
                  id="select-ds"
                  value={selectedSet?.name}
                  label="Dataset"
                >
                  {datasets.map(set => <MenuItem key={set.name} value={set.name} onClick={() => setSelectedSet(set)}>{set.name}</MenuItem>)}
                </Select>
                <InputLabel>Variable:</InputLabel>
                <Select
                  value={selectedVariable?.name || ''}>
                  {variables.map(variable => (
                    <MenuItem key={"row_" + variable.name} value={variable.name} onClick={() => setSelectedVariable(variable)}>{variable.name} - {variable.description}</MenuItem>
                  ))}
                </Select>
              </>
              }
            </Stack>
            <CodeBox text={code} customStyle={{ maxHeight: '500px' }}></CodeBox>
          </CardWrapper>
        </Grid>
        <Grid item xs={6}>
          <CardWrapper style={{ width: '100%', height: '720px' }}>
            <StyledMapContainer
              center={center}
              zoom={3}
              scrollWheelZoom={true}
            >
              <DraggableMarker position={position} setPosition={setPosition}></DraggableMarker>
              <TileLayer
                attribution='<a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {selectedSet && <Area set={selectedSet} />}
            </StyledMapContainer>
          </CardWrapper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ReturnValueStats
