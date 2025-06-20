import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Tag as TagIcon, Save, X, Eye, EyeOff } from "lucide-react";
import { TagLibrary, Tag } from "@/pages/Index";
import { User, LibraryPermission } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";

interface TagManagerProps {
  library: TagLibrary;
  currentUser: User;
  userPermission?: LibraryPermission;
  onUpdate: (library: TagLibrary) => void;
  onClose: () => void;
}

const TagManager = ({ library, currentUser, userPermission, onUpdate, onClose }: TagManagerProps) => {
  const [tags, setTags] = useState<Tag[]>(library.tags);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTag, setNewTag] = useState({
    key: "",
    name: "",
    value: "",
    remark: "",
    level: 1,
    parentId: "",
    status: "active" as "active" | "inactive"
  });
  const { toast } = useToast();

  // 权限检查
  const canManageContent = userPermission?.role === "administrator" || userPermission?.role === "operator";
  const canManageUsers = userPermission?.role === "administrator";

  // Helper functions to generate IDs and manage tags
  const generateNextTagId = (): string => {
    const existingIds = tags.map(tag => {
      const match = tag.id.match(/^\d{3}(\d{4})$/);
      return match ? parseInt(match[1]) : 0;
    }).filter(id => id > 0);
    
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const nextId = (maxId + 1).toString().padStart(4, '0');
    return `${library.libraryId}${nextId}`;
  };

  const createTag = () => {
    if (!canManageContent) {
      toast({
        title: "权限不足",
        description: "您没有权限管理此标签库的内容",
        variant: "destructive",
      });
      return;
    }

    if (!newTag.key.trim() || !newTag.name.trim() || !newTag.value.trim()) {
      toast({
        title: "错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }

    // 检查 key 是否重复
    if (tags.some(tag => tag.key === newTag.key.trim())) {
      toast({
        title: "错误",
        description: "标签键已存在",
        variant: "destructive",
      });
      return;
    }

    const tag: Tag = {
      id: generateNextTagId(),
      key: newTag.key.trim(),
      name: newTag.name.trim(),
      value: newTag.value.trim(),
      remark: newTag.remark.trim(),
      level: newTag.level,
      parentId: newTag.parentId || undefined,
      status: newTag.status,
    };

    const updatedTags = [...tags, tag];
    setTags(updatedTags);
    
    const updatedLibrary = { ...library, tags: updatedTags };
    onUpdate(updatedLibrary);
    
    setNewTag({
      key: "",
      name: "",
      value: "",
      remark: "",
      level: 1,
      parentId: "",
      status: "active"
    });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "成功",
      description: `标签创建成功，ID: ${tag.id}`,
    });
  };

  const updateTag = (updatedTag: Tag) => {
    if (!canManageContent) {
      toast({
        title: "权限不足",
        description: "您没有权限管理此标签库的内容",
        variant: "destructive",
      });
      return;
    }

    const updatedTags = tags.map(tag => tag.id === updatedTag.id ? updatedTag : tag);
    setTags(updatedTags);
    
    const updatedLibrary = { ...library, tags: updatedTags };
    onUpdate(updatedLibrary);
    setEditingTag(null);
    
    toast({
      title: "成功",
      description: "标签更新成功",
    });
  };

  const deleteTag = (id: string) => {
    if (!canManageContent) {
      toast({
        title: "权限不足",
        description: "您没有权限管理此标签库的内容",
        variant: "destructive",
      });
      return;
    }

    // 检查是否有子标签
    const hasChildren = tags.some(tag => tag.parentId === id);
    if (hasChildren) {
      toast({
        title: "错误",
        description: "请先删除所有子标签",
        variant: "destructive",
      });
      return;
    }

    const updatedTags = tags.filter(tag => tag.id !== id);
    setTags(updatedTags);
    
    const updatedLibrary = { ...library, tags: updatedTags };
    onUpdate(updatedLibrary);
    
    toast({
      title: "成功",
      description: "标签删除成功",
    });
  };

  const toggleTagStatus = (id: string) => {
    if (!canManageContent) {
      toast({
        title: "权限不足",
        description: "您没有权限管理此标签库的内容",
        variant: "destructive",
      });
      return;
    }

    const updatedTags = tags.map(tag => 
      tag.id === id 
        ? { ...tag, status: tag.status === "active" ? "inactive" as const : "active" as const }
        : tag
    );
    setTags(updatedTags);
    
    const updatedLibrary = { ...library, tags: updatedTags };
    onUpdate(updatedLibrary);
  };

  const getLevel1Tags = () => tags.filter(tag => tag.level === 1);
  const getLevel2Tags = (parentId: string) => tags.filter(tag => tag.level === 2 && tag.parentId === parentId);

  if (!userPermission) {
    return (
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full max-w-4xl">
          <SheetHeader>
            <SheetTitle>权限不足</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 mb-4">您没有权限访问此标签库</p>
            <Button onClick={onClose}>关闭</Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-4xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <TagIcon className="w-5 h-5" />
            {library.name} - 标签管理
            <Badge variant={userPermission.role === "administrator" ? "default" : "secondary"}>
              {userPermission.role === "administrator" ? "管理员" : "运营"}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">标签列表</h3>
              <p className="text-sm text-gray-600">
                共 {tags.length} 个标签 | 一级标签: {getLevel1Tags().length} | 二级标签: {tags.filter(t => t.level === 2).length}
              </p>
            </div>
            
            {canManageContent && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    添加标签
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建新标签</DialogTitle>
                    <DialogDescription>
                      为标签库 "{library.name}" 添加新标签
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tag-key">标签键 *</Label>
                        <Input
                          id="tag-key"
                          value={newTag.key}
                          onChange={(e) => setNewTag(prev => ({ ...prev, key: e.target.value }))}
                          placeholder="如: category_electronics"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tag-name">标签名称 *</Label>
                        <Input
                          id="tag-name"
                          value={newTag.name}
                          onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="如: 电子产品"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tag-value">标签值 *</Label>
                        <Input
                          id="tag-value"
                          value={newTag.value}
                          onChange={(e) => setNewTag(prev => ({ ...prev, value: e.target.value }))}
                          placeholder="如: electronics"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tag-level">标签层级</Label>
                        <Select 
                          value={newTag.level.toString()} 
                          onValueChange={(value) => setNewTag(prev => ({ ...prev, level: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">一级标签</SelectItem>
                            <SelectItem value="2">二级标签</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {newTag.level === 2 && (
                      <div>
                        <Label htmlFor="parent-tag">父级标签</Label>
                        <Select 
                          value={newTag.parentId} 
                          onValueChange={(value) => setNewTag(prev => ({ ...prev, parentId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择父级标签" />
                          </SelectTrigger>
                          <SelectContent>
                            {getLevel1Tags().map((tag) => (
                              <SelectItem key={tag.id} value={tag.id}>
                                {tag.name} ({tag.key})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="tag-remark">备注</Label>
                      <Textarea
                        id="tag-remark"
                        value={newTag.remark}
                        onChange={(e) => setNewTag(prev => ({ ...prev, remark: e.target.value }))}
                        placeholder="标签的详细说明..."
                        rows={3}
                      />
                    </div>

                    <Button onClick={createTag} className="w-full">
                      创建标签
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {getLevel1Tags().map((level1Tag) => (
              <Card key={level1Tag.id} className="border border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        一级
                      </Badge>
                      <span className="font-medium">{level1Tag.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {level1Tag.key}
                      </Badge>
                      <Badge 
                        variant={level1Tag.status === "active" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {level1Tag.status === "active" ? "启用" : "禁用"}
                      </Badge>
                    </div>
                    
                    {canManageContent && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTagStatus(level1Tag.id)}
                        >
                          {level1Tag.status === "active" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTag(level1Tag)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTag(level1Tag.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>ID:</strong> {level1Tag.id} | 
                      <strong> 值:</strong> {level1Tag.value}
                    </p>
                    {level1Tag.remark && (
                      <p className="text-sm text-gray-600">
                        <strong>备注:</strong> {level1Tag.remark}
                      </p>
                    )}
                    
                    {/* 二级标签 */}
                    {getLevel2Tags(level1Tag.id).length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">子标签</h4>
                        <div className="space-y-2">
                          {getLevel2Tags(level1Tag.id).map((level2Tag) => (
                            <div key={level2Tag.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  二级
                                </Badge>
                                <span className="text-sm font-medium">{level2Tag.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {level2Tag.key}
                                </Badge>
                                <Badge 
                                  variant={level2Tag.status === "active" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {level2Tag.status === "active" ? "启用" : "禁用"}
                                </Badge>
                              </div>
                              
                              {canManageContent && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleTagStatus(level2Tag.id)}
                                  >
                                    {level2Tag.status === "active" ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingTag(level2Tag)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteTag(level2Tag.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 编辑标签对话框 */}
        {editingTag && canManageContent && (
          <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑标签</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-key">标签键</Label>
                    <Input
                      id="edit-key"
                      value={editingTag.key}
                      onChange={(e) => setEditingTag(prev => prev ? { ...prev, key: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-name">标签名称</Label>
                    <Input
                      id="edit-name"
                      value={editingTag.name}
                      onChange={(e) => setEditingTag(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-value">标签值</Label>
                  <Input
                    id="edit-value"
                    value={editingTag.value}
                    onChange={(e) => setEditingTag(prev => prev ? { ...prev, value: e.target.value } : null)}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-remark">备注</Label>
                  <Textarea
                    id="edit-remark"
                    value={editingTag.remark}
                    onChange={(e) => setEditingTag(prev => prev ? { ...prev, remark: e.target.value } : null)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingTag(null)}>
                    取消
                  </Button>
                  <Button onClick={() => editingTag && updateTag(editingTag)}>
                    <Save className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TagManager;
