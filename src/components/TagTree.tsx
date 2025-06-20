
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/types/permissions";
import { ChevronRight, ChevronDown, Edit, Trash2, Plus } from "lucide-react";

interface TagTreeProps {
  tags: Tag[];
  canEdit: boolean;
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
  onAddChild: (parentId: string) => void;
}

interface TagNodeProps {
  tag: Tag;
  children: Tag[];
  canEdit: boolean;
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
  onAddChild: (parentId: string) => void;
  level: number;
}

const TagNode = ({ 
  tag, 
  children, 
  canEdit, 
  onEdit, 
  onDelete, 
  onAddChild, 
  level 
}: TagNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = children.length > 0;

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
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(tag)}
              className="p-1 w-8 h-8"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(tag.id)}
              className="p-1 w-8 h-8 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {children.map((child) => {
            const grandChildren = tags.filter(t => t.parentId === child.id);
            return (
              <TagNode
                key={child.id}
                tag={child}
                children={grandChildren}
                canEdit={canEdit}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const TagTree = ({ tags, canEdit, onEdit, onDelete, onAddChild }: TagTreeProps) => {
  // Get root tags (level 1 or no parent)
  const rootTags = tags.filter(tag => tag.level === 1 || !tag.parentId);

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
      {rootTags.map((rootTag) => {
        const children = tags.filter(tag => tag.parentId === rootTag.id);
        return (
          <TagNode
            key={rootTag.id}
            tag={rootTag}
            children={children}
            canEdit={canEdit}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            level={1}
          />
        );
      })}
    </div>
  );
};

export default TagTree;
