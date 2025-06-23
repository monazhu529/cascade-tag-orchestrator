
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tag } from "@/types/permissions";
import { Download, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TagImportExportProps {
  tags: Tag[];
  onImport: (tags: Tag[]) => void;
  onClose: () => void;
}

const TagImportExport = ({ tags, onImport, onClose }: TagImportExportProps) => {
  const [importData, setImportData] = useState("");
  const [isImporting, setIsImporting] = useState(true);
  const { toast } = useToast();

  const handleExport = () => {
    const exportData = JSON.stringify(tags, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tags-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "成功",
      description: "标签导出成功",
    });
  };

  const handleImport = () => {
    try {
      const parsedData = JSON.parse(importData);
      
      if (!Array.isArray(parsedData)) {
        throw new Error("导入数据必须是数组格式");
      }
      
      const importedTags: Tag[] = parsedData.map((item, index) => {
        if (!item.key || !item.name || !item.value) {
          throw new Error(`第 ${index + 1} 行数据缺少必填字段`);
        }
        
        return {
          id: crypto.randomUUID(),
          key: item.key,
          name: item.name,
          value: item.value,
          status: item.status || "active",
          remark: item.remark || "",
          level: item.level || 1,
          parentId: item.parentId
        };
      });
      
      onImport(importedTags);
      onClose();
    } catch (error) {
      toast({
        title: "导入失败",
        description: error instanceof Error ? error.message : "数据格式不正确",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          标签导入导出
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant={isImporting ? "default" : "outline"}
            onClick={() => setIsImporting(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            导入
          </Button>
          <Button 
            variant={!isImporting ? "default" : "outline"}
            onClick={() => setIsImporting(false)}
          >
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
        </div>
        
        {isImporting ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-data">导入数据 (JSON格式)</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder={`[
  {
    "key": "tag_key",
    "name": "标签名称",
    "value": "标签值",
    "status": "active",
    "remark": "备注",
    "level": 1,
    "parentId": null
  }
]`}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <Button onClick={handleImport} disabled={!importData.trim()}>
              <Upload className="w-4 h-4 mr-2" />
              确认导入
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>当前标签库数据预览</Label>
              <Textarea
                value={JSON.stringify(tags, null, 2)}
                readOnly
                rows={10}
                className="font-mono text-sm bg-gray-50"
              />
            </div>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              下载导出文件
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TagImportExport;
