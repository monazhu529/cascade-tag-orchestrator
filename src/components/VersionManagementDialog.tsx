import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagVersion, Tag } from "@/types/permissions";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Clock, Rocket } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface VersionManagementDialogProps {
  open: boolean;
  onClose: () => void;
  versions: TagVersion[];
  currentTags: Tag[];
  currentUser: string;
  publishedVersionId?: string;
  onCreateVersion: (versionNumber: string, description: string) => void;
  onPublishVersion: (versionId: string) => void;
}

const VersionManagementDialog = ({
  open,
  onClose,
  versions,
  currentTags,
  currentUser,
  publishedVersionId,
  onCreateVersion,
  onPublishVersion,
}: VersionManagementDialogProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [versionNumber, setVersionNumber] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateVersion = () => {
    if (!versionNumber.trim()) return;
    onCreateVersion(versionNumber.trim(), description.trim());
    setVersionNumber("");
    setDescription("");
    setIsCreating(false);
  };

  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>版本管理</span>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)} size="sm">
                创建新版本
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {isCreating ? (
          <div className="space-y-4 py-4">
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                取消
              </Button>
              <Button onClick={handleCreateVersion} disabled={!versionNumber.trim()}>
                创建版本
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {sortedVersions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无版本，点击"创建新版本"开始版本管理
              </div>
            ) : (
              <div className="space-y-3">
                {sortedVersions.map((version) => (
                  <div
                    key={version.id}
                    className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{version.versionNumber}</h4>
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
                          <p className="text-sm text-muted-foreground">
                            {version.description}
                          </p>
                        )}
                      </div>
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

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        创建于 {format(new Date(version.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </div>
                      <div>创建者: {version.createdBy}</div>
                      <div>标签数: {version.tags.length}</div>
                    </div>

                    {version.isPublished && version.publishedAt && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        发布于 {format(new Date(version.publishedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                        {version.publishedBy && ` · 发布者: ${version.publishedBy}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VersionManagementDialog;
