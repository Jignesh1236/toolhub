import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileIcon, Clock, Eye, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SharedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  expiresAt?: string;
  downloadCount: number;
  maxDownloads?: number;
  isPublic: boolean;
}

export default function SharedFile() {
  const { id } = useParams();
  const [file, setFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const isDownloadLimitReached = (file: SharedFile) => {
    return file.maxDownloads && file.downloadCount >= file.maxDownloads;
  };

  const fetchFileDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/files/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch file");
      }

      const fileData = await response.json();
      setFile(fileData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;

    try {
      setIsDownloading(true);
      const response = await fetch(`/api/files/${id}/download`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Download failed");
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "✅ Download started",
        description: `${file.originalName} download has started`,
      });

      // Refresh file details to update download count
      fetchFileDetails();
    } catch (err: any) {
      toast({
        title: "❌ Download failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getMimeTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('text')) return '📝';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📄';
  };

  useEffect(() => {
    if (id) {
      fetchFileDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading file details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              File Not Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/"}
              data-testid="button-go-home"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="text-center py-8">
            <FileIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">File not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expired = isExpired(file.expiresAt);
  const limitReached = isDownloadLimitReached(file);
  const canDownload = !expired && !limitReached;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">
            {getMimeTypeIcon(file.mimeType)}
          </div>
          <CardTitle className="text-2xl" data-testid="text-filename">
            {file.originalName}
          </CardTitle>
          <CardDescription>
            Shared file • {formatFileSize(file.fileSize)} • {file.mimeType}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Status */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline">
              <Eye className="h-3 w-3 mr-1" />
              {file.downloadCount} downloads
            </Badge>
            {file.maxDownloads && (
              <Badge variant="outline">
                Max: {file.maxDownloads}
              </Badge>
            )}
            {file.expiresAt && (
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                Expires: {new Date(file.expiresAt).toLocaleDateString()}
              </Badge>
            )}
            {expired && (
              <Badge variant="destructive">Expired</Badge>
            )}
            {limitReached && (
              <Badge variant="destructive">Limit Reached</Badge>
            )}
          </div>

          {/* File Details */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Uploaded: {new Date(file.uploadedAt).toLocaleString()}</p>
            {file.expiresAt && !expired && (
              <p>Expires: {new Date(file.expiresAt).toLocaleString()}</p>
            )}
            {file.maxDownloads && !limitReached && (
              <p>Downloads remaining: {file.maxDownloads - file.downloadCount}</p>
            )}
          </div>

          {/* Download Section */}
          {canDownload ? (
            <div className="text-center space-y-4">
              <Button
                size="lg"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full"
                data-testid="button-download-file"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Downloading..." : "Download File"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Click to download • File will be saved to your device
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {expired ? "This file has expired" : "Download limit has been reached"}
                </p>
              </div>
            </div>
          )}

          {/* Additional Actions */}
          <div className="text-center pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/tools/file-share"}
              data-testid="button-share-your-files"
            >
              Share Your Files
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}