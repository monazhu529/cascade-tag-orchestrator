
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, X } from "lucide-react";
import { TagLibrary, Tag } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface TagManagerProps {
  library: TagLibrary;
  onUpdate: (library: TagLibrary) => void;
  onClose: () => void;
}

const TagManager = ({ library, onUpdate, onClose }: TagManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState({ key: "", name: "", parentId: "" });
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const createTag = () => {
    if (!newTag.key.trim() || !newTag.name.trim()) {
      toast({
        title: "错误",
        description: "请输入标签键和名称",
        variant: "destructive",
      });
      return;
    }

    const parentTag = newTag.parentId ? findTagById(library.tags, newTag.parentId) : null;
    const level = parentTag ? parentTag.level + 1 : 1;

    const tag: Tag = {
      id: crypto.randomUUID(),
      key: newTag.key,
      name: newTag.name,
      level,
      parentId: newTag.parentId || undefined,
      children: [],
    };

    const updatedTags = [...library.tags, tag];
    const updatedLibrary = { ...library, tags: updatedTags };
    
    onUpdate(updatedLibrary);
    setNewTag({ key: "", name: "", parentId: "" });
    setIsCreateDialogOpen(false);
    
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

  const renderTag = (tag: Tag, depth: number = 0): React.ReactNode => {
    const hasChildren = tag.children && tag.children.length > 0;
    const isExpanded = expandedTags.has(tag.id);

    return (
      <div key={tag.id} className="space-y-2">
        <div 
          className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          style={{ marginLeft: `${depth * 20}px` }}
        >
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
          
          <div className="flex-1 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Level {tag.level}
            </Badge>
            <code className="text-sm bg-gray-200 px-2 py-1 rounded">{tag.key}</code>
            <span className="font-medium">{tag.name}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTag(tag.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {tag.children!.map(child => renderTag(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const tagTree = buildTagTree(library.tags);
  const flatTags = library.tags.filter(tag => !tag.parentId || tag.level < 3); // Max 3 levels

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>管理标签 - {library.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            管理此标签库中的标签，支持多层级结构
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">标签列表</h4>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                添加标签
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新标签</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
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
                  <div>
                    <Label htmlFor="parent">父级标签 (可选)</Label>
                    <Select value={newTag.parentId} onValueChange={(value) => setNewTag(prev => ({ ...prev, parentId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择父级标签" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">无父级标签</SelectItem>
                        {flatTags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.id}>
                            {tag.name} (Level {tag.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createTag} className="w-full">
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
};

export default TagManager;
