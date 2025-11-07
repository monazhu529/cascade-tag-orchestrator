import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagVersion, Tag } from "@/types/permissions";
import { ArrowLeft, CheckCircle2, Plus, Rocket } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import TagTree from "@/components/TagTree";
import TagForm from "@/components/TagForm";
import TagLogDialog from "@/components/TagLogDialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VersionEditProps {
  version: TagVersion;
  libraryId: string;
  libraryName: string;
  canEdit: boolean;
}

const VersionEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    version,
    libraryId,
    libraryName,
    canEdit = false,
  } = (location.state || {}) as VersionEditProps;

  const [tags, setTags] = useState(version?.tags || []);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [parentIdForNew, setParentIdForNew] = useState<string | undefined>();
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [selectedTagForLog, setSelectedTagForLog] = useState<Tag | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublished, setIsPublished] = useState(version?.isPublished || false);
  const { toast } = useToast();

  const handleBack = () => {
    navigate(`/tag-library/${libraryId}/versions`, {
      state: location.state,
    });
  };

  const handleAddTag = () => {
    if (isPublished) {
      toast({
        title: "无法编辑",
        description: "已发布的版本无法编辑标签",
        variant: "destructive",
      });
      return;
    }
    setEditingTag(null);
    setParentIdForNew(undefined);
    setShowTagForm(true);
  };

  const handleEditTag = (tag: Tag) => {
    if (isPublished) {
      toast({
        title: "无法编辑",
        description: "已发布的版本无法编辑标签",
        variant: "destructive",
      });
      return;
    }
    setEditingTag(tag);
    setParentIdForNew(undefined);
    setShowTagForm(true);
  };

  const handleAddChild = (parentId: string) => {
    if (isPublished) {
      toast({
        title: "无法编辑",
        description: "已发布的版本无法编辑标签",
        variant: "destructive",
      });
      return;
    }
    const parentTag = tags.find(t => t.id === parentId);
    if (parentTag) {
      setEditingTag(null);
      setParentIdForNew(parentId);
      setShowTagForm(true);
    }
  };

  const handleDeleteTag = (tagId: string) => {
    if (isPublished) {
      toast({
        title: "无法编辑",
        description: "已发布的版本无法编辑标签",
        variant: "destructive",
      });
      return;
    }
    
    const hasChildren = tags.some(t => t.parentId === tagId);
    if (hasChildren) {
      toast({
        title: "无法删除",
        description: "该标签有子标签，请先删除子标签",
        variant: "destructive",
      });
      return;
    }
    
    setTags(tags.filter(t => t.id !== tagId));
    toast({
      title: "删除成功",
      description: "标签已删除",
    });
  };

  const handleToggleStatus = (tagId: string) => {
    if (isPublished) {
      toast({
        title: "无法编辑",
        description: "已发布的版本无法编辑标签",
        variant: "destructive",
      });
      return;
    }
    
    setTags(tags.map(t => 
      t.id === tagId 
        ? { ...t, status: t.status === "active" ? "inactive" : "active" as "active" | "inactive" }
        : t
    ));
    toast({
      title: "状态已更新",
      description: "标签状态已切换",
    });
  };

  const handleShowLog = (tag: Tag) => {
    setSelectedTagForLog(tag);
    setShowLogDialog(true);
  };

  const handleSaveTag = (tagData: Partial<Tag>) => {
    if (editingTag) {
      // 编辑现有标签
      setTags(tags.map(t => 
        t.id === editingTag.id 
          ? { ...t, ...tagData }
          : t
      ));
      toast({
        title: "保存成功",
        description: "标签已更新",
      });
    } else {
      // 添加新标签
      const parentTag = parentIdForNew ? tags.find(t => t.id === parentIdForNew) : null;
      const newLevel = parentTag ? parentTag.level + 1 : 1;
      
      const newTag: Tag = {
        id: `tag_${Date.now()}`,
        key: tagData.key || "",
        name: tagData.name || "",
        value: tagData.value || "",
        status: tagData.status || "active",
        remark: tagData.remark || "",
        level: newLevel,
        parentId: parentIdForNew,
      };
      
      setTags([...tags, newTag]);
      toast({
        title: "添加成功",
        description: "新标签已添加",
      });
    }
    setShowTagForm(false);
    setEditingTag(null);
    setParentIdForNew(undefined);
  };

  const handlePublish = () => {
    setShowPublishDialog(true);
  };

  const confirmPublish = () => {
    setIsPublished(true);
    setShowPublishDialog(false);
    toast({
      title: "发布成功",
      description: `版本 ${version.versionNumber} 已成功发布`,
    });
  };

  if (!version) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">版本信息不存在</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回版本列表
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{version.versionNumber}</h1>
              {isPublished && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  已发布
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{libraryName}</p>
          </div>
          {canEdit && !isPublished && (
            <Button onClick={handlePublish} className="gap-2">
              <Rocket className="w-4 h-4" />
              发布版本
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>版本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {version.description && (
              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                <p className="text-sm">{version.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">创建时间：</span>
                <div className="font-medium">
                  {format(new Date(version.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">创建者：</span>
                <div className="font-medium">{version.createdBy}</div>
              </div>
              {isPublished && version.publishedAt && (
                <>
                  <div>
                    <span className="text-muted-foreground">发布时间：</span>
                    <div className="font-medium">
                      {format(new Date(version.publishedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                    </div>
                  </div>
                  {version.publishedBy && (
                    <div>
                      <span className="text-muted-foreground">发布者：</span>
                      <div className="font-medium">{version.publishedBy}</div>
                    </div>
                  )}
                </>
              )}
              <div>
                <span className="text-muted-foreground">标签数量：</span>
                <div className="font-medium">{version.tags.length} 个</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>标签结构</CardTitle>
              {canEdit && !isPublished && (
                <Button onClick={handleAddTag} size="sm" className="gap-1">
                  <Plus className="w-4 h-4" />
                  添加标签
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <TagTree 
              tags={tags}
              allTags={tags}
              selectedTags={selectedTags}
              onEdit={handleEditTag}
              onDelete={handleDeleteTag}
              onAddChild={handleAddChild}
              onToggleStatus={handleToggleStatus}
              onShowLog={handleShowLog}
              onSelectTags={setSelectedTags}
              canEdit={canEdit && !isPublished}
            />
          </CardContent>
        </Card>
      </div>

      {showTagForm && (
        <TagForm
          tag={editingTag || undefined}
          parentId={parentIdForNew}
          allTags={tags}
          onSave={handleSaveTag}
          onCancel={() => {
            setShowTagForm(false);
            setEditingTag(null);
            setParentIdForNew(undefined);
          }}
        />
      )}

      {showLogDialog && selectedTagForLog && (
        <TagLogDialog
          tag={selectedTagForLog}
          onClose={() => {
            setShowLogDialog(false);
            setSelectedTagForLog(null);
          }}
        />
      )}

      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认发布版本</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要发布版本 {version.versionNumber} 吗？发布后将无法再编辑该版本的标签。
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">版本号：</span>
                    <span className="font-medium">{version.versionNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">标签数量：</span>
                    <span className="font-medium">{tags.length} 个</span>
                  </div>
                  {version.description && (
                    <div>
                      <span className="text-muted-foreground">描述：</span>
                      <p className="mt-1 text-sm">{version.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPublish}>确认发布</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VersionEdit;
