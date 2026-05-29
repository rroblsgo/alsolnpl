'use client';

import { Icon } from 'leaflet';
import { useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { Marker as TMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = new Icon({
  iconUrl:    '/marker-icon.png',
  shadowUrl:  '/marker-shadow.png',
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  lat:       number;
  lng:       number;
  direccion?: string | null;
  titulo?:   string | null;
};

export default function EnrichmentLocation({ lat, lng, direccion, titulo }: Props) {
  const markerRef = useRef<TMarker>(null);

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={17}
      scrollWheelZoom={true}
      className="h-64 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={markerIcon} ref={markerRef}>
        <Popup>
          {titulo  && <strong className="block">{titulo}</strong>}
          {direccion && <span className="text-xs">{direccion}</span>}
          <span className="mt-1 block font-mono text-[10px] text-gray-500">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </span>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
