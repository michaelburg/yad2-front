import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Column, { ColumnSkeleton } from './Column';
import { DragAndDropBoardProps } from '@/types/Property';

const DragAndDropBoard: React.FC<DragAndDropBoardProps> = ({
  properties,
  onPropertyClick,
  onStatusChange,
}) => {
  const organizedProperties = useMemo(() => {
    const likedProperties = properties.filter((p) => p.status === 'liked');
    const dislikedProperties = properties.filter(
      (p) => p.status === 'disliked'
    );
    const deletedProperties = properties.filter((p) => p.status === 'deleted');

    return {
      liked: likedProperties,
      disliked: dislikedProperties,
      deleted: deletedProperties,
    };
  }, [properties]);

  const columns = [
    {
      id: 'liked',
      title: 'Liked Properties',
      properties: organizedProperties.liked,
    },
    {
      id: 'disliked',
      title: 'Disliked Properties',
      properties: organizedProperties.disliked,
    },
    {
      id: 'deleted',
      title: 'Deleted Properties',
      properties: organizedProperties.deleted,
    },
  ];

  const totalProperties = properties.length;
  const likedCount = organizedProperties.liked.length;
  const dislikedCount = organizedProperties.disliked.length;
  const deletedCount = organizedProperties.deleted.length;

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Property Dashboard Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalProperties}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Properties
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {likedCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Liked
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {dislikedCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Disliked
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {deletedCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Deleted
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((column) => (
          <Column
            key={column.id}
            title={column.title}
            properties={column.properties}
            onPropertyClick={onPropertyClick}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
};

export const DragAndDropBoardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <Card className="rounded-2xl p-6">
      <CardHeader className="p-0 pb-4">
        <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <ColumnSkeleton key={index} />
      ))}
    </div>
  </div>
);

export default DragAndDropBoard;
