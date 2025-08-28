import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, BarChart3, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const barcodeTypes = [
  { id: "code128", name: "Code 128", description: "Most common barcode, alphanumeric" },
  { id: "code39", name: "Code 39", description: "Alphanumeric, widely supported" },
  { id: "ean13", name: "EAN-13", description: "Product barcodes (13 digits)" },
  { id: "ean8", name: "EAN-8", description: "Short product barcodes (8 digits)" },
  { id: "upc", name: "UPC-A", description: "US product barcodes (12 digits)" },
];

export default function BarcodeGenerator() {
  const [inputText, setInputText] = useState("HELLO123");
  const [barcodeType, setBarcodeType] = useState("code128");
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [showText, setShowText] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Simple barcode patterns (simplified for demo)
  const code128Patterns = {
    'A': [2,1,2,2,2,2],
    'B': [1,2,2,1,2,3],
    'C': [1,2,2,2,2,2],
    'D': [1,1,2,2,3,1],
    'E': [1,2,3,1,2,2],
    'F': [1,2,2,2,3,1],
    'G': [1,1,1,4,1,2],
    'H': [1,2,1,1,4,1],
    'I': [1,4,1,1,1,2],
    'J': [1,1,4,1,1,2],
    'K': [1,2,4,1,1,1],
    'L': [1,1,1,2,4,1],
    'M': [1,2,1,2,4,1],
    '0': [2,1,2,1,2,2],
    '1': [2,1,2,2,2,1],
    '2': [2,2,2,1,2,1],
    '3': [1,4,1,2,1,1],
    '4': [1,1,4,2,1,1],
    '5': [1,2,4,1,1,1],
    '6': [1,1,1,4,2,1],
    '7': [1,4,1,1,2,1],
    '8': [1,1,4,1,2,1],
    '9': [4,1,1,1,2,1],
  };

  const generateBarcode = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to generate barcode",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate bars pattern
      const bars: number[] = [];
      const chars = inputText.toUpperCase().split('');
      
      // Add start pattern
      bars.push(2, 1, 1, 1, 1, 1);
      
      // Add character patterns
      chars.forEach(char => {
        const pattern = code128Patterns[char as keyof typeof code128Patterns] || [1,1,1,1,1,1];
        bars.push(...pattern);
      });
      
      // Add end pattern
      bars.push(2, 3, 1, 1, 1, 2);

      // Calculate total width
      const totalWidth = bars.reduce((sum, bar) => sum + bar, 0) * width;
      canvas.width = Math.max(totalWidth + 40, 300);
      canvas.height = height + (showText ? 40 : 20);

      // Clear canvas with new dimensions
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bars
      ctx.fillStyle = 'black';
      let x = 20;
      let isBlack = true;

      bars.forEach(barWidth => {
        if (isBlack) {
          ctx.fillRect(x, 10, barWidth * width, height);
        }
        x += barWidth * width;
        isBlack = !isBlack;
      });

      // Draw text if enabled
      if (showText) {
        ctx.fillStyle = 'black';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(inputText, canvas.width / 2, height + 25);
      }

      toast({
        title: "Success!",
        description: "Barcode generated successfully",
      });

    } catch (error) {
      console.error('Barcode generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate barcode",
        variant: "destructive",
      });
    }
  };

  const downloadBarcode = () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `barcode-${inputText}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast({
        title: "Downloaded!",
        description: "Barcode image saved to your device",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download barcode",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast({
            title: "Copied!",
            description: "Barcode copied to clipboard",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy barcode to clipboard",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    generateBarcode();
  }, [inputText, barcodeType, width, height, showText]);

  const selectedType = barcodeTypes.find(type => type.id === barcodeType);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Barcode Generator</h1>
        <p className="text-muted-foreground">
          Generate various types of barcodes for products, inventory, and more
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card data-testid="input-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Barcode Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="barcode-text">Text/Numbers</Label>
                <Input
                  id="barcode-text"
                  placeholder="Enter text or numbers"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  data-testid="input-barcode-text"
                />
              </div>

              <div>
                <Label htmlFor="barcode-type">Barcode Type</Label>
                <Select value={barcodeType} onValueChange={setBarcodeType}>
                  <SelectTrigger data-testid="select-barcode-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {barcodeTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedType && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedType.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="settings-card">
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bar-width">Bar Width: {width}px</Label>
                  <Input
                    id="bar-width"
                    type="range"
                    min="1"
                    max="5"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="mt-2"
                    data-testid="input-bar-width"
                  />
                </div>

                <div>
                  <Label htmlFor="bar-height">Height: {height}px</Label>
                  <Input
                    id="bar-height"
                    type="range"
                    min="50"
                    max="200"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="mt-2"
                    data-testid="input-bar-height"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-text"
                  checked={showText}
                  onChange={(e) => setShowText(e.target.checked)}
                  className="rounded"
                  data-testid="checkbox-show-text"
                />
                <Label htmlFor="show-text">Show text below barcode</Label>
              </div>

              <Button
                onClick={generateBarcode}
                className="w-full"
                data-testid="button-generate"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Barcode
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="output-card">
          <CardHeader>
            <CardTitle>Generated Barcode</CardTitle>
            <CardDescription>
              Preview and download your barcode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="border border-border rounded-lg bg-white max-w-full"
                  data-testid="canvas-barcode"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={downloadBarcode}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-download"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
                
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-copy"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Image
                </Button>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>Type: {selectedType?.name}</p>
                <p>Content: {inputText}</p>
                <p>Dimensions: {width}px bars, {height}px height</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}