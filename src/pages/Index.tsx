
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Tags, List, RefreshCw } from "lucide-react";
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

// 创建示例标签库数据
const createSampleData = (): { tagLibraries: TagLibrary[], taskLibraries: TaskLibrary[] } => {
  const sampleTagLibraries: TagLibrary[] = [
    {
      id: "tag-lib-1",
      name: "电商分类标签库",
      description: "用于电商商品分类的标签体系",
      createdAt: new Date("2024-01-15"),
      tags: [
        {
          id: "tag-1",
          key: "category_electronics",
          name: "电子产品",
          level: 1
        },
        {
          id: "tag-2",
          key: "category_electronics_phone",
          name: "手机",
          level: 2,
          parentId: "tag-1"
        },
        {
          id: "tag-3",
          key: "category_electronics_laptop",
          name: "笔记本电脑",
          level: 2,
          parentId: "tag-1"
        },
        {
          id: "tag-4",
          key: "category_clothing",
          name: "服装",
          level: 1
        },
        {
          id: "tag-5",
          key: "category_clothing_mens",
          name: "男装",
          level: 2,
          parentId: "tag-4"
        },
        {
          id: "tag-6",
          key: "category_clothing_womens",
          name: "女装",
          level: 2,
          parentId: "tag-4"
        }
      ]
    },
    {
      id: "tag-lib-2",
      name: "项目管理标签库",
      description: "用于项目任务分类和优先级管理",
      createdAt: new Date("2024-02-20"),
      tags: [
        {
          id: "tag-7",
          key: "priority_high",
          name: "高优先级",
          level: 1
        },
        {
          id: "tag-8",
          key: "priority_medium",
          name: "中优先级",
          level: 1
        },
        {
          id: "tag-9",
          key: "priority_low",
          name: "低优先级",
          level: 1
        },
        {
          id: "tag-10",
          key: "status_todo",
          name: "待处理",
          level: 1
        },
        {
          id: "tag-11",
          key: "status_progress",
          name: "进行中",
          level: 1
        },
        {
          id: "tag-12",
          key: "status_done",
          name: "已完成",
          level: 1
        }
      ]
    },
    {
      id: "tag-lib-3",
      name: "内容分类标签库",
      description: "用于博客文章和内容管理的分类标签",
      createdAt: new Date("2024-03-10"),
      tags: [
        {
          id: "tag-13",
          key: "content_tech",
          name: "技术",
          level: 1
        },
        {
          id: "tag-14",
          key: "content_tech_frontend",
          name: "前端开发",
          level: 2,
          parentId: "tag-13"
        },
        {
          id: "tag-15",
          key: "content_tech_backend",
          name: "后端开发",
          level: 2,
          parentId: "tag-13"
        },
        {
          id: "tag-16",
          key: "content_lifestyle",
          name: "生活方式",
          level: 1
        },
        {
          id: "tag-17",
          key: "content_business",
          name: "商业",
          level: 1
        }
      ]
    }
  ];

  const sampleTaskLibraries: TaskLibrary[] = [
    {
      id: "task-lib-1",
      name: "电商平台任务库",
      description: "管理电商平台的各类任务和工作流",
      connectedTagLibraryId: "tag-lib-1",
      tagMappings: {
        "category_electronics": "电子产品类任务",
        "category_clothing": "服装类任务"
      },
      createdAt: new Date("2024-01-20")
    },
    {
      id: "task-lib-2",
      name: "开发团队任务库",
      description: "软件开发团队的项目任务管理",
      connectedTagLibraryId: "tag-lib-2",
      tagMappings: {
        "priority_high": "紧急任务",
        "status_todo": "待开发",
        "status_progress": "开发中"
      },
      createdAt: new Date("2024-02-25")
    }
  ];

  return { tagLibraries: sampleTagLibraries, taskLibraries: sampleTaskLibraries };
};

const Index = () => {
  const sampleData = createSampleData();
  const [tagLibraries, setTagLibraries] = useState<TagLibrary[]>(sampleData.tagLibraries);
  const [taskLibraries, setTaskLibraries] = useState<TaskLibrary[]>(sampleData.taskLibraries);

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
              <RefreshCw className="w-4 h-4" />
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
                  <RefreshCw className="w-5 h-5 text-green-600" />
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
