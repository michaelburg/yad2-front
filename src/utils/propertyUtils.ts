import { Property, PropertyStatus, PropertyState } from '../types/Property';
import { websocketClient } from '../services/websocketClient';

const STORAGE_KEY = 'yad2_property_manager';

function getStoredPropertyStates(): Map<string, PropertyState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return new Map(Object.entries(data));
    }
  } catch (error) {
    console.warn('Error loading property states from localStorage:', error);
  }
  return new Map();
}

function waitForConnection(maxWaitTime: number = 5000): Promise<boolean> {
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
}

async function getStoredPropertyStatesFromWebSocket(): Promise<
  Map<string, PropertyState>
> {
  try {
    const isConnected = await waitForConnection();
    if (!isConnected) {
      console.warn(
        'WebSocket connection timeout - falling back to localStorage'
      );
      return getStoredPropertyStates();
    }
    console.log('getting properties');
    const response = await websocketClient.getProperties();
    console.log('response', response);
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
          });
        }
      });
      return states;
    }
  } catch (error) {
    console.warn('Error loading property states from WebSocket:', error);
  }

  return getStoredPropertyStates();
}

export async function filterPropertiesByStatus(
  properties: Property[],
  status: PropertyStatus | 'none'
): Promise<Property[]> {
  const storedStates = await getStoredPropertyStatesFromWebSocket();

  return properties.filter((property) => {
    const propertyState = storedStates.get(property.token);

    if (status === 'none') {
      return (
        !propertyState ||
        (propertyState.status !== 'liked' &&
          propertyState.status !== 'disliked' &&
          propertyState.status !== 'deleted')
      );
    }

    return propertyState && propertyState.status === status;
  });
}
