import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { TagLibrary, User, LibraryPermission, ClientSubscription, TagVersion } from "@/types/permissions";
import UserManagement from "@/components/UserManagement";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Save, X, GitBranch } from "lucide-react";

interface LibraryInfoTabProps {
  library: TagLibrary;
  currentUser: User;
  userPermission?: LibraryPermission;
  permissions: LibraryPermission[];
  onUpdate: (updatedLibrary: TagLibrary) => void;
  clientSubscriptions?: ClientSubscription[];
}

const LibraryInfoTab = ({ 
  library, 
  currentUser, 
  userPermission, 
  permissions,
  onUpdate,
  clientSubscriptions = []
}: LibraryInfoTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLibrary, setEditedLibrary] = useState(library);
  const { toast } = useToast();
  const navigate = useNavigate();

  const canEdit = userPermission?.role === "administrator";
  
  const publishedVersion = library.versionManagementEnabled && library.publishedVersionId && library.versions
    ? library.versions.find(v => v.id === library.publishedVersionId)
    : undefined;

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

  const handleManageVersions = () => {
    navigate(`/tag-library/${library.id}/versions`, {
      state: {
        libraryId: library.id,
        libraryName: library.name,
        versions: library.versions || [],
        currentTags: library.tags,
        currentUser: currentUser.name,
        publishedVersionId: library.publishedVersionId,
        onCreateVersion: handleCreateVersion,
        onPublishVersion: handlePublishVersion,
      },
    });
  };

  const libraryPermissions = permissions.filter(p => p.libraryId === library.id);
  const librarySubscriptions = clientSubscriptions.filter(s => s.tagLibraryId === library.id);

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

      {/* 版本管理设置 */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">版本管理</CardTitle>
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
                  onClick={handleManageVersions}
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
                {library.versions && library.versions.length > 0 && (
                  <Badge variant="outline">
                    共 {library.versions.length} 个版本
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 客户端订阅信息 */}
      <Card>
        <CardHeader>
          <CardTitle>客户端订阅信息</CardTitle>
        </CardHeader>
        <CardContent>
          {librarySubscriptions.length > 0 ? (
            <div className="space-y-2">
              {librarySubscriptions.map((subscription) => (
                <div key={subscription.id} className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">客户端ID: {subscription.clientId}</div>
                    <Badge variant="outline">
                      {subscription.subscribedVersionNumber}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">环境：</span>
                      {subscription.environment}
                    </div>
                    <div>
                      <span className="font-medium">App Server：</span>
                      {subscription.appServer}
                    </div>
                    <div>
                      <span className="font-medium">容器ID：</span>
                      {subscription.containerId}
                    </div>
                    <div>
                      <span className="font-medium">最后同步：</span>
                      {subscription.lastSyncTime.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              暂无客户端订阅此标签库
            </div>
          )}
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
