import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GradientGenerator() {
  const { toast } = useToast();
  const [color1, setColor1] = useState("#ff0000");
  const [color2, setColor2] = useState("#0000ff");
  const [direction, setDirection] = useState("to right");
  const [angle, setAngle] = useState([90]);

  const directions = [
    { value: "to right", label: "To Right" },
    { value: "to left", label: "To Left" },
    { value: "to top", label: "To Top" },
    { value: "to bottom", label: "To Bottom" },
    { value: "to top right", label: "To Top Right" },
    { value: "to top left", label: "To Top Left" },
    { value: "to bottom right", label: "To Bottom Right" },
    { value: "to bottom left", label: "To Bottom Left" },
  ];

  const generateCSS = () => {
    const deg = direction.includes("deg") ? `${angle[0]}deg` : direction;
    return `background: linear-gradient(${deg}, ${color1}, ${color2});`;
  };

  const copyCSS = () => {
    const css = generateCSS();
    navigator.clipboard.writeText(css);
    toast({
      title: "CSS copied!",
      description: "Gradient CSS has been copied to clipboard",
    });
  };

  const randomizeColors = () => {
    const randomColor1 = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    const randomColor2 = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setColor1(randomColor1);
    setColor2(randomColor2);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">CSS Gradient Generator</h1>
        <p className="text-muted-foreground">
          Create beautiful CSS gradients with live preview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gradient Controls</CardTitle>
            <CardDescription>
              Customize your gradient colors and direction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color1">Start Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color1"
                    type="color"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="w-16 h-10"
                    data-testid="input-color1"
                  />
                  <Input
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    placeholder="#ff0000"
                    data-testid="input-color1-text"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color2">End Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color2"
                    type="color"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="w-16 h-10"
                    data-testid="input-color2"
                  />
                  <Input
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    placeholder="#0000ff"
                    data-testid="input-color2-text"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Direction</Label>
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger data-testid="select-direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {directions.map((dir) => (
                    <SelectItem key={dir.value} value={dir.value}>
                      {dir.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Angle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {direction === "custom" && (
              <div className="space-y-2">
                <Label>Angle: {angle[0]}°</Label>
                <Slider
                  value={angle}
                  onValueChange={setAngle}
                  max={360}
                  min={0}
                  step={1}
                  data-testid="slider-angle"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={randomizeColors} variant="outline" data-testid="button-randomize">
                Randomize Colors
              </Button>
              <Button onClick={copyCSS} data-testid="button-copy-css">
                <Copy className="w-4 h-4 mr-2" />
                Copy CSS
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your gradient looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="w-full h-64 rounded-lg border"
              style={{
                background: `linear-gradient(${direction === "custom" ? `${angle[0]}deg` : direction}, ${color1}, ${color2})`
              }}
              data-testid="gradient-preview"
            />
            
            <div className="mt-4 space-y-2">
              <Label>CSS Code</Label>
              <div className="bg-muted p-3 rounded-lg">
                <code className="text-sm font-mono" data-testid="css-output">
                  {generateCSS()}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}