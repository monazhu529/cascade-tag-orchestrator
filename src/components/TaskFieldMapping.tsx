
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskLibrary } from "@/pages/Index";
import { TagLibrary, Tag } from "@/types/permissions";
import { ArrowRight, Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskFieldMappingProps {
  taskLibrary: TaskLibrary;
  connectedTagLibrary: TagLibrary;
}

interface FieldMapping {
  id: string;
  tagId: string;
  tagName: string;
  tagLevel: number;
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
  onSelectTag: (tagId: string, selected: boolean) => void;
  onCreateMapping: (tagId: string, tagName: string, level: number) => void;
  level: number;
}

const TagNode = ({ 
  tag, 
  children, 
  allTags, 
  selectedTags, 
  onSelectTag, 
  onCreateMapping,
  level 
}: TagNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(level <= 2);
  const hasChildren = children.length > 0;
  const isSelected = selectedTags.includes(tag.id);

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
          </div>
          <div className="text-sm text-gray-500 truncate">
            值: {tag.value}
          </div>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCreateMapping(tag.id, tag.name, tag.level)}
            className="p-1 w-8 h-8"
            title="创建字段映射"
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
                onSelectTag={onSelectTag}
                onCreateMapping={onCreateMapping}
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const TaskFieldMapping = ({ taskLibrary, connectedTagLibrary }: TaskFieldMappingProps) => {
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([
    {
      id: '1',
      tagId: '1010001',
      tagName: '电子产品',
      tagLevel: 1,
      sourceField: 'name',
      targetField: 'category',
      mappingRule: 'electronics',
      isActive: true
    }
  ]);
  
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreatingMapping, setIsCreatingMapping] = useState(false);
  const [currentTag, setCurrentTag] = useState<{id: string, name: string, level: number} | null>(null);
  const [newMapping, setNewMapping] = useState({
    sourceField: 'name' as 'key' | 'name' | 'value' | 'status' | 'remark' | 'level',
    targetField: '',
    mappingRule: ''
  });

  const { toast } = useToast();

  const tags = connectedTagLibrary.tags || [];
  const rootTags = tags.filter(tag => tag.level === 1 || !tag.parentId);

  const sourceFieldOptions = [
    { value: 'key', label: '标签键 (Key)' },
    { value: 'name', label: '标签名 (Name)' },
    { value: 'value', label: '标签值 (Value)' },
    { value: 'status', label: '状态 (Status)' },
    { value: 'remark', label: '备注 (Remark)' },
    { value: 'level', label: '级别 (Level)' }
  ];

  const handleSelectTag = (tagId: string, selected: boolean) => {
    if (selected) {
      setSelectedTags([...selectedTags, tagId]);
    } else {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    }
  };

  const handleCreateMapping = (tagId: string, tagName: string, level: number) => {
    setCurrentTag({ id: tagId, name: tagName, level });
    setIsCreatingMapping(true);
  };

  const handleSaveMapping = () => {
    if (!currentTag || !newMapping.targetField || !newMapping.mappingRule) {
      toast({
        title: "错误",
        description: "请填写完整的映射信息",
        variant: "destructive",
      });
      return;
    }

    const mapping: FieldMapping = {
      id: crypto.randomUUID(),
      tagId: currentTag.id,
      tagName: currentTag.name,
      tagLevel: currentTag.level,
      sourceField: newMapping.sourceField,
      targetField: newMapping.targetField,
      mappingRule: newMapping.mappingRule,
      isActive: true
    };

    setFieldMappings([...fieldMappings, mapping]);
    setIsCreatingMapping(false);
    setCurrentTag(null);
    setNewMapping({
      sourceField: 'name',
      targetField: '',
      mappingRule: ''
    });
    
    toast({
      title: "成功",
      description: "字段映射创建成功",
    });
  };

  const toggleMapping = (id: string) => {
    setFieldMappings(prev => prev.map(mapping => 
      mapping.id === id 
        ? { ...mapping, isActive: !mapping.isActive }
        : mapping
    ));
  };

  const deleteMapping = (id: string) => {
    setFieldMappings(prev => prev.filter(mapping => mapping.id !== id));
    toast({
      title: "成功",
      description: "字段映射删除成功",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：标签选择 */}
        <Card>
          <CardHeader>
            <CardTitle>标签库结构</CardTitle>
            <div className="text-sm text-gray-500">
              选择要映射的标签，支持多级标签结构
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
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
                        onSelectTag={handleSelectTag}
                        onCreateMapping={handleCreateMapping}
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
            </div>
          </CardContent>
        </Card>

        {/* 右侧：字段映射配置 */}
        <Card>
          <CardHeader>
            <CardTitle>字段映射配置</CardTitle>
            <div className="text-sm text-gray-500">
              配置标签字段到任务字段的映射关系
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {fieldMappings.map((mapping) => (
                <div key={mapping.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        L{mapping.tagLevel}
                      </Badge>
                      <span className="font-medium">{mapping.tagName}</span>
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
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{sourceFieldOptions.find(o => o.value === mapping.sourceField)?.label}</span>
                    <ArrowRight className="w-4 h-4" />
                    <span>{mapping.targetField}</span>
                    <ArrowRight className="w-4 h-4" />
                    <span>{mapping.mappingRule}</span>
                  </div>
                </div>
              ))}

              {fieldMappings.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>还没有配置字段映射<br />点击左侧标签的"+"按钮开始配置</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 创建映射对话框 */}
      {isCreatingMapping && currentTag && (
        <Card>
          <CardHeader>
            <CardTitle>创建字段映射</CardTitle>
            <div className="text-sm text-gray-500">
              为标签 "{currentTag.name}" (L{currentTag.level}) 创建字段映射
            </div>
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
                placeholder="输入目标字段名，如：category, priority 等"
              />
            </div>

            <div>
              <Label>映射规则</Label>
              <Input
                value={newMapping.mappingRule}
                onChange={(e) => setNewMapping({...newMapping, mappingRule: e.target.value})}
                placeholder="输入映射规则，如：electronics, high_priority 等"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveMapping}>
                创建映射
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreatingMapping(false);
                  setCurrentTag(null);
                }}
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

export default TaskFieldMapping;
