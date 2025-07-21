import React, { useState, useEffect, useCallback } from 'react';
import { Heart, X } from 'lucide-react';
import { Property } from '../types/Property';
import { usePropertyStore } from '../hooks/usePropertyStore';
import { usePropertyData } from '../hooks/usePropertyData';
import { Button } from '../components/ui/button';
import PropertyDetails from '../components/PropertyDetails';

const LoadingState: React.FC = () => (
  <div className="bg-[#121212] p-4 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
      <p className="text-white">Loading properties...</p>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="bg-[#121212] p-4 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-white mb-4">
        No More Properties!
      </h1>
      <p className="text-gray-400 mb-2">
        You've reviewed all available properties.
      </p>
      <p className="text-gray-400">
        Check your liked/disliked pages to manage your selections.
      </p>
    </div>
  </div>
);

const SwipeHeader: React.FC<{
  currentIndex: number;
  totalProperties: number;
}> = ({ currentIndex, totalProperties }) => (
  <div className="text-center mb-6">
    <h1 className="text-2xl font-bold text-white mb-2">Property Swipe</h1>
    <p className="text-gray-400">Swipe right to like, left to pass</p>
    <p className="text-gray-600 text-sm mt-1">
      {currentIndex + 1} of {totalProperties} properties
    </p>
  </div>
);

const ActionButtons: React.FC<{
  onDislike: () => void;
  onLike: () => void;
  isProcessing: boolean;
}> = ({ onDislike, onLike, isProcessing }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-gray-800 p-4 z-[9999] md:relative md:border-t-0 md:bg-transparent md:z-auto">
    <div className="flex justify-center gap-8 max-w-4xl mx-auto">
      <Button
        onClick={onDislike}
        variant="destructive"
        size="lg"
        disabled={isProcessing}
        className="rounded-full p-4"
      >
        <X className="w-6 h-6 mr-2" />
        Pass
      </Button>
      <Button
        onClick={onLike}
        variant="default"
        size="lg"
        disabled={isProcessing}
        className="rounded-full p-4 bg-green-600 hover:bg-green-700"
      >
        <Heart className="w-6 h-6 mr-2" />
        Like
      </Button>
    </div>
  </div>
);

const InfoBanner: React.FC = () => (
  <div className="text-center mt-8 p-4 bg-[#1E1E1E] border border-gray-800 rounded-lg">
    <p className="text-gray-400 text-sm">
      Your selections are automatically saved and will appear in the
      Liked/Disliked pages.
    </p>
  </div>
);

const TinderPage: React.FC = () => {
  const { allProperties } = usePropertyData();
  const { propertyStates, updatePropertyStatus, isLoading } = usePropertyStore(
    allProperties as Property[]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableProperties, setAvailableProperties] = useState<Property[]>(
    []
  );

  useEffect(() => {
    if (isLoading) return;

    const filtered = (allProperties as Property[]).filter((property) => {
      const propertyState = propertyStates.get(property.token);
      return (
        !propertyState ||
        !['liked', 'disliked', 'deleted'].includes(propertyState.status)
      );
    });

    setAvailableProperties(filtered);
    setCurrentIndex((prevIndex) =>
      prevIndex >= filtered.length
        ? Math.max(0, filtered.length - 1)
        : prevIndex
    );
  }, [allProperties, propertyStates, isLoading]);

  const currentProperty = availableProperties[currentIndex];

  const handleAction = useCallback(
    async (action: 'liked' | 'disliked') => {
      if (!currentProperty || isProcessing) return;

      setIsProcessing(true);

      try {
        await updatePropertyStatus(currentProperty.token, action, 0);
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          return nextIndex >= availableProperties.length
            ? prevIndex
            : nextIndex;
        });
      } catch (error) {
      } finally {
        setTimeout(() => setIsProcessing(false), 200);
      }
    },
    [
      currentProperty,
      isProcessing,
      updatePropertyStatus,
      availableProperties.length,
    ]
  );

  if (isLoading) return <LoadingState />;
  if (!currentProperty) return <EmptyState />;

  return (
    <div className="bg-[#121212] min-h-screen">
      <div className="max-w-4xl mx-auto p-4 pb-32 md:pb-8">
        <SwipeHeader
          currentIndex={currentIndex}
          totalProperties={availableProperties.length}
        />

        <PropertyDetails property={currentProperty} />

        <ActionButtons
          onDislike={() => handleAction('disliked')}
          onLike={() => handleAction('liked')}
          isProcessing={isProcessing}
        />

        <InfoBanner />
      </div>
    </div>
  );
};

export default TinderPage;
