import React from 'react'
import { FeatureGroup, Polygon, TileLayer } from 'react-leaflet'
// @ts-ignore
import { LatLng } from 'leaflet'
import { DraggableMarker } from '../DragableMarker'
import { StyledMapContainer } from '../Map'
import { Dataset } from '../../Types'

export interface MapDataset {
  dataset: Dataset,
  selected: boolean,
  color: string
}

function calculateMapCenter(mset: MapDataset): [number, number] {
  // return [62.536484, 4.176969]
  const set = mset.dataset
  const lats = set.latitudes
  const lons = set.latitudes
  const lat_mean = lats.reduce((a, b) => (a + b)) / lats.length;
  const lon_mean = lons.reduce((a, b) => (a + b)) / lons.length;
  return [lat_mean, lon_mean]
}

function calculateTotalMapCenter(sets: MapDataset[]): [number, number] {
  return sets.map(calculateMapCenter).reduce((prev, current) => {
    const lat = (prev[0] + current[0]) / 2
    const lon = (prev[1] + current[1]) / 2
    return [lat, lon];
  }, [67, 40]);
}

function calculateArea(set: Dataset): [number, number][] {
  const lats = set.latitudes
  const lons = set.longitudes
  const latlons: [number, number][] = [];
  lats.forEach((lat, index) => {
    const lon = lons[index];
    latlons.push([lat, lon])
  });
  return latlons
}

function renderArea(mset: MapDataset, areaIndex: number) {
  const set = mset.dataset
  const name = set.name
  const color = mset.color
  return <div key={"area_" + name}>
    <FeatureGroup>
      <Polygon pathOptions={{ color: color }} positions={calculateArea(set)} />
    </FeatureGroup>
  </div>
}

const DatasetMap = (props: { datasets: MapDataset[], position: LatLng, setPosition: (pos: LatLng) => void }) => {
  const { datasets, position, setPosition } = props;
  return (
    <div style={{ width: '100%', height: '700px' }}>
      <StyledMapContainer
        center={calculateTotalMapCenter(datasets)}
        zoom={3}
        scrollWheelZoom={true}
      >
        <DraggableMarker position={position} setPosition={setPosition}></DraggableMarker>
        <TileLayer
          attribution='<a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {datasets.filter(set => set.selected).map((set, index) => renderArea(set, index))}
      </StyledMapContainer>
    </div>
  )
}

export default DatasetMap