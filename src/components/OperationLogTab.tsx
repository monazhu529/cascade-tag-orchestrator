import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TagLibrary, User, LibraryPermission } from "@/types/permissions";
import { History, Search, Filter, Calendar, User as UserIcon, Tag, Settings } from "lucide-react";

interface OperationLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  operation: "create" | "update" | "delete" | "status_change" | "permission_change";
  target: "tag" | "library" | "user";
  targetId: string;
  targetName: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

interface OperationLogTabProps {
  library: TagLibrary;
  currentUser: User;
  userPermission?: LibraryPermission;
}

const OperationLogTab = ({ library, currentUser, userPermission }: OperationLogTabProps) => {
  const [logs] = useState<OperationLog[]>([
    {
      id: "log-1",
      timestamp: new Date("2024-06-23T10:30:00"),
      userId: "user-1",
      userName: "张三",
      operation: "create",
      target: "tag",
      targetId: "1010007",
      targetName: "平板电脑",
      details: "创建了新标签：平板电脑",
    },
    {
      id: "log-2",
      timestamp: new Date("2024-06-23T09:15:00"),
      userId: "user-1",
      userName: "张三",
      operation: "status_change",
      target: "tag",
      targetId: "1010006",
      targetName: "女装",
      details: "修改标签状态",
      oldValue: "active",
      newValue: "inactive",
    },
    {
      id: "log-3",
      timestamp: new Date("2024-06-22T16:45:00"),
      userId: "user-2",
      userName: "李四",
      operation: "update",
      target: "tag",
      targetId: "1010002",
      targetName: "手机",
      details: "更新标签备注信息",
      oldValue: "智能手机",
      newValue: "智能手机和功能手机",
    },
    {
      id: "log-4",
      timestamp: new Date("2024-06-22T14:20:00"),
      userId: "user-1",
      userName: "张三",
      operation: "permission_change",
      target: "user",
      targetId: "user-2",
      targetName: "李四",
      details: "为用户添加运营权限",
      newValue: "operator",
    },
    {
      id: "log-5",
      timestamp: new Date("2024-06-21T11:10:00"),
      userId: "user-1",
      userName: "张三",
      operation: "update",
      target: "library",
      targetId: library.id,
      targetName: library.name,
      details: "更新标签库描述",
      oldValue: "电商分类标签",
      newValue: "用于电商商品分类的标签体系",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");

  const getOperationIcon = (operation: OperationLog["operation"]) => {
    switch (operation) {
      case "create":
        return <Tag className="w-4 h-4 text-green-600" />;
      case "update":
        return <Settings className="w-4 h-4 text-blue-600" />;
      case "delete":
        return <Tag className="w-4 h-4 text-red-600" />;
      case "status_change":
        return <Settings className="w-4 h-4 text-orange-600" />;
      case "permission_change":
        return <UserIcon className="w-4 h-4 text-purple-600" />;
      default:
        return <History className="w-4 h-4 text-gray-600" />;
    }
  };

  const getOperationLabel = (operation: OperationLog["operation"]) => {
    switch (operation) {
      case "create":
        return "创建";
      case "update":
        return "更新";
      case "delete":
        return "删除";
      case "status_change":
        return "状态变更";
      case "permission_change":
        return "权限变更";
      default:
        return "未知操作";
    }
  };

  const getTargetLabel = (target: OperationLog["target"]) => {
    switch (target) {
      case "tag":
        return "标签";
      case "library":
        return "标签库";
      case "user":
        return "用户";
      default:
        return "未知";
    }
  };

  const getOperationColor = (operation: OperationLog["operation"]) => {
    switch (operation) {
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      case "status_change":
        return "bg-orange-100 text-orange-800";
      case "permission_change":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOperation = operationFilter === "all" || log.operation === operationFilter;
    const matchesTarget = targetFilter === "all" || log.target === targetFilter;
    
    return matchesSearch && matchesOperation && matchesTarget;
  });

  return (
    <div className="space-y-6">
      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            日志筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">搜索</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索用户、操作或目标..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="operation">操作类型</Label>
              <Select value={operationFilter} onValueChange={setOperationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部操作</SelectItem>
                  <SelectItem value="create">创建</SelectItem>
                  <SelectItem value="update">更新</SelectItem>
                  <SelectItem value="delete">删除</SelectItem>
                  <SelectItem value="status_change">状态变更</SelectItem>
                  <SelectItem value="permission_change">权限变更</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target">目标类型</Label>
              <Select value={targetFilter} onValueChange={setTargetFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="tag">标签</SelectItem>
                  <SelectItem value="library">标签库</SelectItem>
                  <SelectItem value="user">用户</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(searchTerm || operationFilter !== "all" || targetFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <History className="w-4 h-4" />
              显示 {filteredLogs.length} 条日志
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setOperationFilter("all");
                  setTargetFilter("all");
                }}
                className="ml-auto text-blue-600 hover:text-blue-800"
              >
                清除筛选
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 操作日志列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-green-600" />
            操作日志
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || operationFilter !== "all" || targetFilter !== "all" 
                ? "没有找到匹配的日志记录" 
                : "暂无操作日志"
              }
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getOperationIcon(log.operation)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getOperationColor(log.operation)}>
                            {getOperationLabel(log.operation)}
                          </Badge>
                          <Badge variant="outline">
                            {getTargetLabel(log.target)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {log.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {log.details}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {log.userName}
                          </span>
                          {log.targetName && (
                            <span>
                              目标: {log.targetName} (ID: {log.targetId})
                            </span>
                          )}
                        </div>
                        {(log.oldValue || log.newValue) && (
                          <div className="bg-gray-100 p-2 rounded text-xs">
                            {log.oldValue && (
                              <div>原值: <span className="text-red-600">{log.oldValue}</span></div>
                            )}
                            {log.newValue && (
                              <div>新值: <span className="text-green-600">{log.newValue}</span></div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationLogTab;
