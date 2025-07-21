import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { PropertyModal, DragAndDropBoard } from '../components';
import { DragAndDropBoardSkeleton } from '../components/DragAndDropBoard';
import { Property, PropertyStatus } from '../types/Property';
import {
  extractPropertiesFromData,
  updatePropertyStatus,
} from '../utils/propertyExtractor';
import propertiesData from '../data/properties.json';

const StatusLegend: React.FC = () => (
  <div className="flex flex-wrap gap-4 text-sm">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-green-400 rounded-full" />
      <span>Liked Properties</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-red-400 rounded-full" />
      <span>Disliked Properties</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-gray-400 rounded-full" />
      <span>Deleted Properties</span>
    </div>
  </div>
);

const DashboardHeader: React.FC = () => (
  <Card className="rounded-2xl p-6 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
    <CardHeader className="p-0">
      <CardTitle className="text-3xl font-bold mb-2">
        Property Management Dashboard
      </CardTitle>
      <p className="text-blue-100 text-lg">
        Organize and manage your properties across different categories
      </p>
    </CardHeader>
    <CardContent className="p-0 pt-4">
      <StatusLegend />
    </CardContent>
  </Card>
);

const ErrorState: React.FC<{ error: string }> = ({ error }) => (
  <Card className="rounded-2xl p-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
    <CardHeader>
      <CardTitle className="text-red-800 dark:text-red-200">
        Error Loading Properties
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-red-700 dark:text-red-300">{error}</p>
      <p className="text-sm text-red-600 dark:text-red-400 mt-2">
        Please check the console for more details or try refreshing the page.
      </p>
    </CardContent>
  </Card>
);

const EmptyState: React.FC = () => (
  <Card className="rounded-2xl p-8 text-center">
    <CardContent>
      <div className="text-gray-500 dark:text-gray-400">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-xl font-semibold mb-2">No Properties Found</h3>
        <p className="text-sm">
          No properties were found in the data file. Please check the data
          source.
        </p>
      </div>
    </CardContent>
  </Card>
);

const HomePage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await new Promise((resolve) => setTimeout(resolve, 500));

        const extractionResult = extractPropertiesFromData(propertiesData);

        if (extractionResult.error) {
          setError(extractionResult.error);
        } else {
          setProperties(extractionResult.properties);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load properties';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handlePropertyClick = useCallback((property: Property) => {
    setSelectedProperty(property);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProperty(null);
  }, []);

  const handleStatusChange = useCallback(
    (propertyToken: string, newStatus: PropertyStatus) => {
      setProperties((prevProperties) =>
        updatePropertyStatus(prevProperties, propertyToken, newStatus)
      );
    },
    []
  );

  const renderContent = () => {
    if (isLoading) return <DragAndDropBoardSkeleton />;
    if (error) return <ErrorState error={error} />;
    if (properties.length === 0) return <EmptyState />;

    return (
      <DragAndDropBoard
        properties={properties}
        onPropertyClick={handlePropertyClick}
        onStatusChange={handleStatusChange}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />
        {renderContent()}

        {selectedProperty && (
          <PropertyModal
            property={selectedProperty}
            onClose={handleCloseModal}
            open={!!selectedProperty}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
