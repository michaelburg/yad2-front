import { useState, useEffect, useCallback, useMemo } from 'react';
import { Property, PropertyStatus, PropertyState } from '../types/Property';
import { websocketClient } from '../services/websocketClient';

export interface PropertyStore {
  properties: Map<string, Property>;
  propertyStates: Map<string, PropertyState>;
  getPropertiesByColumn: (columns: string[]) => Property[][];
  getPropertiesByStatus: (status?: PropertyStatus) => Property[];
  getPropertyWithState: (
    token: string
  ) => (Property & { state?: PropertyState }) | undefined;
  updatePropertyStatus: (
    token: string,
    newStatus: PropertyStatus,
    columnIndex?: number
  ) => Promise<void>;
  updatePropertyComment: (token: string, comment: string) => Promise<void>;
  moveProperty: (
    token: string,
    fromColumn: number,
    toColumn: number,
    newPosition: number
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const waitForConnection = (maxWaitTime: number = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (websocketClient.getConnectionStatus()) {
      resolve(true);
      return;
    }

    let timeElapsed = 0;
    const checkInterval = 100;

    const checkConnection = () => {
      if (websocketClient.getConnectionStatus()) {
        resolve(true);
        return;
      }

      timeElapsed += checkInterval;
      if (timeElapsed >= maxWaitTime) {
        resolve(false);
        return;
      }

      setTimeout(checkConnection, checkInterval);
    };

    websocketClient.connect();
    setTimeout(checkConnection, checkInterval);
  });
};

const loadPropertyStates = async (): Promise<Map<string, PropertyState>> => {
  const isConnected = await waitForConnection();
  if (!isConnected) {
    return new Map();
  }

  const response = await websocketClient.getProperties();
  if (response.success && response.data) {
    const states = new Map<string, PropertyState>();
    response.data.forEach((item: any) => {
      if (item.propertyId) {
        states.set(item.propertyId, {
          propertyId: item.propertyId,
          status: item.status,
          position: item.position || 0,
          columnIndex: item.columnIndex || 0,
          lastUpdated: item.lastUpdated || Date.now(),
          comment: item.comment,
        });
      }
    });
    return states;
  }
  return new Map();
};

const savePropertyState = async (state: PropertyState): Promise<void> => {
  if (!websocketClient.getConnectionStatus()) {
    const isConnected = await waitForConnection();
    if (!isConnected) {
      throw new Error('WebSocket connection failed');
    }
  }

  await websocketClient.updateProperty({
    propertyId: state.propertyId,
    columnIndex: state.columnIndex,
    position: state.position,
    status: state.status,
    comment: state.comment,
  });
};

const enhancePropertyWithState = (
  property: Property,
  state?: PropertyState
): Property => ({
  ...property,
  comment: state?.comment ?? property.comment,
  status: state?.status ?? property.status,
});

export function usePropertyStore(
  initialProperties: Property[],
  statusFilter?: PropertyStatus
): PropertyStore {
  const [properties, setProperties] = useState<Map<string, Property>>(
    new Map()
  );
  const [propertyStates, setPropertyStates] = useState<
    Map<string, PropertyState>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const propertiesMap = useMemo(() => {
    const map = new Map<string, Property>();
    initialProperties.forEach((property) => {
      map.set(property.token, property);
    });
    return map;
  }, [initialProperties]);

  useEffect(() => {
    let isMounted = true;

    const initializeStore = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const states = await loadPropertyStates();
        if (isMounted) {
          setProperties(propertiesMap);
          setPropertyStates(states);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to initialize store'
          );
          setProperties(propertiesMap);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeStore();
    return () => {
      isMounted = false;
    };
  }, [propertiesMap]);

  useEffect(() => {
    const handlePropertyUpdated = (data: any) => {
      if (!data.success || !data.data) return;

      const updatedState = data.data;
      const newState: PropertyState = {
        propertyId: updatedState.propertyId,
        status: updatedState.status,
        position: updatedState.position || 0,
        columnIndex: updatedState.columnIndex || 0,
        lastUpdated: updatedState.lastUpdated || Date.now(),
        comment: updatedState.comment,
      };

      setPropertyStates((prev) =>
        new Map(prev).set(updatedState.propertyId, newState)
      );

      if (updatedState.comment !== undefined) {
        setProperties((prev) => {
          const newProperties = new Map(prev);
          const property = newProperties.get(updatedState.propertyId);
          if (property) {
            newProperties.set(updatedState.propertyId, {
              ...property,
              comment: updatedState.comment,
              status: updatedState.status,
            });
          }
          return newProperties;
        });
      }
    };

    websocketClient.on('propertyUpdated', handlePropertyUpdated);
    return () => websocketClient.off('propertyUpdated', handlePropertyUpdated);
  }, []);

  const getPropertiesByColumn = useCallback(
    (columns: string[]): Property[][] => {
      const columnGroups: Property[][] = columns.map(() => []);

      properties.forEach((property) => {
        const state = propertyStates.get(property.token);

        if (
          statusFilter &&
          state?.status !== statusFilter &&
          state?.status !== undefined
        )
          return;
        if (state?.status === 'deleted') return;

        const columnIndex = Math.max(
          0,
          Math.min(state?.columnIndex ?? 0, columns.length - 1)
        );
        const enhancedProperty = enhancePropertyWithState(property, state);

        columnGroups[columnIndex].push(enhancedProperty);
      });

      columnGroups.forEach((column) => {
        column.sort((a, b) => {
          const stateA = propertyStates.get(a.token);
          const stateB = propertyStates.get(b.token);
          return (stateA?.position ?? 0) - (stateB?.position ?? 0);
        });
      });

      return columnGroups;
    },
    [properties, propertyStates, statusFilter]
  );

  const getPropertiesByStatus = useCallback(
    (status?: PropertyStatus): Property[] => {
      const result: Property[] = [];

      properties.forEach((property) => {
        const state = propertyStates.get(property.token);
        const propertyStatus = state?.status ?? property.status;

        if (!status || propertyStatus === status) {
          result.push(enhancePropertyWithState(property, state));
        }
      });

      return result;
    },
    [properties, propertyStates]
  );

  const getPropertyWithState = useCallback(
    (token: string) => {
      const property = properties.get(token);
      if (!property) return undefined;

      const state = propertyStates.get(token);
      return {
        ...enhancePropertyWithState(property, state),
        state,
      };
    },
    [properties, propertyStates]
  );

  const updatePropertyStatus = useCallback(
    async (token: string, newStatus: PropertyStatus, columnIndex?: number) => {
      const currentState = propertyStates.get(token);
      const newState: PropertyState = {
        propertyId: token,
        status: newStatus,
        position: currentState?.position ?? 0,
        columnIndex: columnIndex ?? currentState?.columnIndex ?? 0,
        lastUpdated: Date.now(),
        comment: currentState?.comment,
      };

      setPropertyStates((prev) => new Map(prev).set(token, newState));
      setProperties((prev) => {
        const newProperties = new Map(prev);
        const property = newProperties.get(token);
        if (property) {
          newProperties.set(token, { ...property, status: newStatus });
        }
        return newProperties;
      });

      try {
        await savePropertyState(newState);
      } catch (err) {
        setPropertyStates((prev) => {
          const newStates = new Map(prev);
          if (currentState) {
            newStates.set(token, currentState);
          } else {
            newStates.delete(token);
          }
          return newStates;
        });
        throw err;
      }
    },
    [propertyStates]
  );

  const updatePropertyComment = useCallback(
    async (token: string, comment: string) => {
      const currentState = propertyStates.get(token);
      const newState: PropertyState = {
        propertyId: token,
        status: currentState?.status ?? 'liked',
        position: currentState?.position ?? 0,
        columnIndex: currentState?.columnIndex ?? 0,
        lastUpdated: Date.now(),
        comment,
      };

      setPropertyStates((prev) => new Map(prev).set(token, newState));
      setProperties((prev) => {
        const newProperties = new Map(prev);
        const property = newProperties.get(token);
        if (property) {
          newProperties.set(token, { ...property, comment });
        }
        return newProperties;
      });

      try {
        await savePropertyState(newState);
      } catch (err) {
        setPropertyStates((prev) => {
          const newStates = new Map(prev);
          if (currentState) {
            newStates.set(token, currentState);
          }
          return newStates;
        });
        throw err;
      }
    },
    [propertyStates]
  );

  const moveProperty = useCallback(
    async (
      token: string,
      fromColumn: number,
      toColumn: number,
      newPosition: number
    ) => {
      const currentState = propertyStates.get(token);
      const newState: PropertyState = {
        propertyId: token,
        status: currentState?.status ?? 'liked',
        position: newPosition,
        columnIndex: toColumn,
        lastUpdated: Date.now(),
        comment: currentState?.comment,
      };

      setPropertyStates((prev) => new Map(prev).set(token, newState));

      try {
        await savePropertyState(newState);
      } catch (err) {
        setPropertyStates((prev) => {
          const newStates = new Map(prev);
          if (currentState) {
            newStates.set(token, currentState);
          }
          return newStates;
        });
        throw err;
      }
    },
    [propertyStates]
  );

  return {
    properties,
    propertyStates,
    getPropertiesByColumn,
    getPropertiesByStatus,
    getPropertyWithState,
    updatePropertyStatus,
    updatePropertyComment,
    moveProperty,
    isLoading,
    error,
  };
}
