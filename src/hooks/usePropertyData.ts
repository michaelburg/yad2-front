import { useMemo, useEffect, useState } from 'react';
import { Property, PropertyStatus } from '../types/Property';
import { filterPropertiesByStatus } from '../utils/propertyUtils';
import properties from '../data/properties.json';

export const usePropertyData = (status?: PropertyStatus) => {
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const allProperties = useMemo(() => {
    return Array.isArray(properties) ? properties : [];
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadFilteredProperties = async () => {
      setIsLoading(true);

      try {
        const filtered = status
          ? await filterPropertiesByStatus(allProperties, status)
          : allProperties;

        if (isMounted) {
          setFilteredProperties(filtered);
        }
      } catch (error) {
        console.error('Error filtering properties:', error);
        if (isMounted) {
          setFilteredProperties(allProperties);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFilteredProperties();

    return () => {
      isMounted = false;
    };
  }, [allProperties, status]);

  return {
    allProperties,
    filteredProperties,
    hasProperties: filteredProperties.length > 0,
    isLoading,
  };
};
