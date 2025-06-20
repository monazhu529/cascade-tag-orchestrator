
import { useState, useEffect } from "react";
import TagLibraryEdit from "@/pages/TagLibraryEdit";
import { User, LibraryPermission, PermissionRequest, TagLibrary, Tag } from "@/types/permissions";
import { TaskLibrary } from "@/pages/Index";

// Mock data - in a real app, this would come from a global state or API
const createSampleData = (): { 
  tagLibraries: TagLibrary[], 
  taskLibraries: TaskLibrary[],
  currentUser: User,
  permissions: LibraryPermission[],
  permissionRequests: PermissionRequest[]
} => {
  const currentUser: User = {
    id: "user-1",
    name: "张三",
    email: "zhangsan@example.com"
  };

  const sampleTagLibraries: TagLibrary[] = [
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
        },
        {
          id: "1010002",
          key: "category_electronics_phone",
          name: "手机",
          value: "phone",
          status: "active",
          remark: "智能手机和功能手机",
          level: 2,
          parentId: "1010001"
        },
        {
          id: "1010003",
          key: "category_electronics_laptop",
          name: "笔记本电脑",
          value: "laptop",
          status: "active",
          remark: "各种品牌的笔记本电脑",
          level: 2,
          parentId: "1010001"
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

  return { 
    tagLibraries: sampleTagLibraries, 
    taskLibraries: [], 
    currentUser, 
    permissions, 
    permissionRequests: [] 
  };
};

const TagLibraryEditWrapper = () => {
  const sampleData = createSampleData();
  const [tagLibraries, setTagLibraries] = useState<TagLibrary[]>(sampleData.tagLibraries);
  const [currentUser] = useState<User>(sampleData.currentUser);
  const [permissions] = useState<LibraryPermission[]>(sampleData.permissions);

  return (
    <TagLibraryEdit
      tagLibraries={tagLibraries}
      setTagLibraries={setTagLibraries}
      currentUser={currentUser}
      permissions={permissions}
    />
  );
};

export default TagLibraryEditWrapper;
