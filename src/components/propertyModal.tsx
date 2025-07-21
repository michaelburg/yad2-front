import React, { useCallback } from 'react';
import { PropertyModalProps } from '../types/Property';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import PropertyDetails from './PropertyDetails';

const PropertyModal: React.FC<PropertyModalProps & { open: boolean }> = ({
  property,
  onClose,
  open = true,
}) => {
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose();
      }
    },
    [onClose]
  );

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1E1E1E] border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Property Details
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {property.address.street?.text} {property.address.house?.number},{' '}
            {property.address.city.text}
          </DialogDescription>
        </DialogHeader>

        <PropertyDetails property={property} />
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(PropertyModal);
