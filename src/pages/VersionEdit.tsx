import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagVersion } from "@/types/permissions";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import TagTree from "@/components/TagTree";

interface VersionEditProps {
  version: TagVersion;
  libraryId: string;
  libraryName: string;
  canEdit: boolean;
}

const VersionEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    version,
    libraryId,
    libraryName,
    canEdit = false,
  } = (location.state || {}) as VersionEditProps;

  const [tags, setTags] = useState(version?.tags || []);

  const handleBack = () => {
    navigate(`/tag-library/${libraryId}/versions`, {
      state: location.state,
    });
  };

  if (!version) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">版本信息不存在</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回版本列表
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{version.versionNumber}</h1>
              {version.isPublished && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  已发布
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{libraryName}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>版本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {version.description && (
              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                <p className="text-sm">{version.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">创建时间：</span>
                <div className="font-medium">
                  {format(new Date(version.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">创建者：</span>
                <div className="font-medium">{version.createdBy}</div>
              </div>
              {version.isPublished && version.publishedAt && (
                <>
                  <div>
                    <span className="text-muted-foreground">发布时间：</span>
                    <div className="font-medium">
                      {format(new Date(version.publishedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                    </div>
                  </div>
                  {version.publishedBy && (
                    <div>
                      <span className="text-muted-foreground">发布者：</span>
                      <div className="font-medium">{version.publishedBy}</div>
                    </div>
                  )}
                </>
              )}
              <div>
                <span className="text-muted-foreground">标签数量：</span>
                <div className="font-medium">{version.tags.length} 个</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>标签结构</CardTitle>
          </CardHeader>
          <CardContent>
            <TagTree 
              tags={tags}
              allTags={tags}
              selectedTags={[]}
              onEdit={() => {}}
              onDelete={() => {}}
              onAddChild={() => {}}
              onToggleStatus={() => {}}
              onShowLog={() => {}}
              onSelectTags={() => {}}
              canEdit={canEdit && !version.isPublished}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VersionEdit;
