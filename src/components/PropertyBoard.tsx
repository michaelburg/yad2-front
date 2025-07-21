import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PropertyBlock from './PropertyBlock';
import PropertyModal from './PropertyModal';
import { Property, PropertyBoardProps } from '../types/Property';
import { usePropertyStore } from '../hooks/usePropertyStore';
import { Input } from './ui/input';
import { Save, X, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { ColumnSetting } from '../types/Settings';
import { getColorStyles } from '../utils/colorUtils';
import { DEFAULT_SETTINGS } from '../hooks/useSettings';

const EditControls: React.FC<{
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
}> = ({ onSave, onCancel, onReset }) => (
  <div className="flex-shrink-0 bg-card border-b">
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-center gap-4">
        <Button onClick={onSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Discard Changes
        </Button>
        <Button onClick={onReset} className="flex items-center gap-2">
          <RefreshCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </div>
  </div>
);

const ColumnHeader: React.FC<{
  title: string;
  columnIndex: number;
  isEditMode: boolean;
  columnSettings: ColumnSetting[];
  onSettingChange: (
    index: number,
    field: 'name' | 'color',
    value: string
  ) => void;
}> = ({ title, columnIndex, isEditMode, columnSettings, onSettingChange }) => {
  const [localColor, setLocalColor] = useState<string>('');
  const [localName, setLocalName] = useState<string>('');

  const columnSettings_color = columnSettings[columnIndex]?.color || '#6B7280';
  const columnSettings_name = columnSettings[columnIndex]?.name || title;
  const columnStyles = getColorStyles(localColor || columnSettings_color);
  const columnName = localName || columnSettings_name;

  // Initialize local state when columnSettings change
  useEffect(() => {
    setLocalColor(columnSettings_color);
    setLocalName(columnSettings_name);
  }, [columnSettings_color, columnSettings_name]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalColor(e.target.value);
  };

  const handleColorBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onSettingChange(columnIndex, 'color', e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalName(e.target.value);
  };

  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onSettingChange(columnIndex, 'name', e.target.value);
  };

  if (isEditMode) {
    return (
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Input
            type="color"
            value={localColor || columnSettings_color}
            onChange={handleColorChange}
            onBlur={handleColorBlur}
            className="w-10 h-10 flex-shrink-0 rounded border cursor-pointer p-1"
          />
          <Input
            type="text"
            value={columnName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            className="text-center font-semibold flex-1"
            placeholder="Column name"
          />
        </div>
      </CardHeader>
    );
  }

  return (
    <CardHeader className="pb-4">
      <div className="text-center">
        <Badge
          variant="secondary"
          className="text-sm font-semibold px-3 py-1"
          style={{
            backgroundColor: columnStyles.headerBg,
            color: columnStyles.headerColor,
            borderColor: columnStyles.borderColor,
          }}
        >
          {columnName}
        </Badge>
      </div>
    </CardHeader>
  );
};

const PropertyItem: React.FC<{
  property: Property;
  columnIndex: number;
  index: number;
  isEditMode: boolean;
  onPropertyClick: (property: Property) => void;
  onDelete: (property: Property) => (e: React.MouseEvent) => void;
  onMoveColumn: (
    property: Property,
    currentColumn: number,
    direction: number
  ) => (e: React.MouseEvent) => void;
  onLike: (property: Property) => (e: React.MouseEvent) => void;
  onCommentUpdate: (token: string, comment: string) => void;
}> = ({
  property,
  columnIndex,
  index,
  isEditMode,
  onPropertyClick,
  onDelete,
  onMoveColumn,
  onLike,
  onCommentUpdate,
}) => (
  <Draggable
    key={`${property.token}-${columnIndex}-${index}`}
    draggableId={`${property.token}__COLUMN__${columnIndex}`}
    index={index}
    isDragDisabled={isEditMode}
  >
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{
          ...provided.draggableProps.style,
          opacity: snapshot.isDragging ? 0.8 : 1,
        }}
        onClick={() =>
          !snapshot.isDragging && !isEditMode && onPropertyClick(property)
        }
        className={`transition-transform duration-200 ${
          isEditMode ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'
        } ${snapshot.isDragging ? 'z-50' : ''}`}
      >
        <PropertyBlock
          property={property}
          onDelete={onDelete(property)}
          onBack={onMoveColumn(property, columnIndex, -1)}
          onNext={onMoveColumn(property, columnIndex, 1)}
          onLike={onLike(property)}
          onCommentUpdate={onCommentUpdate}
        />
      </div>
    )}
  </Draggable>
);

const PropertyBoard: React.FC<PropertyBoardProps> = ({
  initialProperties,
  boardType,
  columns,
  columnSettings = [],
  isEditMode = false,
  onSaveEdit,
  onCancelEdit,
}) => {
  const {
    getPropertiesByColumn,
    updatePropertyStatus,
    updatePropertyComment,
    moveProperty,
    isLoading,
    error,
  } = usePropertyStore(initialProperties, boardType);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [tempColumnSettings, setTempColumnSettings] = useState<ColumnSetting[]>(
    []
  );

  const propertyColumns = getPropertiesByColumn(columns);
  const currentSettings = isEditMode ? tempColumnSettings : columnSettings;

  useEffect(() => {
    if (isEditMode) {
      const initialSettings = columns.map((columnName, index) => ({
        name: columnSettings[index]?.name || columnName,
        color: columnSettings[index]?.color || '#6B7280',
      }));
      setTempColumnSettings(initialSettings);
    } else {
      setTempColumnSettings([]);
    }
  }, [isEditMode, columns, columnSettings]);

  const handleTempColumnChange = useCallback(
    (index: number, field: 'name' | 'color', value: string) => {
      setTempColumnSettings((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = { ...updated[index], [field]: value };
        } else {
          updated[index] = {
            name: field === 'name' ? value : columns[index] || '',
            color: field === 'color' ? value : '#6B7280',
          };
        }
        return updated;
      });
    },
    [columns]
  );

  const handlePropertyClick = useCallback((property: Property) => {
    setSelectedProperty(property);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    (property: Property) => (e: React.MouseEvent) => {
      e.stopPropagation();
      updatePropertyStatus(property.token, 'deleted');
    },
    [updatePropertyStatus]
  );

  const handleMoveColumn = useCallback(
    (property: Property, currentColumn: number, direction: number) =>
      (e: React.MouseEvent) => {
        e.stopPropagation();
        const newColumnIndex = currentColumn + direction;
        if (newColumnIndex >= 0 && newColumnIndex < columns.length) {
          // Find current property position in the current column
          const currentColumnProperties = propertyColumns[currentColumn] || [];
          const currentPosition = currentColumnProperties.findIndex(
            (p: Property) => p.token === property.token
          );
          // New position will be at the end of the target column
          const targetColumnProperties = propertyColumns[newColumnIndex] || [];
          const newPosition = targetColumnProperties.length;

          moveProperty(
            property.token,
            currentColumn,
            newColumnIndex,
            newPosition
          );
        }
      },
    [moveProperty, columns, propertyColumns]
  );

  const handleLike = useCallback(
    (property: Property) => (e: React.MouseEvent) => {
      e.stopPropagation();
      const newStatus = boardType === 'liked' ? 'disliked' : 'liked';
      updatePropertyStatus(property.token, newStatus);
    },
    [updatePropertyStatus, boardType]
  );

  const handleDragEnd = useCallback(
    (result: any) => {
      if (!result.destination || isEditMode) return;

      const { source, destination, draggableId } = result;

      // Extract property token using the new separator
      const propertyToken = draggableId.split('__COLUMN__')[0];
      const sourceColumnIndex = parseInt(source.droppableId);
      const destColumnIndex = parseInt(destination.droppableId);

      // Handle both cross-column moves and same-column reordering
      if (
        source.droppableId !== destination.droppableId ||
        source.index !== destination.index
      ) {
        moveProperty(
          propertyToken,
          sourceColumnIndex,
          destColumnIndex,
          destination.index
        );
      }
    },
    [moveProperty, isEditMode]
  );

  const handleSave = useCallback(() => {
    if (onSaveEdit) {
      onSaveEdit(tempColumnSettings);
    }
  }, [onSaveEdit, tempColumnSettings]);

  const handleCancel = useCallback(() => {
    setTempColumnSettings([]);
    if (onCancelEdit) {
      onCancelEdit();
    }
  }, [onCancelEdit]);

  const handleReset = useCallback(() => {
    const defaultSettings =
      boardType === 'liked'
        ? DEFAULT_SETTINGS.likeColumns
        : DEFAULT_SETTINGS.dislikeColumns;
    setTempColumnSettings(defaultSettings);
    handleSave();
  }, [boardType, handleSave]);

  const renderColumn = (title: string, columnIndex: number) => {
    const columnProperties = propertyColumns[columnIndex] || [];
    const columnStyles = getColorStyles(
      currentSettings[columnIndex]?.color || '#6B7280'
    );

    return (
      <Droppable
        droppableId={columnIndex.toString()}
        key={title}
        isDropDisabled={isEditMode}
      >
        {(provided, snapshot) => (
          <Card
            className="flex-shrink-0 sm:w-72 md:w-80 flex flex-col transition-colors duration-200 shadow-sm hover:shadow-md mx-1 sm:mx-2 md:mx-4 h-[calc(100%-0.5rem)] sm:h-[calc(100%-1rem)] md:h-[calc(100%-2rem)]"
            style={{
              borderColor: columnStyles.borderColor,
              backgroundColor: snapshot.isDraggingOver
                ? columnStyles.dragOverBg
                : undefined,
            }}
          >
            <ColumnHeader
              title={title}
              columnIndex={columnIndex}
              isEditMode={isEditMode}
              columnSettings={currentSettings}
              onSettingChange={handleTempColumnChange}
            />
            <CardContent
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 scrollbar-elegant p-2 sm:p-3 md:p-6"
            >
              {columnProperties.map((property: Property, index: number) => (
                <PropertyItem
                  key={`${property.token}-${columnIndex}-${index}`}
                  property={property}
                  columnIndex={columnIndex}
                  index={index}
                  isEditMode={isEditMode}
                  onPropertyClick={handlePropertyClick}
                  onDelete={handleDelete}
                  onMoveColumn={handleMoveColumn}
                  onLike={handleLike}
                  onCommentUpdate={updatePropertyComment}
                />
              ))}
              {provided.placeholder}
            </CardContent>
          </Card>
        )}
      </Droppable>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">
              Error loading properties: {error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-screen-safe">
      {isEditMode && (
        <EditControls
          onSave={handleSave}
          onCancel={handleCancel}
          onReset={handleReset}
        />
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-0.5 sm:gap-1 md:gap-2 h-full overflow-x-auto scrollbar-elegant px-0.5 sm:px-1 md:px-2">
            {columns.map((title, columnIndex) =>
              renderColumn(title, columnIndex)
            )}
          </div>
        </div>
      </DragDropContext>

      {modalOpen && selectedProperty && !isEditMode && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setModalOpen(false)}
          open={modalOpen}
        />
      )}
    </div>
  );
};

export default PropertyBoard;
