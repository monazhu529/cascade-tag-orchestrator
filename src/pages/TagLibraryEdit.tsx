
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Info, Tag, List } from "lucide-react";
import { TagLibrary, User, LibraryPermission } from "@/types/permissions";
import LibraryInfoTab from "@/components/LibraryInfoTab";
import TagTreeTab from "@/components/TagTreeTab";
import TasksTab from "@/components/TasksTab";

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

  useEffect(() => {
    const foundLibrary = tagLibraries.find(lib => lib.id === libraryId);
    if (foundLibrary) {
      setLibrary(foundLibrary);
    } else {
      navigate("/");
    }
  }, [libraryId, tagLibraries, navigate]);

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
                <TabsList className="grid w-full grid-cols-3">
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
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TagLibraryEdit;
