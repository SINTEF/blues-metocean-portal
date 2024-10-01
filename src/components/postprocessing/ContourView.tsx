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


function hasUnit(variable: DatasetVariable, unit: string) {
  const dims = variable.dimensions
  const vunit = variable.unit
  if (dims && dims.includes("time")) {
    return vunit && (vunit === unit)
  }
  return false
}

function isHsOrTp(variable: DatasetVariable) {
  return hasUnit(variable,"m") || hasUnit(variable,"s")
}

function findDatasets(container: DatasetContainer, selectedSets: Dataset[]) {
  container.containers?.forEach(child => findDatasets(child, selectedSets))
  container.datasets?.forEach(dataset => {
    selectedSets.push(dataset)
  })
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
  const api = set.api
  const idx = api.lastIndexOf(".")
  const dataset = api.substring(idx + 1)
  const imprt = api.substring(0, idx)
  const pos = { lat: position.lat.toFixed(4), lng: position.lng.toFixed(4) }
  const hs = row ? row.name : "hs"
  const tp = column ? column.name : "tp"
  return `
"""
Calculate contours for selected datasets

Required libraries:

pip install virocon
pip install xclim

"""
from datetime import datetime

from bluesmet.${imprt} import ${dataset}
from bluesmet.normet.metengine.extreme_stats import joint_2D_contour


# Coordinates we want to get data for
lat_pos = ${pos.lat}
lon_pos = ${pos.lng}
start_date = datetime(2020, 1, 1)
end_date = datetime(2022, 12, 31)

variables = ["${hs}", "${tp}"]

values = wave_sub_time.get_values_between(
  lat_pos, lon_pos, start_date, end_date, requested_values=variables
)

${hs} = values["${hs}"]
${tp} = values["${tp}"]

path = "output/joint_contour.png"

joint_2D_contour(
  ${hs}, ${tp}, return_periods=[5, 10, 50, 100], image_path=path, image_title="Contour"
)

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
      setVariables(selectedSet.variables.filter(isHsOrTp))
    }
  }, [selectedSet,hs,tp])

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
