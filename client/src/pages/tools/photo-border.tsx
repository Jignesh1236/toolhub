import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Square, Image as ImageIcon } from "lucide-react";

export default function PhotoBorder() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [borderedImage, setBorderedImage] = useState<string | null>(null);
  const [borderStyle, setBorderStyle] = useState<string>("solid");
  const [borderWidth, setBorderWidth] = useState([20]);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [cornerRadius, setCornerRadius] = useState([0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const borderStyles = [
    { value: "solid", label: "Solid" },
    { value: "double", label: "Double" },
    { value: "dashed", label: "Dashed" },
    { value: "dotted", label: "Dotted" },
    { value: "shadow", label: "Shadow" },
    { value: "gradient", label: "Gradient" },
  ];

  const presetColors = [
    "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff",
    "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080",
    "#ffc0cb", "#a52a2a", "#808080", "#ffd700", "#90ee90"
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setBorderedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyBorder = async () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) return;

    img.onload = () => {
      const borderSize = borderWidth[0];
      const radius = cornerRadius[0];
      
      canvas.width = img.width + (borderSize * 2);
      canvas.height = img.height + (borderSize * 2);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply border based on style
      switch (borderStyle) {
        case "solid":
          ctx.fillStyle = borderColor;
          if (radius > 0) {
            drawRoundedRect(ctx, 0, 0, canvas.width, canvas.height, radius);
            ctx.fill();
          } else {
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          break;
          
        case "gradient":
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, borderColor);
          gradient.addColorStop(1, adjustBrightness(borderColor, -30));
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          break;
          
        case "shadow":
          // Draw shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = borderSize;
          ctx.shadowOffsetX = borderSize / 4;
          ctx.shadowOffsetY = borderSize / 4;
          ctx.fillStyle = borderColor;
          ctx.fillRect(borderSize/2, borderSize/2, canvas.width - borderSize, canvas.height - borderSize);
          ctx.shadowColor = 'transparent';
          break;
          
        case "double":
          ctx.fillStyle = borderColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(borderSize/3, borderSize/3, canvas.width - (borderSize*2/3), canvas.height - (borderSize*2/3));
          ctx.fillStyle = borderColor;
          ctx.fillRect(borderSize*2/3, borderSize*2/3, canvas.width - (borderSize*4/3), canvas.height - (borderSize*4/3));
          break;
          
        case "dashed":
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = borderSize;
          ctx.setLineDash([borderSize, borderSize/2]);
          ctx.strokeRect(borderSize/2, borderSize/2, canvas.width - borderSize, canvas.height - borderSize);
          ctx.setLineDash([]);
          break;
          
        case "dotted":
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = borderSize;
          ctx.setLineDash([borderSize/4, borderSize/2]);
          ctx.strokeRect(borderSize/2, borderSize/2, canvas.width - borderSize, canvas.height - borderSize);
          ctx.setLineDash([]);
          break;
          
        default:
          ctx.fillStyle = borderColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw image in center
      if (radius > 0 && borderStyle === "solid") {
        ctx.save();
        drawRoundedRect(ctx, borderSize, borderSize, img.width, img.height, Math.max(0, radius - borderSize));
        ctx.clip();
      }
      
      ctx.drawImage(img, borderSize, borderSize);
      
      if (radius > 0 && borderStyle === "solid") {
        ctx.restore();
      }
      
      setBorderedImage(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.src = originalImage;
  };

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const adjustBrightness = (color: string, amount: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return "#" + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
  };

  const downloadImage = () => {
    if (borderedImage) {
      const link = document.createElement('a');
      link.download = 'bordered-image.jpg';
      link.href = borderedImage;
      link.click();
    }
  };

  const resetEditor = () => {
    setOriginalImage(null);
    setBorderedImage(null);
    setBorderWidth([20]);
    setBorderColor("#ffffff");
    setCornerRadius([0]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Photo Border Tool</h1>
          <p className="text-lg text-gray-600">Add decorative borders and frames to your photos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Square className="h-5 w-5" />
              Border Editor
            </CardTitle>
            <CardDescription>
              Create beautiful borders and frames for your images with various styles and customization options.
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

            {originalImage && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Border Style</Label>
                    <Select value={borderStyle} onValueChange={setBorderStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {borderStyles.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Border Width: {borderWidth[0]}px</Label>
                    <Slider
                      value={borderWidth}
                      onValueChange={setBorderWidth}
                      max={100}
                      min={5}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Corner Radius: {cornerRadius[0]}px</Label>
                    <Slider
                      value={cornerRadius}
                      onValueChange={setCornerRadius}
                      max={50}
                      min={0}
                      step={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Border Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        type="text"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="flex-1"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preset Colors</Label>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded border-2 ${borderColor === color ? 'border-blue-500' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setBorderColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button onClick={applyBorder} className="px-8">
                    Apply Border
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
                        src={originalImage} 
                        alt="Original" 
                        className="w-full h-auto max-h-96 object-contain mx-auto"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Square className="h-4 w-4" />
                      With Border
                    </Label>
                    <div className="border rounded-lg p-4 bg-white">
                      {borderedImage ? (
                        <img 
                          src={borderedImage} 
                          alt="With Border" 
                          className="w-full h-auto max-h-96 object-contain mx-auto"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-96 text-gray-400">
                          Bordered image will appear here
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {borderedImage && (
                  <div className="flex justify-center">
                    <Button onClick={downloadImage} className="px-8">
                      <Download className="h-4 w-4 mr-2" />
                      Download Bordered Image
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
                <p className="text-sm text-gray-500">Add beautiful borders and frames to your photos</p>
              </div>
            )}
          </CardContent>
        </Card>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}