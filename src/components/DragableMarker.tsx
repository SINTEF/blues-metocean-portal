import { LatLng, Marker as LMarker } from 'leaflet'
import React, { useMemo, useRef } from 'react'
import { Marker } from 'react-leaflet'

export function DraggableMarker(props: { position: LatLng, setPosition: CallableFunction}) {
    const markerRef = useRef<LMarker>(null)
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current
          if (marker != null) {
            props.setPosition(marker.getLatLng())
          }
        },
      }),
      [props],
    )
    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={props.position}
        ref={markerRef}>
      </Marker>
    )
  }
  