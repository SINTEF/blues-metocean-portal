import { Grid, MenuItem, Select } from '@mui/material'
import Box from '@mui/material/Box'
import { LatLng } from 'leaflet'
import React, { useContext, useEffect, useState } from 'react'
import { FeatureGroup, Polygon, TileLayer } from 'react-leaflet'
import { CardWrapper } from '../Card'
import CodeBox from '../CodeBox'
import { DraggableMarker } from '../DragableMarker'
import { StyledMapContainer } from '../Map'
import { TextMarker } from '../TextMarker'
import { AppCtx } from '../../App'
import { Dataset,DatasetContainer } from '../../Types'

function toCodeString(set: Dataset, position: LatLng): string {
  const api = set.api
  const idx = api.lastIndexOf(".")
  const dataset = api.substring(idx + 1)
  const imprt = api.substring(0, idx)
  const pos = { lat: position.lat.toFixed(4), lng: position.lng.toFixed(4) }
 return `
import calendar
import os
from datetime import datetime
from pathlib import Path

import numpy as np
from windrose import WindroseAxes

from bluesmet.${imprt} import ${dataset}

name = "My location"
lat_pos = ${pos.lat}
lon_pos = ${pos.lng}
years = [2019,2020]

path = Path(f"./output/windroses/{name}")
os.makedirs(path, exist_ok=True)

all_values = {}
variables = ["wind_speed", "wind_direction", "height"]

# Get the heights from the first dataset
heights = None

for year in years:
  yearly = {}
  all_values[year] = yearly

  for month in range(1, 13):

      start_date = datetime(year, month, 1)
      mrange = calendar.monthrange(year, month)
      end_date = datetime(year, month, mrange[1])
      print(f"Collection data from {start_date} to {end_date}...")
      monthly = ${dataset}.get_values_between(lat_pos, lon_pos,start_date, end_date, requested_values=variables)
      yearly[month] = monthly

      if heights is None:
          heights = monthly["height"].values
          lat_actual = monthly.latitude
          lon_actual = monthly.longitude
          print(f"Actual location (nearest grid point): {lat_actual}, {lon_actual}")

all_speed = np.ndarray(0)
all_direction = np.ndarray(0)

if heights is None:
  raise ValueError("No data found")

# Select the height from available heights
height_idx = 2
height = heights[height_idx]

print(f"Available heights: {heights} m")
print(f"Selected height: {height} m")

for month in range(1, 13):

  speed = np.ndarray(0)
  direction = np.ndarray(0)

  for year in years:
      yearly = all_values[year]
      monthly = yearly[month]

      mspeed = monthly["wind_speed"][:, height_idx]
      # Met: North West Up, wind_going_to
      # Wind rose: North East Down, wind coming from
      mdir = np.fmod(monthly["wind_direction"][:, height_idx] + 180.0, 360.0)
      speed = np.concatenate((speed, mspeed))
      direction = np.concatenate((direction, mdir))

  ax = WindroseAxes.from_ax()
  ax.bar(direction, speed, bins=9, nsector=36, opening=0.8, edgecolor="white")
  ax.set_legend()
  name = calendar.month_name[month]

  ax.set_title(f"Montly wind - {name} - years {years} at {height} m")
  ax.figure.savefig(str(path / f"month_{month}_{height}m.png"))

  all_speed = np.concatenate((all_speed, speed))
  all_direction = np.concatenate((all_direction, direction))

ax = WindroseAxes.from_ax()
ax.bar(all_direction, all_speed, bins=9, nsector=36, opening=0.8, edgecolor="white")
ax.set_legend()
ax.set_title(f"Wind - all data - years {years} at {height} m")
ax.figure.savefig(str(path / f"all_{height}m.png"))

print(f"File successfully created at {path}")

`
}

function isContained(array1: string[], array2: string[]): boolean {
  return array1.every(element => array2.includes(element));
}

function findDatasets(container: DatasetContainer, selectedSets: Dataset[]) {
  container.containers?.forEach(child => findDatasets(child, selectedSets))
  container.datasets?.forEach(dataset => {
    const names = dataset.variables.map(variable => variable.name)
    const requested_values = ["wind_speed", "wind_direction", "height"]
    if (isContained(requested_values, names)) {
      selectedSets.push(dataset)
    }
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


const WindRoseView = () => {

  const app = useContext(AppCtx);

  const center = new LatLng(62.536484, 4.176969)
  const [position, setPosition] = useState<LatLng>(center)
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedSet, setSelectedSet] = useState<Dataset>()
  const [code, setCode] = useState<string>("")

  useEffect(() => {
    if (selectedSet) {
      setCode(toCodeString(selectedSet,position))
    }
  }, [selectedSet,position])

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
              Windrose generation from datasets
            </h4>
            <div>
              Will generate source code to generate monthly and total windrose plots over selected years.<br/>
            </div>
            <TextMarker position={position} setPosition={setPosition} />
            {selectedSet && <Select
              id="select-ds"
              value={selectedSet?.name}
              label="Dataset"
            >
              {datasets.map(set => <MenuItem key={set.name} value={set.name} onClick={() => setSelectedSet(set)}>{set.name}</MenuItem>)}
            </Select>}
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

export default WindRoseView
