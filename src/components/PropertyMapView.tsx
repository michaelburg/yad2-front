import React, { useState, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Target } from 'lucide-react';
import PropertyBlock from './PropertyBlock';
import PropertyModal from './PropertyModal';
import { Property } from '../types/Property';
import { ColumnSetting } from '../types/Settings';
import { usePropertyStore } from '../hooks/usePropertyStore';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';

import 'leaflet/dist/leaflet.css';

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
const DEFAULT_CENTER = { lat: 32.0853, lon: 34.7818 };
const DEFAULT_ZOOM = 11;

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const POPUP_STYLES = `
  .custom-popup .leaflet-popup-content-wrapper {
    padding: 0 !important;
    margin: 0 !important;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }
  .custom-popup .leaflet-popup-content {
    margin: 0 !important;
    padding: 0 !important;
    min-width: 280px;
    max-width: 350px;
  }
  .custom-popup .leaflet-popup-tip-container {
    margin: 0 !important;
  }
`;

const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background-color: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

const calculateMapCenter = (
  propertiesWithColumn: { property: Property; columnIndex: number }[]
) => {
  if (propertiesWithColumn.length === 0) return DEFAULT_CENTER;

  const validProperties = propertiesWithColumn.filter(
    ({ property }) =>
      property.address?.coords?.lat && property.address?.coords?.lon
  );

  if (validProperties.length === 0) return DEFAULT_CENTER;

  const totalLat = validProperties.reduce(
    (sum, { property }) => sum + property.address.coords.lat,
    0
  );
  const totalLon = validProperties.reduce(
    (sum, { property }) => sum + property.address.coords.lon,
    0
  );

  return {
    lat: totalLat / validProperties.length,
    lon: totalLon / validProperties.length,
  };
};

const CenterControl: React.FC<{ center: { lat: number; lon: number } }> = ({
  center,
}) => {
  const map = useMap();

  const handleCenterMap = () => {
    map.setView([center.lat, center.lon], DEFAULT_ZOOM, {
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
        title="Center map on all properties"
      >
        <Target size={16} />
      </Button>
    </div>
  );
};

const LoadingState: React.FC = () => (
  <div className="flex-1 flex items-center justify-center">
    <Card className="w-full max-w-md">
      <CardContent className="pt-6 text-center space-y-4">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </CardContent>
    </Card>
  </div>
);

const ErrorState: React.FC<{ error: string }> = ({ error }) => (
  <div className="flex-1 flex items-center justify-center">
    <Card className="w-full max-w-md">
      <CardContent className="pt-6 text-center">
        <p className="text-destructive">Error loading properties: {error}</p>
      </CardContent>
    </Card>
  </div>
);

interface PropertyMapViewProps {
  initialProperties: Property[];
  columns: string[];
  columnSettings?: ColumnSetting[];
  statusFilter?: 'liked' | 'disliked' | 'deleted';
}

const PropertyMapView: React.FC<PropertyMapViewProps> = ({
  initialProperties,
  columns,
  columnSettings = [],
  statusFilter,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  const {
    getPropertiesByColumn,
    updatePropertyStatus,
    updatePropertyComment,
    isLoading,
    error,
  } = usePropertyStore(initialProperties, statusFilter);

  const getColumnColor = (columnIndex: number) => {
    return (
      columnSettings[columnIndex]?.color ||
      DEFAULT_COLORS[columnIndex] ||
      DEFAULT_COLORS[0]
    );
  };

  const propertyColumns = getPropertiesByColumn(columns);

  const allPropertiesWithColumn = useMemo(
    () =>
      propertyColumns.flatMap((columnProperties, columnIndex) =>
        columnProperties.map((property) => ({ property, columnIndex }))
      ),
    [propertyColumns]
  );

  const mapCenter = useMemo(
    () => calculateMapCenter(allPropertiesWithColumn),
    [allPropertiesWithColumn]
  );

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setModalOpen(true);
  };

  const handleDelete = (property: Property) => () => {
    updatePropertyStatus(property.token, 'deleted');
  };

  const handleLike = (property: Property) => () => {
    const newStatus = property.status === 'liked' ? 'disliked' : 'liked';
    updatePropertyStatus(property.token, newStatus);
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="flex-1 flex flex-col h-full max-h-screen-safe">
      <style>{POPUP_STYLES}</style>

      <div className="flex-1 overflow-hidden p-2 md:p-4">
        <Card className="h-full">
          <CardContent className="p-0 h-full relative">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lon]}
              zoom={DEFAULT_ZOOM}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
              className="rounded-lg"
            >
              <CenterControl center={mapCenter} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {allPropertiesWithColumn.map(({ property, columnIndex }) => (
                <Marker
                  key={`${property.token}-${columnIndex}`}
                  position={[
                    property.address.coords.lat,
                    property.address.coords.lon,
                  ]}
                  icon={createColoredIcon(getColumnColor(columnIndex))}
                >
                  <Popup
                    closeButton={false}
                    className="custom-popup"
                    offset={[0, 0]}
                  >
                    <PropertyBlock
                      property={property}
                      onDelete={handleDelete(property)}
                      onBack={() => {}}
                      onNext={() => {}}
                      onLike={handleLike(property)}
                      onCommentUpdate={updatePropertyComment}
                      columnName={columns[columnIndex]}
                      columnColor={getColumnColor(columnIndex)}
                      onClick={handlePropertyClick}
                    />
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </CardContent>
        </Card>
      </div>

      {modalOpen && selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setModalOpen(false)}
          open={modalOpen}
        />
      )}
    </div>
  );
};

export default PropertyMapView;
