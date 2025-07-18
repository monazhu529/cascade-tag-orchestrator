
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Settings } from "lucide-react";
import { TaskLibrary } from "@/pages/Index";
import { TagLibrary, SyncConfig } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";
import UnifiedTagMapping from "./UnifiedTagMapping";

interface TaskFilterMappingProps {
  taskLibrary: TaskLibrary;
  connectedTagLibrary?: TagLibrary;
  currentUser: any;
}

const TaskFilterMapping = ({ taskLibrary, connectedTagLibrary }: TaskFilterMappingProps) => {
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    id: '1',
    taskLibraryId: taskLibrary.id,
    tagLibraryId: connectedTagLibrary?.id || '',
    syncLevels: {
      1: {
        enabled: true,
        fields: {
          key: true,
          name: true,
          value: false,
          status: true,
          remark: false,
          level: false
        }
      },
      2: {
        enabled: true,
        fields: {
          key: true,
          name: true,
          value: true,
          status: true,
          remark: false,
          level: false
        }
      },
      3: {
        enabled: false,
        fields: {
          key: false,
          name: false,
          value: false,
          status: false,
          remark: false,
          level: false
        }
      }
    },
    tagSyncSettings: {},
    autoSync: true,
    syncFrequency: 'daily',
    lastSyncTime: '2024-01-15 10:30:00'
  });

  const { toast } = useToast();

  const handleSyncNow = () => {
    toast({
      title: "同步已开始",
      description: "正在从标签库同步最新数据...",
    });
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

  if (!connectedTagLibrary) {
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
            配置标签库字段映射和同步设置
          </p>
        </div>
      </div>

      {/* 基本同步设置 */}
      <Card>
        <CardHeader>
          <CardTitle>基本设置</CardTitle>
          <CardDescription>
            配置从标签库"{connectedTagLibrary.name}"的同步规则
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {syncConfig.autoSync && (
            <div className="space-y-2">
              <Label>同步频率</Label>
              <Select 
                value={syncConfig.syncFrequency} 
                onValueChange={(value: 'realtime' | 'hourly' | 'daily' | 'weekly') => setSyncConfig(prev => ({...prev, syncFrequency: value}))}
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
              <p className="text-sm text-gray-500">{syncConfig.lastSyncTime}</p>
            </div>
            <Button onClick={handleSyncNow} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              立即同步
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 统一的标签映射和同步配置 */}
      <UnifiedTagMapping 
        tags={connectedTagLibrary.tags || []}
        syncConfig={syncConfig}
        onUpdateSyncConfig={setSyncConfig}
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
              {Object.values(syncConfig.tagSyncSettings || {}).filter((setting: any) => setting.enabled).length}
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
              {Object.values(syncConfig.tagSyncSettings || {}).reduce((total: number, setting: any) => {
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
              {connectedTagLibrary.tags?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskFilterMapping;
