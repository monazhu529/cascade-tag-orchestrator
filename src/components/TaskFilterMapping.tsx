
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Settings } from "lucide-react";
import { TaskLibrary } from "@/pages/Index";
import { TagLibrary, SyncConfig } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";
import UnifiedTagMapping from "./UnifiedTagMapping";

interface TaskFilterMappingProps {
  taskLibrary: TaskLibrary;
  connectedTagLibraries: TagLibrary[];
  currentUser: any;
}

const TaskFilterMapping = ({ taskLibrary, connectedTagLibraries }: TaskFilterMappingProps) => {
  const [syncConfigs, setSyncConfigs] = useState<{ [tagLibraryId: string]: SyncConfig }>({});
  const [activeTagLibrary, setActiveTagLibrary] = useState<string>(
    connectedTagLibraries[0]?.id || ""
  );

  const { toast } = useToast();

  const handleSyncNow = (tagLibraryId: string) => {
    const tagLibrary = connectedTagLibraries.find(lib => lib.id === tagLibraryId);
    if (!tagLibrary) return;

    toast({
      title: "同步已开始",
      description: `正在从标签库"${tagLibrary.name}"同步最新数据...`,
    });
    
    setTimeout(() => {
      setSyncConfigs(prev => ({
        ...prev,
        [tagLibraryId]: {
          ...prev[tagLibraryId],
          lastSyncTime: new Date().toLocaleString('zh-CN')
        }
      }));
      toast({
        title: "同步完成",
        description: `已成功同步标签库"${tagLibrary.name}"数据`,
      });
    }, 2000);
  };

  const handleSyncAllNow = () => {
    toast({
      title: "批量同步已开始",
      description: `正在同步所有 ${connectedTagLibraries.length} 个标签库...`,
    });
    
    setTimeout(() => {
      const newConfigs = { ...syncConfigs };
      connectedTagLibraries.forEach(lib => {
        newConfigs[lib.id] = {
          ...newConfigs[lib.id],
          lastSyncTime: new Date().toLocaleString('zh-CN')
        };
      });
      setSyncConfigs(newConfigs);
      toast({
        title: "批量同步完成",
        description: "所有标签库数据已成功同步",
      });
    }, 3000);
  };

  const getCurrentSyncConfig = (tagLibraryId: string): SyncConfig => {
    return syncConfigs[tagLibraryId] || {
      id: `sync-${tagLibraryId}`,
      taskLibraryId: taskLibrary.id,
      tagLibraryId: tagLibraryId,
      syncLevels: {
        1: { enabled: true, fields: { key: true, name: true, value: false, status: true, remark: false, level: false } },
        2: { enabled: true, fields: { key: true, name: true, value: true, status: true, remark: false, level: false } },
        3: { enabled: false, fields: { key: false, name: false, value: false, status: false, remark: false, level: false } }
      },
      tagSyncSettings: {},
      autoSync: true,
      syncFrequency: 'daily',
      lastSyncTime: '2024-01-15 10:30:00'
    };
  };

  const updateSyncConfig = (tagLibraryId: string, config: SyncConfig) => {
    setSyncConfigs(prev => ({
      ...prev,
      [tagLibraryId]: config
    }));
  };

  if (connectedTagLibraries.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="w-12 h-12 text-gray-400 mb-4" />
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
            管理 {connectedTagLibraries.length} 个标签库的字段映射和同步设置
          </p>
        </div>
        <Button onClick={handleSyncAllNow} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <RotateCcw className="w-4 h-4 mr-2" />
          同步所有标签库
        </Button>
      </div>

      {/* 多标签库切换 */}
      <Card>
        <CardHeader>
          <CardTitle>标签库选择</CardTitle>
          <CardDescription>
            选择要配置的标签库进行映射和同步设置
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTagLibrary} onValueChange={setActiveTagLibrary}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {connectedTagLibraries.map((tagLibrary) => (
                <TabsTrigger key={tagLibrary.id} value={tagLibrary.id} className="text-xs">
                  {tagLibrary.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {connectedTagLibraries.map((tagLibrary) => (
              <TabsContent key={tagLibrary.id} value={tagLibrary.id} className="space-y-4">
                {/* 基本同步设置 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>基本设置</span>
                      <Badge variant="outline">{tagLibrary.name}</Badge>
                    </CardTitle>
                    <CardDescription>
                      配置从标签库"{tagLibrary.name}"的同步规则
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">自动同步</Label>
                        <p className="text-sm text-gray-500">启用后将根据设定频率自动同步标签库数据</p>
                      </div>
                      <Switch 
                        checked={getCurrentSyncConfig(tagLibrary.id).autoSync}
                        onCheckedChange={(checked) => {
                          const config = getCurrentSyncConfig(tagLibrary.id);
                          updateSyncConfig(tagLibrary.id, { ...config, autoSync: checked });
                        }}
                      />
                    </div>

                    {getCurrentSyncConfig(tagLibrary.id).autoSync && (
                      <div className="space-y-2">
                        <Label>同步频率</Label>
                        <Select 
                          value={getCurrentSyncConfig(tagLibrary.id).syncFrequency} 
                          onValueChange={(value: 'realtime' | 'hourly' | 'daily' | 'weekly') => {
                            const config = getCurrentSyncConfig(tagLibrary.id);
                            updateSyncConfig(tagLibrary.id, { ...config, syncFrequency: value });
                          }}
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

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm font-medium">上次同步时间</p>
                        <p className="text-sm text-gray-500">
                          {getCurrentSyncConfig(tagLibrary.id).lastSyncTime}
                        </p>
                      </div>
                      <Button onClick={() => handleSyncNow(tagLibrary.id)} variant="outline">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        立即同步
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 统一的标签映射和同步配置 */}
                <UnifiedTagMapping 
                  tags={tagLibrary.tags || []}
                  syncConfig={getCurrentSyncConfig(tagLibrary.id)}
                  onUpdateSyncConfig={(config) => updateSyncConfig(tagLibrary.id, config)}
                />

                {/* 同步统计 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">启用同步</span>
                      </div>
                      <p className="text-2xl font-bold mt-2">
                        {Object.values(getCurrentSyncConfig(tagLibrary.id).tagSyncSettings || {}).filter((setting: any) => setting.enabled).length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">同步字段</span>
                      </div>
                      <p className="text-2xl font-bold mt-2 text-green-600">
                        {Object.values(getCurrentSyncConfig(tagLibrary.id).tagSyncSettings || {}).reduce((total: number, setting: any) => {
                          return total + (setting.enabled ? Object.values(setting.fields).filter(Boolean).length : 0);
                        }, 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium">总标签数</span>
                      </div>
                      <p className="text-2xl font-bold mt-2 text-orange-600">
                        {tagLibrary.tags?.length || 0}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskFilterMapping;
