import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Type, Image as ImageIcon, Move } from "lucide-react";

export default function PhotoTextOverlay() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [text, setText] = useState("Your Text Here");
  const [fontSize, setFontSize] = useState([48]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [textPosition, setTextPosition] = useState("center");
  const [textOpacity, setTextOpacity] = useState([100]);
  const [strokeWidth, setStrokeWidth] = useState([0]);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [shadowOffset, setShadowOffset] = useState([0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fontFamilies = [
    "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana",
    "Courier New", "Arial Black", "Comic Sans MS", "Impact", "Trebuchet MS"
  ];

  const positions = [
    { value: "top-left", label: "Top Left" },
    { value: "top-center", label: "Top Center" },
    { value: "top-right", label: "Top Right" },
    { value: "center-left", label: "Center Left" },
    { value: "center", label: "Center" },
    { value: "center-right", label: "Center Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  const presetColors = [
    "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff",
    "#ffff00", "#ff00ff", "#00ffff", "#ffa500", "#800080"
  ];

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

  const getTextPosition = (canvasWidth: number, canvasHeight: number, textWidth: number, textHeight: number) => {
    const padding = 20;
    
    switch (textPosition) {
      case "top-left":
        return { x: padding, y: fontSize[0] + padding };
      case "top-center":
        return { x: (canvasWidth - textWidth) / 2, y: fontSize[0] + padding };
      case "top-right":
        return { x: canvasWidth - textWidth - padding, y: fontSize[0] + padding };
      case "center-left":
        return { x: padding, y: (canvasHeight + textHeight) / 2 };
      case "center":
        return { x: (canvasWidth - textWidth) / 2, y: (canvasHeight + textHeight) / 2 };
      case "center-right":
        return { x: canvasWidth - textWidth - padding, y: (canvasHeight + textHeight) / 2 };
      case "bottom-left":
        return { x: padding, y: canvasHeight - padding };
      case "bottom-center":
        return { x: (canvasWidth - textWidth) / 2, y: canvasHeight - padding };
      case "bottom-right":
        return { x: canvasWidth - textWidth - padding, y: canvasHeight - padding };
      default:
        return { x: (canvasWidth - textWidth) / 2, y: (canvasHeight + textHeight) / 2 };
    }
  };

  const addTextOverlay = async () => {
    if (!originalImage || !canvasRef.current || !text.trim()) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) return;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Set up text styling
      ctx.font = `${fontSize[0]}px ${fontFamily}`;
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
      
      // Measure text
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize[0];
      
      // Get position
      const position = getTextPosition(canvas.width, canvas.height, textWidth, textHeight);
      
      // Apply opacity
      const alpha = textOpacity[0] / 100;
      
      // Draw background if not transparent
      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.globalAlpha = alpha;
        const bgPadding = 10;
        ctx.fillRect(
          position.x - bgPadding,
          position.y - textHeight - bgPadding,
          textWidth + (bgPadding * 2),
          textHeight + (bgPadding * 2)
        );
      }
      
      // Draw shadow
      if (shadowOffset[0] > 0) {
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = "#000000";
        ctx.fillText(
          text,
          position.x + shadowOffset[0],
          position.y + shadowOffset[0]
        );
      }
      
      // Draw stroke
      if (strokeWidth[0] > 0) {
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth[0];
        ctx.strokeText(text, position.x, position.y);
      }
      
      // Draw main text
      ctx.globalAlpha = alpha;
      ctx.fillStyle = textColor;
      ctx.fillText(text, position.x, position.y);
      
      // Reset global alpha
      ctx.globalAlpha = 1;
      
      setProcessedImage(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.src = originalImage;
  };

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.download = 'text-overlay-image.jpg';
      link.href = processedImage;
      link.click();
    }
  };

  const resetEditor = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setText("Your Text Here");
    setFontSize([48]);
    setTextColor("#ffffff");
    setBackgroundColor("transparent");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Photo Text Overlay</h1>
          <p className="text-lg text-gray-600">Add custom text, quotes, and captions to your photos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Text Overlay Editor
            </CardTitle>
            <CardDescription>
              Add beautiful text overlays to your images with customizable fonts, colors, and positioning.
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
                <div className="space-y-4">
                  <Label htmlFor="text-input">Text Content</Label>
                  <Textarea
                    id="text-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your text here..."
                    rows={2}
                  />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Font Size: {fontSize[0]}px</Label>
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      max={120}
                      min={12}
                      step={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select value={textPosition} onValueChange={setTextPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={backgroundColor === "transparent" ? "#ffffff" : backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Select value={backgroundColor} onValueChange={setBackgroundColor}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transparent">Transparent</SelectItem>
                          <SelectItem value="#ffffff">White</SelectItem>
                          <SelectItem value="#000000">Black</SelectItem>
                          <SelectItem value="#ff0000">Red</SelectItem>
                          <SelectItem value="#0000ff">Blue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Opacity: {textOpacity[0]}%</Label>
                    <Slider
                      value={textOpacity}
                      onValueChange={setTextOpacity}
                      max={100}
                      min={10}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Stroke Width: {strokeWidth[0]}px</Label>
                    <Slider
                      value={strokeWidth}
                      onValueChange={setStrokeWidth}
                      max={10}
                      min={0}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Stroke Color</Label>
                    <Input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="w-full h-10 p-1 border rounded"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Shadow Offset: {shadowOffset[0]}px</Label>
                    <Slider
                      value={shadowOffset}
                      onValueChange={setShadowOffset}
                      max={10}
                      min={0}
                      step={1}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Preset Text Colors</Label>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded border-2 ${textColor === color ? 'border-blue-500' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setTextColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button onClick={addTextOverlay} className="px-8">
                    Add Text Overlay
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
                      <Type className="h-4 w-4" />
                      With Text Overlay
                    </Label>
                    <div className="border rounded-lg p-4 bg-white">
                      {processedImage ? (
                        <img 
                          src={processedImage} 
                          alt="With Text" 
                          className="w-full h-auto max-h-96 object-contain mx-auto"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-96 text-gray-400">
                          Image with text overlay will appear here
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {processedImage && (
                  <div className="flex justify-center">
                    <Button onClick={downloadImage} className="px-8">
                      <Download className="h-4 w-4 mr-2" />
                      Download Image with Text
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
                <p className="text-sm text-gray-500">Add custom text and captions to your photos</p>
              </div>
            )}
          </CardContent>
        </Card>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}