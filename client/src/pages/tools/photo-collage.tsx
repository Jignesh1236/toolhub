import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Grid3X3, Image as ImageIcon, Plus, X } from "lucide-react";

export default function PhotoCollage() {
  const [images, setImages] = useState<string[]>([]);
  const [layout, setLayout] = useState<string>("2x2");
  const [collageImage, setCollageImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const layouts = [
    { value: "2x2", label: "2×2 Grid", cols: 2, rows: 2 },
    { value: "3x3", label: "3×3 Grid", cols: 3, rows: 3 },
    { value: "1x2", label: "1×2 Horizontal", cols: 2, rows: 1 },
    { value: "2x1", label: "2×1 Vertical", cols: 1, rows: 2 },
    { value: "1x3", label: "1×3 Strip", cols: 3, rows: 1 },
    { value: "3x1", label: "3×1 Stack", cols: 1, rows: 3 },
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const createCollage = async () => {
    if (images.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const selectedLayout = layouts.find(l => l.value === layout);
    
    if (!selectedLayout || !ctx) return;

    const { cols, rows } = selectedLayout;
    const cellWidth = 300;
    const cellHeight = 300;
    const padding = 10;
    
    canvas.width = cols * cellWidth + (cols + 1) * padding;
    canvas.height = rows * cellHeight + (rows + 1) * padding;
    
    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const maxImages = cols * rows;
    const imagesToUse = images.slice(0, maxImages);

    for (let i = 0; i < imagesToUse.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      const x = col * cellWidth + (col + 1) * padding;
      const y = row * cellHeight + (row + 1) * padding;

      const img = new Image();
      await new Promise((resolve) => {
        img.onload = () => {
          // Draw image with aspect ratio maintained
          const imgAspect = img.width / img.height;
          const cellAspect = cellWidth / cellHeight;
          
          let drawWidth = cellWidth;
          let drawHeight = cellHeight;
          let drawX = x;
          let drawY = y;
          
          if (imgAspect > cellAspect) {
            drawHeight = cellWidth / imgAspect;
            drawY = y + (cellHeight - drawHeight) / 2;
          } else {
            drawWidth = cellHeight * imgAspect;
            drawX = x + (cellWidth - drawWidth) / 2;
          }
          
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          resolve(null);
        };
        img.src = imagesToUse[i];
      });
    }

    setCollageImage(canvas.toDataURL('image/jpeg', 0.9));
  };

  const downloadCollage = () => {
    if (collageImage) {
      const link = document.createElement('a');
      link.download = 'photo-collage.jpg';
      link.href = collageImage;
      link.click();
    }
  };

  const resetCollage = () => {
    setImages([]);
    setCollageImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Photo Collage Maker</h1>
          <p className="text-lg text-gray-600">Create beautiful photo collages with multiple layouts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Collage Creator
            </CardTitle>
            <CardDescription>
              Upload multiple photos and arrange them in various grid layouts to create stunning collages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="images">Upload Photos</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="layout">Collage Layout</Label>
                <Select value={layout} onValueChange={setLayout}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select layout" />
                  </SelectTrigger>
                  <SelectContent>
                    {layouts.map((layout) => (
                      <SelectItem key={layout.value} value={layout.value}>
                        {layout.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={createCollage} 
                disabled={images.length === 0}
                className="flex-1"
              >
                Create Collage
              </Button>
              <Button onClick={resetCollage} variant="outline">
                Reset
              </Button>
            </div>

            {images.length > 0 && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">Uploaded Photos ({images.length})</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  <div 
                    className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            {collageImage && (
              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Generated Collage
                </Label>
                <div className="border rounded-lg p-4 bg-white">
                  <img 
                    src={collageImage} 
                    alt="Photo Collage" 
                    className="w-full h-auto max-h-96 object-contain mx-auto"
                  />
                </div>
                <div className="flex justify-center">
                  <Button onClick={downloadCollage} className="px-8">
                    <Download className="h-4 w-4 mr-2" />
                    Download Collage
                  </Button>
                </div>
              </div>
            )}

            {images.length === 0 && (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">Click to upload photos</p>
                <p className="text-sm text-gray-500">Select multiple images to create your collage</p>
              </div>
            )}
          </CardContent>
        </Card>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}