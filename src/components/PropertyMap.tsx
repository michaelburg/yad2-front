import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Target } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from './ui/button';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  className?: string;
}

const MapUpdater: React.FC<{ latitude: number; longitude: number }> = ({
  latitude,
  longitude,
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [latitude, longitude, map]);

  return null;
};

const CenterControl: React.FC<{ latitude: number; longitude: number }> = ({
  latitude,
  longitude,
}) => {
  const map = useMap();

  const handleCenterMap = () => {
    map.setView([latitude, longitude], 15, {
      animate: true,
      duration: 0.5,
    });
  };

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <Button
        onClick={handleCenterMap}
        variant="outline"
        size="icon"
        className="bg-white hover:bg-gray-50 border border-gray-300 shadow-lg"
        title="Center map on property"
      >
        <Target size={16} />
      </Button>
    </div>
  );
};

const PropertyMap: React.FC<PropertyMapProps> = ({
  latitude,
  longitude,
  address,
  className = 'h-80 w-full',
}) => {
  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <MapUpdater latitude={latitude} longitude={longitude} />
        <CenterControl latitude={latitude} longitude={longitude} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          {address && <Popup>{address}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
