import { TextField } from '@mui/material';
import { LatLng } from 'leaflet'
import React from 'react'


export const TextMarker = (props: { position: LatLng, setPosition: (pos: LatLng) => void }) => {
  const { position, setPosition } = props;

  function onCoordinateChange(event: any) {
    const sval = event.target.value as string
    let [slat, slon] = sval.split(",")
    setPosition(new LatLng(parseFloat(slat), parseFloat(slon)))
  }

  return (
    <TextField label="Position:" value={position.lat.toFixed(4) + "," + position.lng.toFixed(4)} variant="outlined" onChange={onCoordinateChange} />
  )
}
