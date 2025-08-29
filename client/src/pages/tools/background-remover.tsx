import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Scissors, Image as ImageIcon, AlertCircle, Pipette, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [removalMode, setRemovalMode] = useState<"auto" | "color-picker">("auto");
  const [selectedColor, setSelectedColor] = useState<{r: number, g: number, b: number} | null>(null);
  const [tolerance, setTolerance] = useState([30]);
  const [isColorPickerActive, setIsColorPickerActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!isColorPickerActive || !imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    const rect = img.getBoundingClientRect();
    
    // Calculate click position relative to image
    const x = Math.floor((event.clientX - rect.left) * (img.naturalWidth / rect.width));
    const y = Math.floor((event.clientY - rect.top) * (img.naturalHeight / rect.height));
    
    // Draw image to canvas to get pixel data
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx?.drawImage(img, 0, 0);
    
    // Get pixel color at clicked position
    const imageData = ctx?.getImageData(x, y, 1, 1);
    if (imageData) {
      const data = imageData.data;
      const color = {
        r: data[0],
        g: data[1],
        b: data[2]
      };
      setSelectedColor(color);
      setIsColorPickerActive(false);
    }
  };

  const colorDistance = (color1: {r: number, g: number, b: number}, color2: {r: number, g: number, b: number}) => {
    const rDiff = color1.r - color2.r;
    const gDiff = color1.g - color2.g;
    const bDiff = color1.b - color2.b;
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
  };

  const removeBackground = async () => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const data = imageData.data;
          
          if (removalMode === "auto") {
            // Auto mode: removes white/light backgrounds
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              if (r > 240 && g > 240 && b > 240) {
                data[i + 3] = 0; // Make transparent
              }
            }
          } else if (removalMode === "color-picker" && selectedColor) {
            // Color picker mode: removes selected color with tolerance
            const toleranceValue = tolerance[0];
            
            for (let i = 0; i < data.length; i += 4) {
              const pixelColor = {
                r: data[i],
                g: data[i + 1],
                b: data[i + 2]
              };
              
              const distance = colorDistance(pixelColor, selectedColor);
              if (distance <= toleranceValue) {
                data[i + 3] = 0; // Make transparent
              }
            }
          }
          
          ctx?.putImageData(imageData, 0, 0);
          setProcessedImage(canvas.toDataURL('image/png'));
        }
        setIsProcessing(false);
      };
      
      img.src = originalImage;
    } catch (error) {
      console.error('Background removal error:', error);
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.download = 'background-removed.png';
      link.href = processedImage;
      link.click();
    }
  };

  const resetEditor = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setSelectedColor(null);
    setIsColorPickerActive(false);
    setRemovalMode("auto");
    setTolerance([30]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Background Remover</h1>
          <p className="text-lg text-gray-600">Remove backgrounds from your images automatically</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              Background Removal Tool
            </CardTitle>
            <CardDescription>
              Remove backgrounds automatically or use the color picker to select specific colors to remove.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="image-upload">Upload Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="flex-1"
                />
                <Button onClick={resetEditor} variant="outline">
                  Reset
                </Button>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {removalMode === "auto" 
                  ? "Auto mode removes white/light backgrounds. Use Color Picker mode to remove specific colors." 
                  : "Click the eyedropper button, then click on the image to select a color to remove. Adjust tolerance to remove similar colors."}
              </AlertDescription>
            </Alert>

            {originalImage && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Removal Mode</Label>
                    <Select value={removalMode} onValueChange={(value: "auto" | "color-picker") => {
                      setRemovalMode(value);
                      setSelectedColor(null);
                      setIsColorPickerActive(false);
                      setProcessedImage(null);
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (White Background)</SelectItem>
                        <SelectItem value="color-picker">Color Picker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {removalMode === "color-picker" && (
                    <div className="space-y-2">
                      <Label>Tolerance: {tolerance[0]}</Label>
                      <Slider
                        value={tolerance}
                        onValueChange={setTolerance}
                        max={100}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {removalMode === "color-picker" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => setIsColorPickerActive(!isColorPickerActive)}
                        variant={isColorPickerActive ? "default" : "outline"}
                        size="sm"
                      >
                        <Pipette className="h-4 w-4 mr-2" />
                        {isColorPickerActive ? "Cancel Color Pick" : "Pick Color"}
                      </Button>
                      
                      {selectedColor && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 border rounded border-gray-300"
                            style={{ backgroundColor: `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})` }}
                          />
                          <span className="text-sm text-gray-600">
                            RGB({selectedColor.r}, {selectedColor.g}, {selectedColor.b})
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {isColorPickerActive && (
                      <Alert>
                        <Target className="h-4 w-4" />
                        <AlertDescription>
                          Click on the image below to select the color you want to remove.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            )}

            {originalImage && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button 
                    onClick={removeBackground} 
                    disabled={isProcessing || (removalMode === "color-picker" && !selectedColor)}
                    className="px-8"
                  >
                    {isProcessing ? 'Processing...' : 'Remove Background'}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Original Image
                    </Label>
                    <div className="border rounded-lg p-4 bg-white">
                      <img 
                        ref={imageRef}
                        src={originalImage} 
                        alt="Original" 
                        className={`w-full h-auto max-h-96 object-contain mx-auto ${
                          isColorPickerActive ? 'cursor-crosshair' : 'cursor-default'
                        }`}
                        onClick={handleImageClick}
                      />
                      {isColorPickerActive && (
                        <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Scissors className="h-4 w-4" />
                      Background Removed
                    </Label>
                    <div className="border rounded-lg p-4 bg-checkered">
                      {processedImage ? (
                        <img 
                          src={processedImage} 
                          alt="Background Removed" 
                          className="w-full h-auto max-h-96 object-contain mx-auto"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-96 text-gray-400">
                          {isProcessing ? 'Processing...' : 'Processed image will appear here'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {processedImage && (
                  <div className="flex justify-center">
                    <Button onClick={downloadImage} className="px-8">
                      <Download className="h-4 w-4 mr-2" />
                      Download PNG
                    </Button>
                  </div>
                )}
              </div>
            )}

            {!originalImage && (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">Click to upload an image</p>
                <p className="text-sm text-gray-500">Supports JPEG, PNG, and other image formats</p>
              </div>
            )}
          </CardContent>
        </Card>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}