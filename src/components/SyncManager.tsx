import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { TaskLibrary, TagLibrary, Tag } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface SyncManagerProps {
  tagLibraries: TagLibrary[];
  taskLibraries: TaskLibrary[];
  setTaskLibraries: React.Dispatch<React.SetStateAction<TaskLibrary[]>>;
}

const SyncManager = ({ tagLibraries, taskLibraries, setTaskLibraries }: SyncManagerProps) => {
  const [selectedTaskLibrary, setSelectedTaskLibrary] = useState<string>("");
  const [selectedTagLibrary, setSelectedTagLibrary] = useState<string>("");
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const taskLibrary = taskLibraries.find(lib => lib.id === selectedTaskLibrary);
  const tagLibrary = tagLibraries.find(lib => lib.id === selectedTagLibrary);

  const getFlatTags = (tags: Tag[]): Tag[] => {
    return tags;
  };

  const performSync = async () => {
    if (!taskLibrary || !tagLibrary) {
      toast({
        title: "错误",
        description: "请选择任务库和标签库",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    // Simulate sync progress
    const tags = getFlatTags(tagLibrary.tags);
    const totalTags = tags.length;

    for (let i = 0; i <= totalTags; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSyncProgress((i / totalTags) * 100);
    }

    // Create tag mappings
    const tagMappings: Record<string, string> = {};
    tags.forEach(tag => {
      tagMappings[tag.id] = tag.key;
    });

    // Update task library
    setTaskLibraries(prev =>
      prev.map(lib =>
        lib.id === taskLibrary.id
          ? {
              ...lib,
              connectedTagLibraryId: tagLibrary.id,
              tagMappings,
            }
          : lib
      )
    );

    setIsSyncing(false);
    setSyncProgress(0);

    toast({
      title: "同步完成",
      description: `成功同步了 ${totalTags} 个标签`,
    });
  };

  const getConnectedTagLibrary = (taskLib: TaskLibrary) => {
    return taskLib.connectedTagLibraryId 
      ? tagLibraries.find(lib => lib.id === taskLib.connectedTagLibraryId)
      : undefined;
  };

  const getSyncStatus = (taskLib: TaskLibrary) => {
    const connectedTagLib = getConnectedTagLibrary(taskLib);
    if (!connectedTagLib) return "未连接";
    
    const mappingCount = Object.keys(taskLib.tagMappings).length;
    const tagCount = connectedTagLib.tags.length;
    
    if (mappingCount === 0) return "未同步";
    if (mappingCount === tagCount) return "已同步";
    return "部分同步";
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case "已同步": return "bg-green-100 text-green-800";
      case "部分同步": return "bg-yellow-100 text-yellow-800";
      case "未同步": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            标签同步配置
          </CardTitle>
          <CardDescription>
            选择任务库和标签库进行同步配置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">选择任务库</label>
              <Select value={selectedTaskLibrary} onValueChange={setSelectedTaskLibrary}>
                <SelectTrigger>
                  <SelectValue placeholder="选择任务库" />
                </SelectTrigger>
                <SelectContent>
                  {taskLibraries.map((library) => (
                    <SelectItem key={library.id} value={library.id}>
                      {library.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">选择标签库</label>
              <Select value={selectedTagLibrary} onValueChange={setSelectedTagLibrary}>
                <SelectTrigger>
                  <SelectValue placeholder="选择标签库" />
                </SelectTrigger>
                <SelectContent>
                  {tagLibraries.map((library) => (
                    <SelectItem key={library.id} value={library.id}>
                      {library.name} ({library.tags.length} 个标签)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {taskLibrary && tagLibrary && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4 p-4 bg-white rounded-lg border">
                <div className="text-center">
                  <div className="font-medium">{taskLibrary.name}</div>
                  <div className="text-sm text-gray-500">任务库</div>
                </div>
                <ArrowRight className="w-6 h-6 text-blue-600" />
                <div className="text-center">
                  <div className="font-medium">{tagLibrary.name}</div>
                  <div className="text-sm text-gray-500">标签库 ({tagLibrary.tags.length} 个标签)</div>
                </div>
              </div>

              {isSyncing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>同步进度</span>
                    <span>{Math.round(syncProgress)}%</span>
                  </div>
                  <Progress value={syncProgress} className="w-full" />
                </div>
              )}

              <Button 
                onClick={performSync} 
                disabled={isSyncing}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    同步中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    开始同步
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>同步状态概览</CardTitle>
          <CardDescription>查看所有任务库的同步状态</CardDescription>
        </CardHeader>
        <CardContent>
          {taskLibraries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">还没有任务库</p>
          ) : (
            <div className="space-y-3">
              {taskLibraries.map((taskLib) => {
                const connectedTagLib = getConnectedTagLibrary(taskLib);
                const status = getSyncStatus(taskLib);
                const mappingCount = Object.keys(taskLib.tagMappings).length;

                return (
                  <div key={taskLib.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{taskLib.name}</h4>
                      <p className="text-sm text-gray-500">
                        {connectedTagLib ? (
                          <>关联到: {connectedTagLib.name}</>
                        ) : (
                          <>未关联标签库</>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {connectedTagLib && mappingCount > 0 && (
                        <span className="text-sm text-gray-600">
                          {mappingCount}/{connectedTagLib.tags.length} 个标签已映射
                        </span>
                      )}
                      
                      <Badge className={getSyncStatusColor(status)}>
                        {status === "已同步" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {status === "未同步" && <AlertCircle className="w-3 h-3 mr-1" />}
                        {status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncManager;
