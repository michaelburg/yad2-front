import React, { useState, useMemo, useCallback } from 'react';
import { Grid, Map, Pencil } from 'lucide-react';
import PropertyBoard from './PropertyBoard';
import PropertyMapView from './PropertyMapView';
import { PropertyPageProps } from '../types/Property';
import { usePropertyData } from '../hooks/usePropertyData';
import { useSettings } from '../hooks/useSettings';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { ColumnSetting } from '../types/Settings';

const PropertyPage: React.FC<PropertyPageProps> = ({
  status,
  columns: propsColumns,
  theme = 'blue',
  title,
}) => {
  const { filteredProperties, isLoading: propertiesLoading } =
    usePropertyData(status);
  const {
    getColumnNames,
    getColumnSettings,
    saveSettings,
    settings,
    isLoading: settingsLoading,
  } = useSettings();
  const [viewMode, setViewMode] = useState<'columns' | 'map'>('columns');
  const [isEditMode, setIsEditMode] = useState(false);

  const columns = useMemo(() => {
    return (
      propsColumns || getColumnNames(status === 'liked' ? 'like' : 'dislike')
    );
  }, [propsColumns, getColumnNames, status]);

  const columnSettings = useMemo(() => {
    return getColumnSettings(status === 'liked' ? 'like' : 'dislike');
  }, [getColumnSettings, status]);

  const isLoading = propertiesLoading || settingsLoading;

  const handleEditClick = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleSaveEdit = useCallback(
    async (newColumnSettings: ColumnSetting[]) => {
      try {
        const newSettings = { ...settings };
        const settingsType =
          status === 'liked' ? 'likeColumns' : 'dislikeColumns';
        newSettings[settingsType] = newColumnSettings;

        const success = await saveSettings(newSettings);
        if (success) {
          setIsEditMode(false);
        } else {
          console.error('Failed to save settings');
        }
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    },
    [settings, status, saveSettings]
  );

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
  }, []);

  const handleViewModeColumns = useCallback(() => {
    setViewMode('columns');
  }, []);

  const handleViewModeMap = useCallback(() => {
    setViewMode('map');
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <Card className="flex-1 m-4">
          <CardHeader className="text-center">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <div className="flex justify-center gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header Section - Fixed Height */}
      <div className="flex-shrink-0 bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-4">
            {/* Title and Edit Button */}
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {!isEditMode && viewMode === 'columns' && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleEditClick}
                  className="shrink-0"
                  title="Edit columns"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* View Mode Toggle */}
            {!isEditMode && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant={viewMode === 'columns' ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleViewModeColumns}
                  className="flex items-center gap-2"
                >
                  <Grid className="w-4 h-4" />
                  Columns
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleViewModeMap}
                  className="flex items-center gap-2"
                >
                  <Map className="w-4 h-4" />
                  Map
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section - Flexible Height */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'columns' ? (
          <PropertyBoard
            initialProperties={filteredProperties}
            boardType={status}
            columns={columns}
            columnSettings={columnSettings}
            theme={theme}
            isEditMode={isEditMode}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
          />
        ) : (
          !isEditMode && (
            <PropertyMapView
              initialProperties={filteredProperties}
              columns={columns}
              columnSettings={columnSettings}
              statusFilter={status}
            />
          )
        )}
      </div>
    </div>
  );
};

export default React.memo(PropertyPage);
