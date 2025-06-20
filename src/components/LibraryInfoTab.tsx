
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TagLibrary, User, LibraryPermission } from "@/types/permissions";
import UserManagement from "@/components/UserManagement";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Save, X } from "lucide-react";

interface LibraryInfoTabProps {
  library: TagLibrary;
  currentUser: User;
  userPermission?: LibraryPermission;
  permissions: LibraryPermission[];
  onUpdate: (updatedLibrary: TagLibrary) => void;
}

const LibraryInfoTab = ({ 
  library, 
  currentUser, 
  userPermission, 
  permissions,
  onUpdate 
}: LibraryInfoTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLibrary, setEditedLibrary] = useState(library);
  const { toast } = useToast();

  const canEdit = userPermission?.role === "administrator";

  const handleSave = () => {
    onUpdate(editedLibrary);
    setIsEditing(false);
    toast({
      title: "成功",
      description: "标签库信息更新成功",
    });
  };

  const handleCancel = () => {
    setEditedLibrary(library);
    setIsEditing(false);
  };

  const libraryPermissions = permissions.filter(p => p.libraryId === library.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            基础信息
            {canEdit && (
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    编辑
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">标签库名称</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedLibrary.name}
                  onChange={(e) => setEditedLibrary({ ...editedLibrary, name: e.target.value })}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded">{library.name}</div>
              )}
            </div>
            <div>
              <Label htmlFor="libraryId">库ID</Label>
              <div className="p-2 bg-gray-50 rounded">{library.libraryId}</div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="administrator">管理员</Label>
            {isEditing ? (
              <Input
                id="administrator"
                value={editedLibrary.administrator}
                onChange={(e) => setEditedLibrary({ ...editedLibrary, administrator: e.target.value })}
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded">{library.administrator}</div>
            )}
          </div>
          
          <div>
            <Label htmlFor="description">描述</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={editedLibrary.description}
                onChange={(e) => setEditedLibrary({ ...editedLibrary, description: e.target.value })}
                rows={3}
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded min-h-[80px]">{library.description}</div>
            )}
          </div>
          
          <div>
            <Label>创建时间</Label>
            <div className="p-2 bg-gray-50 rounded">{library.createdAt.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>权限管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>当前权限用户</Label>
              <div className="mt-2 space-y-2">
                {libraryPermissions.map((permission) => (
                  <div key={permission.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">用户ID: {permission.userId}</span>
                      <div className="text-sm text-gray-500">
                        授权时间: {permission.grantedAt.toLocaleString()}
                      </div>
                    </div>
                    <Badge variant={permission.role === "administrator" ? "default" : "secondary"}>
                      {permission.role === "administrator" ? "管理员" : "运营"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            {canEdit && (
              <UserManagement 
                library={library}
                currentUser={currentUser}
                permissions={libraryPermissions}
                onUpdate={onUpdate}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LibraryInfoTab;
