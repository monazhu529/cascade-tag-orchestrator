
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Settings, UserCheck, UserX, Crown } from "lucide-react";
import { TaskLibrary } from "@/pages/Index";
import { User, TaskLibraryPermission } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";

interface TaskPermissionManagementProps {
  taskLibrary: TaskLibrary;
  currentUser: User;
  permissions: TaskLibraryPermission[];
}

const TaskPermissionManagement = ({ taskLibrary, currentUser, permissions }: TaskPermissionManagementProps) => {
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [newPermission, setNewPermission] = useState({
    userId: "",
    role: "operator" as "manager" | "operator"
  });

  const [taskPermissions] = useState<TaskLibraryPermission[]>([
    {
      id: "1",
      userId: "user-1",
      userName: "张三",
      taskLibraryId: taskLibrary.id,
      role: "manager",
      grantedAt: new Date("2024-01-15"),
      grantedBy: "system"
    },
    {
      id: "2",
      userId: "user-2",
      userName: "李四",
      taskLibraryId: taskLibrary.id,
      role: "operator",
      grantedAt: new Date("2024-02-01"),
      grantedBy: "user-1"
    }
  ]);

  const { toast } = useToast();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "manager": return <Crown className="w-4 h-4" />;
      case "operator": return <UserCheck className="w-4 h-4" />;
      default: return <UserCheck className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "manager": return "default";
      case "operator": return "secondary";
      default: return "outline";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "manager": return "管理员";
      case "operator": return "运营员";
      default: return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "manager": return "可以管理权限、删除用户、完全控制任务库";
      case "operator": return "可以筛选映射标签、导入导出数据、管理任务";
      default: return "";
    }
  };

  const handleGrantPermission = () => {
    setIsGrantDialogOpen(false);
    setNewPermission({ userId: "", role: "operator" });
    toast({
      title: "权限授予成功",
      description: "用户权限已成功添加",
    });
  };

  const revokePermission = (permissionId: string) => {
    toast({
      title: "权限撤销成功",
      description: "用户权限已被撤销",
    });
  };

  const canManagePermissions = () => {
    const userPermission = taskPermissions.find(p => p.userId === currentUser.id);
    return userPermission?.role === "manager";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">权限管理</h3>
          <p className="text-sm text-gray-500">
            管理任务库的用户访问权限和角色分配
          </p>
        </div>
        {canManagePermissions() && (
          <Dialog open={isGrantDialogOpen} onOpenChange={setIsGrantDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                授予权限
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>授予任务库权限</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">用户</label>
                  <Input
                    placeholder="输入用户名或邮箱"
                    value={newPermission.userId}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, userId: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">权限角色</label>
                  <Select value={newPermission.role} onValueChange={(value: any) => setNewPermission(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">
                        <div>
                          <div className="font-medium">管理员</div>
                          <div className="text-sm text-gray-500">可以管理权限、删除用户、完全控制任务库</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="operator">
                        <div>
                          <div className="font-medium">运营员</div>
                          <div className="text-sm text-gray-500">可以筛选映射标签、导入导出数据、管理任务</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGrantPermission} className="w-full">
                  授予权限
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* 权限统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">总用户数</span>
            </div>
            <p className="text-2xl font-bold mt-2">{taskPermissions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">管理员</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-purple-600">
              {taskPermissions.filter(p => p.role === "manager").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">运营员</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">
              {taskPermissions.filter(p => p.role === "operator").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 权限列表 */}
      <div className="space-y-4">
        {taskPermissions.map((permission) => (
          <Card key={permission.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{permission.userName}</p>
                    <p className="text-sm text-gray-500">ID: {permission.userId}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant={getRoleBadgeVariant(permission.role)} className="flex items-center gap-1">
                      {getRoleIcon(permission.role)}
                      {getRoleText(permission.role)}
                    </Badge>
                    <p className="text-xs text-gray-500">{getRoleDescription(permission.role)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-gray-500">
                    <p>授权时间: {permission.grantedAt.toLocaleDateString()}</p>
                    <p>授权人: {permission.grantedBy}</p>
                  </div>
                  {canManagePermissions() && permission.role !== "manager" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => revokePermission(permission.id)}
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      撤销
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskPermissionManagement;
