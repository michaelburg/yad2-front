import { useState, useEffect, useCallback } from 'react';
import { SettingsResponse, Settings, ColumnSetting } from '../types/Settings';
import { getAuthHeaders } from '../utils/authUtils';

export const DEFAULT_SETTINGS: Settings = {
  likeColumns: [
    { color: '#3B82F6', name: 'liked' },
    { color: '#10B981', name: 'contacted' },
    { color: '#F59E0B', name: 'visited' },
    { color: '#EF4444', name: 'want' },
  ],
  dislikeColumns: [
    { color: '#3B82F6', name: 'disliked' },
    { color: '#10B981', name: 'contacted' },
    { color: '#F59E0B', name: 'visited' },
    { color: '#EF4444', name: 'want' },
  ],
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('http://192.168.1.217:4000/api/settings', {
          method: 'GET',
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SettingsResponse = await response.json();

        if (data.success && data.data?.settings) {
          setSettings(data.data.settings);
        } else {
          console.warn('Invalid settings response, using defaults');
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to fetch settings'
        );
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const saveSettings = useCallback(
    async (newSettings: Settings): Promise<boolean> => {
      try {
        const response = await fetch('http://192.168.1.217:4000/api/settings', {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ settings: newSettings }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SettingsResponse = await response.json();

        if (data.success && data.data?.settings) {
          setSettings(data.data.settings);
          return true;
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Error saving settings:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to save settings'
        );
        return false;
      }
    },
    []
  );

  const getColumnNames = useCallback(
    (type: 'like' | 'dislike'): string[] => {
      const columns =
        type === 'like' ? settings.likeColumns : settings.dislikeColumns;
      return columns.map((column) => column.name);
    },
    [settings]
  );

  const getColumnColors = useCallback(
    (type: 'like' | 'dislike'): Record<string, string> => {
      const columns =
        type === 'like' ? settings.likeColumns : settings.dislikeColumns;
      return columns.reduce((acc, column) => {
        acc[column.name] = column.color;
        return acc;
      }, {} as Record<string, string>);
    },
    [settings]
  );

  const getColumnSettings = useCallback(
    (type: 'like' | 'dislike'): ColumnSetting[] => {
      return type === 'like' ? settings.likeColumns : settings.dislikeColumns;
    },
    [settings]
  );

  return {
    settings,
    isLoading,
    error,
    getColumnNames,
    getColumnColors,
    getColumnSettings,
    saveSettings,
  };
};
