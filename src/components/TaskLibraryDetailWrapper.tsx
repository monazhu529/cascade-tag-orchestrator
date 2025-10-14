
import { useState } from "react";
import { useLocation } from "react-router-dom";
import TaskLibraryDetail from "./TaskLibraryDetail";
import { TagLibrary, User, LibraryPermission } from "@/types/permissions";
import { TaskLibrary } from "@/pages/Index";

const TaskLibraryDetailWrapper = () => {
  const location = useLocation();
  const locationState = location.state as { 
    taskLibraries?: TaskLibrary[],
    tagLibraries?: TagLibrary[], 
    currentUser?: User, 
    permissions?: LibraryPermission[] 
  };

  const [taskLibraries, setTaskLibraries] = useState<TaskLibrary[]>(
    locationState?.taskLibraries || []
  );
  
  const currentUser: User = locationState?.currentUser || {
    id: "user-1",
    name: "张三",
    email: "zhangsan@example.com"
  };

  const tagLibraries: TagLibrary[] = locationState?.tagLibraries || [];
  const permissions: LibraryPermission[] = locationState?.permissions || [];

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
