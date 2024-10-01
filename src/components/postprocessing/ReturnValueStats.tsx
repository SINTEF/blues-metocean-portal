import { Grid, InputLabel, MenuItem, Select } from '@mui/material'
import Box from '@mui/material/Box'
import { Stack } from '@mui/system'
import { LatLng } from 'leaflet'
import React, { useContext, useEffect, useState } from 'react'
import { FeatureGroup, Polygon, TileLayer } from 'react-leaflet'
import { AppCtx } from '../../App'
import { Dataset,DatasetContainer,DatasetVariable } from '../../Types'
import { CardWrapper } from '../Card'
import CodeBox from '../CodeBox'
import { DraggableMarker } from '../DragableMarker'
import { StyledMapContainer } from '../Map'
import { TextMarker } from '../TextMarker'

function findDatasets(container: DatasetContainer, selectedSets: Dataset[]) {
  container.containers?.forEach(child => findDatasets(child, selectedSets))
  container.datasets?.forEach(dataset => selectedSets.push(dataset))
}


const ReturnValueStats = () => {

  const app = useContext(AppCtx);

  const center = new LatLng(62.536484, 4.176969)
  const [position, setPosition] = useState<LatLng>(center)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedSet, setSelectedSet] = useState<Dataset>()
  const [variables, setVariables] = useState<DatasetVariable[]>([])


  const [row, setRow] = useState<DatasetVariable>()
  const [code, setCode] = useState<string>("")

  useEffect(() => {
    if (selectedSet && row && position) {
      setCode(toCodeString(selectedSet,row,position))
    }
  }, [position, selectedSet, row])

  useEffect(() => {
    if (selectedSet) {
      setRow(selectedSet.variables.find(v => v.name === (row ? row.name :  "hs")))
      setVariables(selectedSet.variables.filter(hasTime))
    }
  }, [selectedSet,row])

  useEffect(() => {
    if (app) {
      app.datasetContainers.forEach(container => {
        const availableSets: Dataset[] = []
        container.containers?.forEach(child => findDatasets(child, availableSets))
        setDatasets(availableSets)
        if (availableSets.length > 0) {
          setSelectedSet(availableSets[0])
        }
      })
    }
  }, [app])

  function toCodeString(set: Dataset, variable: DatasetVariable, position: LatLng) {
    const api = set.api
    const idx = api.lastIndexOf(".")
    const dataset = api.substring(idx + 1)
    const imprt = api.substring(0, idx)
    const name = variable.name
    const pos = { lat: position.lat.toFixed(4), lng: position.lng.toFixed(4) }
   return `
"""
Calculate return values for selected datasets

Required libraries:

pip install virocon
pip install xclim

"""
from datetime import datetime

from bluesmet.${imprt} import ${dataset}

from bluesmet.normet.metengine.extreme_stats import return_value

# Coordinates we want to get data for
lat_pos = ${pos.lat}
lon_pos = ${pos.lng}
start_date = datetime(1997, 1, 1)
end_date = datetime(2007, 12, 31)

variables = [
    "${name}",
]

values = wave_sub_time.get_values_between(lat_pos, lon_pos, start_date, end_date, requested_values=variables)

return_periods=[5,10,50,100]

for name in variables:
    print("Computing return value for " + name)
    value = values[name]
    ret = return_value(value, return_periods)
    for value, rp in zip(ret.values,return_periods):
        print("Value for return period " + str(rp) + " years: " + str(value))
    print()

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


  function hasTime(variable: DatasetVariable) {
    const dims = variable.dimensions
    if (dims) {
      return dims.includes("time")
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
                  value={row?.name || ''}>
                  {variables.map(variable => (
                    <MenuItem key={"row_" + variable.name} value={variable.name} onClick={() => setRow(variable)}>{variable.name} - {variable.description}</MenuItem>
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
