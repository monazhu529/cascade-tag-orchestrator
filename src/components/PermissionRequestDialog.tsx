
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, PermissionRequest, TagLibrary } from "@/types/permissions";

interface PermissionRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  library: TagLibrary;
  currentUser: User;
  onSubmitRequest: (request: PermissionRequest) => void;
}

const PermissionRequestDialog = ({ 
  isOpen, 
  onClose, 
  library, 
  currentUser, 
  onSubmitRequest 
}: PermissionRequestDialogProps) => {
  const [requestedRole, setRequestedRole] = useState<"administrator" | "operator">("operator");
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast({
        title: "错误",
        description: "请填写申请理由",
        variant: "destructive",
      });
      return;
    }

    const request: PermissionRequest = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      libraryId: library.id,
      requestedRole,
      reason: reason.trim(),
      status: "pending",
      requestedAt: new Date(),
    };

    onSubmitRequest(request);
    setReason("");
    setRequestedRole("operator");
    onClose();

    toast({
      title: "申请已提交",
      description: "您的权限申请已提交，请等待管理员审核",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>申请标签库权限</DialogTitle>
          <DialogDescription>
            向管理员申请访问 "{library.name}" 的权限
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="library-info">标签库信息</Label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-medium">{library.name}</p>
              <p className="text-sm text-gray-600">{library.description}</p>
              <p className="text-sm text-gray-600">管理员：{library.administrator}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="requested-role">申请角色</Label>
            <Select value={requestedRole} onValueChange={(value: "administrator" | "operator") => setRequestedRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">运营 - 可管理库内容</SelectItem>
                <SelectItem value="administrator">管理员 - 可管理库内容和人员授权</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">申请理由</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请说明您需要此权限的理由..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              提交申请
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionRequestDialog;
