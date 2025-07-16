
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Plus, Edit, Trash2, ArrowRight, RotateCcw, Settings } from "lucide-react";
import { TaskLibrary } from "@/pages/Index";
import { TagLibrary } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";
import TagFieldMapping, { FieldMapping } from "./TagFieldMapping";

interface TaskFilterMappingProps {
  taskLibrary: TaskLibrary;
  connectedTagLibrary?: TagLibrary;
  currentUser: any;
}

const TaskFilterMapping = ({ taskLibrary, connectedTagLibrary }: TaskFilterMappingProps) => {
  const [mappings, setMappings] = useState([
    {
      id: '1',
      sourceTagId: '1010001',
      sourceTagName: '电子产品',
      targetField: 'category',
      mappingRule: 'electronics',
      isActive: true
    },
    {
      id: '2',
      sourceTagId: '1010004',
      sourceTagName: '服装',
      targetField: 'category',
      mappingRule: 'clothing',
      isActive: true
    }
  ]);

  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [syncConfig, setSyncConfig] = useState({
    autoSync: true,
    syncFrequency: 'daily',
    selectedLevels: [1, 2, 3] as number[],
    lastSyncTime: '2024-01-15 10:30:00'
  });

  const { toast } = useToast();

  const toggleMapping = (id: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.id === id 
        ? { ...mapping, isActive: !mapping.isActive }
        : mapping
    ));
    toast({
      title: "映射状态已更新",
      description: "筛选映射配置已保存",
    });
  };

  const deleteMapping = (id: string) => {
    setMappings(prev => prev.filter(mapping => mapping.id !== id));
    toast({
      title: "映射删除成功",
      description: "筛选映射已从配置中移除",
    });
  };

  const handleSyncNow = () => {
    toast({
      title: "同步已开始",
      description: "正在从标签库同步最新数据...",
    });
    // 这里会实际执行同步逻辑
    setTimeout(() => {
      setSyncConfig(prev => ({
        ...prev,
        lastSyncTime: new Date().toLocaleString('zh-CN')
      }));
      toast({
        title: "同步完成",
        description: "已成功同步标签库数据",
      });
    }, 2000);
  };

  const toggleSyncLevel = (level: number) => {
    setSyncConfig(prev => ({
      ...prev,
      selectedLevels: prev.selectedLevels.includes(level)
        ? prev.selectedLevels.filter(l => l !== level)
        : [...prev.selectedLevels, level]
    }));
  };

  if (!connectedTagLibrary) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Filter className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center">
            尚未关联标签库<br />
            请先在基础信息中关联标签库以配置筛选映射
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">筛选映射配置</h3>
          <p className="text-sm text-gray-500">
            配置标签库标签到任务字段的映射关系和同步设置
          </p>
        </div>
      </div>

      <Tabs defaultValue="sync" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            同步配置
          </TabsTrigger>
          <TabsTrigger value="mapping" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            标签映射
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            字段映射
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="space-y-6">
          {/* 同步配置 */}
          <Card>
            <CardHeader>
              <CardTitle>同步设置</CardTitle>
              <CardDescription>
                配置从标签库"{connectedTagLibrary.name}"的同步规则
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 自动同步开关 */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">自动同步</Label>
                  <p className="text-sm text-gray-500">启用后将根据设定频率自动同步标签库数据</p>
                </div>
                <Switch 
                  checked={syncConfig.autoSync}
                  onCheckedChange={(checked) => setSyncConfig(prev => ({...prev, autoSync: checked}))}
                />
              </div>

              {/* 同步频率 */}
              {syncConfig.autoSync && (
                <div className="space-y-2">
                  <Label>同步频率</Label>
                  <Select 
                    value={syncConfig.syncFrequency} 
                    onValueChange={(value) => setSyncConfig(prev => ({...prev, syncFrequency: value}))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">实时同步</SelectItem>
                      <SelectItem value="hourly">每小时</SelectItem>
                      <SelectItem value="daily">每日</SelectItem>
                      <SelectItem value="weekly">每周</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 同步级别选择 */}
              <div className="space-y-3">
                <Label>同步级别</Label>
                <p className="text-sm text-gray-500">选择要同步的标签层级</p>
                <div className="flex gap-4">
                  {[1, 2, 3].map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={syncConfig.selectedLevels.includes(level)}
                        onChange={() => toggleSyncLevel(level)}
                        className="rounded"
                      />
                      <span className="text-sm">第{level}级标签</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 手动同步 */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm font-medium">上次同步时间</p>
                  <p className="text-sm text-gray-500">{syncConfig.lastSyncTime}</p>
                </div>
                <Button onClick={handleSyncNow} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  立即同步
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 同步统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">已同步标签</span>
                </div>
                <p className="text-2xl font-bold mt-2">{connectedTagLibrary.tags?.length || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">活跃映射</span>
                </div>
                <p className="text-2xl font-bold mt-2 text-green-600">
                  {mappings.filter(m => m.isActive).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium">字段映射</span>
                </div>
                <p className="text-2xl font-bold mt-2 text-orange-600">
                  {fieldMappings.length}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          {/* 标签映射配置 */}
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-medium">标签映射</h4>
              <p className="text-sm text-gray-500">配置标签到任务字段的映射关系</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              添加映射
            </Button>
          </div>

          {/* 映射列表 */}
          <div className="space-y-4">
            {mappings.map((mapping) => (
              <Card key={mapping.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {mapping.sourceTagName}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div className="text-sm">
                          <span className="text-gray-600">字段:</span>
                          <span className="ml-1 font-medium">{mapping.targetField}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div className="text-sm">
                          <span className="text-gray-600">值:</span>
                          <span className="ml-1 font-medium">{mapping.mappingRule}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={mapping.isActive}
                        onCheckedChange={() => toggleMapping(mapping.id)}
                      />
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteMapping(mapping.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {mappings.length === 0 && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Filter className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-center">
                    还没有配置标签映射<br />
                    点击"添加映射"开始配置标签到字段的映射关系
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="fields" className="space-y-6">
          {/* 字段映射 */}
          <TagFieldMapping 
            tags={connectedTagLibrary.tags || []}
            mappings={fieldMappings}
            onUpdateMappings={setFieldMappings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskFilterMapping;
