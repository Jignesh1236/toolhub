import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Upload, Download, Image as ImageIcon, Palette, Wand2, Loader2, RotateCw, Crop, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageFilter {
  id: string;
  name: string;
  enabled: boolean;
  intensity: number;
}

interface ImageAdjustment {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sharpen: number;
  sepia: number;
  grayscale: number;
}

export default function ImageEditor() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [editedImageUrl, setEditedImageUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("adjust");
  const [rotation, setRotation] = useState(0);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [adjustments, setAdjustments] = useState<ImageAdjustment>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
    sharpen: 0,
    sepia: 0,
    grayscale: 0,
  });
  const [filters, setFilters] = useState<ImageFilter[]>([
    { id: "vintage", name: "Vintage", enabled: false, intensity: 50 },
    { id: "dramatic", name: "Dramatic", enabled: false, intensity: 60 },
    { id: "vivid", name: "Vivid", enabled: false, intensity: 70 },
    { id: "noir", name: "Noir", enabled: false, intensity: 80 },
    { id: "warm", name: "Warm", enabled: false, intensity: 50 },
    { id: "cool", name: "Cool", enabled: false, intensity: 50 },
    { id: "soft", name: "Soft Focus", enabled: false, intensity: 40 },
    { id: "high-contrast", name: "High Contrast", enabled: false, intensity: 75 },
  ]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        setEditedImageUrl("");
        resetAdjustments();
        
        toast({
          title: "Image loaded",
          description: "Image ready for editing",
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, GIF, WebP)",
          variant: "destructive",
        });
      }
    }
  };

  const resetAdjustments = () => {
    setAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0,
      sharpen: 0,
      sepia: 0,
      grayscale: 0,
    });
    setRotation(0);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
    setFilters(filters => filters.map(f => ({ ...f, enabled: false })));
  };

  const updateAdjustment = (key: keyof ImageAdjustment, value: number) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
    applyRealTimeEffects();
  };

  const applyRealTimeEffects = () => {
    if (!imageRef.current || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Build filter string
    const filterParts = [];
    
    if (adjustments.brightness !== 0) {
      filterParts.push(`brightness(${100 + adjustments.brightness}%)`);
    }
    if (adjustments.contrast !== 0) {
      filterParts.push(`contrast(${100 + adjustments.contrast}%)`);
    }
    if (adjustments.saturation !== 0) {
      filterParts.push(`saturate(${100 + adjustments.saturation}%)`);
    }
    if (adjustments.hue !== 0) {
      filterParts.push(`hue-rotate(${adjustments.hue}deg)`);
    }
    if (adjustments.blur > 0) {
      filterParts.push(`blur(${adjustments.blur}px)`);
    }
    if (adjustments.sepia > 0) {
      filterParts.push(`sepia(${adjustments.sepia}%)`);
    }
    if (adjustments.grayscale > 0) {
      filterParts.push(`grayscale(${adjustments.grayscale}%)`);
    }

    // Apply enabled filters
    filters.forEach(filter => {
      if (filter.enabled) {
        switch (filter.id) {
          case "vintage":
            filterParts.push(`sepia(${filter.intensity}%) contrast(110%)`);
            break;
          case "dramatic":
            filterParts.push(`contrast(${100 + filter.intensity}%) saturate(130%)`);
            break;
          case "vivid":
            filterParts.push(`saturate(${100 + filter.intensity}%) contrast(115%)`);
            break;
          case "noir":
            filterParts.push(`grayscale(100%) contrast(${100 + filter.intensity}%)`);
            break;
          case "warm":
            filterParts.push(`hue-rotate(15deg) saturate(${100 + filter.intensity / 2}%)`);
            break;
          case "cool":
            filterParts.push(`hue-rotate(-15deg) saturate(${100 + filter.intensity / 2}%)`);
            break;
          case "soft":
            filterParts.push(`blur(${filter.intensity / 20}px) brightness(105%)`);
            break;
          case "high-contrast":
            filterParts.push(`contrast(${100 + filter.intensity}%)`);
            break;
        }
      }
    });

    if (filterParts.length > 0) {
      ctx.filter = filterParts.join(' ');
    }

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  useEffect(() => {
    if (imageUrl && imageRef.current) {
      imageRef.current.onload = () => {
        applyRealTimeEffects();
      };
    }
  }, [imageUrl, adjustments, rotation, filters]);

  const cropImage = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const img = imageRef.current;
      const cropX = (cropArea.x / 100) * img.naturalWidth;
      const cropY = (cropArea.y / 100) * img.naturalHeight;
      const cropWidth = (cropArea.width / 100) * img.naturalWidth;
      const cropHeight = (cropArea.height / 100) * img.naturalHeight;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 500));

      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );

      setProgress(100);
      const croppedUrl = canvas.toDataURL('image/png');
      setEditedImageUrl(croppedUrl);

      toast({
        title: "Success!",
        description: "Image cropped successfully",
      });

    } catch (error) {
      console.error('Error cropping image:', error);
      toast({
        title: "Error",
        description: "Failed to crop image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const rotateImage = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const img = imageRef.current;
      
      // Adjust canvas size for rotation
      if (rotation % 180 === 90) {
        canvas.width = img.naturalHeight;
        canvas.height = img.naturalWidth;
      } else {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }

      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 500));

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();

      setProgress(100);
      const rotatedUrl = canvas.toDataURL('image/png');
      setEditedImageUrl(rotatedUrl);

      toast({
        title: "Success!",
        description: "Image rotated successfully",
      });

    } catch (error) {
      console.error('Error rotating image:', error);
      toast({
        title: "Error",
        description: "Failed to rotate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const applyEffects = async () => {
    if (!previewCanvasRef.current) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const processedUrl = previewCanvasRef.current.toDataURL('image/png');
      setEditedImageUrl(processedUrl);
      setProgress(100);

      toast({
        title: "Success!",
        description: "Effects applied successfully",
      });

    } catch (error) {
      console.error('Error applying effects:', error);
      toast({
        title: "Error",
        description: "Failed to apply effects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFilter = (filterId: string) => {
    setFilters(filters => 
      filters.map(filter => 
        filter.id === filterId ? { ...filter, enabled: !filter.enabled } : filter
      )
    );
  };

  const updateFilterIntensity = (filterId: string, intensity: number) => {
    setFilters(filters => 
      filters.map(filter => 
        filter.id === filterId ? { ...filter, intensity } : filter
      )
    );
  };

  const downloadImage = () => {
    if (!editedImageUrl) return;

    const link = document.createElement('a');
    link.href = editedImageUrl;
    link.download = `edited-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Image Editor</h1>
        <p className="text-muted-foreground">
          Professional image editing with filters, adjustments, and effects
        </p>
      </div>

      <div className="grid gap-6">
        <Card data-testid="image-upload-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Image
            </CardTitle>
            <CardDescription>
              Select an image to edit (JPEG, PNG, GIF, WebP)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                  data-testid="input-image-file"
                />
              </div>
              
              {selectedImage && (
                <Alert>
                  <ImageIcon className="h-4 w-4" />
                  <AlertDescription>
                    {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {imageUrl && (
          <Card data-testid="image-preview-card">
            <CardHeader>
              <CardTitle>Image Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Original</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      ref={imageRef}
                      src={imageUrl}
                      alt="Original"
                      className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-800"
                      data-testid="img-original"
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <canvas
                      ref={previewCanvasRef}
                      className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-800"
                      data-testid="canvas-preview"
                      style={{ maxWidth: '100%', height: '256px' }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {imageUrl && (
          <Card data-testid="editing-tools-card">
            <CardHeader>
              <CardTitle>Editing Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="adjust" data-testid="tab-adjust">
                    <Settings className="h-4 w-4 mr-2" />
                    Adjust
                  </TabsTrigger>
                  <TabsTrigger value="filters" data-testid="tab-filters">
                    <Palette className="h-4 w-4 mr-2" />
                    Filters
                  </TabsTrigger>
                  <TabsTrigger value="crop" data-testid="tab-crop">
                    <Crop className="h-4 w-4 mr-2" />
                    Crop
                  </TabsTrigger>
                  <TabsTrigger value="rotate" data-testid="tab-rotate">
                    <RotateCw className="h-4 w-4 mr-2" />
                    Rotate
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="adjust" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Color & Light Adjustments</h4>
                    
                    <div className="grid gap-4">
                      {Object.entries(adjustments).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}: {value}</Label>
                          <Slider
                            value={[value]}
                            onValueChange={(newValue) => updateAdjustment(key as keyof ImageAdjustment, newValue[0])}
                            min={key === 'hue' ? -180 : -100}
                            max={key === 'hue' ? 180 : 100}
                            step={1}
                            className="w-full"
                            data-testid={`slider-${key}`}
                          />
                        </div>
                      ))}
                    </div>

                    <Separator />
                    
                    <Button
                      onClick={applyEffects}
                      disabled={isProcessing}
                      className="w-full"
                      data-testid="button-apply-adjustments"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Apply Adjustments
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={resetAdjustments}
                      variant="outline"
                      className="w-full"
                      data-testid="button-reset"
                    >
                      Reset All
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="filters" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Creative Filters</h4>
                    
                    <div className="grid gap-4">
                      {filters.map((filter) => (
                        <div key={filter.id} className="space-y-2 p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={filter.enabled}
                                onChange={() => toggleFilter(filter.id)}
                                className="rounded"
                                data-testid={`checkbox-filter-${filter.id}`}
                              />
                              <span className="font-medium">{filter.name}</span>
                            </div>
                          </div>
                          
                          {filter.enabled && (
                            <div className="flex items-center space-x-4">
                              <Label className="text-sm">Intensity:</Label>
                              <Slider
                                value={[filter.intensity]}
                                onValueChange={(value) => updateFilterIntensity(filter.id, value[0])}
                                max={100}
                                step={1}
                                className="flex-1"
                                data-testid={`slider-filter-${filter.id}`}
                              />
                              <span className="text-sm w-10">{filter.intensity}%</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      onClick={applyEffects}
                      disabled={isProcessing || !filters.some(f => f.enabled)}
                      className="w-full"
                      data-testid="button-apply-filters"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Applying Filters...
                        </>
                      ) : (
                        <>
                          <Palette className="h-4 w-4 mr-2" />
                          Apply Filters
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="crop" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Crop Image</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="crop-x">X Position (%)</Label>
                        <Input
                          id="crop-x"
                          type="number"
                          min="0"
                          max="100"
                          value={cropArea.x}
                          onChange={(e) => setCropArea({...cropArea, x: Number(e.target.value)})}
                          data-testid="input-crop-x"
                        />
                      </div>
                      <div>
                        <Label htmlFor="crop-y">Y Position (%)</Label>
                        <Input
                          id="crop-y"
                          type="number"
                          min="0"
                          max="100"
                          value={cropArea.y}
                          onChange={(e) => setCropArea({...cropArea, y: Number(e.target.value)})}
                          data-testid="input-crop-y"
                        />
                      </div>
                      <div>
                        <Label htmlFor="crop-width">Width (%)</Label>
                        <Input
                          id="crop-width"
                          type="number"
                          min="1"
                          max="100"
                          value={cropArea.width}
                          onChange={(e) => setCropArea({...cropArea, width: Number(e.target.value)})}
                          data-testid="input-crop-width"
                        />
                      </div>
                      <div>
                        <Label htmlFor="crop-height">Height (%)</Label>
                        <Input
                          id="crop-height"
                          type="number"
                          min="1"
                          max="100"
                          value={cropArea.height}
                          onChange={(e) => setCropArea({...cropArea, height: Number(e.target.value)})}
                          data-testid="input-crop-height"
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={cropImage}
                      disabled={isProcessing}
                      className="w-full"
                      data-testid="button-crop"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cropping...
                        </>
                      ) : (
                        <>
                          <Crop className="h-4 w-4 mr-2" />
                          Crop Image
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="rotate" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Rotate Image</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rotation">Rotation: {rotation}°</Label>
                        <Slider
                          value={[rotation]}
                          onValueChange={(value) => setRotation(value[0])}
                          min={0}
                          max={360}
                          step={90}
                          className="w-full"
                          data-testid="slider-rotation"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        <Button
                          onClick={() => setRotation(0)}
                          variant="outline"
                          size="sm"
                          data-testid="button-rotate-0"
                        >
                          0°
                        </Button>
                        <Button
                          onClick={() => setRotation(90)}
                          variant="outline"
                          size="sm"
                          data-testid="button-rotate-90"
                        >
                          90°
                        </Button>
                        <Button
                          onClick={() => setRotation(180)}
                          variant="outline"
                          size="sm"
                          data-testid="button-rotate-180"
                        >
                          180°
                        </Button>
                        <Button
                          onClick={() => setRotation(270)}
                          variant="outline"
                          size="sm"
                          data-testid="button-rotate-270"
                        >
                          270°
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      onClick={rotateImage}
                      disabled={isProcessing}
                      className="w-full"
                      data-testid="button-apply-rotation"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Rotating...
                        </>
                      ) : (
                        <>
                          <RotateCw className="h-4 w-4 mr-2" />
                          Apply Rotation
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

        {editedImageUrl && (
          <Card data-testid="result-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Edited Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={editedImageUrl}
                    alt="Edited"
                    className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-800"
                    data-testid="img-result"
                  />
                </div>
                
                <Button
                  onClick={downloadImage}
                  className="w-full"
                  data-testid="button-download"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Edited Image
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}