import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FaviconGenerator() {
  const { toast } = useToast();
  const [text, setText] = useState("A");
  const [fontSize, setFontSize] = useState("24");
  const [backgroundColor, setBackgroundColor] = useState("#4f46e5");
  const [textColor, setTextColor] = useState("#ffffff");
  const [shape, setShape] = useState("square");
  const [size, setSize] = useState("32");

  const generateFavicon = (canvasSize: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw background
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = backgroundColor;
      ctx.fill();
    } else if (shape === 'rounded') {
      const radius = canvasSize * 0.2;
      ctx.beginPath();
      ctx.roundRect(0, 0, canvasSize, canvasSize, radius);
      ctx.fillStyle = backgroundColor;
      ctx.fill();
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    }

    // Draw text
    ctx.fillStyle = textColor;
    ctx.font = `bold ${Math.floor(canvasSize * 0.6)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.charAt(0).toUpperCase(), canvasSize / 2, canvasSize / 2);

    return canvas.toDataURL('image/png');
  };

  const downloadFavicon = (size: number) => {
    const dataUrl = generateFavicon(size);
    const link = document.createElement('a');
    link.download = `favicon-${size}x${size}.png`;
    link.href = dataUrl;
    link.click();
    
    toast({
      title: "Favicon downloaded!",
      description: `${size}x${size} favicon has been downloaded`
    });
  };

  const downloadAllSizes = () => {
    const sizes = [16, 32, 48, 64, 128, 256];
    sizes.forEach(size => {
      setTimeout(() => downloadFavicon(size), size / 16 * 100);
    });
    
    toast({
      title: "All favicons downloaded!",
      description: "Favicons in all standard sizes have been downloaded"
    });
  };

  const generateHTMLCode = () => {
    return `<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;
  };

  const copyHTMLCode = () => {
    navigator.clipboard.writeText(generateHTMLCode());
    toast({
      title: "HTML code copied!",
      description: "Favicon HTML code has been copied to clipboard"
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Favicon Generator</h1>
        <p className="text-muted-foreground">
          Generate favicons from text or upload your own image
        </p>
      </div>

      <Tabs defaultValue="text" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text" data-testid="tab-text">Text to Favicon</TabsTrigger>
          <TabsTrigger value="upload" data-testid="tab-upload">Upload Image</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Favicon Settings</CardTitle>
                <CardDescription>
                  Customize your text-based favicon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text">Text (First character will be used)</Label>
                  <Input
                    id="text"
                    placeholder="Enter text..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={1}
                    data-testid="input-text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bg-color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-16 h-10"
                        data-testid="input-bg-color"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        placeholder="#4f46e5"
                        data-testid="input-bg-color-text"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-16 h-10"
                        data-testid="input-text-color"
                      />
                      <Input
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        placeholder="#ffffff"
                        data-testid="input-text-color-text"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Shape</Label>
                  <Select value={shape} onValueChange={setShape}>
                    <SelectTrigger data-testid="select-shape">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Button onClick={downloadAllSizes} className="w-full" data-testid="button-download-all">
                    <Download className="w-4 h-4 mr-2" />
                    Download All Sizes
                  </Button>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[16, 32, 64].map(size => (
                      <Button
                        key={size}
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFavicon(size)}
                        data-testid={`button-download-${size}`}
                      >
                        {size}x{size}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <Star className="w-5 h-5 inline mr-2" />
                  Preview
                </CardTitle>
                <CardDescription>
                  See how your favicon will look
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[16, 32, 64].map(size => (
                    <div key={size} className="flex items-center gap-4 p-3 border rounded-lg">
                      <img
                        src={generateFavicon(size)}
                        alt={`${size}x${size} favicon`}
                        className="border"
                        style={{ width: size, height: size }}
                        data-testid={`preview-${size}`}
                      />
                      <div>
                        <div className="font-medium">{size}x{size} pixels</div>
                        <div className="text-sm text-muted-foreground">
                          {size === 16 && "Browser tab"}
                          {size === 32 && "Bookmark"}
                          {size === 64 && "Desktop shortcut"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>HTML Code</Label>
                  <div className="bg-muted p-3 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {generateHTMLCode()}
                    </pre>
                  </div>
                  <Button onClick={copyHTMLCode} variant="outline" className="w-full" data-testid="button-copy-html">
                    Copy HTML Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>
                Upload an image to convert to favicon format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Drag and drop an image here, or click to select
                </p>
                <Button variant="outline" data-testid="button-upload-image">
                  Choose Image
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Supported formats: PNG, JPG, SVG</p>
                <p>• Recommended size: 512x512 pixels or larger</p>
                <p>• Square images work best for favicons</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}