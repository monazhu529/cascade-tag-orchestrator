
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TagLibrary, User, LibraryPermission } from "@/types/permissions";
import { List, ExternalLink } from "lucide-react";

interface TasksTabProps {
  library: TagLibrary;
  currentUser: User;
  userPermission?: LibraryPermission;
}

// Mock task data - in a real app, this would come from API
const mockTasks = [
  {
    id: "task-1",
    name: "电商商品分类任务",
    status: "active",
    createdAt: new Date("2024-01-20"),
    usedTags: ["category_electronics", "category_electronics_phone"]
  },
  {
    id: "task-2", 
    name: "产品推荐标签任务",
    status: "completed",
    createdAt: new Date("2024-01-18"),
    usedTags: ["category_electronics_laptop"]
  }
];

const TasksTab = ({ 
  library, 
  currentUser, 
  userPermission 
}: TasksTabProps) => {
  // Filter tasks that use tags from this library
  const relevantTasks = mockTasks.filter(task => 
    task.usedTags.some(tagKey => 
      library.tags.some(tag => tag.key === tagKey)
    )
  );

  const getUsedTagsInfo = (usedTagKeys: string[]) => {
    return usedTagKeys
      .map(key => library.tags.find(tag => tag.key === key))
      .filter(Boolean);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            任务引用情况
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            当前标签库被 {relevantTasks.length} 个任务引用
          </div>
          
          {relevantTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <List className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无任务引用此标签库</p>
            </div>
          ) : (
            <div className="space-y-4">
              {relevantTasks.map((task) => {
                const usedTags = getUsedTagsInfo(task.usedTags);
                
                return (
                  <Card key={task.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{task.name}</h3>
                          <Badge 
                            variant={task.status === "active" ? "default" : "secondary"}
                          >
                            {task.status === "active" ? "进行中" : "已完成"}
                          </Badge>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          创建时间: {task.createdAt.toLocaleDateString()}
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">使用的标签:</div>
                          <div className="flex flex-wrap gap-2">
                            {usedTags.map((tag) => (
                              <Badge key={tag?.id} variant="outline" className="text-xs">
                                {tag?.name} ({tag?.key})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>标签使用统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{library.tags.length}</div>
              <div className="text-sm text-gray-600">总标签数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{relevantTasks.length}</div>
              <div className="text-sm text-gray-600">引用任务数</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {library.tags.filter(tag => tag.status === "active").length}
              </div>
              <div className="text-sm text-gray-600">活跃标签数</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksTab;
