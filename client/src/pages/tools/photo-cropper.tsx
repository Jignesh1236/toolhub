import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Crop, Image as ImageIcon } from "lucide-react";

export default function PhotoCropper() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("free");
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const aspectRatios = [
    { value: "free", label: "Free Form", ratio: null },
    { value: "1:1", label: "Square (1:1)", ratio: 1 },
    { value: "4:3", label: "Standard (4:3)", ratio: 4/3 },
    { value: "3:4", label: "Portrait (3:4)", ratio: 3/4 },
    { value: "16:9", label: "Widescreen (16:9)", ratio: 16/9 },
    { value: "9:16", label: "Vertical (9:16)", ratio: 9/16 },
    { value: "3:2", label: "Photo (3:2)", ratio: 3/2 },
    { value: "2:3", label: "Photo Portrait (2:3)", ratio: 2/3 },
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setCroppedImage(null);
        setCropArea({ x: 50, y: 50, width: 200, height: 200 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - cropArea.x,
        y: e.clientY - rect.top - cropArea.y
      });
    }
  }, [cropArea]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - rect.left - dragStart.x, rect.width - cropArea.width));
    const newY = Math.max(0, Math.min(e.clientY - rect.top - dragStart.y, rect.height - cropArea.height));
    
    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  }, [isDragging, dragStart, cropArea.width, cropArea.height]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value);
    const selectedRatio = aspectRatios.find(r => r.value === value);
    
    if (selectedRatio?.ratio && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      let newWidth = Math.min(200, containerWidth - 100);
      let newHeight = newWidth / selectedRatio.ratio;
      
      if (newHeight > containerHeight - 100) {
        newHeight = containerHeight - 100;
        newWidth = newHeight * selectedRatio.ratio;
      }
      
      setCropArea(prev => ({
        ...prev,
        width: newWidth,
        height: newHeight,
        x: Math.min(prev.x, containerWidth - newWidth),
        y: Math.min(prev.y, containerHeight - newHeight)
      }));
    }
  };

  const cropImage = async () => {
    if (!originalImage || !canvasRef.current || !imageRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    const container = containerRef.current;
    
    if (!ctx) return;

    // Calculate scale factors
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    
    // Calculate crop dimensions in original image coordinates
    const cropX = cropArea.x * scaleX;
    const cropY = cropArea.y * scaleY;
    const cropWidth = cropArea.width * scaleX;
    const cropHeight = cropArea.height * scaleY;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );
    
    setCroppedImage(canvas.toDataURL('image/jpeg', 0.9));
  };

  const downloadImage = () => {
    if (croppedImage) {
      const link = document.createElement('a');
      link.download = 'cropped-image.jpg';
      link.href = croppedImage;
      link.click();
    }
  };

  const resetCropper = () => {
    setOriginalImage(null);
    setCroppedImage(null);
    setCropArea({ x: 50, y: 50, width: 200, height: 200 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Photo Cropper</h1>
          <p className="text-lg text-gray-600">Crop photos to custom sizes and aspect ratios</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crop className="h-5 w-5" />
              Image Cropping Tool
            </CardTitle>
            <CardDescription>
              Upload an image and crop it to your desired size and aspect ratio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="image-upload">Upload Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={handleAspectRatioChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map((ratio) => (
                      <SelectItem key={ratio.value} value={ratio.value}>
                        {ratio.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={cropImage} 
                disabled={!originalImage}
                className="flex-1"
              >
                <Crop className="h-4 w-4 mr-2" />
                Crop Image
              </Button>
              <Button onClick={resetCropper} variant="outline">
                Reset
              </Button>
            </div>

            {originalImage && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">Crop Area (Drag to adjust)</Label>
                <div 
                  ref={containerRef}
                  className="relative border rounded-lg overflow-hidden bg-gray-100"
                  style={{ maxHeight: '500px' }}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img 
                    ref={imageRef}
                    src={originalImage} 
                    alt="Original" 
                    className="w-full h-auto max-h-96 object-contain"
                    draggable={false}
                  />
                  
                  {/* Crop overlay */}
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 cursor-move"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height,
                    }}
                    onMouseDown={handleMouseDown}
                  >
                    <div className="absolute inset-0 border border-white border-dashed"></div>
                    
                    {/* Corner handles */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white"></div>
                  </div>
                </div>
              </div>
            )}

            {croppedImage && (
              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Cropped Image
                </Label>
                <div className="border rounded-lg p-4 bg-white">
                  <img 
                    src={croppedImage} 
                    alt="Cropped" 
                    className="w-full h-auto max-h-96 object-contain mx-auto"
                  />
                </div>
                <div className="flex justify-center">
                  <Button onClick={downloadImage} className="px-8">
                    <Download className="h-4 w-4 mr-2" />
                    Download Cropped Image
                  </Button>
                </div>
              </div>
            )}

            {!originalImage && (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">Click to upload an image</p>
                <p className="text-sm text-gray-500">Select an image to start cropping</p>
              </div>
            )}
          </CardContent>
        </Card>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}