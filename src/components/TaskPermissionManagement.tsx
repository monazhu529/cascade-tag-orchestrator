
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Shield, UserCheck, UserX, Crown } from "lucide-react";
import { TaskLibrary } from "@/pages/Index";
import { User, LibraryPermission } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";

interface TaskPermissionManagementProps {
  taskLibrary: TaskLibrary;
  currentUser: User;
  permissions: LibraryPermission[];
}

const TaskPermissionManagement = ({ taskLibrary, currentUser }: TaskPermissionManagementProps) => {
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [newPermission, setNewPermission] = useState({
    userId: "",
    role: "viewer" as "administrator" | "operator" | "viewer"
  });

  const [taskPermissions] = useState([
    {
      id: "1",
      userId: "user-1",
      userName: "张三",
      role: "administrator",
      grantedAt: new Date("2024-01-15"),
      grantedBy: "system"
    },
    {
      id: "2",
      userId: "user-2",
      userName: "李四",
      role: "operator",
      grantedAt: new Date("2024-02-01"),
      grantedBy: "user-1"
    },
    {
      id: "3",
      userId: "user-3",
      userName: "王五",
      role: "viewer",
      grantedAt: new Date("2024-02-15"),
      grantedBy: "user-1"
    }
  ]);

  const { toast } = useToast();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "administrator": return <Crown className="w-4 h-4" />;
      case "operator": return <UserCheck className="w-4 h-4" />;
      case "viewer": return <Shield className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "administrator": return "default";
      case "operator": return "secondary";
      case "viewer": return "outline";
      default: return "outline";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "administrator": return "管理员";
      case "operator": return "操作员";
      case "viewer": return "查看者";
      default: return role;
    }
  };

  const handleGrantPermission = () => {
    // 这里应该添加授权逻辑
    setIsGrantDialogOpen(false);
    setNewPermission({ userId: "", role: "viewer" });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">权限管理</h3>
          <p className="text-sm text-gray-500">
            管理任务库的用户访问权限
          </p>
        </div>
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
                    <SelectItem value="administrator">管理员 - 完全控制权限</SelectItem>
                    <SelectItem value="operator">操作员 - 可编辑任务和映射</SelectItem>
                    <SelectItem value="viewer">查看者 - 仅查看权限</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGrantPermission} className="w-full">
                授予权限
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 权限统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {taskPermissions.filter(p => p.role === "administrator").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">操作员</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">
              {taskPermissions.filter(p => p.role === "operator").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">查看者</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-600">
              {taskPermissions.filter(p => p.role === "viewer").length}
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
                  <Badge variant={getRoleBadgeVariant(permission.role)} className="flex items-center gap-1">
                    {getRoleIcon(permission.role)}
                    {getRoleText(permission.role)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-gray-500">
                    <p>授权时间: {permission.grantedAt.toLocaleDateString()}</p>
                    <p>授权人: {permission.grantedBy}</p>
                  </div>
                  {permission.role !== "administrator" && (
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
