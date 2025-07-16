
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag } from "@/types/permissions";
import { ArrowRight, Plus, Edit, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TagFieldMappingProps {
  tags: Tag[];
  mappings: FieldMapping[];
  onUpdateMappings: (mappings: FieldMapping[]) => void;
}

export interface FieldMapping {
  id: string;
  tagId: string;
  sourceField: 'key' | 'name' | 'value' | 'status' | 'remark' | 'level';
  targetField: string;
  mappingRule: string;
  isActive: boolean;
}

interface TagNodeProps {
  tag: Tag;
  children: Tag[];
  allTags: Tag[];
  selectedTags: string[];
  mappings: FieldMapping[];
  onSelectTag: (tagId: string, selected: boolean) => void;
  onAddMapping: (tagId: string) => void;
  level: number;
}

const TagNode = ({ 
  tag, 
  children, 
  allTags, 
  selectedTags, 
  mappings,
  onSelectTag, 
  onAddMapping,
  level 
}: TagNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = children.length > 0;
  const isSelected = selectedTags.includes(tag.id);
  const tagMappings = mappings.filter(m => m.tagId === tag.id);

  return (
    <div className="border-l-2 border-gray-200 pl-4 ml-2">
      <div className="flex items-center gap-2 py-2 group">
        <div className="flex items-center gap-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectTag(tag.id, checked as boolean)}
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
            {tagMappings.length > 0 && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                {tagMappings.length} 个映射
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-500 truncate">
            值: {tag.value} | 级别: {tag.level}
          </div>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddMapping(tag.id)}
            className="p-1 w-8 h-8"
            title="添加字段映射"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
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
                selectedTags={selectedTags}
                mappings={mappings}
                onSelectTag={onSelectTag}
                onAddMapping={onAddMapping}
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const TagFieldMapping = ({ tags, mappings, onUpdateMappings }: TagFieldMappingProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAddingMapping, setIsAddingMapping] = useState(false);
  const [selectedTagForMapping, setSelectedTagForMapping] = useState<string>("");
  const [newMapping, setNewMapping] = useState({
    sourceField: 'name' as 'key' | 'name' | 'value' | 'status' | 'remark' | 'level',
    targetField: '',
    mappingRule: ''
  });
  const { toast } = useToast();

  const rootTags = tags.filter(tag => tag.level === 1 || !tag.parentId);

  const handleSelectTag = (tagId: string, selected: boolean) => {
    if (selected) {
      setSelectedTags([...selectedTags, tagId]);
    } else {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    }
  };

  const handleAddMapping = (tagId: string) => {
    setSelectedTagForMapping(tagId);
    setIsAddingMapping(true);
  };

  const handleSaveMapping = () => {
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
      tagId: selectedTagForMapping,
      sourceField: newMapping.sourceField,
      targetField: newMapping.targetField,
      mappingRule: newMapping.mappingRule,
      isActive: true
    };

    onUpdateMappings([...mappings, mapping]);
    setIsAddingMapping(false);
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

  const toggleMapping = (id: string) => {
    const updatedMappings = mappings.map(mapping => 
      mapping.id === id 
        ? { ...mapping, isActive: !mapping.isActive }
        : mapping
    );
    onUpdateMappings(updatedMappings);
  };

  const deleteMapping = (id: string) => {
    onUpdateMappings(mappings.filter(mapping => mapping.id !== id));
    toast({
      title: "成功",
      description: "字段映射删除成功",
    });
  };

  const sourceFieldOptions = [
    { value: 'key', label: '标签键 (Key)' },
    { value: 'name', label: '标签名 (Name)' },
    { value: 'value', label: '标签值 (Value)' },
    { value: 'status', label: '状态 (Status)' },
    { value: 'remark', label: '备注 (Remark)' },
    { value: 'level', label: '级别 (Level)' }
  ];

  return (
    <div className="space-y-6">
      {/* 标签树选择 */}
      <Card>
        <CardHeader>
          <CardTitle>标签选择</CardTitle>
        </CardHeader>
        <CardContent>
          {rootTags.length > 0 ? (
            <div className="space-y-2">
              {rootTags.map((rootTag) => {
                const children = tags.filter(tag => tag.parentId === rootTag.id);
                return (
                  <TagNode
                    key={rootTag.id}
                    tag={rootTag}
                    children={children}
                    allTags={tags}
                    selectedTags={selectedTags}
                    mappings={mappings}
                    onSelectTag={handleSelectTag}
                    onAddMapping={handleAddMapping}
                    level={1}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>暂无标签可供选择</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 字段映射列表 */}
      <Card>
        <CardHeader>
          <CardTitle>字段映射配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mappings.map((mapping) => {
              const tag = tags.find(t => t.id === mapping.tagId);
              const sourceFieldLabel = sourceFieldOptions.find(o => o.value === mapping.sourceField)?.label;
              
              return (
                <Card key={mapping.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {tag?.name || '未知标签'}
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <div className="text-sm">
                            <span className="text-gray-600">源字段:</span>
                            <span className="ml-1 font-medium">{sourceFieldLabel}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <div className="text-sm">
                            <span className="text-gray-600">目标:</span>
                            <span className="ml-1 font-medium">{mapping.targetField}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <div className="text-sm">
                            <span className="text-gray-600">规则:</span>
                            <span className="ml-1 font-medium">{mapping.mappingRule}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={mapping.isActive}
                          onCheckedChange={() => toggleMapping(mapping.id)}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteMapping(mapping.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {mappings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>还没有配置字段映射<br />请选择标签并添加字段映射</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 添加映射对话框 */}
      {isAddingMapping && (
        <Card>
          <CardHeader>
            <CardTitle>添加字段映射</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>源字段</Label>
              <Select 
                value={newMapping.sourceField} 
                onValueChange={(value) => setNewMapping({...newMapping, sourceField: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sourceFieldOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>目标字段</Label>
              <Input
                value={newMapping.targetField}
                onChange={(e) => setNewMapping({...newMapping, targetField: e.target.value})}
                placeholder="输入目标字段名"
              />
            </div>

            <div>
              <Label>映射规则</Label>
              <Input
                value={newMapping.mappingRule}
                onChange={(e) => setNewMapping({...newMapping, mappingRule: e.target.value})}
                placeholder="输入映射规则"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveMapping}>
                保存映射
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddingMapping(false)}
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TagFieldMapping;
