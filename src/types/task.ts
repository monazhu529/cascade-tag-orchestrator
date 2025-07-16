
export interface SyncConfig {
  enabled: boolean;
  syncLevel: 'full' | 'level1' | 'level2' | 'level3';
  selectedTags?: string[];
  autoSync: boolean;
  lastSyncTime?: Date;
}

export interface TaskLibraryDetail {
  id: string;
  name: string;
  description: string;
  connectedTagLibraryId?: string;
  syncConfig: SyncConfig;
  tagMappings: Record<string, string>;
  createdAt: Date;
  createdBy: string;
  version: string;
  approvers: string[];
  subscribers: string[];
}

export interface FilterMapping {
  id: string;
  taskLibraryId: string;
  sourceTagId: string;
  targetField: string;
  mappingRule: string;
  isActive: boolean;
}

export interface OperationLog {
  id: string;
  taskLibraryId: string;
  operation: string;
  operatorId: string;
  operatorName: string;
  timestamp: Date;
  details: string;
}

export interface Subscription {
  id: string;
  taskLibraryId: string;
  userId: string;
  userName: string;
  subscriptionType: 'sync' | 'update' | 'all';
  isActive: boolean;
  createdAt: Date;
}
