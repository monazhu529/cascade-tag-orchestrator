
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { TaskLibrary, TagLibrary } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface SyncManagerProps {
  tagLibraries: TagLibrary[];
  taskLibraries: TaskLibrary[];
  setTaskLibraries: React.Dispatch<React.SetStateAction<TaskLibrary[]>>;
}

const SyncManager = ({ tagLibraries, taskLibraries, setTaskLibraries }: SyncManagerProps) => {
  const [selectedTaskLibrary, setSelectedTaskLibrary] = useState<string>("none");
  const { toast } = useToast();

  const handleSync = (taskLibraryId: string) => {
    const taskLibrary = taskLibraries.find(lib => lib.id === taskLibraryId);
    const tagLibrary = tagLibraries.find(lib => lib.id === taskLibrary?.connectedTagLibraryId);
    
    if (!taskLibrary || !tagLibrary) {
      toast({
        title: "错误",
        description: "找不到对应的任务库或标签库",
        variant: "destructive",
      });
      return;
    }

    // 模拟同步过程
    toast({
      title: "同步成功",
      description: `${taskLibrary.name} 与 ${tagLibrary.name} 同步完成`,
    });
  };

  const connectedTaskLibraries = taskLibraries.filter(lib => lib.connectedTagLibraryId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">同步映射管理</h3>
        <Select value={selectedTaskLibrary} onValueChange={setSelectedTaskLibrary}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="选择任务库查看映射" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">选择任务库</SelectItem>
            {connectedTaskLibraries.map((library) => (
              <SelectItem key={library.id} value={library.id}>
                {library.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {connectedTaskLibraries.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              还没有已连接的任务库<br />
              请先在任务库管理中关联标签库
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {connectedTaskLibraries.map((taskLibrary) => {
            const connectedTagLibrary = tagLibraries.find(lib => lib.id === taskLibrary.connectedTagLibraryId);
            
            return (
              <Card key={taskLibrary.id} className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{taskLibrary.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(taskLibrary.id)}
                      className="bg-green-50 border-green-200 hover:bg-green-100"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      同步
                    </Button>
                  </CardTitle>
                  <CardDescription>{taskLibrary.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {taskLibrary.name}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {connectedTagLibrary?.name}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">映射状态: 已连接</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      上次同步: {taskLibrary.createdAt.toLocaleDateString()}
                    </div>
                  </div>

                  {selectedTaskLibrary === taskLibrary.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">映射详情</h4>
                      <div className="space-y-2">
                        {connectedTagLibrary?.tags.slice(0, 3).map((tag) => (
                          <div key={tag.id} className="flex justify-between text-sm">
                            <span>{tag.name}</span>
                            <span className="text-gray-500">→ {tag.key}</span>
                          </div>
                        )) || <span className="text-sm text-gray-500">暂无映射数据</span>}
                      </div>
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

export default SyncManager;
