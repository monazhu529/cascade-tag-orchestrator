
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagLibrary, User, LibraryPermission, Tag, TagVersion } from "@/types/permissions";
import TagTree from "@/components/TagTree";
import TagForm from "@/components/TagForm";
import TagImportExport from "@/components/TagImportExport";
import BatchEditDialog from "@/components/BatchEditDialog";
import TagLogDialog from "@/components/TagLogDialog";
import VersionManagementDialog from "@/components/VersionManagementDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, Upload, Expand, Shrink, Edit, Search, X, GitBranch, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showVersionManagement, setShowVersionManagement] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const canEdit = userPermission?.role === "administrator" || userPermission?.role === "operator";
  const isAdmin = userPermission?.role === "administrator";

  // 获取当前显示的标签数据
  const displayTags = useMemo(() => {
    if (!library.versionManagementEnabled) {
      return library.tags;
    }
    
    if (selectedVersionId) {
      const version = library.versions?.find(v => v.id === selectedVersionId);
      return version?.tags || library.tags;
    }
    
    return library.tags;
  }, [library, selectedVersionId]);

  // 获取已发布版本
  const publishedVersion = useMemo(() => {
    if (!library.versionManagementEnabled || !library.publishedVersionId) {
      return undefined;
    }
    return library.versions?.find(v => v.id === library.publishedVersionId);
  }, [library]);

  const handleToggleVersionManagement = (enabled: boolean) => {
    onUpdate({ 
      ...library, 
      versionManagementEnabled: enabled,
      versions: enabled ? (library.versions || []) : [],
      publishedVersionId: enabled ? library.publishedVersionId : undefined,
    });
    
    toast({
      title: enabled ? "版本管理已开启" : "版本管理已关闭",
      description: enabled 
        ? "标签修改将不会直接影响订阅方，需要发布版本后才会生效" 
        : "标签修改将实时影响订阅方",
    });
  };

  const handleCreateVersion = (versionNumber: string, description: string) => {
    const newVersion: TagVersion = {
      id: crypto.randomUUID(),
      versionNumber,
      tags: JSON.parse(JSON.stringify(library.tags)), // 深拷贝当前标签数据
      createdAt: new Date(),
      createdBy: currentUser.name,
      isPublished: false,
      description,
    };

    const updatedVersions = [...(library.versions || []), newVersion];
    onUpdate({ ...library, versions: updatedVersions });
    
    toast({
      title: "版本创建成功",
      description: `版本 ${versionNumber} 已创建`,
    });
  };

  const handlePublishVersion = (versionId: string) => {
    const version = library.versions?.find(v => v.id === versionId);
    if (!version) return;

    const updatedVersions = library.versions?.map(v => 
      v.id === versionId 
        ? { ...v, isPublished: true, publishedAt: new Date(), publishedBy: currentUser.name }
        : v
    );

    onUpdate({ 
      ...library, 
      versions: updatedVersions,
      publishedVersionId: versionId,
    });
    
    toast({
      title: "版本发布成功",
      description: `版本 ${version.versionNumber} 已发布，订阅方将获取此版本的标签数据`,
    });
  };

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
    
    const mode = library.versionManagementEnabled ? "（需发布版本后生效）" : "";
    toast({
      title: "成功",
      description: `标签创建成功${mode}`,
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

  // 搜索过滤函数
  const filteredTags = searchQuery.trim() 
    ? displayTags.filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tag.remark && tag.remark.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : displayTags;

  return (
    <div className="space-y-6">
      {/* 版本管理设置 */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">版本管理设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="version-mode">启用版本管理</Label>
                  {library.versionManagementEnabled ? (
                    <Badge variant="secondary">版本模式</Badge>
                  ) : (
                    <Badge variant="outline">实时模式</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {library.versionManagementEnabled 
                    ? "标签修改需要发布版本后才会影响订阅方" 
                    : "标签修改将实时影响订阅方"}
                </p>
              </div>
              <Switch
                id="version-mode"
                checked={library.versionManagementEnabled}
                onCheckedChange={handleToggleVersionManagement}
              />
            </div>

            {library.versionManagementEnabled && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  onClick={() => setShowVersionManagement(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <GitBranch className="w-4 h-4" />
                  管理版本
                </Button>
                {publishedVersion && (
                  <div className="text-sm text-muted-foreground">
                    当前发布版本: <span className="font-medium">{publishedVersion.versionNumber}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              标签树状结构
              {library.versionManagementEnabled && selectedVersionId && (
                <Badge variant="secondary">
                  查看版本: {library.versions?.find(v => v.id === selectedVersionId)?.versionNumber}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {library.versionManagementEnabled && library.versions && library.versions.length > 0 && (
                <Select value={selectedVersionId || "current"} onValueChange={(value) => setSelectedVersionId(value === "current" ? undefined : value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择版本" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">当前版本（编辑中）</SelectItem>
                    {library.versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        {version.versionNumber}
                        {version.isPublished && " ✓"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {canEdit && (
                <>
                  <Button onClick={() => setIsAddingTag(true)} size="sm" disabled={!!selectedVersionId}>
                    <Plus className="w-4 h-4 mr-2" />
                    新增
                  </Button>
                  <Button onClick={() => setShowImportExport(true)} variant="outline" size="sm" disabled={!!selectedVersionId}>
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
                  {selectedTags.length > 0 && !selectedVersionId && (
                    <Button onClick={() => setShowBatchEdit(true)} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      批量编辑 ({selectedTags.length})
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 搜索框 */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索标签（支持名称、键、值、备注）..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                找到 {filteredTags.length} 个匹配的标签
              </p>
            )}
          </div>

          {selectedVersionId && (
            <div className="mb-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              正在查看历史版本，无法编辑。切换到"当前版本（编辑中）"以编辑标签。
            </div>
          )}

          <TagTree 
            tags={filteredTags}
            allTags={displayTags}
            canEdit={canEdit && !selectedVersionId}
            expandedAll={expandedAll}
            selectedTags={selectedTags}
            onEdit={setEditingTag}
            onDelete={handleDeleteTag}
            onAddChild={handleAddChild}
            onToggleStatus={handleToggleTagStatus}
            onShowLog={handleShowTagLog}
            onSelectTags={setSelectedTags}
            isSearching={!!searchQuery.trim()}
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

      {showVersionManagement && (
        <VersionManagementDialog
          open={showVersionManagement}
          onClose={() => setShowVersionManagement(false)}
          versions={library.versions || []}
          currentTags={library.tags}
          currentUser={currentUser.name}
          publishedVersionId={library.publishedVersionId}
          onCreateVersion={handleCreateVersion}
          onPublishVersion={handlePublishVersion}
        />
      )}
    </div>
  );
};

export default TagTreeTab;
