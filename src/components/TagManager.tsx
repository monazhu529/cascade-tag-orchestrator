import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Tag as TagIcon } from "lucide-react";
import { TagLibrary, Tag, User, LibraryPermission } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";

interface TagManagerProps {
  library: TagLibrary;
  currentUser: User;
  userPermission?: LibraryPermission;
  onUpdate: (updatedLibrary: TagLibrary) => void;
  onClose: () => void;
  isModal?: boolean;
}

const TagManager = ({ 
  library, 
  currentUser, 
  userPermission, 
  onUpdate, 
  onClose,
  isModal = true
}: TagManagerProps) => {
  const [tags, setTags] = useState<Tag[]>(library.tags);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTag, setEditedTag] = useState<Tag | null>(null);
  const [newTag, setNewTag] = useState<Omit<Tag, "id">>({
    key: "",
    name: "",
    value: "",
    status: "active",
    remark: "",
    level: 1,
  });
  const { toast } = useToast();

  const handleTagUpdate = (tag: Tag) => {
    setEditedTag(tag);
    setIsEditDialogOpen(true);
  };

  const handleSaveTag = (updatedTag: Tag) => {
    const updatedTags = tags.map(tag =>
      tag.id === updatedTag.id ? updatedTag : tag
    );
    setTags(updatedTags);
    onUpdate({ ...library, tags: updatedTags });
    setIsEditDialogOpen(false);
    setEditedTag(null);
    toast({
      title: "成功",
      description: "标签更新成功",
    });
  };

  const handleCreateTag = () => {
    if (!newTag.key.trim() || !newTag.name.trim() || !newTag.value.trim()) {
      toast({
        title: "错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }

    const newTagWithId: Tag = { id: crypto.randomUUID(), ...newTag };
    const updatedTags = [...tags, newTagWithId];
    setTags(updatedTags);
    onUpdate({ ...library, tags: updatedTags });
    setNewTag({ key: "", name: "", value: "", status: "active", remark: "", level: 1 });
    toast({
      title: "成功",
      description: "标签创建成功",
    });
  };

  const handleDeleteTag = (id: string) => {
    const updatedTags = tags.filter(tag => tag.id !== id);
    setTags(updatedTags);
    onUpdate({ ...library, tags: updatedTags });
    toast({
      title: "成功",
      description: "标签删除成功",
    });
  };

  const content = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>添加新标签</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="key">键 (Key)</Label>
              <Input
                id="key"
                value={newTag.key}
                onChange={(e) => setNewTag({ ...newTag, key: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="name">名称 (Name)</Label>
              <Input
                id="name"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value">值 (Value)</Label>
              <Input
                id="value"
                value={newTag.value}
                onChange={(e) => setNewTag({ ...newTag, value: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="level">层级 (Level)</Label>
              <Select value={newTag.level.toString()} onValueChange={(value) => setNewTag({ ...newTag, level: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择层级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">一级</SelectItem>
                  <SelectItem value="2">二级</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="remark">备注 (Remark)</Label>
            <Textarea
              id="remark"
              value={newTag.remark}
              onChange={(e) => setNewTag({ ...newTag, remark: e.target.value })}
            />
          </div>
          <Button onClick={handleCreateTag}>创建标签</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>标签列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{tag.name}</div>
                  <div className="text-sm text-gray-500">{tag.key}</div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {tag.level === 1 ? "一级" : "二级"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => handleTagUpdate(tag)}>
                    <Edit className="w-4 h-4 mr-2" />
                    编辑
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteTag(tag.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isEditDialogOpen && editedTag && (
        <Dialog open={isEditDialogOpen} onOpenChange={() => setIsEditDialogOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑标签</DialogTitle>
              <DialogDescription>
                修改标签信息
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-key">键 (Key)</Label>
                  <Input
                    id="edit-key"
                    value={editedTag.key}
                    onChange={(e) => setEditedTag({ ...editedTag, key: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-name">名称 (Name)</Label>
                  <Input
                    id="edit-name"
                    value={editedTag.name}
                    onChange={(e) => setEditedTag({ ...editedTag, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-value">值 (Value)</Label>
                  <Input
                    id="edit-value"
                    value={editedTag.value}
                    onChange={(e) => setEditedTag({ ...editedTag, value: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">状态 (Status)</Label>
                  <Select value={editedTag.status} onValueChange={(value) => setEditedTag({ ...editedTag, status: value as "active" | "inactive" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">激活</SelectItem>
                      <SelectItem value="inactive">未激活</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-remark">备注 (Remark)</Label>
                <Textarea
                  id="edit-remark"
                  value={editedTag.remark}
                  onChange={(e) => setEditedTag({ ...editedTag, remark: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={() => {
              if (editedTag) {
                handleSaveTag(editedTag);
              }
            }}>保存</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>管理标签库: {library.name}</DialogTitle>
          <DialogDescription>
            库ID: {library.libraryId} | 管理员: {library.administrator}
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default TagManager;
