import React, { useState, useCallback, useMemo } from 'react';
import { Property } from '../types/Property';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Home,
  Square,
  User,
  Calendar,
} from 'lucide-react';
import { Button } from './ui/button';
import PropertyMapWrapper from './PropertyMapWrapper';

interface PropertyDetailsProps {
  property: Property;
  className?: string;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  className = '',
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = useMemo(
    () => property.metaData?.images || [],
    [property.metaData?.images]
  );
  const hasMultipleImages = useMemo(() => images.length > 1, [images.length]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToImage = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  const renderImageCarousel = useMemo(
    () => (
      <div className="relative">
        <img
          src={images[currentImageIndex]}
          alt={`Property image ${currentImageIndex + 1}`}
          className="w-full h-64 lg:h-80 object-cover rounded-xl"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              'https://via.placeholder.com/400x300/1E1E1E/FFFFFF?text=No+Image';
          }}
        />

        {hasMultipleImages && (
          <>
            <Button
              onClick={prevImage}
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={nextImage}
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <Button
                  key={index}
                  onClick={() => goToImage(index)}
                  variant="ghost"
                  size="sm"
                  className={`w-2 h-2 rounded-full p-0 transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    ),
    [
      images,
      currentImageIndex,
      hasMultipleImages,
      prevImage,
      nextImage,
      goToImage,
    ]
  );

  const renderPropertyDetails = useMemo(
    () => (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#2A2A2A] rounded-lg p-4 flex items-center gap-3">
          <Home size={20} className="text-gray-400" />
          <div>
            <div className="text-gray-400 text-sm">חדרים</div>
            <div className="text-white font-semibold">
              {property.additionalDetails.roomsCount}
            </div>
          </div>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg p-4 flex items-center gap-3">
          <Square size={20} className="text-gray-400" />
          <div>
            <div className="text-gray-400 text-sm">שטח</div>
            <div className="text-white font-semibold">
              {property.additionalDetails.squareMeter} מ"ר
            </div>
          </div>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg p-4 flex items-center gap-3">
          <User size={20} className="text-gray-400" />
          <div>
            <div className="text-gray-400 text-sm">קומה</div>
            <div className="text-white font-semibold">
              {property.address.house.floor}
            </div>
          </div>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg p-4 flex items-center gap-3">
          <Calendar size={20} className="text-gray-400" />
          <div>
            <div className="text-gray-400 text-sm">סוג נכס</div>
            <div className="text-white font-semibold">
              {property.additionalDetails.property.text}
            </div>
          </div>
        </div>
      </div>
    ),
    [property.additionalDetails, property.address.house.floor]
  );

  const renderTags = useMemo(() => {
    const tags = property.tags || [];
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm"
          >
            {tag.name}
          </span>
        ))}
      </div>
    );
  }, [property.tags]);

  const renderVideo = useMemo(() => {
    if (!property.metaData?.video) return null;

    return (
      <div className="aspect-video rounded-xl overflow-hidden">
        <video
          src={property.metaData.video}
          controls
          className="w-full h-full object-cover"
          poster={property.metaData.coverImage}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }, [property.metaData?.video, property.metaData?.coverImage]);

  const formattedPrice = useMemo(
    () => `₪${property.price.toLocaleString()}`,
    [property.price]
  );

  return (
    <div className={`space-y-6 lg:space-y-0 ${className}`}>
      {/* Mobile: Images first, Desktop: Left column with images */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
        <div className="space-y-4 order-1">
          {images.length > 0 && renderImageCarousel}
          {renderVideo}
        </div>

        {/* Mobile: Details second, Desktop: Right column */}
        <div className="space-y-6 order-2">
          <div className="text-3xl font-bold text-white">{formattedPrice}</div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin size={20} className="text-gray-400 mt-0.5" />
              <div className="text-white">
                <div className="font-semibold text-lg">
                  {property.address.street?.text}{' '}
                  {property.address.house?.number}
                </div>
                <div className="text-gray-400">
                  {property.address.neighborhood?.text},{' '}
                  {property.address.city?.text}
                </div>
                <div className="text-gray-400 text-sm">
                  {property.address.area?.text}
                </div>
              </div>
            </div>
          </div>

          {renderPropertyDetails}
          {renderTags}

          <div className="text-gray-400 text-sm">
            מזהה נכס: {property.token}
          </div>
        </div>
      </div>

      {/* Mobile: Map at bottom, Desktop: Spans full width below */}
      <div className="order-3 lg:mt-8">
        <PropertyMapWrapper property={property} className="h-80 w-full" />
      </div>
    </div>
  );
};

export default React.memo(PropertyDetails);
