'use client';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useMemo } from 'react';

function MapUpdater({ pickup, delivery, driver }: any) {
  const map = useMap();
  useEffect(() => {
    const points: L.LatLngExpression[] = [];
    if (pickup) points.push([pickup.lat, pickup.lng]);
    if (delivery) points.push([delivery.lat, delivery.lng]);
    if (driver) points.push([driver.lat, driver.lng]);

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    }
  }, [pickup, delivery, driver, map]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick?: (coords: {lat: number, lng: number}) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapComponent({ pickup, delivery, driver, onPickupChange }: any) {
  useEffect(() => {
    // Fix Leaflet icons issue in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const deliveryIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const driverIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const markerRef = useRef<any>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null && onPickupChange) {
          const latLng = marker.getLatLng();
          onPickupChange({ lat: latLng.lat, lng: latLng.lng });
        }
      },
    }),
    [onPickupChange],
  );

  return (
    <MapContainer center={[9.5375, -13.6771]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <MapUpdater pickup={pickup} delivery={delivery} driver={driver} />
      <MapClickHandler onMapClick={onPickupChange} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {pickup && (
        <Marker 
          position={[pickup.lat, pickup.lng]} 
          icon={pickupIcon}
          draggable={!!onPickupChange}
          eventHandlers={onPickupChange ? eventHandlers : undefined}
          ref={markerRef}
        >
          <Popup>{onPickupChange ? "Retrait (Déplacez pour corriger)" : "Retrait"}</Popup>
        </Marker>
      )}
      
      {delivery && (
        <Marker position={[delivery.lat, delivery.lng]} icon={deliveryIcon}>
          <Popup>Livraison</Popup>
        </Marker>
      )}
      
      {driver && (
        <Marker position={[driver.lat, driver.lng]} icon={driverIcon}>
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
