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
import {toCodeString} from './ReportTemplate'

const ReturnValueStats = () => {

  const app = useContext(AppCtx);

  const center = new LatLng(62.536484, 4.176969)
  const [position, setPosition] = useState<LatLng>(center)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedSet, setSelectedSet] = useState<Dataset>()
  

  const [row, setRow] = useState<DatasetVariable>()
  const [code, setCode] = useState<string>("")

  useEffect(() => {
    if (selectedSet && row && position) {
      setCode(toCodeString(position))
    }
  }, [position, selectedSet, row])

  useEffect(() => {
    if (selectedSet) {
      setRow(selectedSet.variables.find(v => v.name === (row ? row.name :  "hs")))
    }
  }, [selectedSet,row])

  useEffect(() => {
    if (app) {
      app.providers.forEach(container => {
        const availableSets = container.datasets
        setDatasets(availableSets)
        if (availableSets.length > 0) {
          setSelectedSet(availableSets[0])
        }
      })
    }
  }, [app])

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
    <Box sx={{ flexGrow: 1, height: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <CardWrapper style={{ width: '100%', height: '100%' }}>
            <h4 style={{ margin: '15px' }}>
              Report Generation
            </h4>
            <TextMarker position={position} setPosition={setPosition} />
            <Stack>
              {selectedSet && <>
                <InputLabel>Show Dataset in map:</InputLabel>
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
            <InputLabel>Basic example of creating a simple word report:</InputLabel>
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
