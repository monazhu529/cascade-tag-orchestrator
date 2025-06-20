
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag } from "@/types/permissions";
import { Save, X } from "lucide-react";

interface TagFormProps {
  tag?: Tag | null;
  parentId?: string;
  allTags: Tag[];
  onSave: (tagData: Omit<Tag, "id">) => void;
  onCancel: () => void;
}

const TagForm = ({ tag, parentId, allTags, onSave, onCancel }: TagFormProps) => {
  const [formData, setFormData] = useState<Omit<Tag, "id">>({
    key: "",
    name: "",
    value: "",
    status: "active",
    remark: "",
    level: parentId ? 2 : 1,
    parentId: parentId
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tag) {
      setFormData({
        key: tag.key,
        name: tag.name,
        value: tag.value,
        status: tag.status,
        remark: tag.remark,
        level: tag.level,
        parentId: tag.parentId
      });
    } else if (parentId) {
      const parent = allTags.find(t => t.id === parentId);
      setFormData(prev => ({
        ...prev,
        level: parent ? parent.level + 1 : 2,
        parentId: parentId
      }));
    }
    setErrors({});
  }, [tag, parentId, allTags]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.key.trim()) {
      newErrors.key = "键不能为空";
    } else if (allTags.some(t => t.key === formData.key && (!tag || t.id !== tag.id))) {
      newErrors.key = "键已存在";
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "名称不能为空";
    }
    
    if (!formData.value.trim()) {
      newErrors.value = "值不能为空";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const getAvailableParents = () => {
    if (tag) {
      // When editing, exclude self and descendants
      const excludeIds = new Set([tag.id]);
      const addDescendants = (id: string) => {
        allTags.filter(t => t.parentId === id).forEach(child => {
          excludeIds.add(child.id);
          addDescendants(child.id);
        });
      };
      addDescendants(tag.id);
      
      return allTags.filter(t => !excludeIds.has(t.id) && t.level < 3);
    }
    return allTags.filter(t => t.level < 3);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {tag ? "编辑标签" : "添加新标签"}
          {parentId && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              (子标签)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="key">键 (Key) *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="tag_key"
                className={errors.key ? "border-red-500" : ""}
              />
              {errors.key && <p className="text-red-500 text-sm mt-1">{errors.key}</p>}
            </div>
            <div>
              <Label htmlFor="name">名称 (Name) *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="标签名称"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value">值 (Value) *</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="标签值"
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
            </div>
            <div>
              <Label htmlFor="status">状态</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "inactive" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">激活</SelectItem>
                  <SelectItem value="inactive">未激活</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="level">层级</Label>
              <Select 
                value={formData.level.toString()} 
                onValueChange={(value) => setFormData({ ...formData, level: parseInt(value) })}
                disabled={!!parentId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">一级</SelectItem>
                  <SelectItem value="2">二级</SelectItem>
                  <SelectItem value="3">三级</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="parent">父标签</Label>
              <Select 
                value={formData.parentId || ""} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  parentId: value || undefined,
                  level: value ? (allTags.find(t => t.id === value)?.level || 0) + 1 : 1
                })}
                disabled={!!parentId && !tag}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择父标签 (可选)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无父标签</SelectItem>
                  {getAvailableParents().map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name} ({parent.key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="remark">备注</Label>
            <Textarea
              id="remark"
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="标签备注信息"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TagForm;
