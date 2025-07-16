
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Filter, Users, Clock, Bell } from "lucide-react";
import { TaskLibrary } from "@/pages/Index";
import { TagLibrary, User, LibraryPermission } from "@/types/permissions";
import TaskBasicInfo from "./TaskBasicInfo";
import TaskFilterMapping from "./TaskFilterMapping";
import TaskPermissionManagement from "./TaskPermissionManagement";
import TaskOperationLog from "./TaskOperationLog";
import TaskSubscriptionManagement from "./TaskSubscriptionManagement";

interface TaskLibraryDetailProps {
  taskLibraries: TaskLibrary[];
  setTaskLibraries: React.Dispatch<React.SetStateAction<TaskLibrary[]>>;
  tagLibraries: TagLibrary[];
  currentUser: User;
  permissions: LibraryPermission[];
}

const TaskLibraryDetail = ({ 
  taskLibraries, 
  setTaskLibraries, 
  tagLibraries, 
  currentUser,
  permissions 
}: TaskLibraryDetailProps) => {
  const { taskLibraryId } = useParams<{ taskLibraryId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");

  const taskLibrary = useMemo(() => 
    taskLibraries.find(lib => lib.id === taskLibraryId),
    [taskLibraries, taskLibraryId]
  );

  const connectedTagLibrary = useMemo(() => 
    taskLibrary?.connectedTagLibraryId 
      ? tagLibraries.find(lib => lib.id === taskLibrary.connectedTagLibraryId)
      : undefined,
    [taskLibrary, tagLibraries]
  );

  // Mock task library permissions
  const taskLibraryPermissions = [
    {
      id: "1",
      userId: "user-1",
      userName: "张三",
      taskLibraryId: taskLibrary?.id || '',
      role: "manager" as const,
      grantedAt: new Date("2024-01-15"),
      grantedBy: "system"
    }
  ];

  if (!taskLibrary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">任务库不存在</h2>
            <Button onClick={() => navigate('/')}>返回首页</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回任务库列表
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {taskLibrary.name}
              </h1>
              <p className="text-gray-600 mt-2">{taskLibrary.description}</p>
              {connectedTagLibrary && (
                <p className="text-sm text-green-600 mt-1">
                  已关联标签库: {connectedTagLibrary.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-0 rounded-t-lg rounded-b-none">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  基础信息
                </TabsTrigger>
                <TabsTrigger value="mapping" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  筛选映射
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  权限管理
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  操作日志
                </TabsTrigger>
                <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  订阅管理
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="basic" className="mt-0">
                  <TaskBasicInfo 
                    taskLibrary={taskLibrary}
                    setTaskLibraries={setTaskLibraries}
                    tagLibraries={tagLibraries}
                    connectedTagLibrary={connectedTagLibrary}
                    currentUser={currentUser}
                  />
                </TabsContent>

                <TabsContent value="mapping" className="mt-0">
                  <TaskFilterMapping 
                    taskLibrary={taskLibrary}
                    connectedTagLibrary={connectedTagLibrary}
                    currentUser={currentUser}
                  />
                </TabsContent>

                <TabsContent value="permissions" className="mt-0">
                  <TaskPermissionManagement 
                    taskLibrary={taskLibrary}
                    currentUser={currentUser}
                    permissions={taskLibraryPermissions}
                  />
                </TabsContent>

                <TabsContent value="logs" className="mt-0">
                  <TaskOperationLog 
                    taskLibrary={taskLibrary}
                    currentUser={currentUser}
                  />
                </TabsContent>

                <TabsContent value="subscriptions" className="mt-0">
                  <TaskSubscriptionManagement 
                    taskLibrary={taskLibrary}
                    currentUser={currentUser}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskLibraryDetail;
