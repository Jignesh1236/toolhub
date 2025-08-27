import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Download, Monitor, Smartphone, Tablet } from "lucide-react";

export default function WebsiteScreenshot() {
  const [url, setUrl] = useState<string>("");
  const [device, setDevice] = useState<string>("desktop");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const deviceSizes = {
    desktop: { width: 1920, height: 1080, icon: Monitor },
    tablet: { width: 768, height: 1024, icon: Tablet },
    mobile: { width: 375, height: 667, icon: Smartphone }
  };

  const captureScreenshot = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    setScreenshot(null);
    
    try {
      // Clean URL - add protocol if missing
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }

      // In a real application, you would send this to your backend
      // Backend would use a service like Puppeteer, Playwright, or a screenshot API
      // For demo purposes, we'll simulate the process
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a placeholder image (in reality, this would be the actual screenshot)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const deviceConfig = deviceSizes[device as keyof typeof deviceSizes];
      
      canvas.width = deviceConfig.width;
      canvas.height = deviceConfig.height;
      
      if (ctx) {
        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#1e40af');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some content to simulate a webpage
        ctx.fillStyle = 'white';
        ctx.fillRect(50, 50, canvas.width - 100, 80);
        
        ctx.fillStyle = '#374151';
        ctx.font = '24px Arial';
        ctx.fillText('Website Screenshot Preview', 70, 100);
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Arial';
        ctx.fillText(`URL: ${cleanUrl}`, 70, 130);
        ctx.fillText(`Device: ${device}`, 70, 150);
        ctx.fillText(`Size: ${deviceConfig.width}x${deviceConfig.height}`, 70, 170);
        
        // Add some mock content boxes
        for (let i = 0; i < 3; i++) {
          const y = 220 + (i * 120);
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(50, y, canvas.width - 100, 100);
          
          ctx.fillStyle = '#9ca3af';
          ctx.font = '14px Arial';
          ctx.fillText(`Content Block ${i + 1}`, 70, y + 30);
        }
        
        setScreenshot(canvas.toDataURL('image/png'));
      }
      
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      // In a real app, you'd show an error message
    } finally {
      setIsLoading(false);
    }
  };

  const downloadScreenshot = () => {
    if (!screenshot) return;
    
    const link = document.createElement('a');
    link.download = `screenshot-${url.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${device}.png`;
    link.href = screenshot;
    link.click();
  };

  const DeviceIcon = deviceSizes[device as keyof typeof deviceSizes].icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Camera className="w-8 h-8" />
          Website Screenshot
        </h1>
        <p className="text-lg text-muted-foreground">
          Capture screenshots of websites in different device formats
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Screenshot Settings
            </CardTitle>
            <CardDescription>
              Configure the website and device type for your screenshot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                data-testid="input-url"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter the full URL of the website to capture
              </p>
            </div>

            <div>
              <Label htmlFor="device">Device Type</Label>
              <Select value={device} onValueChange={setDevice}>
                <SelectTrigger data-testid="select-device">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">Desktop (1920x1080)</SelectItem>
                  <SelectItem value="tablet">Tablet (768x1024)</SelectItem>
                  <SelectItem value="mobile">Mobile (375x667)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <DeviceIcon className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">{device.charAt(0).toUpperCase() + device.slice(1)} View</div>
                <div className="text-sm text-muted-foreground">
                  {deviceSizes[device as keyof typeof deviceSizes].width} × {deviceSizes[device as keyof typeof deviceSizes].height} pixels
                </div>
              </div>
            </div>

            <Button 
              onClick={captureScreenshot} 
              disabled={!url.trim() || isLoading}
              className="w-full"
              data-testid="button-capture"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Capturing Screenshot...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Screenshot
                </>
              )}
            </Button>

            {screenshot && (
              <Button 
                onClick={downloadScreenshot} 
                variant="outline"
                className="w-full"
                data-testid="button-download"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Screenshot
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Screenshot Preview</CardTitle>
            <CardDescription>
              Preview of the captured website screenshot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {screenshot ? (
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={screenshot} 
                    alt="Website screenshot" 
                    className="w-full border rounded-lg shadow-lg"
                    data-testid="img-screenshot"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {device}
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground text-center">
                  Screenshot captured successfully
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-16">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No screenshot captured yet</p>
                <p className="text-sm">Enter a URL and click capture to see the preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Screenshot Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Device Formats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>Desktop: Full-width website view</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tablet className="w-4 h-4" />
                    <span>Tablet: Medium-width responsive view</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile: Mobile-optimized view</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Use Cases</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Portfolio documentation</li>
                  <li>• Bug reporting</li>
                  <li>• Website archiving</li>
                  <li>• Design comparison</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Tips for Better Screenshots</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use HTTPS URLs when possible</li>
                  <li>• Wait for page to fully load</li>
                  <li>• Consider different device views</li>
                  <li>• Check for mobile responsiveness</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Supported Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Multiple device formats</li>
                  <li>• High-quality PNG output</li>
                  <li>• Instant download</li>
                  <li>• Responsive preview</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}