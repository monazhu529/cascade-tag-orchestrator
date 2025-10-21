
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag } from "@/types/permissions";
import { ChevronRight, ChevronDown, Edit, Trash2, Plus, Power, History } from "lucide-react";

interface TagTreeProps {
  tags: Tag[];
  allTags: Tag[];
  canEdit: boolean;
  expandedAll?: boolean;
  selectedTags: string[];
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
  onAddChild: (parentId: string) => void;
  onToggleStatus: (tagId: string) => void;
  onShowLog: (tag: Tag) => void;
  onSelectTags: (tagIds: string[]) => void;
  isSearching?: boolean;
}

interface TagNodeProps {
  tag: Tag;
  children: Tag[];
  allTags: Tag[];
  canEdit: boolean;
  expandedAll?: boolean;
  selectedTags: string[];
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
  onAddChild: (parentId: string) => void;
  onToggleStatus: (tagId: string) => void;
  onShowLog: (tag: Tag) => void;
  onSelectTags: (tagIds: string[]) => void;
  level: number;
}

const TagNode = ({ 
  tag, 
  children, 
  allTags,
  canEdit, 
  expandedAll,
  selectedTags,
  onEdit, 
  onDelete, 
  onAddChild,
  onToggleStatus,
  onShowLog,
  onSelectTags,
  level 
}: TagNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = children.length > 0;
  const isSelected = selectedTags.includes(tag.id);

  useEffect(() => {
    if (expandedAll !== undefined) {
      setIsExpanded(expandedAll);
    }
  }, [expandedAll]);

  const handleSelectChange = (checked: boolean) => {
    if (checked) {
      onSelectTags([...selectedTags, tag.id]);
    } else {
      onSelectTags(selectedTags.filter(id => id !== tag.id));
    }
  };

  return (
    <div className="border-l-2 border-gray-200 pl-4 ml-2">
      <div className="flex items-center gap-2 py-2 group">
        <div className="flex items-center gap-1">
          {canEdit && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelectChange}
            />
          )}
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
          </div>
          <div className="text-sm text-gray-500 truncate">
            值: {tag.value} | 级别: {tag.level}
          </div>
          {tag.remark && (
            <div className="text-xs text-gray-400 truncate">
              备注: {tag.remark}
            </div>
          )}
        </div>
        
        {canEdit && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddChild(tag.id)}
              className="p-1 w-8 h-8"
              title="添加子标签"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(tag)}
              className="p-1 w-8 h-8"
              title="编辑"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(tag.id)}
              className={`p-1 w-8 h-8 ${tag.status === "active" ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}`}
              title={tag.status === "active" ? "停用" : "启用"}
            >
              <Power className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShowLog(tag)}
              className="p-1 w-8 h-8 text-blue-600 hover:text-blue-700"
              title="查看日志"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(tag.id)}
              className="p-1 w-8 h-8 text-red-600 hover:text-red-700"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
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
                canEdit={canEdit}
                expandedAll={expandedAll}
                selectedTags={selectedTags}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onToggleStatus={onToggleStatus}
                onShowLog={onShowLog}
                onSelectTags={onSelectTags}
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const TagTree = ({ 
  tags, 
  allTags,
  canEdit, 
  expandedAll, 
  selectedTags, 
  onEdit, 
  onDelete, 
  onAddChild, 
  onToggleStatus, 
  onShowLog, 
  onSelectTags,
  isSearching = false
}: TagTreeProps) => {
  // 搜索模式：直接显示所有匹配的标签为平铺列表
  // 树模式：只显示根节点
  const displayTags = isSearching ? tags : tags.filter(tag => tag.level === 1 || !tag.parentId);

  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-gray-300 mb-4">
          📝
        </div>
        <p>暂无标签，请添加第一个标签</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayTags.map((tag) => {
        // 在搜索模式下，不显示子节点（平铺显示）
        const children = isSearching ? [] : allTags.filter(t => t.parentId === tag.id);
        return (
          <TagNode
            key={tag.id}
            tag={tag}
            children={children}
            allTags={allTags}
            canEdit={canEdit}
            expandedAll={expandedAll}
            selectedTags={selectedTags}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onToggleStatus={onToggleStatus}
            onShowLog={onShowLog}
            onSelectTags={onSelectTags}
            level={1}
          />
        );
      })}
    </div>
  );
};

export default TagTree;
