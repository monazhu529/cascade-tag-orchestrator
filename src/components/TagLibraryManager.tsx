
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { TagLibrary } from "@/pages/Index";
import TagManager from "@/components/TagManager";
import { useToast } from "@/hooks/use-toast";

interface TagLibraryManagerProps {
  tagLibraries: TagLibrary[];
  setTagLibraries: React.Dispatch<React.SetStateAction<TagLibrary[]>>;
}

const TagLibraryManager = ({ tagLibraries, setTagLibraries }: TagLibraryManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState<TagLibrary | null>(null);
  const [newLibrary, setNewLibrary] = useState({ name: "", description: "" });
  const { toast } = useToast();

  const createTagLibrary = () => {
    if (!newLibrary.name.trim()) {
      toast({
        title: "错误",
        description: "请输入标签库名称",
        variant: "destructive",
      });
      return;
    }

    const library: TagLibrary = {
      id: crypto.randomUUID(),
      name: newLibrary.name,
      description: newLibrary.description,
      tags: [],
      createdAt: new Date(),
    };

    setTagLibraries(prev => [...prev, library]);
    setNewLibrary({ name: "", description: "" });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "成功",
      description: "标签库创建成功",
    });
  };

  const deleteTagLibrary = (id: string) => {
    setTagLibraries(prev => prev.filter(lib => lib.id !== id));
    toast({
      title: "成功",
      description: "标签库删除成功",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">标签库列表</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              创建标签库
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新标签库</DialogTitle>
              <DialogDescription>
                创建一个新的标签库来组织您的标签
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">标签库名称</Label>
                <Input
                  id="name"
                  value={newLibrary.name}
                  onChange={(e) => setNewLibrary(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="输入标签库名称"
                />
              </div>
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={newLibrary.description}
                  onChange={(e) => setNewLibrary(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="输入标签库描述"
                  rows={3}
                />
              </div>
              <Button onClick={createTagLibrary} className="w-full">
                创建
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tagLibraries.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              还没有标签库<br />
              点击上方按钮创建您的第一个标签库
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tagLibraries.map((library) => (
            <Card key={library.id} className="hover:shadow-lg transition-shadow cursor-pointer bg-white/80 backdrop-blur-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{library.name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLibrary(library)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTagLibrary(library.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>{library.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {library.tags.length} 个标签
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {library.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedLibrary && (
        <TagManager 
          library={selectedLibrary}
          onUpdate={(updatedLibrary) => {
            setTagLibraries(prev => 
              prev.map(lib => lib.id === updatedLibrary.id ? updatedLibrary : lib)
            );
            setSelectedLibrary(updatedLibrary);
          }}
          onClose={() => setSelectedLibrary(null)}
        />
      )}
    </div>
  );
};

export default TagLibraryManager;
