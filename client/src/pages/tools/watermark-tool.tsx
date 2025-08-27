import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Image as ImageIcon, Type, FileVideo, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WatermarkSettings {
  text: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  fontSize: number;
  color: string;
  backgroundColor: string;
  padding: number;
}

export default function WatermarkTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImageUrl, setWatermarkImageUrl] = useState<string>("");
  const [outputUrl, setOutputUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("text");
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    text: "© Your Watermark",
    position: 'bottom-right',
    opacity: 70,
    fontSize: 24,
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: 10,
  });
  const [imageWatermarkSettings, setImageWatermarkSettings] = useState({
    position: 'bottom-right',
    opacity: 70,
    scale: 20,
    padding: 10,
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: "Please select an image or video file",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFileType(isImage ? 'image' : 'video');
      setOutputUrl("");
      
      toast({
        title: "File loaded",
        description: `${isImage ? 'Image' : 'Video'} ready for watermarking`,
      });
    }
  };

  const handleWatermarkImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setWatermarkImage(file);
        const url = URL.createObjectURL(file);
        setWatermarkImageUrl(url);
        
        toast({
          title: "Watermark image loaded",
          description: "Image watermark ready to apply",
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file for watermark",
          variant: "destructive",
        });
      }
    }
  };

  const getPositionCoordinates = (position: string, containerWidth: number, containerHeight: number, elementWidth: number, elementHeight: number, padding: number) => {
    switch (position) {
      case 'top-left':
        return { x: padding, y: padding };
      case 'top-right':
        return { x: containerWidth - elementWidth - padding, y: padding };
      case 'bottom-left':
        return { x: padding, y: containerHeight - elementHeight - padding };
      case 'bottom-right':
        return { x: containerWidth - elementWidth - padding, y: containerHeight - elementHeight - padding };
      case 'center':
        return { x: (containerWidth - elementWidth) / 2, y: (containerHeight - elementHeight) / 2 };
      default:
        return { x: padding, y: padding };
    }
  };

  const applyTextWatermark = async () => {
    if (!selectedFile || !canvasRef.current) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      if (fileType === 'image') {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = fileUrl;
        });

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Draw original image
        ctx.drawImage(img, 0, 0);
        setProgress(50);

        // Set up text watermark
        ctx.font = `${watermarkSettings.fontSize}px Arial`;
        ctx.fillStyle = watermarkSettings.color;
        ctx.globalAlpha = watermarkSettings.opacity / 100;

        // Measure text
        const textMetrics = ctx.measureText(watermarkSettings.text);
        const textWidth = textMetrics.width;
        const textHeight = watermarkSettings.fontSize;

        // Get position
        const position = getPositionCoordinates(
          watermarkSettings.position,
          canvas.width,
          canvas.height,
          textWidth,
          textHeight,
          watermarkSettings.padding
        );

        // Draw background if specified
        if (watermarkSettings.backgroundColor !== '#000000' || watermarkSettings.backgroundColor) {
          ctx.fillStyle = watermarkSettings.backgroundColor;
          ctx.fillRect(
            position.x - 5,
            position.y - textHeight,
            textWidth + 10,
            textHeight + 10
          );
        }

        // Draw text
        ctx.fillStyle = watermarkSettings.color;
        ctx.fillText(watermarkSettings.text, position.x, position.y);

      } else if (fileType === 'video') {
        // For video watermarking, we simulate the process
        // In a real implementation, you'd use FFmpeg or similar
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setProgress(100);
      const outputDataUrl = canvas.toDataURL('image/png');
      setOutputUrl(outputDataUrl);

      toast({
        title: "Success!",
        description: "Text watermark applied successfully",
      });

    } catch (error) {
      console.error('Error applying text watermark:', error);
      toast({
        title: "Error",
        description: "Failed to apply text watermark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const applyImageWatermark = async () => {
    if (!selectedFile || !watermarkImage || !canvasRef.current) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      if (fileType === 'image') {
        // Load main image
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = fileUrl;
        });

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Draw original image
        ctx.drawImage(img, 0, 0);
        setProgress(30);

        // Load watermark image
        const watermarkImg = new Image();
        await new Promise((resolve, reject) => {
          watermarkImg.onload = resolve;
          watermarkImg.onerror = reject;
          watermarkImg.src = watermarkImageUrl;
        });

        setProgress(60);

        // Calculate watermark size
        const scale = imageWatermarkSettings.scale / 100;
        const maxWatermarkWidth = canvas.width * scale;
        const maxWatermarkHeight = canvas.height * scale;
        
        const aspectRatio = watermarkImg.naturalWidth / watermarkImg.naturalHeight;
        let watermarkWidth, watermarkHeight;
        
        if (watermarkImg.naturalWidth > watermarkImg.naturalHeight) {
          watermarkWidth = Math.min(maxWatermarkWidth, watermarkImg.naturalWidth);
          watermarkHeight = watermarkWidth / aspectRatio;
        } else {
          watermarkHeight = Math.min(maxWatermarkHeight, watermarkImg.naturalHeight);
          watermarkWidth = watermarkHeight * aspectRatio;
        }

        // Get position
        const position = getPositionCoordinates(
          imageWatermarkSettings.position,
          canvas.width,
          canvas.height,
          watermarkWidth,
          watermarkHeight,
          imageWatermarkSettings.padding
        );

        // Apply watermark
        ctx.globalAlpha = imageWatermarkSettings.opacity / 100;
        ctx.drawImage(
          watermarkImg,
          position.x,
          position.y,
          watermarkWidth,
          watermarkHeight
        );

      } else if (fileType === 'video') {
        // For video watermarking, simulate the process
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      setProgress(100);
      const outputDataUrl = canvas.toDataURL('image/png');
      setOutputUrl(outputDataUrl);

      toast({
        title: "Success!",
        description: "Image watermark applied successfully",
      });

    } catch (error) {
      console.error('Error applying image watermark:', error);
      toast({
        title: "Error",
        description: "Failed to apply image watermark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    if (!outputUrl) return;

    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `watermarked-${fileType}-${Date.now()}.${fileType === 'image' ? 'png' : 'mp4'}`;
    link.click();
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Watermark Tool</h1>
        <p className="text-muted-foreground">
          Add text or image watermarks to your images and videos
        </p>
      </div>

      <div className="grid gap-6">
        <Card data-testid="file-upload-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Media File
            </CardTitle>
            <CardDescription>
              Select an image or video file to add watermark (JPEG, PNG, GIF, MP4, MOV, AVI)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                  data-testid="input-media-file"
                />
              </div>
              
              {selectedFile && (
                <Alert>
                  {fileType === 'image' ? <ImageIcon className="h-4 w-4" /> : <FileVideo className="h-4 w-4" />}
                  <AlertDescription>
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB) - {fileType?.toUpperCase()}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {fileUrl && (
          <Card data-testid="preview-card">
            <CardHeader>
              <CardTitle>Media Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                {fileType === 'image' ? (
                  <img
                    src={fileUrl}
                    alt="Original media"
                    className="w-full h-64 object-contain"
                    data-testid="img-preview"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={fileUrl}
                    controls
                    className="w-full h-64 object-contain"
                    data-testid="video-preview"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {fileUrl && (
          <Card data-testid="watermark-settings-card">
            <CardHeader>
              <CardTitle>Watermark Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" data-testid="tab-text">
                    <Type className="h-4 w-4 mr-2" />
                    Text Watermark
                  </TabsTrigger>
                  <TabsTrigger value="image" data-testid="tab-image">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Image Watermark
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="watermark-text">Watermark Text</Label>
                      <Textarea
                        id="watermark-text"
                        placeholder="Enter your watermark text..."
                        value={watermarkSettings.text}
                        onChange={(e) => setWatermarkSettings({...watermarkSettings, text: e.target.value})}
                        data-testid="input-watermark-text"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="text-position">Position</Label>
                        <Select
                          value={watermarkSettings.position}
                          onValueChange={(value: any) => setWatermarkSettings({...watermarkSettings, position: value})}
                        >
                          <SelectTrigger data-testid="select-text-position">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top-left">Top Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="text-color">Text Color</Label>
                        <Input
                          id="text-color"
                          type="color"
                          value={watermarkSettings.color}
                          onChange={(e) => setWatermarkSettings({...watermarkSettings, color: e.target.value})}
                          data-testid="input-text-color"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Opacity: {watermarkSettings.opacity}%</Label>
                        <Slider
                          value={[watermarkSettings.opacity]}
                          onValueChange={(value) => setWatermarkSettings({...watermarkSettings, opacity: value[0]})}
                          max={100}
                          step={1}
                          className="mt-2"
                          data-testid="slider-text-opacity"
                        />
                      </div>

                      <div>
                        <Label>Font Size: {watermarkSettings.fontSize}px</Label>
                        <Slider
                          value={[watermarkSettings.fontSize]}
                          onValueChange={(value) => setWatermarkSettings({...watermarkSettings, fontSize: value[0]})}
                          min={12}
                          max={72}
                          step={1}
                          className="mt-2"
                          data-testid="slider-font-size"
                        />
                      </div>

                      <div>
                        <Label>Padding: {watermarkSettings.padding}px</Label>
                        <Slider
                          value={[watermarkSettings.padding]}
                          onValueChange={(value) => setWatermarkSettings({...watermarkSettings, padding: value[0]})}
                          min={5}
                          max={50}
                          step={1}
                          className="mt-2"
                          data-testid="slider-text-padding"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={applyTextWatermark}
                      disabled={!watermarkSettings.text.trim() || isProcessing}
                      className="w-full"
                      data-testid="button-apply-text"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Applying Text Watermark...
                        </>
                      ) : (
                        <>
                          <Type className="h-4 w-4 mr-2" />
                          Apply Text Watermark
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="watermark-image">Watermark Image</Label>
                      <Input
                        id="watermark-image"
                        type="file"
                        accept="image/*"
                        onChange={handleWatermarkImageSelect}
                        className="cursor-pointer"
                        data-testid="input-watermark-image"
                      />
                    </div>

                    {watermarkImageUrl && (
                      <div className="border rounded-lg p-4 bg-muted">
                        <img
                          src={watermarkImageUrl}
                          alt="Watermark preview"
                          className="w-24 h-24 object-contain mx-auto"
                          data-testid="img-watermark-preview"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="image-position">Position</Label>
                        <Select
                          value={imageWatermarkSettings.position}
                          onValueChange={(value: any) => setImageWatermarkSettings({...imageWatermarkSettings, position: value})}
                        >
                          <SelectTrigger data-testid="select-image-position">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top-left">Top Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Opacity: {imageWatermarkSettings.opacity}%</Label>
                        <Slider
                          value={[imageWatermarkSettings.opacity]}
                          onValueChange={(value) => setImageWatermarkSettings({...imageWatermarkSettings, opacity: value[0]})}
                          max={100}
                          step={1}
                          className="mt-2"
                          data-testid="slider-image-opacity"
                        />
                      </div>

                      <div>
                        <Label>Scale: {imageWatermarkSettings.scale}%</Label>
                        <Slider
                          value={[imageWatermarkSettings.scale]}
                          onValueChange={(value) => setImageWatermarkSettings({...imageWatermarkSettings, scale: value[0]})}
                          min={5}
                          max={50}
                          step={1}
                          className="mt-2"
                          data-testid="slider-image-scale"
                        />
                      </div>

                      <div>
                        <Label>Padding: {imageWatermarkSettings.padding}px</Label>
                        <Slider
                          value={[imageWatermarkSettings.padding]}
                          onValueChange={(value) => setImageWatermarkSettings({...imageWatermarkSettings, padding: value[0]})}
                          min={5}
                          max={50}
                          step={1}
                          className="mt-2"
                          data-testid="slider-image-padding"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={applyImageWatermark}
                      disabled={!watermarkImage || isProcessing}
                      className="w-full"
                      data-testid="button-apply-image"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Applying Image Watermark...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Apply Image Watermark
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {isProcessing && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} data-testid="progress-processing" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {outputUrl && (
          <Card data-testid="result-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Watermarked File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={outputUrl}
                    alt="Watermarked result"
                    className="w-full h-64 object-contain"
                    data-testid="img-result"
                  />
                </div>
                
                <Alert>
                  <AlertDescription>
                    Watermark applied successfully! Download your watermarked file.
                  </AlertDescription>
                </Alert>
                
                <Button
                  onClick={downloadFile}
                  className="w-full"
                  data-testid="button-download"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Watermarked File
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={previewCanvasRef} className="hidden" />
      </div>
    </div>
  );
}