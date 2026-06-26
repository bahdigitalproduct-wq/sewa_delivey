'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import Link from 'next/link';

function MapUpdater({ pickup, delivery }: any) {
  const map = useMap();
  useEffect(() => {
    const points: L.LatLngExpression[] = [];
    if (pickup) points.push([pickup.lat, pickup.lng]);
    if (delivery) points.push([delivery.lat, delivery.lng]);

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.setView([9.55, -13.65], 12);
    }
  }, [pickup, delivery, map]);
  return null;
}

// Fonction utilitaire pour générer des coordonnées fictives autour de Conakry
// (Puisque les vraies coordonnées GPS ne sont pas encore stockées en BDD)
const getMockCoordinates = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // S'assurer que le hash est positif
  hash = Math.abs(hash);
  // Générer un offset entre 0 et 0.12 pour la latitude, et 0 et 0.15 pour la longitude
  const latOffset = (hash % 120) / 1000; 
  const lngOffset = ((hash >> 2) % 150) / 1000;
  
  // Base Conakry (Kaloum) -> remonte vers la banlieue
  return [9.52 + latOffset, -13.71 + lngOffset];
};

export default function LiveRadarMap({ orders, selectedOrder }: { orders: any[], selectedOrder?: any | null }) {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  const pendingIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  const enRouteIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  const deliveryIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  return (
    <MapContainer center={[9.55, -13.65]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {!selectedOrder && <MapUpdater pickup={null} delivery={null} />}
      {!selectedOrder && orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').map((order) => {
        const coords = (order.sender_address?.lat && order.sender_address?.lng) 
                       ? [order.sender_address.lat, order.sender_address.lng] 
                       : getMockCoordinates(order.id);
        const icon = order.status === 'pending' ? pendingIcon : enRouteIcon;
        
        return (
          <Marker key={order.id} position={coords as [number, number]} icon={icon}>
            <Popup className="rounded-xl">
              <div className="p-1">
                <p className="font-bold text-gray-900 text-sm mb-1">{order.receiver_address.address}</p>
                <p className="text-xs text-gray-500 mb-2">Statut: <span className="font-bold uppercase" style={{color: order.status === 'pending' ? '#f97316' : '#3b82f6'}}>{order.status}</span></p>
                <Link href={`/suivi/${order.id}`} className="bg-sewa-red text-white px-3 py-1.5 rounded-lg text-xs font-bold block text-center hover:bg-red-700 transition-colors">
                  Voir / Assigner
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {selectedOrder && (() => {
        const pickupCoords = (selectedOrder.sender_address?.lat && selectedOrder.sender_address?.lng) 
          ? { lat: selectedOrder.sender_address.lat, lng: selectedOrder.sender_address.lng } 
          : { lat: getMockCoordinates(selectedOrder.id)[0], lng: getMockCoordinates(selectedOrder.id)[1] };
          
        const deliveryCoords = (selectedOrder.receiver_address?.lat && selectedOrder.receiver_address?.lng) 
          ? { lat: selectedOrder.receiver_address.lat, lng: selectedOrder.receiver_address.lng } 
          : { lat: 9.6, lng: -13.62 }; // Mock destination if none

        return (
          <>
            <MapUpdater pickup={pickupCoords} delivery={deliveryCoords} />
            <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={pickupIcon}>
              <Popup>Retrait: {selectedOrder.sender_address.address}</Popup>
            </Marker>
            <Marker position={[deliveryCoords.lat, deliveryCoords.lng]} icon={deliveryIcon}>
              <Popup>Livraison: {selectedOrder.receiver_address.address}</Popup>
            </Marker>
            <Polyline positions={[
              [pickupCoords.lat, pickupCoords.lng],
              [deliveryCoords.lat, deliveryCoords.lng]
            ]} color="red" dashArray="5, 10" />
          </>
        );
      })()}
    </MapContainer>
  );
}
