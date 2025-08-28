import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Shuffle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ColorPaletteGenerator() {
  const { toast } = useToast();
  const [palette, setPalette] = useState<string[]>([]);

  const generateRandomColor = (): string => {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  };

  const generatePalette = () => {
    const newPalette = Array.from({ length: 5 }, () => generateRandomColor());
    setPalette(newPalette);
  };

  const generateHarmoniousPalette = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const colors = [
      `hsl(${baseHue}, 70%, 50%)`,
      `hsl(${(baseHue + 30) % 360}, 70%, 60%)`,
      `hsl(${(baseHue + 60) % 360}, 70%, 40%)`,
      `hsl(${(baseHue + 120) % 360}, 70%, 55%)`,
      `hsl(${(baseHue + 180) % 360}, 70%, 45%)`,
    ];
    
    // Convert HSL to HEX
    const hexColors = colors.map(hslToHex);
    setPalette(hexColors);
  };

  const hslToHex = (hsl: string): string => {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return '#000000';
    
    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);

    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast({
      title: "Color copied!",
      description: `${color} has been copied to clipboard`,
    });
  };

  const copyPalette = () => {
    const paletteString = palette.join(', ');
    navigator.clipboard.writeText(paletteString);
    toast({
      title: "Palette copied!",
      description: "Color palette has been copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Color Palette Generator</h1>
        <p className="text-muted-foreground">
          Generate beautiful color palettes for your design projects
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Palette</CardTitle>
          <CardDescription>
            Create random or harmonious color combinations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={generatePalette} data-testid="button-random-palette">
              <Shuffle className="w-4 h-4 mr-2" />
              Random Palette
            </Button>
            <Button onClick={generateHarmoniousPalette} variant="secondary" data-testid="button-harmonious-palette">
              Generate Harmonious
            </Button>
            {palette.length > 0 && (
              <Button onClick={copyPalette} variant="outline" data-testid="button-copy-palette">
                <Copy className="w-4 h-4 mr-2" />
                Copy All
              </Button>
            )}
          </div>

          {palette.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {palette.map((color, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div 
                      className="h-32 w-full cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => copyColor(color)}
                      data-testid={`color-swatch-${index}`}
                    />
                    <CardContent className="p-3 text-center space-y-2">
                      <p className="font-mono text-sm" data-testid={`color-value-${index}`}>{color}</p>
                      <Badge variant="secondary" className="text-xs">
                        Click to copy
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}