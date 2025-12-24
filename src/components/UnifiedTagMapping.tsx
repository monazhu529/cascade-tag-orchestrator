
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "@/types/permissions";
import { ChevronRight, ChevronDown, Settings, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UnifiedTagMappingProps {
  tags: Tag[];
  syncConfig: any;
  onUpdateSyncConfig: (config: any) => void;
  disabled?: boolean;
}

interface FieldMapping {
  id: string;
  sourceField: 'name' | 'value' | 'remark';
  targetField: string;
  mappingRule: string;
}

interface TagMappingSettings {
  enabled: boolean;
  selected: boolean;
  fieldMappings: FieldMapping[];
}

interface TagNodeProps {
  tag: Tag;
  children: Tag[];
  allTags: Tag[];
  settings: { [tagId: string]: TagMappingSettings };
  onUpdateSettings: (tagId: string, settings: TagMappingSettings) => void;
  level: number;
  disabled?: boolean;
}

const TagNode = ({ 
  tag, 
  children, 
  allTags, 
  settings,
  onUpdateSettings,
  level,
  disabled = false
}: TagNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(level <= 2);
  const [showMappings, setShowMappings] = useState(false);
  const [newMapping, setNewMapping] = useState({
    sourceField: 'name' as 'name' | 'value' | 'remark',
    targetField: '',
    mappingRule: ''
  });
  
  const hasChildren = children.length > 0;
  const tagSettings = settings[tag.id] || {
    enabled: false,
    selected: false,
    fieldMappings: []
  };

  const { toast } = useToast();

  const sourceFieldLabels = {
    name: '标题',
    value: '值',
    remark: '备注'
  };

  const handleSyncToggle = (enabled: boolean) => {
    onUpdateSettings(tag.id, {
      ...tagSettings,
      enabled
    });
  };

  const handleSelectionToggle = (selected: boolean) => {
    onUpdateSettings(tag.id, {
      ...tagSettings,
      selected
    });
  };

  const handleAddMapping = () => {
    if (!newMapping.targetField || !newMapping.mappingRule) {
      toast({
        title: "错误",
        description: "请填写目标字段和映射规则",
        variant: "destructive",
      });
      return;
    }

    const mapping: FieldMapping = {
      id: crypto.randomUUID(),
      sourceField: newMapping.sourceField,
      targetField: newMapping.targetField,
      mappingRule: newMapping.mappingRule
    };

    onUpdateSettings(tag.id, {
      ...tagSettings,
      fieldMappings: [...tagSettings.fieldMappings, mapping]
    });

    setNewMapping({
      sourceField: 'name',
      targetField: '',
      mappingRule: ''
    });

    toast({
      title: "成功",
      description: "字段映射添加成功",
    });
  };

  const handleDeleteMapping = (mappingId: string) => {
    onUpdateSettings(tag.id, {
      ...tagSettings,
      fieldMappings: tagSettings.fieldMappings.filter(m => m.id !== mappingId)
    });

    toast({
      title: "成功",
      description: "字段映射删除成功",
    });
  };

  return (
    <div className={`border-l-2 border-gray-200 pl-4 ml-2 ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3 py-2 group">
        <div className="flex items-center gap-1">
          <Checkbox
            checked={tagSettings.selected}
            onCheckedChange={handleSelectionToggle}
            disabled={disabled}
          />
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
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{tag.name}</span>
            <Badge variant="outline" className="text-xs">
              {tag.key}
            </Badge>
            <Badge 
              variant={tag.status === "active" ? "default" : "secondary"}
              className="text-xs"
            >
              {tag.status === "active" ? "激活" : "未激活"}
            </Badge>
            {tagSettings.fieldMappings.length > 0 && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                {tagSettings.fieldMappings.length} 个映射
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-500 truncate">
            值: {tag.value} | 级别: {tag.level}
            {tag.remark && ` | 备注: ${tag.remark}`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">同步</div>
          <Switch
            checked={tagSettings.enabled}
            onCheckedChange={handleSyncToggle}
            disabled={disabled}
          />
          {tagSettings.selected && !disabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMappings(!showMappings)}
              className="p-1 w-8 h-8"
              title="字段映射"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {tagSettings.selected && showMappings && !disabled && (
        <div className="ml-8 mb-3 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <p className="text-sm font-medium">字段映射配置：</p>
            
            {/* 现有映射列表 */}
            {tagSettings.fieldMappings.map((mapping) => (
              <div key={mapping.id} className="flex items-center gap-2 p-2 bg-white rounded border">
                <Badge variant="outline" className="text-xs">
                  {sourceFieldLabels[mapping.sourceField]}
                </Badge>
                <span className="text-sm">→</span>
                <span className="text-sm font-medium">{mapping.targetField}</span>
                <span className="text-sm text-gray-500">({mapping.mappingRule})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMapping(mapping.id)}
                  className="p-1 w-6 h-6 ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}

            {/* 添加新映射 */}
            <div className="grid grid-cols-3 gap-2 p-2 border-2 border-dashed border-gray-300 rounded">
              <Select 
                value={newMapping.sourceField} 
                onValueChange={(value: 'name' | 'value' | 'remark') => 
                  setNewMapping({...newMapping, sourceField: value})
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sourceFieldLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="目标字段"
                value={newMapping.targetField}
                onChange={(e) => setNewMapping({...newMapping, targetField: e.target.value})}
                className="h-8"
              />

              <div className="flex gap-1">
                <Input
                  placeholder="映射规则"
                  value={newMapping.mappingRule}
                  onChange={(e) => setNewMapping({...newMapping, mappingRule: e.target.value})}
                  className="h-8 flex-1"
                />
                <Button 
                  onClick={handleAddMapping}
                  size="sm"
                  className="h-8 px-2"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
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
                settings={settings}
                onUpdateSettings={onUpdateSettings}
                level={level + 1}
                disabled={disabled}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const UnifiedTagMapping = ({ tags, syncConfig, onUpdateSyncConfig, disabled = false }: UnifiedTagMappingProps) => {
  const [tagSettings, setTagSettings] = useState<{ [tagId: string]: TagMappingSettings }>({});
  
  const rootTags = tags.filter(tag => tag.level === 1 || !tag.parentId);

  const handleUpdateSettings = (tagId: string, settings: TagMappingSettings) => {
    const newTagSettings = {
      ...tagSettings,
      [tagId]: settings
    };
    setTagSettings(newTagSettings);

    // 同时更新syncConfig以保持兼容性
    const newSyncConfig = {
      ...syncConfig,
      tagSyncSettings: {
        ...syncConfig.tagSyncSettings,
        [tagId]: {
          enabled: settings.enabled,
          fields: {
            key: settings.enabled,
            name: settings.fieldMappings.some(m => m.sourceField === 'name'),
            value: settings.fieldMappings.some(m => m.sourceField === 'value'),
            status: settings.enabled,
            remark: settings.fieldMappings.some(m => m.sourceField === 'remark'),
            level: false
          }
        }
      }
    };
    onUpdateSyncConfig(newSyncConfig);
  };

  const toggleAllSelection = (selected: boolean) => {
    const newSettings: { [tagId: string]: TagMappingSettings } = {};
    tags.forEach(tag => {
      newSettings[tag.id] = {
        enabled: selected,
        selected: selected,
        fieldMappings: selected ? [
          {
            id: crypto.randomUUID(),
            sourceField: 'name',
            targetField: 'category',
            mappingRule: tag.key
          }
        ] : []
      };
    });
    setTagSettings(newSettings);
  };

  const selectedTagsCount = Object.values(tagSettings).filter(s => s.selected).length;
  const enabledTagsCount = Object.values(tagSettings).filter(s => s.enabled).length;
  const totalMappingsCount = Object.values(tagSettings).reduce((total, s) => total + s.fieldMappings.length, 0);

  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>暂无标签可供配置</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 统计和整体操作 */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div>
          <h4 className="font-medium">标签映射与同步控制</h4>
          <p className="text-sm text-gray-600">
            已选择 {selectedTagsCount} 个标签，启用同步 {enabledTagsCount} 个，配置映射 {totalMappingsCount} 个
          </p>
        </div>
        {!disabled && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toggleAllSelection(true)}
            >
              全部选择
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toggleAllSelection(false)}
            >
              全部取消
            </Button>
          </div>
        )}
      </div>

      {/* 标签树状结构 */}
      <Card>
        <CardHeader>
          <CardTitle>标签树状结构</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {rootTags.map((rootTag) => {
              const children = tags.filter(tag => tag.parentId === rootTag.id);
              return (
                <TagNode
                  key={rootTag.id}
                  tag={rootTag}
                  children={children}
                  allTags={tags}
                  settings={tagSettings}
                  onUpdateSettings={handleUpdateSettings}
                  level={1}
                  disabled={disabled}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedTagMapping;
