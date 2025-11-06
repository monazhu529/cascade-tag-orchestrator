
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TagLibraryEdit from "@/pages/TagLibraryEdit";
import { User, LibraryPermission, TagLibrary, ClientSubscription } from "@/types/permissions";

const TagLibraryEditWrapper = () => {
  const location = useLocation();
  const locationState = location.state as { 
    tagLibraries?: TagLibrary[], 
    currentUser?: User, 
    permissions?: LibraryPermission[],
    clientSubscriptions?: ClientSubscription[]
  };

  // 从 location state 获取数据，如果没有则使用默认数据
  const [tagLibraries, setTagLibraries] = useState<TagLibrary[]>(
    locationState?.tagLibraries || []
  );
  const [currentUser] = useState<User>(
    locationState?.currentUser || {
      id: "user-1",
      name: "张三",
      email: "zhangsan@example.com"
    }
  );
  const [permissions] = useState<LibraryPermission[]>(
    locationState?.permissions || []
  );
  const [clientSubscriptions] = useState<ClientSubscription[]>(
    locationState?.clientSubscriptions || []
  );

  return (
    <TagLibraryEdit
      tagLibraries={tagLibraries}
      setTagLibraries={setTagLibraries}
      currentUser={currentUser}
      permissions={permissions}
      clientSubscriptions={clientSubscriptions}
    />
  );
};

export default TagLibraryEditWrapper;
