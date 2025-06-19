
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, List, Link } from "lucide-react";
import { TaskLibrary, TagLibrary } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface TaskLibraryManagerProps {
  taskLibraries: TaskLibrary[];
  setTaskLibraries: React.Dispatch<React.SetStateAction<TaskLibrary[]>>;
  tagLibraries: TagLibrary[];
}

const TaskLibraryManager = ({ taskLibraries, setTaskLibraries, tagLibraries }: TaskLibraryManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTaskLibrary, setNewTaskLibrary] = useState({ 
    name: "", 
    description: "", 
    connectedTagLibraryId: "" 
  });
  const { toast } = useToast();

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
      connectedTagLibraryId: newTaskLibrary.connectedTagLibraryId || undefined,
      tagMappings: {},
      createdAt: new Date(),
    };

    setTaskLibraries(prev => [...prev, taskLibrary]);
    setNewTaskLibrary({ name: "", description: "", connectedTagLibraryId: "" });
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

  const updateTaskLibraryConnection = (taskLibraryId: string, tagLibraryId: string | undefined) => {
    setTaskLibraries(prev => 
      prev.map(lib => 
        lib.id === taskLibraryId 
          ? { ...lib, connectedTagLibraryId: tagLibraryId, tagMappings: {} }
          : lib
      )
    );
    
    toast({
      title: "成功",
      description: tagLibraryId ? "标签库连接成功" : "标签库连接已断开",
    });
  };

  const getConnectedTagLibrary = (taskLibrary: TaskLibrary) => {
    return taskLibrary.connectedTagLibraryId 
      ? tagLibraries.find(lib => lib.id === taskLibrary.connectedTagLibraryId)
      : undefined;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">任务库列表</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              创建任务库
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新任务库</DialogTitle>
              <DialogDescription>
                创建一个新的任务库并可选择关联标签库
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
                <Label htmlFor="tag-library">关联标签库 (可选)</Label>
                <Select 
                  value={newTaskLibrary.connectedTagLibraryId} 
                  onValueChange={(value) => setNewTaskLibrary(prev => ({ ...prev, connectedTagLibraryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择要关联的标签库" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">不关联标签库</SelectItem>
                    {tagLibraries.map((library) => (
                      <SelectItem key={library.id} value={library.id}>
                        {library.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createTaskLibrary} className="w-full">
                创建
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {taskLibraries.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <List className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              还没有任务库<br />
              点击上方按钮创建您的第一个任务库
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {taskLibraries.map((taskLibrary) => {
            const connectedTagLibrary = getConnectedTagLibrary(taskLibrary);
            
            return (
              <Card key={taskLibrary.id} className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{taskLibrary.name}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* Edit functionality */}}
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
                      {taskLibrary.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  
                  {connectedTagLibrary ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">已关联标签库</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {connectedTagLibrary.name}
                      </Badge>
                      <Select
                        value={taskLibrary.connectedTagLibraryId || ""}
                        onValueChange={(value) => updateTaskLibraryConnection(taskLibrary.id, value || undefined)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">断开连接</SelectItem>
                          {tagLibraries.map((library) => (
                            <SelectItem key={library.id} value={library.id}>
                              {library.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">未关联标签库</span>
                      <Select
                        value=""
                        onValueChange={(value) => updateTaskLibraryConnection(taskLibrary.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="选择标签库关联" />
                        </SelectTrigger>
                        <SelectContent>
                          {tagLibraries.map((library) => (
                            <SelectItem key={library.id} value={library.id}>
                              {library.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskLibraryManager;
