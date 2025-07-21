import React from 'react';
import {
  Trash,
  ArrowLeft,
  ArrowRight,
  Heart,
  Phone,
  MessageCircle,
  HeartOff,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Button } from './ui/button';

export interface PropertyActionsProps {
  currentPageStatus?: string;
  hasComment?: boolean;
  onLike?: (e: React.MouseEvent) => void;
  onComment?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onBack?: (e: React.MouseEvent) => void;
  onNext?: (e: React.MouseEvent) => void;
  className?: string;
  showNavigation?: boolean;
  variant?: 'floating' | 'inline';
}

const PropertyActions: React.FC<PropertyActionsProps> = ({
  currentPageStatus,
  hasComment = false,
  onLike,
  onComment,
  onDelete,
  onBack,
  onNext,
  className = '',
  showNavigation = true,
  variant = 'floating',
}) => {
  const onPhoneCall = () => {
    window.open('tel:+972546692615', '_blank');
  };

  const onWhatsApp = () => {
    window.open('https://wa.me/972546692615', '_blank');
  };

  const actions = [
    onPhoneCall && {
      icon: Phone,
      onClick: onPhoneCall,
      className: 'text-red-500',
      key: 'phone',
    },
    onWhatsApp && {
      icon: FaWhatsapp,
      onClick: onWhatsApp,
      className: 'text-green-500',
      key: 'whatsapp',
    },
    onLike && {
      icon: currentPageStatus === 'liked' ? HeartOff : Heart,
      onClick: onLike,
      className: 'text-red-500',
      key: 'like',
    },
    onComment && {
      icon: MessageCircle,
      onClick: onComment,
      className: hasComment ? 'text-blue-500' : 'text-gray-500',
      key: 'comment',
    },
    onDelete && {
      icon: Trash,
      onClick: onDelete,
      className: 'text-red-500',
      key: 'delete',
    },
    showNavigation &&
      onBack && {
        icon: ArrowLeft,
        onClick: onBack,
        className: 'text-gray-700',
        key: 'back',
      },
    showNavigation &&
      onNext && {
        icon: ArrowRight,
        onClick: onNext,
        className: 'text-gray-700',
        key: 'next',
      },
  ].filter(Boolean);

  const baseClasses =
    variant === 'floating'
      ? 'absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10'
      : 'flex gap-2';

  return (
    <div className={`${baseClasses} ${className}`}>
      {actions.map((action) => {
        if (!action) return null;
        const { icon: Icon, onClick, className: actionClassName, key } = action;
        return (
          <Button
            key={key}
            onClick={onClick}
            variant="ghost"
            size="icon"
            className={`hover:bg-gray-100 transition-colors ${actionClassName}`}
            type="button"
          >
            <Icon size={16} className="cursor-pointer" />
          </Button>
        );
      })}
    </div>
  );
};

export default PropertyActions;
