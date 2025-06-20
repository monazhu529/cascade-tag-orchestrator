
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TagLibrary, User, LibraryPermission } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface UserManagementProps {
  library: TagLibrary;
  currentUser: User;
  permissions: LibraryPermission[];
  onUpdate: (updatedLibrary: TagLibrary) => void;
}

const UserManagement = ({ 
  library, 
  currentUser, 
  permissions, 
  onUpdate 
}: UserManagementProps) => {
  const [newUserId, setNewUserId] = useState("");
  const [newUserRole, setNewUserRole] = useState<"administrator" | "operator">("operator");
  const { toast } = useToast();

  const handleAddUser = () => {
    if (!newUserId.trim()) {
      toast({
        title: "错误",
        description: "请输入用户ID",
        variant: "destructive",
      });
      return;
    }

    if (permissions.some(p => p.userId === newUserId)) {
      toast({
        title: "错误", 
        description: "该用户已有权限",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would make an API call to add the permission
    toast({
      title: "成功",
      description: `已为用户 ${newUserId} 添加 ${newUserRole === "administrator" ? "管理员" : "运营"} 权限`,
    });

    setNewUserId("");
    setNewUserRole("operator");
  };

  const handleRemoveUser = (userId: string) => {
    if (userId === currentUser.id) {
      toast({
        title: "错误",
        description: "不能移除自己的权限", 
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would make an API call to remove the permission
    toast({
      title: "成功",
      description: "用户权限已移除",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>添加用户权限</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="userId">用户ID</Label>
            <Input
              id="userId"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              placeholder="输入用户ID"
            />
          </div>
          <div>
            <Label htmlFor="role">角色</Label>
            <Select value={newUserRole} onValueChange={(value: "administrator" | "operator") => setNewUserRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">运营</SelectItem>
                <SelectItem value="administrator">管理员</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddUser} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              添加
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>当前用户权限</Label>
          {permissions.map((permission) => (
            <div key={permission.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <span className="font-medium">用户ID: {permission.userId}</span>
                <Badge variant={permission.role === "administrator" ? "default" : "secondary"}>
                  {permission.role === "administrator" ? "管理员" : "运营"}
                </Badge>
                {permission.userId === currentUser.id && (
                  <Badge variant="outline">当前用户</Badge>
                )}
              </div>
              
              {permission.userId !== currentUser.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveUser(permission.userId)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
