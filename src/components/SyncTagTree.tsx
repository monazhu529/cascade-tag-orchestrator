
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tag } from "@/types/permissions";
import { ChevronRight, ChevronDown, Settings } from "lucide-react";

interface SyncTagTreeProps {
  tags: Tag[];
  syncConfig: any;
  onUpdateSyncConfig: (config: any) => void;
}

interface TagNodeProps {
  tag: Tag;
  children: Tag[];
  allTags: Tag[];
  syncConfig: any;
  onUpdateSyncConfig: (config: any) => void;
  level: number;
}

const TagNode = ({ 
  tag, 
  children, 
  allTags, 
  syncConfig,
  onUpdateSyncConfig,
  level 
}: TagNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(level <= 2);
  const [showFields, setShowFields] = useState(false);
  const hasChildren = children.length > 0;
  
  const tagSync = syncConfig.tagSyncSettings?.[tag.id] || {
    enabled: false,
    fields: {
      key: false,
      name: false,
      value: false,
      status: false,
      remark: false,
      level: false
    }
  };

  const fieldLabels = {
    key: '标签键',
    name: '标签名',
    value: '标签值',
    status: '状态',
    remark: '备注',
    level: '级别'
  };

  const toggleTagSync = (enabled: boolean) => {
    const newConfig = {
      ...syncConfig,
      tagSyncSettings: {
        ...syncConfig.tagSyncSettings,
        [tag.id]: {
          ...tagSync,
          enabled
        }
      }
    };
    onUpdateSyncConfig(newConfig);
  };

  const toggleFieldSync = (field: string, enabled: boolean) => {
    const newConfig = {
      ...syncConfig,
      tagSyncSettings: {
        ...syncConfig.tagSyncSettings,
        [tag.id]: {
          ...tagSync,
          fields: {
            ...tagSync.fields,
            [field]: enabled
          }
        }
      }
    };
    onUpdateSyncConfig(newConfig);
  };

  const enabledFieldsCount = Object.values(tagSync.fields).filter(Boolean).length;

  return (
    <div className="border-l-2 border-gray-200 pl-4 ml-2">
      <div className="flex items-center gap-2 py-2 group">
        <div className="flex items-center gap-1">
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0 w-6 h-6"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-6" />}
        </div>
        
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <Switch
            checked={tagSync.enabled}
            onCheckedChange={toggleTagSync}
          />
          <span className="font-medium truncate">{tag.name}</span>
          <Badge variant="outline" className="text-xs">
            L{tag.level}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {tag.key}
          </Badge>
          <Badge 
            variant={tag.status === "active" ? "default" : "secondary"}
            className="text-xs"
          >
            {tag.status === "active" ? "激活" : "未激活"}
          </Badge>
          {tagSync.enabled && enabledFieldsCount > 0 && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
              {enabledFieldsCount} 个字段
            </Badge>
          )}
        </div>
        
        {tagSync.enabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFields(!showFields)}
            className="p-1 w-8 h-8"
            title="字段配置"
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>

      {tagSync.enabled && showFields && (
        <div className="ml-8 mb-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium mb-2">同步字段配置：</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(fieldLabels).map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={tagSync.fields[field] || false}
                  onCheckedChange={(checked) => toggleFieldSync(field, checked as boolean)}
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {children.map((child) => {
            const grandChildren = allTags.filter(t => t.parentId === child.id);
            return (
              <TagNode
                key={child.id}
                tag={child}
                children={grandChildren}
                allTags={allTags}
                syncConfig={syncConfig}
                onUpdateSyncConfig={onUpdateSyncConfig}
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const SyncTagTree = ({ tags, syncConfig, onUpdateSyncConfig }: SyncTagTreeProps) => {
  const rootTags = tags.filter(tag => tag.level === 1 || !tag.parentId);

  const toggleAllSync = (enabled: boolean) => {
    const tagSyncSettings: any = {};
    tags.forEach(tag => {
      tagSyncSettings[tag.id] = {
        enabled,
        fields: {
          key: enabled,
          name: enabled,
          value: enabled,
          status: enabled,
          remark: false,
          level: false
        }
      };
    });

    onUpdateSyncConfig({
      ...syncConfig,
      tagSyncSettings
    });
  };

  const enabledTagsCount = Object.values(syncConfig.tagSyncSettings || {}).filter((setting: any) => setting.enabled).length;

  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>暂无标签可供配置同步</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div>
          <h4 className="font-medium">整库同步控制</h4>
          <p className="text-sm text-gray-600">
            快速启用或禁用所有标签的同步（已启用 {enabledTagsCount} 个标签）
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toggleAllSync(true)}
          >
            全部启用
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toggleAllSync(false)}
          >
            全部禁用
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-3">标签同步配置</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {rootTags.map((rootTag) => {
            const children = tags.filter(tag => tag.parentId === rootTag.id);
            return (
              <TagNode
                key={rootTag.id}
                tag={rootTag}
                children={children}
                allTags={tags}
                syncConfig={syncConfig}
                onUpdateSyncConfig={onUpdateSyncConfig}
                level={1}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SyncTagTree;
