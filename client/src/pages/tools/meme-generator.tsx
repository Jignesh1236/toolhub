import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, Upload, Type, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  textBoxes: number;
}

export default function MemeGenerator() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState([40]);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState([2]);
  const [customImage, setCustomImage] = useState<string | null>(null);

  // Popular meme templates (using placeholder images)
  const memeTemplates: MemeTemplate[] = [
    {
      id: "distracted-boyfriend",
      name: "Distracted Boyfriend",
      url: "https://i.imgflip.com/1ur9b0.jpg",
      textBoxes: 3
    },
    {
      id: "drake-pointing",
      name: "Drake Pointing",
      url: "https://i.imgflip.com/30b1gx.jpg",
      textBoxes: 2
    },
    {
      id: "two-buttons",
      name: "Two Buttons",
      url: "https://i.imgflip.com/1g8my4.jpg",
      textBoxes: 3
    },
    {
      id: "expanding-brain",
      name: "Expanding Brain",
      url: "https://i.imgflip.com/1jhl6n.jpg",
      textBoxes: 4
    },
    {
      id: "woman-yelling-cat",
      name: "Woman Yelling at Cat",
      url: "https://i.imgflip.com/345v97.jpg",
      textBoxes: 2
    },
    {
      id: "change-my-mind",
      name: "Change My Mind",
      url: "https://i.imgflip.com/24y43o.jpg",
      textBoxes: 1
    }
  ];

  const generateMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Set text properties
      ctx.font = `bold ${fontSize[0]}px Impact, Arial Black, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = fontColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth[0];

      // Draw top text
      if (topText.trim()) {
        const topY = fontSize[0] + 20;
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, topY);
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, topY);
      }

      // Draw bottom text
      if (bottomText.trim()) {
        const bottomY = canvas.height - 20;
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, bottomY);
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, bottomY);
      }
    };

    img.onerror = () => {
      toast({
        title: "Error loading image",
        description: "Could not load the meme template",
        variant: "destructive"
      });
    };

    if (customImage) {
      img.src = customImage;
    } else if (selectedTemplate) {
      img.src = selectedTemplate.url;
    }
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'my-meme.png';
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Meme downloaded!",
      description: "Your meme has been saved successfully"
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCustomImage(result);
      setSelectedTemplate(null);
    };
    reader.readAsDataURL(file);
  };

  const selectTemplate = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setCustomImage(null);
  };

  // Generate meme whenever relevant state changes
  useEffect(() => {
    if (selectedTemplate || customImage) {
      generateMeme();
    }
  }, [selectedTemplate, customImage, topText, bottomText, fontSize, fontColor, strokeColor, strokeWidth]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Meme Generator</h1>
        <p className="text-muted-foreground">
          Create funny memes with popular templates or your own images
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Meme Creator</CardTitle>
            <CardDescription>
              Choose a template or upload your own image
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Popular Templates</Label>
              <div className="grid grid-cols-2 gap-2">
                {memeTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => selectTemplate(template)}
                    className={`p-2 border rounded-lg text-sm hover:bg-muted ${
                      selectedTemplate?.id === template.id ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    data-testid={`template-${template.id}`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Image Upload */}
            <div className="space-y-2">
              <Label>Or Upload Your Own Image</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-upload-custom"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Text Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="top-text">Top Text</Label>
                <Input
                  id="top-text"
                  placeholder="Enter top text..."
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  data-testid="input-top-text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bottom-text">Bottom Text</Label>
                <Input
                  id="bottom-text"
                  placeholder="Enter bottom text..."
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  data-testid="input-bottom-text"
                />
              </div>
            </div>

            {/* Text Styling */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Font Size: {fontSize[0]}px</Label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  max={80}
                  min={20}
                  step={2}
                  data-testid="slider-font-size"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="font-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="w-16 h-10"
                      data-testid="input-font-color"
                    />
                    <Input
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      placeholder="#ffffff"
                      data-testid="input-font-color-text"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stroke-color">Outline Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="w-16 h-10"
                      data-testid="input-stroke-color"
                    />
                    <Input
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      placeholder="#000000"
                      data-testid="input-stroke-color-text"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Outline Width: {strokeWidth[0]}px</Label>
                <Slider
                  value={strokeWidth}
                  onValueChange={setStrokeWidth}
                  max={8}
                  min={0}
                  step={1}
                  data-testid="slider-stroke-width"
                />
              </div>
            </div>

            <Button 
              onClick={downloadMeme}
              className="w-full"
              disabled={!selectedTemplate && !customImage}
              data-testid="button-download"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Meme
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>
              <ImageIcon className="w-5 h-5 inline mr-2" />
              Preview
            </CardTitle>
            <CardDescription>
              Your meme will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {selectedTemplate || customImage ? (
                <div className="border rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto"
                    data-testid="meme-canvas"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Select a template or upload an image to get started
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Meme Creation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-4">
              <Type className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Keep Text Short</h3>
              <p className="text-muted-foreground">Use concise, punchy text for maximum impact</p>
            </div>
            <div className="text-center p-4">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">High Quality Images</h3>
              <p className="text-muted-foreground">Use clear, high-resolution images for better results</p>
            </div>
            <div className="text-center p-4">
              <Download className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Share Your Memes</h3>
              <p className="text-muted-foreground">Download and share your creations on social media</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}