import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagVersion, Tag } from "@/types/permissions";
import { Calendar, CheckCircle2, Clock, Rocket, Eye, ArrowLeft, Plus } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface VersionManagementProps {
  libraryId: string;
  libraryName: string;
  versions: TagVersion[];
  currentTags: Tag[];
  currentUser: string;
  publishedVersionId?: string;
  onCreateVersion: (versionNumber: string, description: string) => void;
  onPublishVersion: (versionId: string) => void;
}

const VersionManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    libraryId,
    libraryName,
    versions = [],
    currentTags = [],
    currentUser = "",
    publishedVersionId,
    onCreateVersion,
    onPublishVersion,
  } = (location.state || {}) as VersionManagementProps;

  const [isCreating, setIsCreating] = useState(false);
  const [versionNumber, setVersionNumber] = useState("");
  const [description, setDescription] = useState("");

  const handleBack = () => {
    navigate(`/tag-library/${libraryId}`);
  };

  const handleCreateVersion = () => {
    if (!versionNumber.trim()) return;
    onCreateVersion(versionNumber.trim(), description.trim());
    setVersionNumber("");
    setDescription("");
    setIsCreating(false);
  };

  const handleViewVersion = (version: TagVersion) => {
    navigate(`/tag-library/${libraryId}/version/${version.id}`, {
      state: {
        version,
        libraryId,
        libraryName,
        canEdit: true,
      },
    });
  };

  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回标签库
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">版本管理</h1>
            <p className="text-muted-foreground mt-1">{libraryName}</p>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              创建新版本
            </Button>
          )}
        </div>
      </div>

      {isCreating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>创建新版本</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="versionNumber">版本号 *</Label>
              <Input
                id="versionNumber"
                placeholder="例如: v1.0.0"
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">版本描述</Label>
              <Textarea
                id="description"
                placeholder="描述此版本的主要变更..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              将基于当前标签数据（{currentTags.length} 个标签）创建新版本
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                取消
              </Button>
              <Button onClick={handleCreateVersion} disabled={!versionNumber.trim()}>
                创建版本
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {sortedVersions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              暂无版本，点击"创建新版本"开始版本管理
            </CardContent>
          </Card>
        ) : (
          sortedVersions.map((version) => (
            <Card
              key={version.id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handleViewVersion(version)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{version.versionNumber}</h3>
                      {version.isPublished && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          已发布
                        </Badge>
                      )}
                      {publishedVersionId === version.id && (
                        <Badge variant="secondary">当前使用</Badge>
                      )}
                    </div>
                    {version.description && (
                      <p className="text-muted-foreground">
                        {version.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        创建于 {format(new Date(version.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </div>
                      <div>创建者: {version.createdBy}</div>
                      <div>标签数: {version.tags.length}</div>
                    </div>
                    {version.isPublished && version.publishedAt && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        发布于 {format(new Date(version.publishedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        {version.publishedBy && ` · 发布者: ${version.publishedBy}`}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewVersion(version)}
                      className="gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      查看编辑
                    </Button>
                    {!version.isPublished && (
                      <Button
                        size="sm"
                        onClick={() => onPublishVersion(version.id)}
                        className="gap-1"
                      >
                        <Rocket className="w-3 h-3" />
                        发布
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default VersionManagement;
