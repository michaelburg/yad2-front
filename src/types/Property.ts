import { ColumnSetting } from './Settings';

export interface Property {
  token: string;
  price: number;
  address: {
    city: {
      text: string;
    };
    area: {
      text: string;
    };
    neighborhood: {
      text: string;
    };
    street?: {
      text: string;
    };
    house: {
      number?: number;
      floor: number;
    };
    coords: {
      lon: number;
      lat: number;
    };
  };
  additionalDetails: {
    property: {
      text: string;
    };
    roomsCount: number;
    squareMeter: number;
    propertyCondition?: {
      id: number;
    };
  };
  metaData: {
    coverImage: string;
    images: string[];
    video?: string;
    squareMeterBuild?: number;
  };
  subcategoryId: number;
  categoryId: number;
  adType: string;
  tags?: Array<{
    name: string;
    id: number;
    priority: number;
  }>;
  orderId: number;
  priority: number;
  priceBeforeTag?: number;
  status?: PropertyStatus;
  comment?: string;
  customer?: {
    agencyName: string;
    agencyLogo: string;
  };
  inProperty?: {
    isAssetExclusive: boolean;
  };
}

export type PropertyStatus = 'liked' | 'disliked' | 'deleted';

export const createPropertyWithStatus = (
  property: Omit<Property, 'status'>,
  status: PropertyStatus
): Property => ({
  ...property,
  status,
});

export interface PropertyExtractorResult {
  properties: Property[];
  error?: string;
}

export interface PropertyState {
  propertyId: string;
  status: PropertyStatus;
  position: number;
  columnIndex: number;
  lastUpdated: number;
  comment?: string;
}

export interface PropertyColumns {
  [columnIndex: number]: Property[];
}

export interface PropertyBoardProps {
  initialProperties: Property[];
  boardType: PropertyStatus;
  columns: string[];
  columnSettings?: ColumnSetting[];
  theme?: 'blue' | 'red';
  isEditMode?: boolean;
  onSaveEdit?: (newColumnSettings: ColumnSetting[]) => Promise<void>;
  onCancelEdit?: () => void;
}

export interface PropertyBlockProps {
  property: Property;
  onDelete: (e: React.MouseEvent) => void;
  onBack: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
  onLike: (e: React.MouseEvent) => void;
  onCommentUpdate?: (propertyToken: string, comment: string) => void;
  currentPageStatus?: PropertyStatus;
  onClick?: (property: Property) => void;
  columnName?: string;
  columnColor?: string;
}

export interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
}

export interface PropertyPageProps {
  status: PropertyStatus;
  columns?: string[];
  theme?: 'blue' | 'red';
  title: string;
}

export interface PropertyCardProps {
  property: Property;
  onClick: (property: Property) => void;
  onStatusChange: (token: string, newStatus: PropertyStatus) => void;
}

export interface ColumnProps {
  title: string;
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  onStatusChange: (token: string, newStatus: PropertyStatus) => void;
}

export interface DragAndDropBoardProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  onStatusChange: (token: string, newStatus: PropertyStatus) => void;
}
