import {
  Property,
  PropertyExtractorResult,
  createPropertyWithStatus,
  PropertyStatus,
} from '@/types/Property';

const isValidProperty = (obj: any): obj is Omit<Property, 'status'> => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.token === 'string' &&
    typeof obj.price === 'number' &&
    obj.address &&
    typeof obj.address === 'object' &&
    obj.address.city &&
    typeof obj.address.city.text === 'string' &&
    obj.address.neighborhood &&
    typeof obj.address.neighborhood.text === 'string' &&
    obj.additionalDetails &&
    typeof obj.additionalDetails === 'object' &&
    typeof obj.additionalDetails.roomsCount === 'number' &&
    typeof obj.additionalDetails.squareMeter === 'number' &&
    obj.metaData &&
    typeof obj.metaData === 'object' &&
    Array.isArray(obj.metaData.images)
  );
};

export const extractPropertiesFromData = (
  data: any
): PropertyExtractorResult => {
  try {
    if (!data || typeof data !== 'object') {
      return { properties: [], error: 'Invalid data format' };
    }

    if (Array.isArray(data)) {
      const validProperties = data.filter(isValidProperty);
      return {
        properties: validProperties.map((property) =>
          createPropertyWithStatus(property, 'liked')
        ),
      };
    }

    const queries = data.dehydratedState?.queries || [];

    if (Array.isArray(queries)) {
      for (const query of queries) {
        if (
          query?.state?.data?.private &&
          Array.isArray(query.state.data.private)
        ) {
          const validProperties =
            query.state.data.private.filter(isValidProperty);
          if (validProperties.length > 0) {
            return {
              properties: validProperties.map((property) =>
                createPropertyWithStatus(property, 'liked')
              ),
            };
          }
        }

        if (query?.state?.data && Array.isArray(query.state.data)) {
          const validProperties = query.state.data.filter(isValidProperty);
          if (validProperties.length > 0) {
            return {
              properties: validProperties.map((property) =>
                createPropertyWithStatus(property, 'liked')
              ),
            };
          }
        }
      }
    }

    if (data.properties && Array.isArray(data.properties)) {
      const validProperties = data.properties.filter(isValidProperty);
      return {
        properties: validProperties.map((property) =>
          createPropertyWithStatus(property, 'liked')
        ),
      };
    }

    return { properties: [] };
  } catch (error) {
    console.error('Error extracting properties:', error);
    return {
      properties: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const filterPropertiesByStatus = (
  properties: Property[],
  status: PropertyStatus
): Property[] => {
  return properties.filter((property) => property.status === status);
};

export const updatePropertyStatus = (
  properties: Property[],
  propertyToken: string,
  newStatus: PropertyStatus
): Property[] => {
  return properties.map((property) =>
    property.token === propertyToken
      ? { ...property, status: newStatus }
      : property
  );
};

export const groupPropertiesByStatus = (properties: Property[]) => {
  return properties.reduce((acc, property) => {
    const status = property.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(property);
    return acc;
  }, {} as Record<PropertyStatus, Property[]>);
};
