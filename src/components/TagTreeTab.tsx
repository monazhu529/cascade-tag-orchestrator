
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
    const newTag: Tag = {
      id: crypto.randomUUID(),
      ...tagData
    };
    
    const updatedTags = [...library.tags, newTag];
    onUpdate({ ...library, tags: updatedTags });
    setIsAddingTag(false);
    setSelectedParentId(undefined);
    
    toast({
      title: "成功",
      description: "标签创建成功",
    });
  };

  const handleUpdateTag = (updatedTag: Tag) => {
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
          onSave={editingTag ? handleUpdateTag : handleCreateTag}
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
