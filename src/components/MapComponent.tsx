'use client';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

export default function MapComponent({ pickup, delivery, driver }: any) {
  useEffect(() => {
    // Fix Leaflet icons issue in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  const deliveryIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <MapContainer center={[9.5375, -13.6771]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {pickup && (
        <Marker position={[pickup.lat, pickup.lng]}>
          <Popup>Retrait</Popup>
        </Marker>
      )}
      
      {delivery && (
        <Marker position={[delivery.lat, delivery.lng]}>
          <Popup>Livraison</Popup>
        </Marker>
      )}
      
      {driver && (
        <Marker position={[driver.lat, driver.lng]} icon={deliveryIcon}>
          <Popup>Livreur</Popup>
        </Marker>
      )}

      {pickup && delivery && (
        <Polyline positions={[
          [pickup.lat, pickup.lng],
          [delivery.lat, delivery.lng]
        ]} color="red" dashArray="5, 10" />
      )}
    </MapContainer>
  );
}
