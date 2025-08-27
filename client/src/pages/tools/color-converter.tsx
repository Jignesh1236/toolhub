import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Palette, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ColorValues {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

export default function ColorConverter() {
  const [color, setColor] = useState<ColorValues>({
    hex: "#FF6B6B",
    rgb: { r: 255, g: 107, b: 107 },
    hsl: { h: 0, s: 100, l: 71 },
    hsv: { h: 0, s: 58, v: 100 },
    cmyk: { c: 0, m: 58, y: 58, k: 0 }
  });
  const [inputValue, setInputValue] = useState("#FF6B6B");
  const { toast } = useToast();

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    let h = 0;

    if (d !== 0) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
  };

  const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    const c = 1 - (r / 255);
    const m = 1 - (g / 255);
    const y = 1 - (b / 255);
    const k = Math.min(c, Math.min(m, y));
    
    const cNorm = k === 1 ? 0 : (c - k) / (1 - k);
    const mNorm = k === 1 ? 0 : (m - k) / (1 - k);
    const yNorm = k === 1 ? 0 : (y - k) / (1 - k);
    
    return {
      c: Math.round(cNorm * 100),
      m: Math.round(mNorm * 100),
      y: Math.round(yNorm * 100),
      k: Math.round(k * 100)
    };
  };

  const convertColor = (inputColor: string) => {
    let rgb: { r: number; g: number; b: number } | null = null;
    
    // Try to parse as hex
    if (inputColor.startsWith('#')) {
      rgb = hexToRgb(inputColor);
    } 
    // Try to parse as RGB
    else if (inputColor.startsWith('rgb(')) {
      const match = inputColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        rgb = { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
      }
    }

    if (!rgb) return;

    const hex = `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1).toUpperCase()}`;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    setColor({ hex, rgb, hsl, hsv, cmyk });
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    convertColor(value);
  };

  const generateRandomColor = () => {
    const randomHex = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()}`;
    setInputValue(randomHex);
    convertColor(randomHex);
  };

  const copyToClipboard = async (value: string, format: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied!",
        description: `${format} value copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    convertColor(inputValue);
  }, []);

  const colorFormats = [
    {
      label: "HEX",
      value: color.hex,
      format: "HEX",
      testId: "hex-value"
    },
    {
      label: "RGB",
      value: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
      format: "RGB",
      testId: "rgb-value"
    },
    {
      label: "HSL",
      value: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
      format: "HSL",
      testId: "hsl-value"
    },
    {
      label: "HSV",
      value: `hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`,
      format: "HSV",
      testId: "hsv-value"
    },
    {
      label: "CMYK",
      value: `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`,
      format: "CMYK",
      testId: "cmyk-value"
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Color Converter</h1>
        <p className="text-muted-foreground">
          Convert colors between HEX, RGB, HSL, HSV, and CMYK formats
        </p>
      </div>

      <div className="grid gap-6">
        <Card data-testid="input-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Input
            </CardTitle>
            <CardDescription>
              Enter a color in HEX or RGB format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="color-input">Color Value</Label>
                <Input
                  id="color-input"
                  placeholder="#FF6B6B or rgb(255, 107, 107)"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  data-testid="input-color"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={generateRandomColor}
                  variant="outline"
                  data-testid="button-random"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Random
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="preview-card">
          <CardHeader>
            <CardTitle>Color Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div
                className="w-32 h-32 rounded-lg border-2 border-border shadow-lg"
                style={{ backgroundColor: color.hex }}
                data-testid="color-preview"
              />
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Brightness</Label>
                    <div className="text-lg font-mono">{color.hsl.l}%</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Saturation</Label>
                    <div className="text-lg font-mono">{color.hsl.s}%</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Hue</Label>
                    <div className="text-lg font-mono">{color.hsl.h}°</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Alpha</Label>
                    <div className="text-lg font-mono">100%</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {colorFormats.map((format) => (
            <Card key={format.label} data-testid={`card-${format.label.toLowerCase()}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{format.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="font-mono text-sm bg-muted p-3 rounded border min-h-[3rem] flex items-center">
                    <span data-testid={format.testId}>{format.value}</span>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(format.value, format.format)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    data-testid={`button-copy-${format.label.toLowerCase()}`}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy {format.label}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card data-testid="palette-card">
          <CardHeader>
            <CardTitle>Color Variations</CardTitle>
            <CardDescription>
              Lighter and darker variations of the selected color
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, index) => {
                const lightness = 20 + (index * 20);
                const variationColor = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${lightness}%)`;
                return (
                  <div
                    key={index}
                    className="aspect-square rounded cursor-pointer border-2 border-border hover:border-primary transition-colors"
                    style={{ backgroundColor: variationColor }}
                    onClick={() => handleInputChange(variationColor)}
                    title={variationColor}
                    data-testid={`variation-${index}`}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}