
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { TaskLibrary } from "@/pages/Index";
import { TagLibrary } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";
import { Save, Link, Unlink, Settings } from "lucide-react";

interface TaskBasicInfoProps {
  taskLibrary: TaskLibrary;
  setTaskLibraries: React.Dispatch<React.SetStateAction<TaskLibrary[]>>;
  tagLibraries: TagLibrary[];
  connectedTagLibrary?: TagLibrary;
  currentUser: any;
}

const TaskBasicInfo = ({ 
  taskLibrary, 
  setTaskLibraries, 
  tagLibraries, 
  connectedTagLibrary 
}: TaskBasicInfoProps) => {
  const [editedLibrary, setEditedLibrary] = useState(taskLibrary);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setTaskLibraries(prev => 
      prev.map(lib => lib.id === editedLibrary.id ? editedLibrary : lib)
    );
    setIsEditing(false);
    toast({
      title: "保存成功",
      description: "任务库信息已更新",
    });
  };

  const handleConnectTagLibrary = (tagLibraryId: string) => {
    const updatedLibrary = {
      ...editedLibrary,
      connectedTagLibraryId: tagLibraryId
    };
    setEditedLibrary(updatedLibrary);
    setTaskLibraries(prev => 
      prev.map(lib => lib.id === updatedLibrary.id ? updatedLibrary : lib)
    );
    toast({
      title: "关联成功",
      description: "标签库已成功关联",
    });
  };

  const handleDisconnectTagLibrary = () => {
    const updatedLibrary = {
      ...editedLibrary,
      connectedTagLibraryId: undefined
    };
    setEditedLibrary(updatedLibrary);
    setTaskLibraries(prev => 
      prev.map(lib => lib.id === updatedLibrary.id ? updatedLibrary : lib)
    );
    toast({
      title: "取消关联",
      description: "已取消与标签库的关联",
    });
  };

  const togglePublicAccess = () => {
    const updatedLibrary = {
      ...editedLibrary,
      isPublic: !editedLibrary.isPublic
    };
    setEditedLibrary(updatedLibrary);
  };

  return (
    <div className="space-y-6">
      {/* 基础信息编辑 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>基础信息</CardTitle>
              <CardDescription>管理任务库的基本配置信息</CardDescription>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    取消
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  编辑
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>任务库名称</Label>
              <Input
                value={editedLibrary.name}
                onChange={(e) => setEditedLibrary({...editedLibrary, name: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>类型</Label>
              <Select 
                value={editedLibrary.type} 
                onValueChange={(value) => setEditedLibrary({...editedLibrary, type: value})}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">标准任务库</SelectItem>
                  <SelectItem value="template">模板库</SelectItem>
                  <SelectItem value="archive">归档库</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>描述</Label>
            <Textarea
              value={editedLibrary.description}
              onChange={(e) => setEditedLibrary({...editedLibrary, description: e.target.value})}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">公开访问</Label>
              <p className="text-sm text-gray-500">允许其他用户查看此任务库</p>
            </div>
            <Switch 
              checked={editedLibrary.isPublic}
              onCheckedChange={togglePublicAccess}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* 标签库关联 */}
      <Card>
        <CardHeader>
          <CardTitle>标签库关联</CardTitle>
          <CardDescription>
            关联标签库以启用标签筛选和分类功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectedTagLibrary ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-green-800">{connectedTagLibrary.name}</p>
                  <p className="text-sm text-green-600">
                    已关联 • {connectedTagLibrary.tags?.length || 0} 个标签
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleDisconnectTagLibrary}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Unlink className="w-4 h-4 mr-2" />
                取消关联
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-6 text-gray-500">
                <p>尚未关联标签库</p>
                <p className="text-sm">选择一个标签库进行关联</p>
              </div>
              
              <div className="space-y-2">
                <Label>可用标签库</Label>
                <div className="grid gap-2">
                  {tagLibraries.map((tagLib) => (
                    <div 
                      key={tagLib.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{tagLib.name}</p>
                        <p className="text-sm text-gray-500">
                          {tagLib.tags?.length || 0} 个标签 • 创建于 {tagLib.createdAt}
                        </p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleConnectTagLibrary(tagLib.id)}
                      >
                        <Link className="w-4 h-4 mr-2" />
                        关联
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 库统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">总任务数</span>
            </div>
            <p className="text-2xl font-bold mt-2">{taskLibrary.totalTasks || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">活跃任务</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">{taskLibrary.activeTasks || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium">关联用户</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-purple-600">{taskLibrary.userCount || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskBasicInfo;
