
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskLibrary } from "@/pages/Index";
import { TagLibrary } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";
import { Save, Settings, X, Edit, Check } from "lucide-react";

interface ExtendedTaskLibrary extends TaskLibrary {
  type?: string;
  isPublic?: boolean;
  totalTasks?: number;
  activeTasks?: number;
  userCount?: number;
}

interface TaskBasicInfoProps {
  taskLibrary: ExtendedTaskLibrary;
  setTaskLibraries: React.Dispatch<React.SetStateAction<TaskLibrary[]>>;
  tagLibraries: TagLibrary[];
  connectedTagLibraries: TagLibrary[];
  currentUser: any;
}

const TaskBasicInfo = ({ 
  taskLibrary, 
  setTaskLibraries, 
  tagLibraries, 
  connectedTagLibraries 
}: TaskBasicInfoProps) => {
  const [editedLibrary, setEditedLibrary] = useState<ExtendedTaskLibrary>(taskLibrary);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTagLibrary, setIsEditingTagLibrary] = useState(false);
  const [pendingTagLibraryIds, setPendingTagLibraryIds] = useState<string[]>(taskLibrary.connectedTagLibraryIds);
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

  const handleTagLibraryToggle = (tagLibraryId: string, checked: boolean) => {
    setPendingTagLibraryIds(prev => 
      checked 
        ? [...prev, tagLibraryId]
        : prev.filter(id => id !== tagLibraryId)
    );
  };

  const handleRemoveConnectedTagLibrary = (tagLibraryId: string) => {
    setPendingTagLibraryIds(prev => prev.filter(id => id !== tagLibraryId));
  };

  const handleStartEditTagLibrary = () => {
    setPendingTagLibraryIds(editedLibrary.connectedTagLibraryIds);
    setIsEditingTagLibrary(true);
  };

  const handleCancelEditTagLibrary = () => {
    setPendingTagLibraryIds(editedLibrary.connectedTagLibraryIds);
    setIsEditingTagLibrary(false);
  };

  const handleSaveTagLibrary = () => {
    const updatedLibrary = {
      ...editedLibrary,
      connectedTagLibraryIds: pendingTagLibraryIds
    };
    setEditedLibrary(updatedLibrary);
    setTaskLibraries(prev => 
      prev.map(lib => lib.id === updatedLibrary.id ? updatedLibrary : lib)
    );
    setIsEditingTagLibrary(false);
    toast({
      title: "保存成功",
      description: "标签库关联已更新",
    });
  };

  const togglePublicAccess = () => {
    const updatedLibrary = {
      ...editedLibrary,
      isPublic: !editedLibrary.isPublic
    };
    setEditedLibrary(updatedLibrary);
  };

  // 获取当前显示的关联标签库
  const displayedConnectedTagLibraries = isEditingTagLibrary
    ? tagLibraries.filter(lib => pendingTagLibraryIds.includes(lib.id))
    : connectedTagLibraries;

  const hasTagLibraryChanges = JSON.stringify(pendingTagLibraryIds.sort()) !== 
    JSON.stringify(editedLibrary.connectedTagLibraryIds.sort());

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
                value={editedLibrary.type || "standard"} 
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
              checked={editedLibrary.isPublic || false}
              onCheckedChange={togglePublicAccess}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* 多标签库关联管理 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>标签库关联</CardTitle>
              <CardDescription>
                可以关联多个标签库以启用更丰富的标签筛选和分类功能
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isEditingTagLibrary ? (
                <>
                  <Button onClick={handleSaveTagLibrary} disabled={!hasTagLibraryChanges}>
                    <Check className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                  <Button variant="outline" onClick={handleCancelEditTagLibrary}>
                    取消
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleStartEditTagLibrary}>
                  <Edit className="w-4 h-4 mr-2" />
                  编辑关联
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayedConnectedTagLibraries.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800">
                  已关联 {displayedConnectedTagLibraries.length} 个标签库
                  {isEditingTagLibrary && hasTagLibraryChanges && (
                    <Badge variant="outline" className="ml-2 text-amber-600 border-amber-300">
                      未保存
                    </Badge>
                  )}
                </span>
              </div>
              
              <div className="grid gap-3">
                {displayedConnectedTagLibraries.map((tagLibrary) => (
                  <div key={tagLibrary.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-green-800">{tagLibrary.name}</p>
                        <p className="text-sm text-green-600">
                          {tagLibrary.tags?.length || 0} 个标签 • 创建于 {tagLibrary.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {isEditingTagLibrary && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveConnectedTagLibrary(tagLibrary.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>尚未关联标签库</p>
              <p className="text-sm">点击"编辑关联"选择标签库进行关联</p>
            </div>
          )}
          
          {isEditingTagLibrary && (
            <div className="space-y-2 pt-4 border-t">
              <Label>可用标签库</Label>
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {tagLibraries.map((tagLib) => (
                  <div 
                    key={tagLib.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`taglib-${tagLib.id}`}
                        checked={pendingTagLibraryIds.includes(tagLib.id)}
                        onCheckedChange={(checked) => 
                          handleTagLibraryToggle(tagLib.id, checked as boolean)
                        }
                      />
                      <div>
                        <Label htmlFor={`taglib-${tagLib.id}`} className="font-medium cursor-pointer">
                          {tagLib.name}
                        </Label>
                        <p className="text-sm text-gray-500">
                          {tagLib.tags?.length || 0} 个标签 • 创建于 {tagLib.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={pendingTagLibraryIds.includes(tagLib.id) ? "default" : "secondary"}>
                      {pendingTagLibraryIds.includes(tagLib.id) ? "已关联" : "未关联"}
                    </Badge>
                  </div>
                ))}
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
              <span className="text-sm font-medium">关联标签库</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-purple-600">{connectedTagLibraries.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskBasicInfo;
