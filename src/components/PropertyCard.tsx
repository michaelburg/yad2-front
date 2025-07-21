import React, { useCallback, useMemo } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Home, Square, Heart, X, Trash2 } from 'lucide-react';
import { PropertyCardProps, PropertyStatus } from '@/types/Property';

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onClick,
  onStatusChange,
}) => {
  const handleStatusClick = useCallback(
    (newStatus: PropertyStatus, e: React.MouseEvent) => {
      e.stopPropagation();
      onStatusChange(property.token, newStatus);
    },
    [onStatusChange, property.token]
  );

  const handleCardClick = useCallback(() => {
    onClick(property);
  }, [onClick, property]);

  const handleLikeClick = useCallback(
    (e: React.MouseEvent) => {
      handleStatusClick('liked', e);
    },
    [handleStatusClick]
  );

  const handleDislikeClick = useCallback(
    (e: React.MouseEvent) => {
      handleStatusClick('disliked', e);
    },
    [handleStatusClick]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      handleStatusClick('deleted', e);
    },
    [handleStatusClick]
  );

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(property.price);
  }, [property.price]);

  const statusColorClass = useMemo(() => {
    const status = property.status || 'default';
    switch (status) {
      case 'liked':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'disliked':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'deleted':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  }, [property.status]);

  const statusLabel = useMemo(() => {
    const status = property.status || 'default';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }, [property.status]);

  const locationText = useMemo(
    () =>
      `${property.address.city.text}, ${property.address.neighborhood.text}`,
    [property.address.city.text, property.address.neighborhood.text]
  );

  const propertyImage = useMemo(
    () => property.metaData.coverImage || property.metaData.images[0],
    [property.metaData.coverImage, property.metaData.images]
  );

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      target.src =
        'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=No+Image';
    },
    []
  );

  return (
    <Card
      className="rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 border-0"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="relative mb-4">
          <img
            src={propertyImage}
            alt="Property"
            className="w-full h-48 object-cover rounded-2xl"
            onError={handleImageError}
          />

          <Badge className={`absolute top-2 right-2 ${statusColorClass}`}>
            {statusLabel}
          </Badge>

          <div className="absolute bottom-2 left-2 bg-black/80 text-white px-3 py-1 rounded-xl text-sm font-semibold">
            {formattedPrice}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <MapPin size={16} />
            <span className="text-sm">{locationText}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Home size={16} />
              <span>{property.additionalDetails.roomsCount} rooms</span>
            </div>
            <div className="flex items-center gap-1">
              <Square size={16} />
              <span>{property.additionalDetails.squareMeter}m²</span>
            </div>
          </div>

          {property.customer && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={property.customer.agencyLogo}
                  alt={property.customer.agencyName}
                />
                <AvatarFallback className="text-xs">
                  {property.customer.agencyName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500">
                {property.customer.agencyName}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-0 pt-4">
        <div className="flex gap-2 w-full">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleLikeClick}
          >
            <Heart size={14} className="mr-1" />
            Like
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleDislikeClick}
          >
            <X size={14} className="mr-1" />
            Dislike
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDeleteClick}>
            <Trash2 size={14} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default React.memo(PropertyCard);
