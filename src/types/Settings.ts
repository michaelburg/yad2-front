export interface ColumnSetting {
  color: string;
  name: string;
}

export interface Settings {
  likeColumns: ColumnSetting[];
  dislikeColumns: ColumnSetting[];
}

export interface SettingsResponse {
  success: boolean;
  data: {
    settings: Settings;
    _id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}
