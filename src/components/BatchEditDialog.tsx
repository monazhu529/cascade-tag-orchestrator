
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";

interface BatchEditDialogProps {
  selectedCount: number;
  onUpdate: (field: "remark" | "status" | "value", value: string) => void;
  onClose: () => void;
}

const BatchEditDialog = ({ selectedCount, onUpdate, onClose }: BatchEditDialogProps) => {
  const [field, setField] = useState<"remark" | "status" | "value">("remark");
  const [value, setValue] = useState("");

  const handleSave = () => {
    if (!value.trim() && field !== "remark") return;
    onUpdate(field, value);
  };

  const fieldLabels = {
    remark: "备注",
    status: "状态",
    value: "值"
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>批量编辑标签 ({selectedCount} 个)</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="field">要修改的字段</Label>
            <Select value={field} onValueChange={(value) => setField(value as "remark" | "status" | "value")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remark">备注</SelectItem>
                <SelectItem value="status">状态</SelectItem>
                <SelectItem value="value">值</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="value">新的{fieldLabels[field]}</Label>
            {field === "status" ? (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">激活</SelectItem>
                  <SelectItem value="inactive">未激活</SelectItem>
                </SelectContent>
              </Select>
            ) : field === "remark" ? (
              <Textarea
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="输入新的备注"
                rows={3}
              />
            ) : (
              <Input
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="输入新的值"
              />
            )}
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            取消
          </Button>
          <Button onClick={handleSave} disabled={!value.trim() && field !== "remark"}>
            <Save className="w-4 h-4 mr-2" />
            保存修改
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BatchEditDialog;
