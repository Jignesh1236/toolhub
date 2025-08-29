
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Download, Trash2, Clock, Eye, Link2, QrCode, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import QRCode from "qrcode";

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

export default function TextShare() {
  const [textContent, setTextContent] = useState<string>("");
  const [textTitle, setTextTitle] = useState<string>("");
  const [maxDownloads, setMaxDownloads] = useState<string>("");
  const [expiresIn, setExpiresIn] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const { data: texts, refetch } = useQuery<SharedText[]>({
    queryKey: ["/api/texts"],
    staleTime: 5 * 60 * 1000
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; maxDownloads?: string; expiresIn?: string }) => {
      const response = await fetch("/api/texts/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "✅ Text shared successfully",
        description: `${data.title} is now available for sharing`,
      });
      setTextContent("");
      setTextTitle("");
      setMaxDownloads("");
      setExpiresIn("");
      
      // Generate QR code for the share URL
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(data.shareUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF"
          }
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (error) {
        console.error("QR code generation failed:", error);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/texts"] });
      setIsUploading(false);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (textId: string) => {
      const response = await fetch(`/api/texts/${textId}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Delete failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Text deleted",
        description: "Text has been removed from sharing",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/texts"] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpload = async () => {
    if (!textContent.trim()) {
      toast({
        title: "⚠️ No text entered",
        description: "Please enter some text to share",
        variant: "destructive",
      });
      return;
    }

    if (!textTitle.trim()) {
      toast({
        title: "⚠️ No title entered",
        description: "Please enter a title for your text",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const data = {
      title: textTitle,
      content: textContent,
      maxDownloads: maxDownloads || undefined,
      expiresIn: expiresIn || undefined,
    };

    uploadMutation.mutate(data);
  };

  const generateShareUrl = (textId: string) => {
    return `${window.location.origin}/shared-text/${textId}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "✅ Copied to clipboard",
        description: "Share URL has been copied",
      });
    } catch (error) {
      toast({
        title: "❌ Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const generateQRCode = async (textId: string) => {
    try {
      const shareUrl = generateShareUrl(textId);
      const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      });
      setQrCodeUrl(qrCodeDataUrl);
      toast({
        title: "✅ QR Code generated",
        description: "QR code has been created for sharing",
      });
    } catch (error) {
      toast({
        title: "❌ QR Code generation failed",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const isDownloadLimitReached = (text: SharedText) => {
    return text.maxDownloads && text.downloadCount >= text.maxDownloads;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Text Share Tool</h1>
        <p className="text-lg text-muted-foreground">
          Text share karo QR code ke saath. Text automatically save ho jaati hai aur download count track hota hai.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Share Text
            </CardTitle>
            <CardDescription>
              Enter text to share with QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text-title" className="text-sm font-medium">
                Title
              </Label>
              <input
                id="text-title"
                type="text"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                placeholder="Enter a title for your text"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="input-text-title"
              />
            </div>

            <div>
              <Label htmlFor="text-content" className="text-sm font-medium">
                Text Content
              </Label>
              <Textarea
                id="text-content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter the text you want to share..."
                className="mt-1 min-h-[150px]"
                data-testid="textarea-text-content"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Characters: {textContent.length}
              </p>
            </div>

            <div>
              <Label htmlFor="max-downloads" className="text-sm font-medium">
                Max Downloads (Optional)
              </Label>
              <Select value={maxDownloads} onValueChange={setMaxDownloads}>
                <SelectTrigger data-testid="select-max-downloads">
                  <SelectValue placeholder="No limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Download</SelectItem>
                  <SelectItem value="5">5 Downloads</SelectItem>
                  <SelectItem value="10">10 Downloads</SelectItem>
                  <SelectItem value="25">25 Downloads</SelectItem>
                  <SelectItem value="50">50 Downloads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expires-in" className="text-sm font-medium">
                Expires In (Optional)
              </Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger data-testid="select-expires-in">
                  <SelectValue placeholder="Never expires" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="24">24 Hours</SelectItem>
                  <SelectItem value="168">1 Week</SelectItem>
                  <SelectItem value="720">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!textContent.trim() || !textTitle.trim() || isUploading}
              className="w-full"
              data-testid="button-share-text"
            >
              {isUploading ? "Sharing..." : "Share Text"}
            </Button>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        {qrCodeUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code
              </CardTitle>
              <CardDescription>
                Scan this QR code to access the text
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <img
                src={qrCodeUrl}
                alt="QR Code for text sharing"
                className="mx-auto border rounded-lg"
                data-testid="img-qr-code"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Share this QR code with anyone to let them access your text
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Texts List */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Shared Texts
          </CardTitle>
          <CardDescription>
            Manage your shared texts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!texts || texts.length === 0 ? (
            <div className="text-center py-8">
              <Type className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No texts shared yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {texts.map((text) => (
                <div
                  key={text.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`card-text-${text.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{text.title}</h3>
                      <Badge variant="outline">{text.content.length} chars</Badge>
                      {isExpired(text.expiresAt) && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                      {isDownloadLimitReached(text) && (
                        <Badge variant="destructive">Limit Reached</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {text.downloadCount} views
                      </span>
                      {text.maxDownloads && (
                        <span>Max: {text.maxDownloads}</span>
                      )}
                      {text.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires: {new Date(text.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {text.content.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generateShareUrl(text.id))}
                      data-testid={`button-copy-link-${text.id}`}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateQRCode(text.id)}
                      data-testid={`button-generate-qr-${text.id}`}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/shared-text/${text.id}`, "_blank")}
                      disabled={isExpired(text.expiresAt) || isDownloadLimitReached(text) || false}
                      data-testid={`button-view-${text.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(text.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${text.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
