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


function hasUnit(variable: DatasetVariable, unit: string) {
  const dims = variable.dimensions
  const vunit = variable.unit
  if (dims && dims.includes("time")) {
    return vunit && (vunit === unit)
  }
  return false
}

function includeDataset(set: Dataset){
  if(set.variables.find(includeVariable)){
    return true;
  }
  return false;
}

function includeVariable(variable: DatasetVariable) {
  return hasUnit(variable,"m") || hasUnit(variable,"s")
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

function toCodeString(set: Dataset, position: LatLng, row?: DatasetVariable, column?: DatasetVariable) {
  const pos = { lat: position.lat.toFixed(4), lng: position.lng.toFixed(4) }
  const hs = row ? row.name : "hs"
  const tp = column ? column.name : "tp"
  const start_date = "1997-01-01"
  const end_date = "1997-12-31"
  return `
"""
Plot contours for selected datasets

"""
from metocean_api import ts
from metocean_stats.plots.extreme import plot_joint_distribution_Hs_Tp
  
# Coordinates we want to get data for
lat_pos = ${pos.lat}
lon_pos = ${pos.lng}
start_date = "${start_date}"
end_date = "${end_date}"

requested_values = ["${hs}", "${tp}"]

df_ts = ts.TimeSeries(
    lon=lon_pos,
    lat=lat_pos,
    start_time=start_date,
    end_time=end_date,
    variable=requested_values,
    product="${set.name}",
)

df_ts.import_data(save_csv=True, save_nc=False)
values = df_ts.data

path = "output/joint_contour.png"

plot_joint_distribution_Hs_Tp(values,"${hs}","${tp}",periods=[5, 10, 50, 100], output_file=path)
`
}

const ContourView = () => {

  const app = useContext(AppCtx);

  const center = new LatLng(62.536484, 4.176969)
  const [position, setPosition] = useState<LatLng>(center)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedSet, setSelectedSet] = useState<Dataset>()
  const [variables, setVariables] = useState<DatasetVariable[]>([])


  const [tp, setTp] = useState<DatasetVariable>()
  const [hs, setHs] = useState<DatasetVariable>()
  const [code, setCode] = useState<string>("")


  useEffect(() => {
    if (selectedSet) {
      setCode(toCodeString(selectedSet,position, hs, tp))
    }
  }, [position, selectedSet, tp, hs])


  useEffect(() => {
    if (selectedSet) {
      setHs(selectedSet.variables.find(v => v.name === (hs ? hs.name :  "hs")))
      setTp(selectedSet.variables.find(v => v.name === (tp ? tp.name :  "tp")))
      setVariables(selectedSet.variables.filter(includeVariable))
    }
  }, [selectedSet,hs,tp])

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

  

  return (
    <Box sx={{ flexGrow: 1, height: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <CardWrapper style={{ width: '100%', height: '100%' }}>
            <h4 style={{ margin: '15px' }}>
              Contours
            </h4>
            <TextMarker position={position} setPosition={setPosition} />
            <Stack>
              {selectedSet && <>
                <InputLabel>Dataset:</InputLabel>
                <Select
                  id="select-ds"
                  value={selectedSet?.name}
                  label="Dataset"
                >
                  {datasets.map(set => <MenuItem key={set.name} value={set.name} onClick={() => setSelectedSet(set)}>{set.name}</MenuItem>)}
                </Select>
                <InputLabel>Hs:</InputLabel>
                <Select
                  value={hs?.name || ''}>
                  {variables.filter(variable=>hasUnit(variable,"m")).map(variable => (
                    <MenuItem key={"row_" + variable.name} value={variable.name} onClick={() => setHs(variable)}>{variable.name} - {variable.description}</MenuItem>
                  ))}
                </Select>
                <InputLabel>Tp:</InputLabel>
                <Select
                  value={tp?.name || ''}>
                  {variables.filter(variable=>hasUnit(variable,"s")).map(variable => (
                    <MenuItem key={"col_" + variable.name} value={variable.name} onClick={() => setTp(variable)}>{variable.name} - {variable.description}</MenuItem>
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

export default ContourView
