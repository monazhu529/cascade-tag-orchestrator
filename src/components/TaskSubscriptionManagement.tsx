import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Plus, User, Mail, BellRing, BellOff, Search } from "lucide-react";
import { TaskLibrary } from "@/pages/Index";
import { User as UserType } from "@/types/permissions";
import { useToast } from "@/hooks/use-toast";

interface TaskSubscriptionManagementProps {
  taskLibrary: TaskLibrary;
  currentUser: UserType;
}

const TaskSubscriptionManagement = ({ taskLibrary }: TaskSubscriptionManagementProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [newSubscription, setNewSubscription] = useState({
    userId: "",
    subscriptionType: "all" as "sync" | "update" | "all"
  });

  const [subscriptions, setSubscriptions] = useState([
    {
      id: "1",
      userId: "user-1",
      userName: "张三",
      userEmail: "zhangsan@example.com",
      subscriptionType: "all",
      isActive: true,
      createdAt: new Date("2024-01-15")
    },
    {
      id: "2",
      userId: "user-2",
      userName: "李四",
      userEmail: "lisi@example.com",
      subscriptionType: "sync",
      isActive: true,
      createdAt: new Date("2024-02-01")
    },
    {
      id: "3",
      userId: "user-3",
      userName: "王五",
      userEmail: "wangwu@example.com",
      subscriptionType: "update",
      isActive: false,
      createdAt: new Date("2024-02-15")
    }
  ]);

  const { toast } = useToast();

  const getSubscriptionTypeText = (type: string) => {
    switch (type) {
      case "sync": return "同步通知";
      case "update": return "更新通知";
      case "all": return "全部通知";
      default: return type;
    }
  };

  const getSubscriptionTypeColor = (type: string) => {
    switch (type) {
      case "sync": return "bg-blue-100 text-blue-800";
      case "update": return "bg-green-100 text-green-800";
      case "all": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const toggleSubscription = (id: string) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === id 
        ? { ...sub, isActive: !sub.isActive }
        : sub
    ));
    toast({
      title: "订阅状态已更新",
      description: "用户订阅设置已保存",
    });
  };

  const addSubscription = () => {
    // 这里应该添加订阅逻辑
    setIsAddDialogOpen(false);
    setNewSubscription({ userId: "", subscriptionType: "all" });
    toast({
      title: "订阅添加成功",
      description: "新的订阅已添加到通知列表",
    });
  };

  const removeSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    toast({
      title: "订阅删除成功",
      description: "订阅已从通知列表中移除",
    });
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || sub.subscriptionType === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">订阅管理</h3>
          <p className="text-sm text-gray-500">
            管理任务库的通知订阅用户
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              添加订阅
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加通知订阅</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">用户</label>
                <Input
                  placeholder="输入用户名或邮箱"
                  value={newSubscription.userId}
                  onChange={(e) => setNewSubscription(prev => ({ ...prev, userId: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">订阅类型</label>
                <Select value={newSubscription.subscriptionType} onValueChange={(value: any) => setNewSubscription(prev => ({ ...prev, subscriptionType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部通知 - 接收所有类型的通知</SelectItem>
                    <SelectItem value="sync">同步通知 - 仅接收同步相关通知</SelectItem>
                    <SelectItem value="update">更新通知 - 仅接收更新相关通知</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addSubscription} className="w-full">
                添加订阅
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 筛选控件 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="订阅类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="sync">同步通知</SelectItem>
              <SelectItem value="update">更新通知</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 订阅统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">总订阅数</span>
            </div>
            <p className="text-2xl font-bold mt-2">{subscriptions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">活跃订阅</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">
              {subscriptions.filter(sub => sub.isActive).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BellOff className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">暂停订阅</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-600">
              {subscriptions.filter(sub => !sub.isActive).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">全部通知</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-purple-600">
              {subscriptions.filter(sub => sub.subscriptionType === "all").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 订阅列表 */}
      <div className="space-y-4">
        {filteredSubscriptions.map((subscription) => (
          <Card key={subscription.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {subscription.isActive ? (
                      <BellRing className="w-5 h-5 text-green-600" />
                    ) : (
                      <BellOff className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium">{subscription.userName}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {subscription.userEmail}
                    </p>
                  </div>
                  
                  <Badge className={getSubscriptionTypeColor(subscription.subscriptionType)}>
                    {getSubscriptionTypeText(subscription.subscriptionType)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-gray-500">
                    <p>订阅时间: {subscription.createdAt.toLocaleDateString()}</p>
                    <p className={subscription.isActive ? "text-green-600" : "text-gray-500"}>
                      {subscription.isActive ? "活跃" : "已暂停"}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={subscription.isActive}
                      onCheckedChange={() => toggleSubscription(subscription.id)}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeSubscription(subscription.id)}
                    >
                      移除
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubscriptions.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              {searchTerm || filterType !== "all" ? "没有找到符合条件的订阅" : "还没有用户订阅此任务库"}
              <br />
              {!searchTerm && filterType === "all" && "点击 \"添加订阅\" 邀请用户订阅通知"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskSubscriptionManagement;
