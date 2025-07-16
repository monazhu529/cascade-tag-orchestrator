
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Search, Filter, User, Settings, RefreshCw, Edit, Trash2 } from "lucide-react";
import { TaskLibrary } from "@/pages/Index";
import { User as UserType } from "@/types/permissions";

interface TaskOperationLogProps {
  taskLibrary: TaskLibrary;
  currentUser: UserType;
}

const TaskOperationLog = ({ taskLibrary }: TaskOperationLogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterUser, setFilterUser] = useState("all");

  const operationLogs = [
    {
      id: "1",
      operation: "创建任务库",
      operatorName: "张三",
      timestamp: new Date("2024-01-15T10:30:00"),
      details: "创建了新的任务库",
      type: "create"
    },
    {
      id: "2",
      operation: "同步标签库",
      operatorName: "张三",
      timestamp: new Date("2024-01-20T14:20:00"),
      details: "与电商分类标签库建立同步连接",
      type: "sync"
    },
    {
      id: "3",
      operation: "修改映射配置",
      operatorName: "李四",
      timestamp: new Date("2024-01-25T16:45:00"),
      details: "更新了电子产品标签的映射规则",
      type: "edit"
    },
    {
      id: "4",
      operation: "授予权限",
      operatorName: "张三",
      timestamp: new Date("2024-02-01T09:15:00"),
      details: "为用户李四授予操作员权限",
      type: "permission"
    },
    {
      id: "5",
      operation: "删除映射",
      operatorName: "王五",
      timestamp: new Date("2024-02-10T11:30:00"),
      details: "删除了服装分类的映射配置",
      type: "delete"
    }
  ];

  const getOperationIcon = (type: string) => {
    switch (type) {
      case "create": return <Settings className="w-4 h-4" />;
      case "sync": return <RefreshCw className="w-4 h-4" />;
      case "edit": return <Edit className="w-4 h-4" />;
      case "permission": return <User className="w-4 h-4" />;
      case "delete": return <Trash2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getOperationColor = (type: string) => {
    switch (type) {
      case "create": return "bg-green-100 text-green-800";
      case "sync": return "bg-blue-100 text-blue-800";
      case "edit": return "bg-yellow-100 text-yellow-800";
      case "permission": return "bg-purple-100 text-purple-800";
      case "delete": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredLogs = operationLogs.filter(log => {
    const matchesSearch = log.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.operatorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || log.type === filterType;
    const matchesUser = filterUser === "all" || log.operatorName === filterUser;
    
    return matchesSearch && matchesType && matchesUser;
  });

  const uniqueUsers = [...new Set(operationLogs.map(log => log.operatorName))];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">操作日志</h3>
        <p className="text-sm text-gray-500">
          查看任务库的所有操作记录
        </p>
      </div>

      {/* 筛选控件 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索操作或详情..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="操作类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="create">创建</SelectItem>
              <SelectItem value="sync">同步</SelectItem>
              <SelectItem value="edit">编辑</SelectItem>
              <SelectItem value="permission">权限</SelectItem>
              <SelectItem value="delete">删除</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger>
              <SelectValue placeholder="操作人员" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部人员</SelectItem>
              {uniqueUsers.map((user) => (
                <SelectItem key={user} value={user}>{user}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">总操作数</span>
            </div>
            <p className="text-2xl font-bold mt-2">{operationLogs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">创建</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">
              {operationLogs.filter(log => log.type === "create").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">同步</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-blue-600">
              {operationLogs.filter(log => log.type === "sync").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Edit className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">编辑</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-yellow-600">
              {operationLogs.filter(log => log.type === "edit").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">权限</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-purple-600">
              {operationLogs.filter(log => log.type === "permission").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 日志列表 */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Badge className={`${getOperationColor(log.type)} flex items-center gap-1 mt-1`}>
                    {getOperationIcon(log.type)}
                    {log.operation}
                  </Badge>
                  
                  <div className="flex-1">
                    <p className="font-medium">{log.details}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {log.operatorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              没有找到符合条件的操作记录<br />
              请调整筛选条件或搜索关键词
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskOperationLog;
