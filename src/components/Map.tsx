import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import styled from 'styled-components'
import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import React from 'react'
// delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})



export type TLocation = {
  lat: number
  long: number
  name: string
  _id?: string
  type?: string
}

export const StyledMapContainer = styled(MapContainer)`
  height: 100%;
  width: 100%;
  border: darkgrey 1px solid;
  z-index: 1;
`

interface ILocationOnMap {
  location: TLocation
  zoom: number
}

interface IClickableMap {
  location: TLocation | undefined
  zoom: number
  setClickPos: Function
  disableClick: boolean
}

function MapEventHandlerComponent({ setClickLocation }: any) {
  useMapEvents({
    click: (location: any) =>
      setClickLocation([location.latlng.lat, location.latlng.lng]),
  })
  return null
}

export const LocationOnMap = ({
  location,
  zoom,
}: ILocationOnMap): JSX.Element => {
  const marker: LatLngExpression = [location.lat || 60, location.long || 4]
  return (
    <StyledMapContainer center={marker} zoom={zoom} scrollWheelZoom={true}>
      <TileLayer
        attribution='<a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={marker}></Marker>
    </StyledMapContainer>
  )
}

export const ClickableMap = ({
  location,
  zoom,
  setClickPos,
  disableClick,
}: IClickableMap): JSX.Element => {
  const getMarkerFromLocation = (
    location: TLocation | undefined
  ): [number, number] => {
    return [location?.lat || 60, location?.long || 4]
  }

  return (
    <StyledMapContainer
      center={getMarkerFromLocation(location)}
      zoom={zoom}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='<a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={getMarkerFromLocation(location)}></Marker>
      {!disableClick && (
        <MapEventHandlerComponent
          setClickLocation={(v: [number, number]) => {
            setClickPos(v)
          }}
        />
      )}
    </StyledMapContainer>
  )
}
