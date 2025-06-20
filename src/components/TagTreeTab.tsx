
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TagLibrary, User, LibraryPermission, Tag } from "@/types/permissions";
import TagTree from "@/components/TagTree";
import TagForm from "@/components/TagForm";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface TagTreeTabProps {
  library: TagLibrary;
  currentUser: User;
  userPermission?: LibraryPermission;
  onUpdate: (updatedLibrary: TagLibrary) => void;
}

const TagTreeTab = ({ 
  library, 
  currentUser, 
  userPermission, 
  onUpdate 
}: TagTreeTabProps) => {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const canEdit = userPermission?.role === "administrator" || userPermission?.role === "operator";

  const handleCreateTag = (tagData: Omit<Tag, "id">) => {
    // 确保标签数据完整
    const newTag: Tag = {
      id: crypto.randomUUID(),
      key: tagData.key.trim(),
      name: tagData.name.trim(),
      value: tagData.value.trim(),
      status: tagData.status,
      remark: tagData.remark || "",
      level: tagData.level,
      parentId: tagData.parentId
    };
    
    // 验证键的唯一性
    const existingTag = library.tags.find(tag => tag.key === newTag.key);
    if (existingTag) {
      toast({
        title: "错误",
        description: "标签键已存在，请使用不同的键",
        variant: "destructive",
      });
      return;
    }
    
    const updatedTags = [...library.tags, newTag];
    onUpdate({ ...library, tags: updatedTags });
    setIsAddingTag(false);
    setSelectedParentId(undefined);
    
    toast({
      title: "成功",
      description: "标签创建成功",
    });
  };

  const handleUpdateTag = (updatedTagData: Omit<Tag, "id">) => {
    if (!editingTag) return;
    
    const updatedTag: Tag = {
      ...editingTag,
      key: updatedTagData.key.trim(),
      name: updatedTagData.name.trim(),
      value: updatedTagData.value.trim(),
      status: updatedTagData.status,
      remark: updatedTagData.remark || "",
      level: updatedTagData.level,
      parentId: updatedTagData.parentId
    };
    
    // 验证键的唯一性（排除当前编辑的标签）
    const existingTag = library.tags.find(tag => tag.key === updatedTag.key && tag.id !== updatedTag.id);
    if (existingTag) {
      toast({
        title: "错误",
        description: "标签键已存在，请使用不同的键",
        variant: "destructive",
      });
      return;
    }
    
    const updatedTags = library.tags.map(tag =>
      tag.id === updatedTag.id ? updatedTag : tag
    );
    onUpdate({ ...library, tags: updatedTags });
    setEditingTag(null);
    
    toast({
      title: "成功",
      description: "标签更新成功",
    });
  };

  const handleDeleteTag = (tagId: string) => {
    // 递归删除子标签
    const deleteTagAndChildren = (id: string, tags: Tag[]): Tag[] => {
      const children = tags.filter(tag => tag.parentId === id);
      let filteredTags = tags.filter(tag => tag.id !== id);
      
      children.forEach(child => {
        filteredTags = deleteTagAndChildren(child.id, filteredTags);
      });
      
      return filteredTags;
    };

    const updatedTags = deleteTagAndChildren(tagId, library.tags);
    onUpdate({ ...library, tags: updatedTags });
    
    toast({
      title: "成功",
      description: "标签删除成功",
    });
  };

  const handleAddChild = (parentId: string) => {
    setSelectedParentId(parentId);
    setIsAddingTag(true);
  };

  const handleSave = (tagData: Omit<Tag, "id">) => {
    if (editingTag) {
      handleUpdateTag(tagData);
    } else {
      handleCreateTag(tagData);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            标签树状结构
            {canEdit && (
              <Button onClick={() => setIsAddingTag(true)}>
                <Plus className="w-4 h-4 mr-2" />
                添加根标签
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TagTree 
            tags={library.tags}
            canEdit={canEdit}
            onEdit={setEditingTag}
            onDelete={handleDeleteTag}
            onAddChild={handleAddChild}
          />
        </CardContent>
      </Card>

      {(isAddingTag || editingTag) && (
        <TagForm
          tag={editingTag}
          parentId={selectedParentId}
          allTags={library.tags}
          onSave={handleSave}
          onCancel={() => {
            setIsAddingTag(false);
            setEditingTag(null);
            setSelectedParentId(undefined);
          }}
        />
      )}
    </div>
  );
};

export default TagTreeTab;
