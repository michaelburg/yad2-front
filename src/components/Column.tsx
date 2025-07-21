import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import PropertyCard from './PropertyCard';
import { ColumnProps } from '@/types/Property';

const Column: React.FC<ColumnProps> = ({
  title,
  properties,
  onPropertyClick,
  onStatusChange,
}) => {
  const getColumnTheme = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('liked')) {
      return {
        headerBg: 'bg-green-50 dark:bg-green-900/20',
        badgeBg: 'bg-green-500',
        borderColor: 'border-green-200 dark:border-green-800',
      };
    }
    if (lowerTitle.includes('disliked')) {
      return {
        headerBg: 'bg-red-50 dark:bg-red-900/20',
        badgeBg: 'bg-red-500',
        borderColor: 'border-red-200 dark:border-red-800',
      };
    }
    if (lowerTitle.includes('deleted')) {
      return {
        headerBg: 'bg-gray-50 dark:bg-gray-900/20',
        badgeBg: 'bg-gray-500',
        borderColor: 'border-gray-200 dark:border-gray-800',
      };
    }
    return {
      headerBg: 'bg-blue-50 dark:bg-blue-900/20',
      badgeBg: 'bg-blue-500',
      borderColor: 'border-blue-200 dark:border-blue-800',
    };
  };

  const theme = getColumnTheme(title);

  return (
    <Card className={`rounded-2xl ${theme.borderColor} shadow-sm`}>
      <CardHeader className={`${theme.headerBg} rounded-t-2xl p-4`}>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </span>
          <Badge className={`${theme.badgeBg} text-white`}>
            {properties.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-dark">
          {properties.map((property) => (
            <PropertyCard
              key={property.token}
              property={property}
              onClick={onPropertyClick}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const ColumnSkeleton: React.FC = () => (
  <Card className="rounded-2xl">
    <CardHeader className="p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-8 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="p-4 space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="rounded-2xl p-4">
          <Skeleton className="h-48 w-full rounded-2xl mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-10" />
            </div>
          </div>
        </Card>
      ))}
    </CardContent>
  </Card>
);

export default Column;
