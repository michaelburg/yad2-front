import React, { useMemo } from 'react';
import { Property } from '../types/Property';
import PropertyMap from './PropertyMap';

interface PropertyMapWrapperProps {
  property: Property;
  className?: string;
}

const PropertyMapWrapper: React.FC<PropertyMapWrapperProps> = ({
  property,
  className = 'h-full w-full',
}) => {
  const address = useMemo(() => {
    return `${property.address?.street?.text || ''} ${
      property.address?.house?.number || ''
    }, ${property.address?.neighborhood?.text || ''}, ${
      property.address?.city?.text || ''
    }`.trim();
  }, [
    property.address?.street?.text,
    property.address?.house?.number,
    property.address?.neighborhood?.text,
    property.address?.city?.text,
  ]);

  return (
    <PropertyMap
      latitude={property.address.coords.lat}
      longitude={property.address.coords.lon}
      address={address}
      className={className}
    />
  );
};

export default React.memo(PropertyMapWrapper);
