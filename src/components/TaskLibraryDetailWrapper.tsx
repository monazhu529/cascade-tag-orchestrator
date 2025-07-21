
import { useState } from "react";
import TaskLibraryDetail from "./TaskLibraryDetail";
import { TagLibrary, User, LibraryPermission } from "@/types/permissions";
import { TaskLibrary } from "@/pages/Index";

// 创建示例数据，实际应用中应该从API获取
const TaskLibraryDetailWrapper = () => {
  const currentUser: User = {
    id: "user-1",
    name: "张三",
    email: "zhangsan@example.com"
  };

  const [taskLibraries, setTaskLibraries] = useState<TaskLibrary[]>([
    {
      id: "task-lib-1",
      name: "电商平台任务库",
      description: "管理电商平台的各类任务和工作流",
      administrator: "张三",
      connectedTagLibraryIds: ["tag-lib-1"],
      tagMappings: {
        "tag-lib-1": {
          "category_electronics": "电子产品类任务",
          "category_clothing": "服装类任务"
        }
      },
      createdAt: new Date("2024-01-20"),
      createdBy: "user-1"
    },
    {
      id: "task-lib-2",
      name: "开发团队任务库",
      description: "软件开发团队的项目任务管理",
      administrator: "李四",
      connectedTagLibraryIds: ["tag-lib-2"],
      tagMappings: {
        "tag-lib-2": {
          "priority_high": "紧急任务",
          "status_todo": "待开发",
          "status_progress": "开发中"
        }
      },
      createdAt: new Date("2024-02-25"),
      createdBy: "user-2"
    }
  ]);

  const tagLibraries: TagLibrary[] = [
    {
      id: "tag-lib-1",
      libraryId: "101",
      name: "电商分类标签库",
      description: "用于电商商品分类的标签体系",
      administrator: "张三",
      createdAt: new Date("2024-01-15"),
      tags: [
        {
          id: "1010001",
          key: "category_electronics",
          name: "电子产品",
          value: "electronics",
          status: "active",
          remark: "包含所有电子设备分类",
          level: 1
        }
      ]
    }
  ];

  const permissions: LibraryPermission[] = [
    {
      userId: "user-1",
      libraryId: "tag-lib-1",
      role: "administrator",
      grantedAt: new Date("2024-01-15"),
      grantedBy: "system"
    }
  ];

  return (
    <TaskLibraryDetail
      taskLibraries={taskLibraries}
      setTaskLibraries={setTaskLibraries}
      tagLibraries={tagLibraries}
      currentUser={currentUser}
      permissions={permissions}
    />
  );
};

export default TaskLibraryDetailWrapper;
