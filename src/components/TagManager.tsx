
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, X, Check } from "lucide-react";
import { TagLibrary, Tag } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface TagManagerProps {
  library: TagLibrary;
  onUpdate: (library: TagLibrary) => void;
  onClose: () => void;
}

const TagManager = ({ library, onUpdate, onClose }: TagManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState({ 
    key: "", 
    name: "", 
    value: "",
    status: "active" as "active" | "inactive",
    remark: "",
    parentId: "" 
  });
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const [inlineCreateMode, setInlineCreateMode] = useState<string | null>(null);
  const [inlineTagData, setInlineTagData] = useState({ 
    key: "", 
    name: "", 
    value: "",
    status: "active" as "active" | "inactive",
    remark: ""
  });
  const { toast } = useToast();

  const createTag = (parentId?: string) => {
    const tagData = parentId ? inlineTagData : newTag;
    
    if (!tagData.key.trim() || !tagData.name.trim()) {
      toast({
        title: "错误",
        description: "请输入标签键和名称",
        variant: "destructive",
      });
      return;
    }

    const parentTag = parentId ? findTagById(library.tags, parentId) : 
                     (newTag.parentId ? findTagById(library.tags, newTag.parentId) : null);
    const level = parentTag ? parentTag.level + 1 : 1;

    // Generate tag value automatically if not provided
    const generatedValue = tagData.value.trim() || tagData.key.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const tag: Tag = {
      id: crypto.randomUUID(),
      key: tagData.key,
      name: tagData.name,
      value: generatedValue,
      status: tagData.status,
      remark: tagData.remark,
      level,
      parentId: parentId || newTag.parentId || undefined,
      children: [],
    };

    const updatedTags = [...library.tags, tag];
    const updatedLibrary = { ...library, tags: updatedTags };
    
    onUpdate(updatedLibrary);
    
    if (parentId) {
      setInlineCreateMode(null);
      setInlineTagData({ key: "", name: "", value: "", status: "active", remark: "" });
      // Expand parent to show new child
      setExpandedTags(prev => new Set([...prev, parentId]));
    } else {
      setNewTag({ key: "", name: "", value: "", status: "active", remark: "", parentId: "" });
      setIsCreateDialogOpen(false);
    }
    
    toast({
      title: "成功",
      description: "标签创建成功",
    });
  };

  const deleteTag = (tagId: string) => {
    const updatedTags = library.tags.filter(tag => tag.id !== tagId && tag.parentId !== tagId);
    const updatedLibrary = { ...library, tags: updatedTags };
    onUpdate(updatedLibrary);
    
    toast({
      title: "成功",
      description: "标签删除成功",
    });
  };

  const findTagById = (tags: Tag[], id: string): Tag | null => {
    return tags.find(tag => tag.id === id) || null;
  };

  const buildTagTree = (tags: Tag[]): Tag[] => {
    const tagMap = new Map<string, Tag>();
    const rootTags: Tag[] = [];

    // Create a map of all tags
    tags.forEach(tag => {
      tagMap.set(tag.id, { ...tag, children: [] });
    });

    // Build the tree structure
    tagMap.forEach(tag => {
      if (tag.parentId) {
        const parent = tagMap.get(tag.parentId);
        if (parent) {
          parent.children!.push(tag);
        }
      } else {
        rootTags.push(tag);
      }
    });

    return rootTags;
  };

  const toggleExpanded = (tagId: string) => {
    const newExpanded = new Set(expandedTags);
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId);
    } else {
      newExpanded.add(tagId);
    }
    setExpandedTags(newExpanded);
  };

  const startInlineCreate = (parentId: string) => {
    setInlineCreateMode(parentId);
    setInlineTagData({ key: "", name: "", value: "", status: "active", remark: "" });
    // Expand parent to show the inline form
    setExpandedTags(prev => new Set([...prev, parentId]));
  };

  const cancelInlineCreate = () => {
    setInlineCreateMode(null);
    setInlineTagData({ key: "", name: "", value: "", status: "active", remark: "" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    return status === "active" ? "有效" : "无效";
  };

  const renderInlineCreateForm = (parentId: string, depth: number) => {
    if (inlineCreateMode !== parentId) return null;

    return (
      <div 
        className="flex flex-col gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200"
        style={{ marginLeft: `${(depth + 1) * 20}px` }}
      >
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="标签键 (如: category_new)"
            value={inlineTagData.key}
            onChange={(e) => setInlineTagData(prev => ({ ...prev, key: e.target.value }))}
            className="h-8 text-sm"
          />
          <Input
            placeholder="标签名称"
            value={inlineTagData.name}
            onChange={(e) => setInlineTagData(prev => ({ ...prev, name: e.target.value }))}
            className="h-8 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="标签值 (可选，留空自动生成)"
            value={inlineTagData.value}
            onChange={(e) => setInlineTagData(prev => ({ ...prev, value: e.target.value }))}
            className="h-8 text-sm"
          />
          <Select value={inlineTagData.status} onValueChange={(value: "active" | "inactive") => setInlineTagData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">有效</SelectItem>
              <SelectItem value="inactive">无效</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="备注"
          value={inlineTagData.remark}
          onChange={(e) => setInlineTagData(prev => ({ ...prev, remark: e.target.value }))}
          className="h-8 text-sm"
        />
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => createTag(parentId)}
            className="h-8 w-8 p-0"
          >
            <Check className="w-4 h-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={cancelInlineCreate}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>
    );
  };

  const renderTag = (tag: Tag, depth: number = 0): React.ReactNode => {
    const hasChildren = tag.children && tag.children.length > 0;
    const isExpanded = expandedTags.has(tag.id);
    const canAddChild = tag.level < 3; // Max 3 levels

    return (
      <div key={tag.id} className="space-y-2">
        <div 
          className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto"
                onClick={() => toggleExpanded(tag.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            ) : (
              <div className="w-4 h-4" />
            )}
            
            <div className="flex-1 flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                Level {tag.level}
              </Badge>
              <Badge className={`text-xs ${getStatusColor(tag.status)}`}>
                {getStatusText(tag.status)}
              </Badge>
              <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">ID: {tag.id}</code>
              <code className="text-sm bg-gray-200 px-2 py-1 rounded">{tag.key}</code>
              <span className="font-medium">{tag.name}</span>
            </div>
            
            <div className="flex gap-1">
              {canAddChild && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startInlineCreate(tag.id)}
                  className="text-blue-600 hover:text-blue-700"
                  title="添加子标签"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTag(tag.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            <div><span className="font-medium">值:</span> {tag.value}</div>
            <div><span className="font-medium">备注:</span> {tag.remark || "无"}</div>
          </div>
        </div>
        
        {isExpanded && (
          <div>
            {hasChildren && tag.children!.map(child => renderTag(child, depth + 1))}
            {renderInlineCreateForm(tag.id, depth)}
          </div>
        )}
      </div>
    );
  };

  const tagTree = buildTagTree(library.tags);
  const flatTags = library.tags.filter(tag => !tag.parentId || tag.level < 3); // Max 3 levels

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>管理标签 - {library.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            管理此标签库中的标签，支持多层级结构。每个标签包含ID、名称、值、状态和备注信息。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">标签列表</h4>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                添加根标签
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新标签</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="key">标签键 (Key)</Label>
                      <Input
                        id="key"
                        value={newTag.key}
                        onChange={(e) => setNewTag(prev => ({ ...prev, key: e.target.value }))}
                        placeholder="例如: category_1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">标签名称</Label>
                      <Input
                        id="name"
                        value={newTag.name}
                        onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="例如: 分类一"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="value">标签值</Label>
                      <Input
                        id="value"
                        value={newTag.value}
                        onChange={(e) => setNewTag(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="可选，留空自动生成"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">状态</Label>
                      <Select value={newTag.status} onValueChange={(value: "active" | "inactive") => setNewTag(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">有效</SelectItem>
                          <SelectItem value="inactive">无效</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="remark">备注</Label>
                    <Textarea
                      id="remark"
                      value={newTag.remark}
                      onChange={(e) => setNewTag(prev => ({ ...prev, remark: e.target.value }))}
                      placeholder="标签备注信息"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent">父级标签 (可选)</Label>
                    <Select value={newTag.parentId} onValueChange={(value) => setNewTag(prev => ({ ...prev, parentId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择父级标签" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">无父级标签</SelectItem>
                        {flatTags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.id}>
                            {tag.name} (Level {tag.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => createTag()} className="w-full">
                    创建标签
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {library.tags.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-500 text-center">
                  此标签库还没有标签<br />
                  点击上方按钮添加第一个标签
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tagTree.map(tag => renderTag(tag))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  function deleteTag(tagId: string) {
    const updatedTags = library.tags.filter(tag => tag.id !== tagId && tag.parentId !== tagId);
    const updatedLibrary = { ...library, tags: updatedTags };
    onUpdate(updatedLibrary);
    
    toast({
      title: "成功",
      description: "标签删除成功",
    });
  }

  function findTagById(tags: Tag[], id: string): Tag | null {
    return tags.find(tag => tag.id === id) || null;
  }

  function buildTagTree(tags: Tag[]): Tag[] {
    const tagMap = new Map<string, Tag>();
    const rootTags: Tag[] = [];

    // Create a map of all tags
    tags.forEach(tag => {
      tagMap.set(tag.id, { ...tag, children: [] });
    });

    // Build the tree structure
    tagMap.forEach(tag => {
      if (tag.parentId) {
        const parent = tagMap.get(tag.parentId);
        if (parent) {
          parent.children!.push(tag);
        }
      } else {
        rootTags.push(tag);
      }
    });

    return rootTags;
  }

  function toggleExpanded(tagId: string) {
    const newExpanded = new Set(expandedTags);
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId);
    } else {
      newExpanded.add(tagId);
    }
    setExpandedTags(newExpanded);
  }

  function startInlineCreate(parentId: string) {
    setInlineCreateMode(parentId);
    setInlineTagData({ key: "", name: "", value: "", status: "active", remark: "" });
    // Expand parent to show the inline form
    setExpandedTags(prev => new Set([...prev, parentId]));
  }

  function cancelInlineCreate() {
    setInlineCreateMode(null);
    setInlineTagData({ key: "", name: "", value: "", status: "active", remark: "" });
  }
};

export default TagManager;
