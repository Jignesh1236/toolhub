import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Share2, Download, Trash2, Clock, Eye, Link2, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import QRCode from "qrcode";

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

export default function FileShare() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [maxDownloads, setMaxDownloads] = useState<string>("");
  const [expiresIn, setExpiresIn] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("https://tmpfiles.org/api/v1/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }
      return response.json();
    },
    onSuccess: async (response) => {
      const data = response.data;
      toast({
        title: "✅ File uploaded successfully",
        description: "File is now available for sharing",
      });
      setSelectedFile(null);
      setMaxDownloads("");
      setExpiresIn("");
      
      // Generate QR code for the share URL
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(data.url, {
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
      
      // queryClient.invalidateQueries({ queryKey: ["/api/files"] });
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "⚠️ No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    // tmpfiles.org uses 'expire' in seconds (60-86400)
    if (expiresIn) {
      const seconds = Math.min(parseInt(expiresIn) * 3600, 86400);
      formData.append("expire", seconds.toString());
    }

    uploadMutation.mutate(formData);
  };

  const generateShareUrl = (fileId: string) => {
    return `${window.location.origin}/shared/${fileId}`;
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

  const generateQRCode = async (fileId: string) => {
    try {
      const shareUrl = generateShareUrl(fileId);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">File Share Tool</h1>
        <p className="text-lg text-muted-foreground">
          Upload files aur QR code ke saath share karo. Files automatically save ho jaati hain aur download count track hota hai.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload File
            </CardTitle>
            <CardDescription>
              Select a file to upload and share with QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload" className="text-sm font-medium">
                Choose File
              </Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                className="mt-1"
                data-testid="input-file-upload"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
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
              disabled={!selectedFile || isUploading}
              className="w-full"
              data-testid="button-upload-file"
            >
              {isUploading ? "Uploading..." : "Upload & Share"}
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
                Scan this QR code to access the file
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <img
                src={qrCodeUrl}
                alt="QR Code for file sharing"
                className="mx-auto border rounded-lg"
                data-testid="img-qr-code"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Share this QR code with anyone to let them access your file
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}