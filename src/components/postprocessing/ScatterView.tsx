import { Checkbox, Grid, InputLabel, MenuItem, Select } from '@mui/material'
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
import {toCodeString} from './ScatterTemplate'

function findDatasets(container: DatasetContainer, selectedSets: Dataset[]) {
  container.containers?.forEach(child => findDatasets(child, selectedSets))
  container.datasets?.forEach(dataset => selectedSets.push(dataset))
}

const ScatterView = () => {

  const app = useContext(AppCtx);

  const center = new LatLng(62.536484, 4.176969)
  const [position, setPosition] = useState<LatLng>(center)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedSet, setSelectedSet] = useState<Dataset>()
  const [variables, setVariables] = useState<DatasetVariable[]>([])


  const [column, setColumn] = useState<DatasetVariable>()
  const [row, setRow] = useState<DatasetVariable>()
  const [auxs, setAuxs] = useState<DatasetVariable[]>([])
  const [code, setCode] = useState<string>("")

  useEffect(() => {
    if (selectedSet) {
      setCode(toCodeString(selectedSet,position, row, column, auxs))
    }
  }, [position, selectedSet, column, row, auxs])

  useEffect(() => {
    if (selectedSet) {
      setAuxs([])
      setRow(selectedSet.variables.find(v => v.name === (row ? row.name :  "hs")))
      setColumn(selectedSet.variables.find(v => v.name === (column ? column.name :  "tp")))
      setVariables(selectedSet.variables.filter(hasTime))
    }
  }, [selectedSet,column,row])

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

  function onChange(event: any, variable: DatasetVariable) {
    if (event.target.checked) {
      setAuxs([...auxs, variable])
    } else {
      setAuxs(auxs.filter(v => v !== variable))
    }
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
              Scatter table generation from datasets
            </h4>
            <TextMarker position={position} setPosition={setPosition} />
            <Stack>
              {selectedSet && <>
                <InputLabel>Dataset to create scatter for:</InputLabel>
                <Select
                  id="select-ds"
                  value={selectedSet?.name}
                  label="Dataset"
                >
                  {datasets.map(set => <MenuItem key={set.name} value={set.name} onClick={() => setSelectedSet(set)}>{set.name}</MenuItem>)}
                </Select>
                <InputLabel>Row variable (Often Hs):</InputLabel>
                <Select
                  value={row?.name || ''}>
                  {variables.map(variable => (
                    <MenuItem key={"row_" + variable.name} value={variable.name} onClick={() => setRow(variable)}>{variable.name} - {variable.description}</MenuItem>
                  ))}
                </Select>
                <InputLabel>Column variable (Often Tp):</InputLabel>
                <Select
                  value={column?.name || ''}>
                  {variables.map(variable => (
                    <MenuItem key={"col_" + variable.name} value={variable.name} onClick={() => setColumn(variable)}>{variable.name} - {variable.description}</MenuItem>
                  ))}
                </Select>
                <InputLabel>Auxillary variables (Optional, but can be included in the scatter):</InputLabel>
                <Select multiple value={auxs.map(v => v.name)} renderValue={(selected) => selected.join(', ')} >
                  {variables.filter(v => v !== column && v !== row).map(variable => (
                    <div key={"aux_" + variable.name}>
                      <Checkbox checked={auxs?.indexOf(variable) >= 0} onChange={event => onChange(event, variable)}></Checkbox>{variable.name} - {variable.description}
                    </div>
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

export default ScatterView
