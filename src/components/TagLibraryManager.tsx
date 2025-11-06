
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Tag, User, Hash, Lock, Users, Search } from "lucide-react";
import { TagLibrary } from "@/types/permissions";
import { User as UserType, LibraryPermission, PermissionRequest, ClientSubscription } from "@/types/permissions";
import PermissionRequestDialog from "@/components/PermissionRequestDialog";
import { useToast } from "@/hooks/use-toast";

interface TagLibraryManagerProps {
  tagLibraries: TagLibrary[];
  setTagLibraries: React.Dispatch<React.SetStateAction<TagLibrary[]>>;
  currentUser: UserType;
  permissions: LibraryPermission[];
  setPermissions: React.Dispatch<React.SetStateAction<LibraryPermission[]>>;
  permissionRequests: PermissionRequest[];
  setPermissionRequests: React.Dispatch<React.SetStateAction<PermissionRequest[]>>;
  clientSubscriptions?: ClientSubscription[];
}

const TagLibraryManager = ({ 
  tagLibraries, 
  setTagLibraries, 
  currentUser, 
  permissions, 
  setPermissions,
  permissionRequests,
  setPermissionRequests,
  clientSubscriptions = []
}: TagLibraryManagerProps) => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newLibrary, setNewLibrary] = useState({ name: "", description: "", administrator: "" });
  const [activeTab, setActiveTab] = useState("my-libraries");
  const [permissionDialogLibrary, setPermissionDialogLibrary] = useState<TagLibrary | null>(null);
  const [searchLibraryId, setSearchLibraryId] = useState("");
  const [searchLibraryName, setSearchLibraryName] = useState("");
  const [myLibSearchId, setMyLibSearchId] = useState("");
  const [myLibSearchName, setMyLibSearchName] = useState("");
  const { toast } = useToast();

  // 权限检查函数
  const getUserPermission = (libraryId: string): LibraryPermission | undefined => {
    return permissions.find(p => p.libraryId === libraryId && p.userId === currentUser.id);
  };

  const canEditLibrary = (library: TagLibrary): boolean => {
    const permission = getUserPermission(library.id);
    return permission?.role === "administrator" || permission?.role === "operator";
  };

  const canDeleteLibrary = (library: TagLibrary): boolean => {
    const permission = getUserPermission(library.id);
    return permission?.role === "administrator";
  };

  const canManageUsers = (library: TagLibrary): boolean => {
    const permission = getUserPermission(library.id);
    return permission?.role === "administrator";
  };

  // 获取我的库和全部库
  const getMyLibraries = (): TagLibrary[] => {
    let myLibraries = tagLibraries.filter(library => 
      permissions.some(p => p.libraryId === library.id && p.userId === currentUser.id)
    );

    // 按库ID过滤
    if (myLibSearchId.trim()) {
      myLibraries = myLibraries.filter(library =>
        library.libraryId.toLowerCase().includes(myLibSearchId.trim().toLowerCase())
      );
    }

    // 按库名称关键词过滤
    if (myLibSearchName.trim()) {
      myLibraries = myLibraries.filter(library =>
        library.name.toLowerCase().includes(myLibSearchName.trim().toLowerCase())
      );
    }

    return myLibraries;
  };

  const getAllLibraries = (): TagLibrary[] => {
    let filteredLibraries = tagLibraries;

    // 按库ID过滤
    if (searchLibraryId.trim()) {
      filteredLibraries = filteredLibraries.filter(library =>
        library.libraryId.toLowerCase().includes(searchLibraryId.trim().toLowerCase())
      );
    }

    // 按库名称关键词过滤
    if (searchLibraryName.trim()) {
      filteredLibraries = filteredLibraries.filter(library =>
        library.name.toLowerCase().includes(searchLibraryName.trim().toLowerCase())
      );
    }

    return filteredLibraries;
  };

  // 生成下一个可用的库ID
  const generateNextLibraryId = (): string => {
    const existingIds = tagLibraries.map(lib => parseInt(lib.libraryId)).filter(id => !isNaN(id));
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 100;
    return (maxId + 1).toString().padStart(3, '0');
  };

  const createTagLibrary = () => {
    if (!newLibrary.name.trim()) {
      toast({
        title: "错误",
        description: "请输入标签库名称",
        variant: "destructive",
      });
      return;
    }

    if (!newLibrary.administrator.trim()) {
      toast({
        title: "错误",
        description: "请输入管理员姓名",
        variant: "destructive",
      });
      return;
    }

    const library: TagLibrary = {
      id: crypto.randomUUID(),
      libraryId: generateNextLibraryId(),
      name: newLibrary.name,
      description: newLibrary.description,
      administrator: newLibrary.administrator,
      tags: [],
      createdAt: new Date(),
      versionManagementEnabled: false,
      versions: [],
    };

    // 自动为创建者添加管理员权限
    const newPermission: LibraryPermission = {
      userId: currentUser.id,
      libraryId: library.id,
      role: "administrator",
      grantedAt: new Date(),
      grantedBy: "system"
    };

    setTagLibraries(prev => [...prev, library]);
    setPermissions(prev => [...prev, newPermission]);
    setNewLibrary({ name: "", description: "", administrator: "" });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "成功",
      description: `标签库创建成功，库ID: ${library.libraryId}`,
    });
  };

  const deleteTagLibrary = (id: string) => {
    setTagLibraries(prev => prev.filter(lib => lib.id !== id));
    setPermissions(prev => prev.filter(p => p.libraryId !== id));
    toast({
      title: "成功",
      description: "标签库删除成功",
    });
  };

  const handleLibraryClick = (library: TagLibrary) => {
    const permission = getUserPermission(library.id);
    if (!permission) {
      setPermissionDialogLibrary(library);
      return;
    }
    // 通过 state 传递数据到编辑页面
    navigate(`/tag-library/${library.id}`, {
      state: {
        tagLibraries,
        currentUser,
        permissions,
        clientSubscriptions
      }
    });
  };

  const handlePermissionRequest = (request: PermissionRequest) => {
    setPermissionRequests(prev => [...prev, request]);
  };

  const getTagStatistics = (library: TagLibrary) => {
    const level1Tags = library.tags.filter(tag => tag.level === 1).length;
    const level2Tags = library.tags.filter(tag => tag.level === 2).length;
    return { level1Tags, level2Tags };
  };

  const displayLibraries = activeTab === "my-libraries" ? getMyLibraries() : getAllLibraries();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList>
            <TabsTrigger value="my-libraries" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              我的库
            </TabsTrigger>
            <TabsTrigger value="all-libraries" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              全部库
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
                <Label htmlFor="administrator">管理员</Label>
                <Input
                  id="administrator"
                  value={newLibrary.administrator}
                  onChange={(e) => setNewLibrary(prev => ({ ...prev, administrator: e.target.value }))}
                  placeholder="输入管理员姓名"
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

      {/* 搜索区域 - 在两个标签页都显示 */}
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="w-5 h-5 text-blue-600" />
            搜索标签库
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={activeTab === "my-libraries" ? "my-search-library-id" : "search-library-id"}>库ID查询</Label>
              <Input
                id={activeTab === "my-libraries" ? "my-search-library-id" : "search-library-id"}
                value={activeTab === "my-libraries" ? myLibSearchId : searchLibraryId}
                onChange={(e) => activeTab === "my-libraries" ? setMyLibSearchId(e.target.value) : setSearchLibraryId(e.target.value)}
                placeholder="输入库ID进行搜索..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={activeTab === "my-libraries" ? "my-search-library-name" : "search-library-name"}>库名称关键词查询</Label>
              <Input
                id={activeTab === "my-libraries" ? "my-search-library-name" : "search-library-name"}
                value={activeTab === "my-libraries" ? myLibSearchName : searchLibraryName}
                onChange={(e) => activeTab === "my-libraries" ? setMyLibSearchName(e.target.value) : setSearchLibraryName(e.target.value)}
                placeholder="输入库名称关键词进行搜索..."
                className="mt-1"
              />
            </div>
          </div>
          {((activeTab === "my-libraries" && (myLibSearchId || myLibSearchName)) || 
            (activeTab === "all-libraries" && (searchLibraryId || searchLibraryName))) && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Search className="w-4 h-4" />
              找到 {displayLibraries.length} 个匹配的标签库
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (activeTab === "my-libraries") {
                    setMyLibSearchId("");
                    setMyLibSearchName("");
                  } else {
                    setSearchLibraryId("");
                    setSearchLibraryName("");
                  }
                }}
                className="ml-auto text-blue-600 hover:text-blue-800"
              >
                清除搜索
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {displayLibraries.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              {activeTab === "my-libraries" 
                ? (myLibSearchId || myLibSearchName) 
                  ? "没有找到匹配的标签库"
                  : "您还没有权限访问任何标签库"
                : (searchLibraryId || searchLibraryName) 
                  ? "没有找到匹配的标签库"
                  : "还没有标签库"
              }<br />
              {activeTab === "my-libraries" 
                ? (myLibSearchId || myLibSearchName)
                  ? "请尝试调整搜索条件"
                  : "向管理员申请权限或创建新的标签库"
                : (searchLibraryId || searchLibraryName)
                  ? "请尝试调整搜索条件"
                  : "点击上方按钮创建您的第一个标签库"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayLibraries.map((library) => {
            const { level1Tags, level2Tags } = getTagStatistics(library);
            const userPermission = getUserPermission(library.id);
            const hasPermission = !!userPermission;
            
            return (
              <Card 
                key={library.id} 
                className={`hover:shadow-lg transition-shadow cursor-pointer bg-white/80 backdrop-blur-sm border border-gray-200 ${!hasPermission && activeTab === "all-libraries" ? "opacity-75" : ""}`}
                onClick={() => handleLibraryClick(library)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{library.name}</span>
                    <div className="flex gap-1">
                      {hasPermission && canEditLibrary(library) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tag-library/${library.id}`);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {hasPermission && canDeleteLibrary(library) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTagLibrary(library.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      {!hasPermission && activeTab === "all-libraries" && (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription>{library.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">库ID：</span>
                      <Badge variant="outline" className="text-purple-700 bg-purple-50">{library.libraryId}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">管理员：</span>
                      <span className="text-sm text-gray-600">{library.administrator}</span>
                    </div>

                    {hasPermission && (
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={userPermission.role === "administrator" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {userPermission.role === "administrator" ? "管理员" : "运营"}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          一级: {level1Tags}
                        </Badge>
                        <Badge variant="outline">
                          二级: {level2Tags}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {library.createdAt.toLocaleDateString()}
                      </span>
                    </div>

                    {!hasPermission && activeTab === "all-libraries" && (
                      <div className="text-center pt-2">
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          无权限访问
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {permissionDialogLibrary && (
        <PermissionRequestDialog
          isOpen={!!permissionDialogLibrary}
          onClose={() => setPermissionDialogLibrary(null)}
          library={permissionDialogLibrary}
          currentUser={currentUser}
          onSubmitRequest={handlePermissionRequest}
        />
      )}
    </div>
  );
};

export default TagLibraryManager;
