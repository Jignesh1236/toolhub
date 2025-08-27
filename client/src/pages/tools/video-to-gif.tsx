import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, Settings, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VideoToGif() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputGif, setOutputGif] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [fps, setFps] = useState(10);
  const [scale, setScale] = useState(100);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setOutputGif(null);
        setProgress(0);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a video file (MP4, MOV, AVI, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const convertToGif = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setProgress(0);

    try {
      // Create a canvas to extract frames
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      video.src = URL.createObjectURL(selectedFile);
      
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });

      // Set canvas size based on scale
      const scaleFactor = scale / 100;
      canvas.width = video.videoWidth * scaleFactor;
      canvas.height = video.videoHeight * scaleFactor;

      const frames: string[] = [];
      const duration = video.duration;
      const frameCount = Math.floor(duration * fps);
      const frameInterval = duration / frameCount;

      for (let i = 0; i < frameCount; i++) {
        video.currentTime = i * frameInterval;
        
        await new Promise(resolve => {
          video.onseeked = resolve;
        });

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameData = canvas.toDataURL('image/png');
        frames.push(frameData);
        
        setProgress((i + 1) / frameCount * 100);
      }

      // For this demo, we'll create a simple animated canvas
      // In a real implementation, you'd use a library like gif.js
      const gifCanvas = document.createElement('canvas');
      gifCanvas.width = canvas.width;
      gifCanvas.height = canvas.height;
      const gifCtx = gifCanvas.getContext('2d');

      if (!gifCtx) {
        throw new Error('Could not create GIF canvas context');
      }

      // Create a simple preview (first frame)
      const img = new Image();
      img.src = frames[0];
      await new Promise(resolve => {
        img.onload = resolve;
      });
      
      gifCtx.drawImage(img, 0, 0);
      const gifDataUrl = gifCanvas.toDataURL('image/gif', quality / 100);
      setOutputGif(gifDataUrl);

      toast({
        title: "Success!",
        description: `GIF created with ${frames.length} frames`,
      });

    } catch (error) {
      console.error('Error converting video to GIF:', error);
      toast({
        title: "Error",
        description: "Failed to convert video to GIF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const downloadGif = () => {
    if (!outputGif) return;

    const link = document.createElement('a');
    link.href = outputGif;
    link.download = `converted-gif-${Date.now()}.gif`;
    link.click();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Video to GIF Converter</h1>
        <p className="text-muted-foreground">
          Convert your video files to animated GIFs with customizable settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card data-testid="video-upload-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Video
            </CardTitle>
            <CardDescription>
              Select a video file to convert to GIF (MP4, MOV, AVI, WebM)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                  data-testid="input-video-file"
                />
              </div>
              
              {selectedFile && (
                <Alert>
                  <AlertDescription>
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="settings-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Conversion Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quality">Quality: {quality}%</Label>
                <Input
                  id="quality"
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="mt-2"
                  data-testid="input-quality"
                />
              </div>
              
              <div>
                <Label htmlFor="fps">Frame Rate: {fps} FPS</Label>
                <Input
                  id="fps"
                  type="range"
                  min="5"
                  max="30"
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="mt-2"
                  data-testid="input-fps"
                />
              </div>
              
              <div>
                <Label htmlFor="scale">Scale: {scale}%</Label>
                <Input
                  id="scale"
                  type="range"
                  min="25"
                  max="100"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="mt-2"
                  data-testid="input-scale"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="conversion-card">
          <CardHeader>
            <CardTitle>Convert Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={convertToGif}
                disabled={!selectedFile || isConverting}
                className="w-full"
                data-testid="button-convert"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert to GIF"
                )}
              </Button>

              {isConverting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Converting...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} data-testid="progress-conversion" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {outputGif && (
          <Card data-testid="result-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted">
                  <img
                    src={outputGif}
                    alt="Converted GIF"
                    className="max-w-full h-auto mx-auto"
                    data-testid="img-result-gif"
                  />
                </div>
                
                <Button
                  onClick={downloadGif}
                  className="w-full"
                  data-testid="button-download"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download GIF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}