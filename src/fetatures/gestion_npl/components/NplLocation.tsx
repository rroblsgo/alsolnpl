import { Icon } from 'leaflet';
import { useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { Marker as TMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const markerIcon = new Icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  lat: number;
  lng: number;
  direccion: string;
  titulo: string;
};

export default function NplLocation({ lat, lng, direccion, titulo }: Props) {
  const markerRef = useRef<TMarker>(null);
  const ZOOM = 17;

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={ZOOM}
      scrollWheelZoom={true}
      className="h-80 w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={markerIcon} ref={markerRef}>
        <Popup>
          <strong>{titulo}</strong>
          {direccion && <><br />{direccion}</>}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
