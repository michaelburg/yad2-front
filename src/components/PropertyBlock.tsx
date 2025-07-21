import React, { useState, useRef, useCallback } from 'react';
import { PropertyBlockProps } from '../types/Property';
import { Textarea } from './ui/textarea';
import { Badge } from './ui';
import PropertyActions from './PropertyActions';

const PropertyImage: React.FC<{
  coverImage?: string;
  altText: string;
}> = ({ coverImage, altText }) => {
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      target.src =
        'https://via.placeholder.com/110x110/f3f4f6/9ca3af?text=No+Image';
    },
    []
  );

  return (
    <div className="w-[110px] flex-shrink-0">
      {coverImage ? (
        <img
          src={coverImage}
          alt={altText}
          className="w-full h-full object-cover rounded-tl-lg rounded-bl-lg"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 rounded-tl-lg rounded-bl-lg flex items-center justify-center">
          <span className="text-gray-400 text-xs">No Image</span>
        </div>
      )}
    </div>
  );
};

const PropertyDetails: React.FC<{
  price: number;
  address: any;
  additionalDetails: any;
  columnName?: string;
  columnColor?: string;
}> = ({ price, address, additionalDetails, columnName, columnColor }) => {
  const formattedPrice = `₪${price?.toLocaleString()}`;
  const addressLine1 = `${address?.street?.text || ''} ${
    address?.house?.number || ''
  }`.trim();
  const addressLine2 = `${additionalDetails?.property?.text || ''}, ${
    address?.neighborhood?.text || ''
  }, ${address?.city?.text || ''}`;
  const propertyDetails = `${additionalDetails?.roomsCount} חדרים • קומה ${address?.house?.floor} • ${additionalDetails?.squareMeter} מ"ר`;

  return (
    <div className="w-fit px-3 py-2 flex flex-col justify-center">
      <div className="flex flex-row-reverse items-center gap-2">
        <div className="font-bold text-lg text-gray-900 mb-1 text-right">
          {formattedPrice}
        </div>
        {columnName && (
          <Badge
            className="text-xs text-white mb-1 text-right"
            style={{ backgroundColor: columnColor || '#6B7280' }}
          >
            {columnName}
          </Badge>
        )}
      </div>
      <div className="text-gray-600 text-sm mb-1 text-right truncate">
        {addressLine1}
      </div>
      <div className="text-gray-500 text-xs mb-2 text-right truncate">
        {addressLine2}
      </div>
      <div
        className="flex gap-2 text-gray-500 text-xs text-right whitespace-nowrap"
        dir="rtl"
      >
        <span>{propertyDetails}</span>
      </div>
    </div>
  );
};

const CommentSection: React.FC<{
  comment: string;
  isSaving: boolean;
  onCommentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCommentBlur: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}> = ({ comment, isSaving, onCommentChange, onCommentBlur, textareaRef }) => (
  <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-xl">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700 text-right">
        Comments
      </span>
      {isSaving && <span className="text-xs text-blue-500">Saving...</span>}
    </div>
    <Textarea
      ref={textareaRef}
      value={comment}
      onChange={onCommentChange}
      onBlur={onCommentBlur}
      placeholder="Add a comment about the property..."
      className="text-black resize-none focus:ring-2 focus:ring-blue-500 text-right"
      onClick={(e) => e.stopPropagation()}
      rows={3}
    />
  </div>
);

const PropertyBlock: React.FC<PropertyBlockProps> = ({
  property,
  onDelete,
  onBack,
  onNext,
  onLike,
  onCommentUpdate,
  currentPageStatus,
  onClick,
  columnName,
  columnColor,
}) => {
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);
  const [comment, setComment] = useState(property?.comment || '');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!property) return null;

  const { price, address, additionalDetails, metaData } = property;
  const coverImage = metaData?.coverImage || metaData?.images?.[0];
  const altText = `Property at ${address?.street?.text || 'Unknown address'}`;

  const handleCommentToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCommentExpanded((prev) => {
      if (!prev) {
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
      return !prev;
    });
  }, []);

  const handleCommentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setComment(e.target.value);
    },
    []
  );

  const handleCommentBlur = useCallback(async () => {
    if (comment !== property.comment && !isSaving && onCommentUpdate) {
      setIsSaving(true);
      try {
        onCommentUpdate(property.token, comment);
        property.comment = comment;
      } catch (error) {
        setComment(property.comment || '');
      } finally {
        setIsSaving(false);
      }
    }
  }, [comment, property.comment, property.token, isSaving, onCommentUpdate]);

  const handleClick = useCallback(() => {
    onClick?.(property);
  }, [onClick, property]);

  return (
    <div
      className={`group w-full min-w-[250px] sm:min-w-[270px] lg:min-w-[280px] max-w-[380px] ${
        isCommentExpanded ? 'h-auto' : 'h-[110px]'
      } bg-white border-2 border-sky-100 rounded-xl shadow-md flex flex-col overflow-hidden relative hover:shadow-lg transition-all`}
      onClick={handleClick}
    >
      <div className="flex flex-row-reverse items-stretch h-[110px]">
        <PropertyActions
          currentPageStatus={currentPageStatus}
          hasComment={!!comment}
          onLike={onLike}
          onComment={handleCommentToggle}
          onDelete={onDelete}
          onBack={onBack}
          onNext={onNext}
        />

        <PropertyImage coverImage={coverImage} altText={altText} />

        <PropertyDetails
          price={price}
          address={address}
          additionalDetails={additionalDetails}
          columnName={columnName}
          columnColor={columnColor}
        />
      </div>

      {isCommentExpanded && (
        <CommentSection
          comment={comment}
          isSaving={isSaving}
          onCommentChange={handleCommentChange}
          onCommentBlur={handleCommentBlur}
          textareaRef={textareaRef}
        />
      )}
    </div>
  );
};

export default React.memo(PropertyBlock);
