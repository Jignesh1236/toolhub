
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Download, Trash2, Clock, Eye, Link2, QrCode, Type, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";

async function fetchSharedTexts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('shared_texts')
    .select('*')
    .order('uploadedAt', { ascending: false });
  if (error) throw error;
  return data || [];
}

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

  const { data: sharedTexts, isLoading, refetch } = useQuery<SharedText[]>({
    queryKey: ["/api/texts"],
    queryFn: fetchSharedTexts,
    refetchInterval: 5000,
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; expiresIn?: string; maxDownloads?: string }) => {
      if (!supabase) throw new Error("Supabase not initialized");
      
      const expiresAt = data.expiresIn ? new Date(Date.now() + parseInt(data.expiresIn) * 3600 * 1000).toISOString() : null;
      
      const { data: savedText, error } = await supabase
        .from('shared_texts')
        .insert([{
          title: data.title,
          content: data.content,
          expiresAt: expiresAt,
          maxDownloads: data.maxDownloads ? parseInt(data.maxDownloads) : null,
          isPublic: true
        }])
        .select()
        .single();

      if (error) throw error;
      return savedText;
    },
    onSuccess: async (data) => {
      toast({
        title: "✅ Text shared successfully",
        description: `Your text is now available for sharing. Expiring in ${expiresIn || '24'} hours.`,
      });
      
      refetch();
      const internalShareUrl = `${window.location.origin}/download-text?id=${data.id}`;
      
      // Generate QR code for the internal share URL
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(internalShareUrl, {
          width: 200,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" }
        });
        setQrCodeUrl(qrCodeDataUrl);
        (window as any).lastInternalTextUrl = internalShareUrl;
      } catch (error) {
        console.error("QR code generation failed:", error);
      }
      
      setTextContent("");
      setTextTitle("");
      setMaxDownloads("");
      setExpiresIn("24");
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
                  <SelectItem value="2">2 Hours</SelectItem>
                  <SelectItem value="6">6 Hours</SelectItem>
                  <SelectItem value="12">12 Hours</SelectItem>
                  <SelectItem value="24">24 Hours</SelectItem>
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

      {/* Shared Texts List */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Share2 className="h-6 w-6" />
          Recently Shared Texts
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sharedTexts && sharedTexts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedTexts.map((text) => (
              <Card key={text.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 bg-muted/50 flex items-start gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Type className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" title={text.title}>
                        {text.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(text.uploadedAt || (text as any).uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Expires: {text.expiresAt || (text as any).expires_at ? new Date(text.expiresAt || (text as any).expires_at).toLocaleTimeString() : '24h'}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {text.downloadCount || (text as any).download_count || 0} views
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          const url = `${window.location.origin}/download-text?id=${text.id}`;
                          navigator.clipboard.writeText(url);
                          toast({ title: "✅ Copied", description: "Link copied to clipboard" });
                        }}
                      >
                        <Link2 className="h-3 w-3 mr-1" />
                        Link
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.open(`${window.location.origin}/download-text?id=${text.id}`, '_blank')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">No texts shared yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
}
