
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Tags, List, Sync } from "lucide-react";
import TagLibraryManager from "@/components/TagLibraryManager";
import TaskLibraryManager from "@/components/TaskLibraryManager";
import SyncManager from "@/components/SyncManager";

export interface Tag {
  id: string;
  key: string;
  name: string;
  level: number;
  parentId?: string;
  children?: Tag[];
}

export interface TagLibrary {
  id: string;
  name: string;
  description: string;
  tags: Tag[];
  createdAt: Date;
}

export interface TaskLibrary {
  id: string;
  name: string;
  description: string;
  connectedTagLibraryId?: string;
  tagMappings: Record<string, string>;
  createdAt: Date;
}

const Index = () => {
  const [tagLibraries, setTagLibraries] = useState<TagLibrary[]>([]);
  const [taskLibraries, setTaskLibraries] = useState<TaskLibrary[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            标签管理系统
          </h1>
          <p className="text-gray-600 text-lg">高效管理您的标签库与任务库</p>
        </header>

        <Tabs defaultValue="tag-libraries" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="tag-libraries" className="flex items-center gap-2">
              <Tags className="w-4 h-4" />
              标签库管理
            </TabsTrigger>
            <TabsTrigger value="task-libraries" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              任务库管理
            </TabsTrigger>
            <TabsTrigger value="sync-management" className="flex items-center gap-2">
              <Sync className="w-4 h-4" />
              同步映射
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tag-libraries">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="w-5 h-5 text-blue-600" />
                  标签库管理
                </CardTitle>
                <CardDescription>
                  创建和管理您的标签库，支持多层级标签结构
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TagLibraryManager 
                  tagLibraries={tagLibraries}
                  setTagLibraries={setTagLibraries}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="task-libraries">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="w-5 h-5 text-purple-600" />
                  任务库管理
                </CardTitle>
                <CardDescription>
                  管理任务库并配置标签库关联
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskLibraryManager 
                  taskLibraries={taskLibraries}
                  setTaskLibraries={setTaskLibraries}
                  tagLibraries={tagLibraries}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync-management">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sync className="w-5 h-5 text-green-600" />
                  同步映射管理
                </CardTitle>
                <CardDescription>
                  配置标签库与任务库之间的同步映射关系
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SyncManager 
                  tagLibraries={tagLibraries}
                  taskLibraries={taskLibraries}
                  setTaskLibraries={setTaskLibraries}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
