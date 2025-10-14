
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, List, Link, RefreshCw, Search, Filter, Settings, X } from "lucide-react";
import { TaskLibrary } from "@/pages/Index";
import { TagLibrary, User, LibraryPermission } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";

interface TaskLibraryManagerProps {
  taskLibraries: TaskLibrary[];
  setTaskLibraries: React.Dispatch<React.SetStateAction<TaskLibrary[]>>;
  tagLibraries: TagLibrary[];
  currentUser: User;
  permissions: LibraryPermission[];
}

const TaskLibraryManager = ({ 
  taskLibraries, 
  setTaskLibraries, 
  tagLibraries, 
  currentUser,
  permissions 
}: TaskLibraryManagerProps) => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTaskLibrary, setNewTaskLibrary] = useState({ 
    name: "", 
    description: "", 
    connectedTagLibraryIds: [] as string[]
  });
  
  // 筛选状态
  const [viewMode, setViewMode] = useState<"my" | "all">("my");
  const [searchTaskId, setSearchTaskId] = useState("");
  const [searchTaskName, setSearchTaskName] = useState("");
  const [selectedTagLibraryFilter, setSelectedTagLibraryFilter] = useState<string>("all");
  
  const { toast } = useToast();
  
  // 导航到任务库详情页
  const handleNavigateToTaskLibrary = (taskLibraryId: string) => {
    navigate(`/task-library/${taskLibraryId}`, {
      state: {
        taskLibraries,
        tagLibraries,
        currentUser,
        permissions
      }
    });
  };

  // 获取用户有权限的标签库
  const userAccessibleTagLibraries = useMemo(() => {
    const userPermissions = permissions.filter(p => p.userId === currentUser.id);
    return tagLibraries.filter(lib => 
      userPermissions.some(p => p.libraryId === lib.id) || 
      lib.administrator === currentUser.name
    );
  }, [tagLibraries, permissions, currentUser]);

  // 筛选任务库
  const filteredTaskLibraries = useMemo(() => {
    let filtered = taskLibraries;

    // 我的|全部筛选
    if (viewMode === "my") {
      filtered = filtered.filter(lib => lib.createdBy === currentUser.id);
    }

    // 任务ID查询
    if (searchTaskId.trim()) {
      filtered = filtered.filter(lib => 
        lib.id.toLowerCase().includes(searchTaskId.toLowerCase())
      );
    }

    // 任务名称关键词查询
    if (searchTaskName.trim()) {
      filtered = filtered.filter(lib => 
        lib.name.toLowerCase().includes(searchTaskName.toLowerCase())
      );
    }

    // 标签库筛选
    if (selectedTagLibraryFilter !== "all") {
      filtered = filtered.filter(lib => 
        lib.connectedTagLibraryIds.includes(selectedTagLibraryFilter)
      );
    }

    return filtered;
  }, [taskLibraries, viewMode, searchTaskId, searchTaskName, selectedTagLibraryFilter, currentUser.id]);

  const createTaskLibrary = () => {
    if (!newTaskLibrary.name.trim()) {
      toast({
        title: "错误",
        description: "请输入任务库名称",
        variant: "destructive",
      });
      return;
    }

    const taskLibrary: TaskLibrary = {
      id: crypto.randomUUID(),
      name: newTaskLibrary.name,
      description: newTaskLibrary.description,
      administrator: currentUser.name,
      connectedTagLibraryIds: newTaskLibrary.connectedTagLibraryIds,
      tagMappings: {},
      createdAt: new Date(),
      createdBy: currentUser.id,
    };

    setTaskLibraries(prev => [...prev, taskLibrary]);
    setNewTaskLibrary({ name: "", description: "", connectedTagLibraryIds: [] });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "成功",
      description: "任务库创建成功",
    });
  };

  const deleteTaskLibrary = (id: string) => {
    setTaskLibraries(prev => prev.filter(lib => lib.id !== id));
    toast({
      title: "成功",
      description: "任务库删除成功",
    });
  };

  const updateTaskLibraryConnection = (taskLibraryId: string, tagLibraryIds: string[]) => {
    setTaskLibraries(prev => 
      prev.map(lib => 
        lib.id === taskLibraryId 
          ? { ...lib, connectedTagLibraryIds: tagLibraryIds, tagMappings: {} }
          : lib
      )
    );
    
    toast({
      title: "成功",
      description: "标签库关联已更新",
    });
  };

  const handleSync = (taskLibraryId: string) => {
    const taskLibrary = taskLibraries.find(lib => lib.id === taskLibraryId);
    
    if (!taskLibrary) {
      toast({
        title: "错误",
        description: "找不到对应的任务库",
        variant: "destructive",
      });
      return;
    }

    // 模拟同步过程
    toast({
      title: "同步成功",
      description: `${taskLibrary.name} 同步完成`,
    });
  };

  const getConnectedTagLibraries = (taskLibrary: TaskLibrary) => {
    return taskLibrary.connectedTagLibraryIds.map(id => 
      tagLibraries.find(lib => lib.id === id)
    ).filter(Boolean);
  };

  const handleTagLibraryToggle = (taskLibraryId: string, tagLibraryId: string, checked: boolean) => {
    setTaskLibraries(prev => 
      prev.map(lib => {
        if (lib.id === taskLibraryId) {
          const newConnectedIds = checked 
            ? [...lib.connectedTagLibraryIds, tagLibraryId]
            : lib.connectedTagLibraryIds.filter(id => id !== tagLibraryId);
          
          return { ...lib, connectedTagLibraryIds: newConnectedIds };
        }
        return lib;
      })
    );
  };

  const connectedTaskLibraries = filteredTaskLibraries.filter(lib => lib.connectedTagLibraryIds.length > 0);

  return (
    <Tabs defaultValue="management" className="w-full">
      <TabsList className="grid w-full grid-cols-1 mb-6">
        <TabsTrigger value="management">任务库管理</TabsTrigger>
      </TabsList>

      <TabsContent value="management" className="space-y-6">
        {/* 筛选控件 */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="view-mode">查看范围</Label>
              <Select value={viewMode} onValueChange={(value: "my" | "all") => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="my">我的任务库</SelectItem>
                  <SelectItem value="all">全部任务库</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="task-id-search">任务库ID</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="task-id-search"
                  placeholder="输入任务库ID"
                  value={searchTaskId}
                  onChange={(e) => setSearchTaskId(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="task-name-search">任务库名称</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="task-name-search"
                  placeholder="输入关键词"
                  value={searchTaskName}
                  onChange={(e) => setSearchTaskName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="tag-library-filter">关联标签库</Label>
              <Select value={selectedTagLibraryFilter} onValueChange={setSelectedTagLibraryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择标签库" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部标签库</SelectItem>
                  {userAccessibleTagLibraries.map((library) => (
                    <SelectItem key={library.id} value={library.id}>
                      {library.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTaskId("");
                  setSearchTaskName("");
                  setSelectedTagLibraryFilter("all");
                  setViewMode("my");
                }}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                重置筛选
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">任务库列表</h3>
            <p className="text-sm text-gray-500">
              共找到 {filteredTaskLibraries.length} 个任务库
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                创建任务库
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>创建新任务库</DialogTitle>
                <DialogDescription>
                  创建一个新的任务库并可选择关联多个标签库
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-name">任务库名称</Label>
                  <Input
                    id="task-name"
                    value={newTaskLibrary.name}
                    onChange={(e) => setNewTaskLibrary(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="输入任务库名称"
                  />
                </div>
                <div>
                  <Label htmlFor="task-description">描述</Label>
                  <Textarea
                    id="task-description"
                    value={newTaskLibrary.description}
                    onChange={(e) => setNewTaskLibrary(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入任务库描述"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>关联标签库 (可选择多个)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {userAccessibleTagLibraries.map((library) => (
                      <div key={library.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={library.id}
                          checked={newTaskLibrary.connectedTagLibraryIds.includes(library.id)}
                          onCheckedChange={(checked) => {
                            setNewTaskLibrary(prev => ({
                              ...prev,
                              connectedTagLibraryIds: checked
                                ? [...prev.connectedTagLibraryIds, library.id]
                                : prev.connectedTagLibraryIds.filter(id => id !== library.id)
                            }));
                          }}
                        />
                        <Label htmlFor={library.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {library.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {newTaskLibrary.connectedTagLibraryIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {newTaskLibrary.connectedTagLibraryIds.map(id => {
                        const library = userAccessibleTagLibraries.find(lib => lib.id === id);
                        return library ? (
                          <Badge key={id} variant="secondary" className="text-xs">
                            {library.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <Button onClick={createTaskLibrary} className="w-full">
                  创建
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {filteredTaskLibraries.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <List className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">
                {viewMode === "my" ? "您还没有创建任何任务库" : "没有找到符合条件的任务库"}<br />
                {viewMode === "my" && "点击上方按钮创建您的第一个任务库"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTaskLibraries.map((taskLibrary) => {
              const connectedTagLibraries = getConnectedTagLibraries(taskLibrary);
              
              return (
                <Card key={taskLibrary.id} className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{taskLibrary.name}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToTaskLibrary(taskLibrary.id);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTaskLibrary(taskLibrary.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>{taskLibrary.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        ID: {taskLibrary.id.substring(0, 8)}...
                      </span>
                      <span className="text-sm text-gray-500">
                        {taskLibrary.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    
                    {connectedTagLibraries.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Link className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">已关联 {connectedTagLibraries.length} 个标签库</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {connectedTagLibraries.map((tagLib) => (
                            <Badge key={tagLib.id} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              {tagLib.name}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* 多标签库管理 */}
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium mb-2 text-sm">标签库管理</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {userAccessibleTagLibraries.map((library) => (
                              <div key={library.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${taskLibrary.id}-${library.id}`}
                                    checked={taskLibrary.connectedTagLibraryIds.includes(library.id)}
                                    onCheckedChange={(checked) => 
                                      handleTagLibraryToggle(taskLibrary.id, library.id, checked as boolean)
                                    }
                                  />
                                  <Label htmlFor={`${taskLibrary.id}-${library.id}`} className="text-xs">
                                    {library.name}
                                  </Label>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {library.tags?.length || 0} 个标签
                                </span>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2 text-xs h-7"
                            onClick={() => handleSync(taskLibrary.id)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            同步所有标签库
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-sm text-gray-500">未关联标签库</span>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {userAccessibleTagLibraries.map((library) => (
                            <div key={library.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${taskLibrary.id}-${library.id}`}
                                checked={false}
                                onCheckedChange={(checked) => 
                                  handleTagLibraryToggle(taskLibrary.id, library.id, checked as boolean)
                                }
                              />
                              <Label htmlFor={`${taskLibrary.id}-${library.id}`} className="text-xs">
                                {library.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 进入详情按钮 */}
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => handleNavigateToTaskLibrary(taskLibrary.id)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      进入详情
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default TaskLibraryManager;
