
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TagLibrary, User, LibraryPermission, Tag } from "@/types/permissions";
import TagTree from "@/components/TagTree";
import TagForm from "@/components/TagForm";
import TagImportExport from "@/components/TagImportExport";
import BatchEditDialog from "@/components/BatchEditDialog";
import TagLogDialog from "@/components/TagLogDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, Upload, Expand, Shrink, Edit } from "lucide-react";

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
  const [showImportExport, setShowImportExport] = useState(false);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [showTagLog, setShowTagLog] = useState(false);
  const [selectedTagForLog, setSelectedTagForLog] = useState<Tag | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedAll, setExpandedAll] = useState(true);
  const { toast } = useToast();

  const canEdit = userPermission?.role === "administrator" || userPermission?.role === "operator";

  const handleCreateTag = (tagData: Omit<Tag, "id">) => {
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

  const handleToggleTagStatus = (tagId: string) => {
    const updatedTags = library.tags.map(tag =>
      tag.id === tagId ? { ...tag, status: tag.status === "active" ? "inactive" : "active" as "active" | "inactive" } : tag
    );
    onUpdate({ ...library, tags: updatedTags });
    
    toast({
      title: "成功",
      description: "标签状态更新成功",
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

  const handleImportTags = (importedTags: Tag[]) => {
    const updatedTags = [...library.tags, ...importedTags];
    onUpdate({ ...library, tags: updatedTags });
    
    toast({
      title: "成功",
      description: `成功导入 ${importedTags.length} 个标签`,
    });
  };

  const handleBatchUpdate = (field: "remark" | "status" | "value", value: string) => {
    const updatedTags = library.tags.map(tag => {
      if (selectedTags.includes(tag.id)) {
        if (field === "status") {
          return { ...tag, status: value as "active" | "inactive" };
        }
        return { ...tag, [field]: value };
      }
      return tag;
    });
    
    onUpdate({ ...library, tags: updatedTags });
    setSelectedTags([]);
    setShowBatchEdit(false);
    
    toast({
      title: "成功",
      description: `成功批量更新 ${selectedTags.length} 个标签`,
    });
  };

  const handleShowTagLog = (tag: Tag) => {
    setSelectedTagForLog(tag);
    setShowTagLog(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            标签树状结构
            {canEdit && (
              <div className="flex gap-2">
                <Button onClick={() => setIsAddingTag(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  新增
                </Button>
                <Button onClick={() => setShowImportExport(true)} variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  导入
                </Button>
                <Button onClick={() => setShowImportExport(true)} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
                <Button 
                  onClick={() => setExpandedAll(!expandedAll)} 
                  variant="outline" 
                  size="sm"
                >
                  {expandedAll ? (
                    <>
                      <Shrink className="w-4 h-4 mr-2" />
                      全部折叠
                    </>
                  ) : (
                    <>
                      <Expand className="w-4 h-4 mr-2" />
                      全部展开
                    </>
                  )}
                </Button>
                {selectedTags.length > 0 && (
                  <Button onClick={() => setShowBatchEdit(true)} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    批量编辑 ({selectedTags.length})
                  </Button>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TagTree 
            tags={library.tags}
            canEdit={canEdit}
            expandedAll={expandedAll}
            selectedTags={selectedTags}
            onEdit={setEditingTag}
            onDelete={handleDeleteTag}
            onAddChild={handleAddChild}
            onToggleStatus={handleToggleTagStatus}
            onShowLog={handleShowTagLog}
            onSelectTags={setSelectedTags}
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

      {showImportExport && (
        <TagImportExport
          tags={library.tags}
          onImport={handleImportTags}
          onClose={() => setShowImportExport(false)}
        />
      )}

      {showBatchEdit && (
        <BatchEditDialog
          selectedCount={selectedTags.length}
          onUpdate={handleBatchUpdate}
          onClose={() => setShowBatchEdit(false)}
        />
      )}

      {showTagLog && selectedTagForLog && (
        <TagLogDialog
          tag={selectedTagForLog}
          onClose={() => {
            setShowTagLog(false);
            setSelectedTagForLog(null);
          }}
        />
      )}
    </div>
  );
};

export default TagTreeTab;
