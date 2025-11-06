
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TagVersion {
  id: string;
  versionNumber: string; // 版本号，如 "v1.0.0"
  tags: Tag[]; // 该版本的标签数据
  createdAt: Date;
  createdBy: string;
  isPublished: boolean; // 是否已发布
  publishedAt?: Date;
  publishedBy?: string;
  description: string; // 版本描述
}

export interface TagLibrary {
  id: string;
  libraryId: string; // 三位数库ID，如 "101"
  name: string;
  description: string;
  administrator: string;
  tags: Tag[];
  createdAt: Date;
  versionManagementEnabled: boolean; // 是否开启版本管理
  versions: TagVersion[]; // 版本列表
  publishedVersionId?: string; // 当前发布的版本ID
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

export interface TagSyncSettings {
  enabled: boolean;
  fields: {
    [field: string]: boolean;
  };
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
  tagSyncSettings?: {
    [tagId: string]: TagSyncSettings;
  };
  autoSync: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  lastSyncTime?: string;
}

export interface ClientSubscription {
  id: string;
  clientId: string;
  tagLibraryId: string;
  environment: string; // 环境：生产、测试、开发等
  appServer: string; // 应用服务器
  containerId: string; // 容器ID
  subscribedVersionNumber: string; // 订阅的版本号
  lastSyncTime: Date; // 最后一次同步时间
}
