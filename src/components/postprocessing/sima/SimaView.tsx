import { Grid, InputLabel, MenuItem, Select } from '@mui/material'
import Box from '@mui/material/Box'
import { Stack } from '@mui/system'
import { LatLng } from 'leaflet'
import React, { useContext, useEffect, useState } from 'react'
import { FeatureGroup, Polygon, TileLayer } from 'react-leaflet'
import { Dataset,DatasetContainer,DatasetVariable } from '../../../Types'
import { AppCtx } from '../../../App'
import { CardWrapper } from '../../Card'
import CodeBox from '../../CodeBox'
import { DraggableMarker } from '../../DragableMarker'
import { StyledMapContainer } from '../../Map'
import { TextMarker } from '../../TextMarker'
import { toHindcastCode } from './SimaHindcastTemplate'
import { toScatterCode } from './SimaScatterTemplate'

function findDatasets(container: DatasetContainer, selectedSets: Dataset[]) {
  container.containers?.forEach(child => findDatasets(child, selectedSets))
  container.datasets?.filter(include).forEach(dataset => selectedSets.push(dataset))
}

function include(set: Dataset){
  if(set.variables.find(isHsOrTp)){
    return true;
  }
  return false;
}

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


const SimaView = () => {

  const app = useContext(AppCtx);

  const center = new LatLng(62.536484, 4.176969)
  const [position, setPosition] = useState<LatLng>(center)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedSet, setSelectedSet] = useState<Dataset>()


  const [code, setCode] = useState<string>("")
  const [type, setType] = useState<string>("Scatter")

  useEffect(() => {
    if (selectedSet) {
      const func = toCode(type)
      setCode(func(selectedSet,position))
    }
  }, [position, selectedSet,type])

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

  function toCode(type: string){
    if(type==="Scatter"){
      return toScatterCode
    }
    return toHindcastCode
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


  return (
    <Box sx={{ flexGrow: 1, height: '100%'}}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <CardWrapper style={{ width: '100%', height: '100%' }}>
            <h4 style={{ margin: '15px' }}>
              Integration towards the SIMA Metocean task
            </h4>
            <div>
              This guide shows how to use the <a href='https://github.com/SINTEF/simapy'>SIMAPY python library</a> to create metocean data.<b/>
              The data can then be imported into SIMA and used to run multiple cases/conditions.<b/>
              Right click Metocean Task in SIMA and choose "import metocean data", then select the generated file to import
            </div>
            <InputLabel>Location:</InputLabel>
            <TextMarker position={position} setPosition={setPosition} />
            <Stack>
              {selectedSet && <>
                <Select
                  id="select-type"
                  value={type}
                  label="Type"
                >
                  {["Scatter","Hindcast"].map(label => <MenuItem key={label} value={label} onClick={() => setType(label)}>{label}</MenuItem>)}
                </Select>
                <InputLabel>Selected dataset:</InputLabel>
                <Select
                  id="select-ds"
                  value={selectedSet?.name}
                  label="Dataset"
                >
                  {datasets.map(set => <MenuItem key={set.name} value={set.name} onClick={() => setSelectedSet(set)}>{set.name}</MenuItem>)}
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

export default SimaView
