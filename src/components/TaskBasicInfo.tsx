
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Save, Settings, Zap, Clock, Users } from "lucide-react";
import { TaskLibrary } from "@/pages/Index";
import { TagLibrary, User } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";

interface TaskBasicInfoProps {
  taskLibrary: TaskLibrary;
  setTaskLibraries: React.Dispatch<React.SetStateAction<TaskLibrary[]>>;
  tagLibraries: TagLibrary[];
  connectedTagLibrary?: TagLibrary;
  currentUser: User;
}

const TaskBasicInfo = ({ 
  taskLibrary, 
  setTaskLibraries, 
  tagLibraries, 
  connectedTagLibrary, 
  currentUser 
}: TaskBasicInfoProps) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: taskLibrary.name,
    description: taskLibrary.description,
    autoSync: true,
    syncLevel: 'full' as 'full' | 'level1' | 'level2' | 'level3',
    approvers: ['admin-1', 'admin-2'],
    version: '1.0.0'
  });
  
  const { toast } = useToast();

  const handleSave = () => {
    setTaskLibraries(prev => prev.map(lib => 
      lib.id === taskLibrary.id 
        ? { ...lib, name: formData.name, description: formData.description }
        : lib
    ));
    setEditMode(false);
    toast({
      title: "保存成功",
      description: "任务库基础信息已更新",
    });
  };

  const handleSync = () => {
    toast({
      title: "同步成功",
      description: `已与${connectedTagLibrary?.name}同步完成`,
    });
  };

  const getSyncLevelText = (level: string) => {
    switch (level) {
      case 'full': return '完整同步';
      case 'level1': return '一级标签';
      case 'level2': return '二级标签';
      case 'level3': return '三级标签';
      default: return '完整同步';
    }
  };

  return (
    <div className="space-y-6">
      {/* 基础信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              基础信息
            </span>
            <Button
              variant={editMode ? "default" : "outline"}
              size="sm"
              onClick={() => editMode ? handleSave() : setEditMode(true)}
            >
              {editMode ? <Save className="w-4 h-4 mr-2" /> : null}
              {editMode ? "保存" : "编辑"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">任务库名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!editMode}
              />
            </div>
            <div>
              <Label htmlFor="version">版本号</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                disabled={!editMode}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={!editMode}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>创建时间</Label>
              <p className="text-sm text-gray-600 mt-1">
                {taskLibrary.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label>创建者</Label>
              <p className="text-sm text-gray-600 mt-1">
                {taskLibrary.createdBy === currentUser.id ? currentUser.name : '其他用户'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 同步配置 */}
      {connectedTagLibrary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              同步配置
            </CardTitle>
            <CardDescription>
              配置与标签库 {connectedTagLibrary.name} 的同步策略
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>自动同步</Label>
                <p className="text-sm text-gray-600">启用后将自动与标签库保持同步</p>
              </div>
              <Switch
                checked={formData.autoSync}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSync: checked }))}
              />
            </div>

            <Separator />

            <div>
              <Label>同步级别</Label>
              <Select 
                value={formData.syncLevel} 
                onValueChange={(value: 'full' | 'level1' | 'level2' | 'level3') => 
                  setFormData(prev => ({ ...prev, syncLevel: value }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">完整同步 - 同步所有标签</SelectItem>
                  <SelectItem value="level1">一级标签 - 仅同步顶级标签</SelectItem>
                  <SelectItem value="level2">二级标签 - 同步到二级标签</SelectItem>
                  <SelectItem value="level3">三级标签 - 同步到三级标签</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Zap className="w-3 h-3" />
                当前: {getSyncLevelText(formData.syncLevel)}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleSync}>
                <RefreshCw className="w-4 h-4 mr-2" />
                立即同步
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">同步统计</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">标签总数:</span>
                  <span className="ml-2 font-medium">{connectedTagLibrary.tags.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">已映射:</span>
                  <span className="ml-2 font-medium">{Object.keys(taskLibrary.tagMappings).length}</span>
                </div>
                <div>
                  <span className="text-gray-600">上次同步:</span>
                  <span className="ml-2 font-medium">{taskLibrary.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 审批管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            审批管理
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>审批人员</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.approvers.map((approverId) => (
                <Badge key={approverId} variant="outline">
                  {approverId}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <Label>版本发布</Label>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                当前版本: {formData.version}
              </Badge>
              <Button variant="outline" size="sm">
                发布新版本
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskBasicInfo;
