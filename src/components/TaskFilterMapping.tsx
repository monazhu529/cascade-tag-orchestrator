
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Filter, Plus, Edit, Trash2, ArrowRight } from "lucide-react";
import { TaskLibrary } from "@/pages/Index";
import { TagLibrary } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";

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
            配置标签库标签到任务字段的映射关系
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          添加映射
        </Button>
      </div>

      {/* 映射统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">总映射数</span>
            </div>
            <p className="text-2xl font-bold mt-2">{mappings.length}</p>
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
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm font-medium">停用映射</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-500">
              {mappings.filter(m => !m.isActive).length}
            </p>
          </CardContent>
        </Card>
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
      </div>

      {mappings.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              还没有配置筛选映射<br />
              点击"添加映射"开始配置标签到字段的映射关系
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskFilterMapping;
