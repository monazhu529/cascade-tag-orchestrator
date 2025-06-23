
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tag } from "@/types/permissions";
import { X, Clock, User, Edit } from "lucide-react";

interface TagLogEntry {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  operator: string;
  timestamp: Date;
}

interface TagLogDialogProps {
  tag: Tag;
  onClose: () => void;
}

const TagLogDialog = ({ tag, onClose }: TagLogDialogProps) => {
  const [logs, setLogs] = useState<TagLogEntry[]>([]);

  useEffect(() => {
    // 模拟获取标签操作日志
    const mockLogs: TagLogEntry[] = [
      {
        id: "1",
        action: "创建",
        operator: "张三",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: "2",
        action: "修改",
        field: "状态",
        oldValue: "未激活",
        newValue: "激活",
        operator: "李四",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: "3",
        action: "修改",
        field: "备注",
        oldValue: "",
        newValue: "更新备注信息",
        operator: "王五",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];
    setLogs(mockLogs);
  }, [tag.id]);

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('zh-CN');
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "创建":
        return "bg-green-100 text-green-800";
      case "修改":
        return "bg-blue-100 text-blue-800";
      case "删除":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>标签操作日志 - {tag.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">标签键：</span>{tag.key}</p>
              <p><span className="font-medium">标签名：</span>{tag.name}</p>
              <p><span className="font-medium">当前状态：</span>
                <Badge variant={tag.status === "active" ? "default" : "secondary"} className="ml-2">
                  {tag.status === "active" ? "激活" : "未激活"}
                </Badge>
              </p>
            </div>
          </div>
          
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无操作日志
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                          {log.field && (
                            <span className="text-sm text-gray-600">
                              字段: {log.field}
                            </span>
                          )}
                        </div>
                        
                        {log.field && (
                          <div className="text-sm space-y-1">
                            {log.oldValue !== undefined && (
                              <p><span className="text-gray-500">旧值:</span> {log.oldValue || "空"}</p>
                            )}
                            {log.newValue !== undefined && (
                              <p><span className="text-gray-500">新值:</span> {log.newValue}</p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.operator}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TagLogDialog;
