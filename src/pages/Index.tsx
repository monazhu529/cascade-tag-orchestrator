import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Database, Tag as TagIcon, FileText } from "lucide-react";
import TagLibraryManager from "@/components/TagLibraryManager";
import TaskLibraryManager from "@/components/TaskLibraryManager";
import { TagLibrary, Tag, User } from "@/types/permissions";

export interface TaskLibrary {
  id: string;
  name: string;
  description: string;
  administrator: string;
  connectedTagLibraryId?: string;
  createdAt: Date;
}

const Index = () => {
  const [currentUser] = useState<User>({
    id: "user-1",
    name: "张三",
    email: "zhangsan@example.com"
  });

  const [tagLibraries, setTagLibraries] = useState<TagLibrary[]>([
    {
      id: "lib-1",
      libraryId: "101",
      name: "产品分类标签库",
      description: "用于产品分类管理的标签体系",
      administrator: "张三",
      createdAt: new Date("2024-01-15"),
      tags: [
        // 一级标签 - 电子产品
        {
          id: "tag-1",
          key: "electronics",
          name: "电子产品",
          value: "electronics_category",
          status: "active",
          remark: "所有电子产品的总分类",
          level: 1
        },
        // 二级标签 - 手机
        {
          id: "tag-2",
          key: "mobile",
          name: "手机",
          value: "mobile_phone", 
          status: "active",
          remark: "智能手机分类",
          level: 2,
          parentId: "tag-1"
        },
        // 三级标签 - 品牌
        {
          id: "tag-3",
          key: "apple",
          name: "苹果",
          value: "apple_brand",
          status: "active", 
          remark: "苹果品牌手机",
          level: 3,
          parentId: "tag-2"
        },
        {
          id: "tag-4",
          key: "samsung",
          name: "三星",
          value: "samsung_brand",
          status: "active",
          remark: "三星品牌手机", 
          level: 3,
          parentId: "tag-2"
        },
        {
          id: "tag-5",
          key: "huawei",
          name: "华为",
          value: "huawei_brand",
          status: "active",
          remark: "华为品牌手机",
          level: 3,
          parentId: "tag-2"
        },
        // 四级标签 - 具体型号
        {
          id: "tag-6",
          key: "iphone15",
          name: "iPhone 15",
          value: "iphone_15_model",
          status: "active",
          remark: "iPhone 15系列",
          level: 4,
          parentId: "tag-3"
        },
        {
          id: "tag-7",
          key: "iphone14",
          name: "iPhone 14",
          value: "iphone_14_model", 
          status: "active",
          remark: "iPhone 14系列",
          level: 4,
          parentId: "tag-3"
        },
        {
          id: "tag-8",
          key: "galaxy_s24",
          name: "Galaxy S24",
          value: "galaxy_s24_model",
          status: "active",
          remark: "三星Galaxy S24系列",
          level: 4,
          parentId: "tag-4"
        },
        {
          id: "tag-9",
          key: "mate60",
          name: "Mate 60",
          value: "mate60_model",
          status: "active",
          remark: "华为Mate 60系列",
          level: 4,
          parentId: "tag-5"
        },
        // 五级标签 - 存储容量
        {
          id: "tag-10",
          key: "iphone15_128gb",
          name: "128GB",
          value: "128gb_storage",
          status: "active",
          remark: "128GB存储容量",
          level: 5,
          parentId: "tag-6"
        },
        {
          id: "tag-11",
          key: "iphone15_256gb", 
          name: "256GB",
          value: "256gb_storage",
          status: "active",
          remark: "256GB存储容量",
          level: 5,
          parentId: "tag-6"
        },
        {
          id: "tag-12",
          key: "iphone15_512gb",
          name: "512GB", 
          value: "512gb_storage",
          status: "active",
          remark: "512GB存储容量",
          level: 5,
          parentId: "tag-6"
        },
        // 二级标签 - 电脑
        {
          id: "tag-13",
          key: "computer",
          name: "电脑",
          value: "computer_category",
          status: "active",
          remark: "电脑产品分类",
          level: 2,
          parentId: "tag-1"
        },
        // 三级标签 - 电脑类型
        {
          id: "tag-14",
          key: "laptop",
          name: "笔记本电脑",
          value: "laptop_type",
          status: "active",
          remark: "便携式电脑",
          level: 3,
          parentId: "tag-13"
        },
        {
          id: "tag-15",
          key: "desktop",
          name: "台式电脑",
          value: "desktop_type",
          status: "active",
          remark: "桌面电脑",
          level: 3,
          parentId: "tag-13"
        },
        // 四级标签 - 笔记本品牌
        {
          id: "tag-16",
          key: "macbook",
          name: "MacBook",
          value: "macbook_brand",
          status: "active",
          remark: "苹果笔记本电脑",
          level: 4,
          parentId: "tag-14"
        },
        {
          id: "tag-17",
          key: "thinkpad",
          name: "ThinkPad",
          value: "thinkpad_brand",
          status: "active",
          remark: "联想商务笔记本",
          level: 4,
          parentId: "tag-14"
        },
        // 一级标签 - 服装
        {
          id: "tag-18",
          key: "clothing",
          name: "服装",
          value: "clothing_category",
          status: "active",
          remark: "服装产品分类",
          level: 1
        },
        // 二级标签 - 服装类型
        {
          id: "tag-19",
          key: "tops",
          name: "上装",
          value: "tops_type",
          status: "active",
          remark: "上身服装",
          level: 2,
          parentId: "tag-18"
        },
        {
          id: "tag-20",
          key: "bottoms",
          name: "下装",
          value: "bottoms_type",
          status: "active", 
          remark: "下身服装",
          level: 2,
          parentId: "tag-18"
        },
        // 三级标签 - 具体服装
        {
          id: "tag-21",
          key: "tshirt",
          name: "T恤",
          value: "tshirt_item",
          status: "active",
          remark: "短袖T恤衫",
          level: 3,
          parentId: "tag-19"
        },
        {
          id: "tag-22",
          key: "shirt",
          name: "衬衫",
          value: "shirt_item",
          status: "active",
          remark: "正装衬衫",
          level: 3,
          parentId: "tag-19"
        },
        {
          id: "tag-23",
          key: "jeans",
          name: "牛仔裤",
          value: "jeans_item",
          status: "active",
          remark: "牛仔布裤子",
          level: 3,
          parentId: "tag-20"
        },
        // 四级标签 - 尺寸
        {
          id: "tag-24",
          key: "size_s",
          name: "S码",
          value: "size_small",
          status: "active",
          remark: "小号尺寸",
          level: 4,
          parentId: "tag-21"
        },
        {
          id: "tag-25",
          key: "size_m",
          name: "M码",
          value: "size_medium",
          status: "active",
          remark: "中号尺寸",
          level: 4,
          parentId: "tag-21"
        },
        {
          id: "tag-26",
          key: "size_l",
          name: "L码",
          value: "size_large",
          status: "active",
          remark: "大号尺寸",
          level: 4,
          parentId: "tag-21"
        }
      ]
    },
    {
      id: "lib-2", 
      libraryId: "102",
      name: "区域标签库",
      description: "地理区域划分标签体系",
      administrator: "李四",
      createdAt: new Date("2024-01-20"),
      tags: [
        // 一级标签 - 中国
        {
          id: "region-1",
          key: "china",
          name: "中国",
          value: "china_country",
          status: "active",
          remark: "中华人民共和国",
          level: 1
        },
        // 二级标签 - 省份
        {
          id: "region-2",
          key: "beijing",
          name: "北京市",
          value: "beijing_province",
          status: "active",
          remark: "首都直辖市",
          level: 2,
          parentId: "region-1"
        },
        {
          id: "region-3",
          key: "guangdong",
          name: "广东省",
          value: "guangdong_province", 
          status: "active",
          remark: "南方经济大省",
          level: 2,
          parentId: "region-1"
        },
        {
          id: "region-4",
          key: "jiangsu",
          name: "江苏省",
          value: "jiangsu_province",
          status: "active",
          remark: "东部沿海省份",
          level: 2,
          parentId: "region-1"
        },
        // 三级标签 - 城市
        {
          id: "region-5",
          key: "guangzhou",
          name: "广州市",
          value: "guangzhou_city",
          status: "active",
          remark: "广东省省会",
          level: 3,
          parentId: "region-3"
        },
        {
          id: "region-6",
          key: "shenzhen",
          name: "深圳市",
          value: "shenzhen_city",
          status: "active",
          remark: "经济特区",
          level: 3,
          parentId: "region-3"
        },
        {
          id: "region-7",
          key: "nanjing",
          name: "南京市",
          value: "nanjing_city",
          status: "active",
          remark: "江苏省省会",
          level: 3,
          parentId: "region-4"
        },
        {
          id: "region-8",
          key: "suzhou",
          name: "苏州市",
          value: "suzhou_city",
          status: "active",
          remark: "工业发达城市",
          level: 3,
          parentId: "region-4"
        },
        // 四级标签 - 区县
        {
          id: "region-9",
          key: "tianhe",
          name: "天河区",
          value: "tianhe_district",
          status: "active",
          remark: "广州市天河区",
          level: 4,
          parentId: "region-5"
        },
        {
          id: "region-10",
          key: "yuexiu",
          name: "越秀区",
          value: "yuexiu_district",
          status: "active",
          remark: "广州市越秀区",
          level: 4,
          parentId: "region-5"
        },
        {
          id: "region-11",
          key: "nanshan",
          name: "南山区",
          value: "nanshan_district",
          status: "active",
          remark: "深圳市南山区",
          level: 4,
          parentId: "region-6"
        },
        {
          id: "region-12",
          key: "futian",
          name: "福田区",
          value: "futian_district",
          status: "active",
          remark: "深圳市福田区",
          level: 4,
          parentId: "region-6"
        }
      ]
    }
  ]);

  const [taskLibraries, setTaskLibraries] = useState<TaskLibrary[]>([
    {
      id: "task-1",
      name: "电商产品管理",
      description: "电商平台产品信息管理任务库",
      administrator: "张三",
      connectedTagLibraryId: "lib-1",
      createdAt: new Date("2024-01-15")
    },
    {
      id: "task-2", 
      name: "区域销售分析",
      description: "按地区进行销售数据分析的任务库",
      administrator: "李四",
      connectedTagLibraryId: "lib-2",
      createdAt: new Date("2024-01-20")
    },
    {
      id: "task-3",
      name: "客户服务管理",
      description: "客户服务流程管理任务库",
      administrator: "王五",
      createdAt: new Date("2024-01-25")
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            企业标签与任务管理平台
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            统一管理企业标签库与任务库，实现高效的数据分类和流程管理
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 标签库管理 */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <TagIcon className="w-6 h-6" />
                标签库管理
              </CardTitle>
              <CardDescription className="text-blue-100">
                创建和管理企业标签分类体系
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <TagLibraryManager 
                tagLibraries={tagLibraries}
                setTagLibraries={setTagLibraries}
                currentUser={currentUser}
              />
            </CardContent>
          </Card>

          {/* 任务库管理 */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <FileText className="w-6 h-6" />
                任务库管理
              </CardTitle>
              <CardDescription className="text-purple-100">
                创建任务库并关联标签库进行数据筛选
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <TaskLibraryManager 
                taskLibraries={taskLibraries}
                setTaskLibraries={setTaskLibraries}
                tagLibraries={tagLibraries}
                currentUser={currentUser}
              />
            </CardContent>
          </Card>
        </div>

        {/* 统计信息 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center shadow-md border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">标签库总数</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{tagLibraries.length}</p>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-md border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TagIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">标签总数</span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {tagLibraries.reduce((total, lib) => total + (lib.tags?.length || 0), 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-md border-0 bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">任务库总数</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{taskLibraries.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
