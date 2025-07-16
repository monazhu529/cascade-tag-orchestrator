
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TagLibrary {
  id: string;
  libraryId: string; // 三位数库ID，如 "101"
  name: string;
  description: string;
  administrator: string;
  tags: Tag[];
  createdAt: Date;
}

export interface Tag {
  id: string;
  key: string;
  name: string;
  value: string;
  status: "active" | "inactive";
  remark: string;
  level: number;
  parentId?: string;
  children?: Tag[];
}

export interface LibraryPermission {
  userId: string;
  libraryId: string;
  role: "administrator" | "operator";
  grantedAt: Date;
  grantedBy: string;
}

export interface TaskLibraryPermission {
  id: string;
  userId: string;
  userName: string;
  taskLibraryId: string;
  role: "manager" | "operator"; // 管理员和运营员
  grantedAt: Date;
  grantedBy: string;
}

export interface PermissionRequest {
  id: string;
  userId: string;
  libraryId: string;
  requestedRole: "administrator" | "operator";
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface SyncConfig {
  id: string;
  taskLibraryId: string;
  tagLibraryId: string;
  syncLevels: {
    [level: number]: {
      enabled: boolean;
      fields: {
        [field: string]: boolean;
      };
    };
  };
  autoSync: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  lastSyncTime?: string;
}
