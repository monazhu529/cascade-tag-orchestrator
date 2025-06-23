
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Info, Tag, List, History, AlertCircle } from "lucide-react";
import { TagLibrary, User, LibraryPermission } from "@/types/permissions";
import LibraryInfoTab from "@/components/LibraryInfoTab";
import TagTreeTab from "@/components/TagTreeTab";
import TasksTab from "@/components/TasksTab";
import OperationLogTab from "@/components/OperationLogTab";

interface TagLibraryEditProps {
  tagLibraries: TagLibrary[];
  setTagLibraries: React.Dispatch<React.SetStateAction<TagLibrary[]>>;
  currentUser: User;
  permissions: LibraryPermission[];
}

const TagLibraryEdit = ({ 
  tagLibraries, 
  setTagLibraries, 
  currentUser, 
  permissions 
}: TagLibraryEditProps) => {
  const { libraryId } = useParams<{ libraryId: string }>();
  const navigate = useNavigate();
  const [library, setLibrary] = useState<TagLibrary | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(true);

  useEffect(() => {
    const foundLibrary = tagLibraries.find(lib => lib.id === libraryId);
    if (foundLibrary) {
      setLibrary(foundLibrary);
      
      // 检查用户权限
      const userPermission = getUserPermission(foundLibrary.id);
      setHasPermission(!!userPermission);
    } else {
      navigate("/");
    }
  }, [libraryId, tagLibraries, navigate, permissions]);

  const getUserPermission = (libraryId: string): LibraryPermission | undefined => {
    return permissions.find(p => p.libraryId === libraryId && p.userId === currentUser.id);
  };

  const handleUpdate = (updatedLibrary: TagLibrary) => {
    setTagLibraries(prev => 
      prev.map(lib => lib.id === updatedLibrary.id ? updatedLibrary : lib)
    );
    setLibrary(updatedLibrary);
  };

  const handleBack = () => {
    navigate("/");
  };

  if (!library) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  const userPermission = getUserPermission(library.id);

  // 如果用户没有权限，显示无权限页面
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回标签库列表
            </Button>
          </div>
          
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                无权限访问
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  您没有访问标签库 "{library.name}" (ID: {library.libraryId}) 的权限。
                  请联系管理员 {library.administrator} 申请相应权限。
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">标签库信息</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">库名称：</span>{library.name}</p>
                  <p><span className="font-medium">库ID：</span>{library.libraryId}</p>
                  <p><span className="font-medium">管理员：</span>{library.administrator}</p>
                  <p><span className="font-medium">描述：</span>{library.description}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                如需访问此标签库，请向管理员申请权限后重新访问此链接。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回标签库列表
          </Button>
          
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{library.name}</span>
                <div className="text-sm text-gray-500">
                  库ID: {library.libraryId}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info" className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    标签库信息
                  </TabsTrigger>
                  <TabsTrigger value="tags" className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    标签列表
                  </TabsTrigger>
                  <TabsTrigger value="tasks" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    任务情况
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    操作日志
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="mt-6">
                  <LibraryInfoTab 
                    library={library}
                    currentUser={currentUser}
                    userPermission={userPermission}
                    permissions={permissions}
                    onUpdate={handleUpdate}
                  />
                </TabsContent>
                
                <TabsContent value="tags" className="mt-6">
                  <TagTreeTab 
                    library={library}
                    currentUser={currentUser}
                    userPermission={userPermission}
                    onUpdate={handleUpdate}
                  />
                </TabsContent>
                
                <TabsContent value="tasks" className="mt-6">
                  <TasksTab 
                    library={library}
                    currentUser={currentUser}
                    userPermission={userPermission}
                  />
                </TabsContent>
                
                <TabsContent value="logs" className="mt-6">
                  <OperationLogTab 
                    library={library}
                    currentUser={currentUser}
                    userPermission={userPermission}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TagLibraryEdit;
