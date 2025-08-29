
import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Type, Clock, Eye, AlertTriangle, Copy, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SharedText {
  id: string;
  title: string;
  content: string;
  uploadedAt: string;
  expiresAt?: string;
  downloadCount: number;
  maxDownloads?: number;
  isPublic: boolean;
}

export default function SharedText() {
  const { id } = useParams();
  const [text, setText] = useState<SharedText | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const isDownloadLimitReached = (text: SharedText) => {
    return text.maxDownloads && text.downloadCount >= text.maxDownloads;
  };

  const fetchTextDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/texts/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch text");
      }

      const textData = await response.json();
      setText(textData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async () => {
    if (!text) return;

    try {
      // Increment view count
      await fetch(`/api/texts/${id}/view`, { method: "POST" });
      
      toast({
        title: "✅ Text accessed",
        description: "Text has been loaded",
      });

      // Refresh text details to update view count
      fetchTextDetails();
    } catch (err: any) {
      toast({
        title: "❌ Access failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text.content);
      toast({
        title: "✅ Copied to clipboard",
        description: "Text content has been copied",
      });
    } catch (error) {
      toast({
        title: "❌ Copy failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      });
    }
  };

  const copyShareUrl = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      toast({
        title: "✅ Share URL copied",
        description: "Share URL has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "❌ Copy failed",
        description: "Failed to copy share URL",
        variant: "destructive",
      });
    }
  };

  const downloadAsFile = () => {
    if (!text) return;

    const blob = new Blob([text.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${text.title}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "✅ Download started",
      description: `${text.title}.txt download has started`,
    });
  };

  useEffect(() => {
    if (id) {
      fetchTextDetails();
    }
  }, [id]);

  useEffect(() => {
    if (text && !isExpired(text.expiresAt) && !isDownloadLimitReached(text)) {
      // Only call handleView once when component mounts
      handleView();
    }
  }, []); // Empty dependency array to run only once

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading text...</p>
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
              Text Not Available
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

  if (!text) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="text-center py-8">
            <Type className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Text not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const expired = isExpired(text.expiresAt);
  const limitReached = isDownloadLimitReached(text);
  const canAccess = !expired && !limitReached;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">
            📝
          </div>
          <CardTitle className="text-2xl" data-testid="text-title">
            {text.title}
          </CardTitle>
          <CardDescription>
            Shared text • {text.content.length} characters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Status */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline">
              <Eye className="h-3 w-3 mr-1" />
              {text.downloadCount} views
            </Badge>
            {text.maxDownloads && (
              <Badge variant="outline">
                Max: {text.maxDownloads}
              </Badge>
            )}
            {text.expiresAt && (
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                Expires: {new Date(text.expiresAt).toLocaleDateString()}
              </Badge>
            )}
            {expired && (
              <Badge variant="destructive">Expired</Badge>
            )}
            {limitReached && (
              <Badge variant="destructive">Limit Reached</Badge>
            )}
          </div>

          {/* Text Details */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Shared: {new Date(text.uploadedAt).toLocaleString()}</p>
            {text.expiresAt && !expired && (
              <p>Expires: {new Date(text.expiresAt).toLocaleString()}</p>
            )}
            {text.maxDownloads && !limitReached && (
              <p>Views remaining: {text.maxDownloads - text.downloadCount}</p>
            )}
          </div>

          {/* Text Content */}
          {canAccess ? (
            <div className="space-y-4">
              <div className="bg-muted p-6 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono max-h-96 overflow-y-auto">
                  {text.content}
                </pre>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  className="flex-1"
                  data-testid="button-copy-text"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </Button>
                <Button
                  variant="outline"
                  onClick={copyShareUrl}
                  data-testid="button-copy-share-url"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadAsFile}
                  data-testid="button-download-text"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {expired ? "This text has expired" : "View limit has been reached"}
                </p>
              </div>
            </div>
          )}

          {/* Additional Actions */}
          <div className="text-center pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/tools/text-share"}
              data-testid="button-share-your-text"
            >
              Share Your Text
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
