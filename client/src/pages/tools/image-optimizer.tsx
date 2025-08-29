import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ImageOptimizer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [optimizedUrl, setOptimizedUrl] = useState<string>("");
  const [quality, setQuality] = useState([80]);
  const [format, setFormat] = useState<string>("webp");
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [optimizedSize, setOptimizedSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setOriginalSize(file.size);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setOptimizedUrl("");
      setOptimizedSize(0);
    }
  };

  const optimizeImage = async () => {
    if (!selectedFile || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Load the image
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = previewUrl;
      });

      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      const aspectRatio = width / height;

      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress the image
      ctx.drawImage(img, 0, 0, width, height);

      // Get the optimized image as blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          `image/${format}`,
          quality[0] / 100
        );
      });

      setOptimizedSize(blob.size);
      const url = URL.createObjectURL(blob);
      setOptimizedUrl(url);

      toast({
        title: "Image Optimized!",
        description: `File size reduced by ${Math.round(((originalSize - blob.size) / originalSize) * 100)}%`,
      });
    } catch (error) {
      console.error("Optimization error:", error);
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadOptimized = () => {
    if (!optimizedUrl) return;

    const link = document.createElement('a');
    link.href = optimizedUrl;
    link.download = `optimized-image.${format}`;
    link.click();
  };

  const clearAll = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setOptimizedUrl("");
    setOriginalSize(0);
    setOptimizedSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionRatio = originalSize > 0 && optimizedSize > 0 
    ? Math.round(((originalSize - optimizedSize) / originalSize) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Image Optimizer</h1>
          <p className="text-gray-600 dark:text-gray-400">Compress and optimize images without quality loss</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-upload text-blue-500"></i>
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="file-input"
                />
                <i className="fas fa-image text-3xl text-blue-400 mb-3"></i>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Select an image to optimize
                </p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="select-image"
                >
                  Select Image
                </Button>
              </div>

              {selectedFile && (
                <div className="mt-4 space-y-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-file-image text-blue-500"></i>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          Original: {formatFileSize(originalSize)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Output Format</Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger data-testid="format-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="webp">WebP (Best compression)</SelectItem>
                          <SelectItem value="jpeg">JPEG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Quality: {quality[0]}%
                      </Label>
                      <Slider
                        value={quality}
                        onValueChange={setQuality}
                        max={100}
                        min={10}
                        step={5}
                        className="w-full"
                        data-testid="quality-slider"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="maxWidth" className="text-sm font-medium">Max Width (px)</Label>
                        <Input
                          id="maxWidth"
                          type="number"
                          value={maxWidth}
                          onChange={(e) => setMaxWidth(Number(e.target.value))}
                          min={100}
                          max={4000}
                          data-testid="max-width"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxHeight" className="text-sm font-medium">Max Height (px)</Label>
                        <Input
                          id="maxHeight"
                          type="number"
                          value={maxHeight}
                          onChange={(e) => setMaxHeight(Number(e.target.value))}
                          min={100}
                          max={4000}
                          data-testid="max-height"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={optimizeImage}
                        disabled={isProcessing}
                        className="flex-1"
                        data-testid="optimize-button"
                      >
                        {isProcessing ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Optimizing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-compress-arrows-alt mr-2"></i>
                            Optimize
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={clearAll}
                        data-testid="clear-all"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-eye text-green-500"></i>
                Original Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewUrl ? (
                <div className="space-y-3">
                  <div className="relative border rounded-lg overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Original" 
                      className="w-full h-48 object-contain bg-gray-100 dark:bg-gray-800"
                    />
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary">
                      Size: {formatFileSize(originalSize)}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <i className="fas fa-image text-3xl mb-3"></i>
                  <p>Original image preview will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-check-circle text-purple-500"></i>
                Optimized Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {optimizedUrl ? (
                <div className="space-y-3">
                  <div className="relative border rounded-lg overflow-hidden">
                    <img 
                      src={optimizedUrl} 
                      alt="Optimized" 
                      className="w-full h-48 object-contain bg-gray-100 dark:bg-gray-800"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <div className="flex justify-center gap-2">
                      <Badge variant="secondary">
                        Size: {formatFileSize(optimizedSize)}
                      </Badge>
                      <Badge variant={compressionRatio > 0 ? "default" : "secondary"}>
                        {compressionRatio > 0 ? `-${compressionRatio}%` : 'No change'}
                      </Badge>
                    </div>
                    <Button 
                      onClick={downloadOptimized}
                      className="w-full"
                      data-testid="download-optimized"
                    >
                      <i className="fas fa-download mr-2"></i>
                      Download Optimized
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <i className="fas fa-magic text-3xl mb-3"></i>
                  <p>Optimized image will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-star text-yellow-500"></i>
              Optimization Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <i className="fas fa-compress text-2xl text-blue-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Smart Compression</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reduce file size without visible quality loss
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-arrows-alt text-2xl text-green-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Resize Images</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically resize images to optimal dimensions
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-file-export text-2xl text-purple-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Format Conversion</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Convert to modern formats like WebP
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-bolt text-2xl text-yellow-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Fast Processing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lightning-fast optimization in your browser
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}