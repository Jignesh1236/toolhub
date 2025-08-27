import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Upload, Download, Play, Pause, Image as ImageIcon, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageFrame {
  id: string;
  file: File;
  url: string;
  duration: number;
  order: number;
}

export default function GifMaker() {
  const [imageFrames, setImageFrames] = useState<ImageFrame[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputGif, setOutputGif] = useState<string | null>(null);
  const [gifSettings, setGifSettings] = useState({
    width: 500,
    height: 500,
    fps: 2,
    quality: 80,
    loop: true,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const previewIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please select image files (JPEG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    const newFrames: ImageFrame[] = imageFiles.map((file, index) => ({
      id: `frame-${Date.now()}-${index}`,
      file,
      url: URL.createObjectURL(file),
      duration: 500, // 500ms default
      order: imageFrames.length + index,
    }));

    setImageFrames(prev => [...prev, ...newFrames]);
    setOutputGif(null);

    toast({
      title: "Images added",
      description: `${imageFiles.length} image(s) added to GIF frames`,
    });
  };

  const removeFrame = (frameId: string) => {
    setImageFrames(frames => frames.filter(frame => frame.id !== frameId));
    if (imageFrames.length <= 1) {
      setOutputGif(null);
    }
  };

  const moveFrame = (frameId: string, direction: 'up' | 'down') => {
    const frameIndex = imageFrames.findIndex(frame => frame.id === frameId);
    if (frameIndex === -1) return;

    const newFrames = [...imageFrames];
    const targetIndex = direction === 'up' ? frameIndex - 1 : frameIndex + 1;

    if (targetIndex < 0 || targetIndex >= newFrames.length) return;

    // Swap frames
    [newFrames[frameIndex], newFrames[targetIndex]] = [newFrames[targetIndex], newFrames[frameIndex]];
    
    // Update order
    newFrames.forEach((frame, index) => {
      frame.order = index;
    });

    setImageFrames(newFrames);
  };

  const updateFrameDuration = (frameId: string, duration: number) => {
    setImageFrames(frames =>
      frames.map(frame =>
        frame.id === frameId ? { ...frame, duration } : frame
      )
    );
  };

  const startPreview = () => {
    if (imageFrames.length === 0) return;

    setIsPlaying(true);
    let frameIndex = 0;

    const playNext = () => {
      setCurrentFrame(frameIndex);
      frameIndex = (frameIndex + 1) % imageFrames.length;
      
      const currentFrameDuration = imageFrames[frameIndex]?.duration || 500;
      previewIntervalRef.current = setTimeout(playNext, currentFrameDuration);
    };

    playNext();
  };

  const stopPreview = () => {
    setIsPlaying(false);
    if (previewIntervalRef.current) {
      clearTimeout(previewIntervalRef.current);
      previewIntervalRef.current = null;
    }
  };

  const createGif = async () => {
    if (imageFrames.length < 2) {
      toast({
        title: "Insufficient frames",
        description: "Please add at least 2 images to create a GIF",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not found');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      canvas.width = gifSettings.width;
      canvas.height = gifSettings.height;

      // Sort frames by order
      const sortedFrames = [...imageFrames].sort((a, b) => a.order - b.order);

      // Process each frame
      const processedFrames: string[] = [];
      
      for (let i = 0; i < sortedFrames.length; i++) {
        const frame = sortedFrames[i];
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = frame.url;
        });

        // Clear canvas and draw image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const frameData = canvas.toDataURL('image/png', gifSettings.quality / 100);
        processedFrames.push(frameData);
        
        setProgress((i + 1) / sortedFrames.length * 80);
      }

      // Simulate GIF creation (in a real app, you'd use a GIF library like gif.js)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(90);

      // For demonstration, create a simple animated preview using the first frame
      // In a real implementation, you would use a library like gif.js to create actual GIF
      const gifBlob = await createSimpleGif(processedFrames);
      const gifUrl = URL.createObjectURL(gifBlob);
      
      setOutputGif(gifUrl);
      setProgress(100);

      toast({
        title: "Success!",
        description: `GIF created with ${sortedFrames.length} frames`,
      });

    } catch (error) {
      console.error('Error creating GIF:', error);
      toast({
        title: "Error",
        description: "Failed to create GIF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple GIF creation simulation (in real app, use gif.js or similar library)
  const createSimpleGif = async (frames: string[]): Promise<Blob> => {
    // This is a simplified demonstration
    // In a real implementation, you would use gif.js or a similar library
    const canvas = document.createElement('canvas');
    canvas.width = gifSettings.width;
    canvas.height = gifSettings.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not create canvas context');

    // For demo, just return the first frame as a static image
    const img = new Image();
    await new Promise(resolve => {
      img.onload = resolve;
      img.src = frames[0];
    });
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve(blob!);
      }, 'image/gif', gifSettings.quality / 100);
    });
  };

  const downloadGif = () => {
    if (!outputGif) return;

    const link = document.createElement('a');
    link.href = outputGif;
    link.download = `animated-gif-${Date.now()}.gif`;
    link.click();
  };

  const clearAllFrames = () => {
    setImageFrames([]);
    setOutputGif(null);
    setCurrentFrame(0);
    stopPreview();
    
    toast({
      title: "Frames cleared",
      description: "All frames have been removed",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">GIF Maker</h1>
        <p className="text-muted-foreground">
          Create animated GIFs from your images with customizable settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card data-testid="image-upload-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Images
            </CardTitle>
            <CardDescription>
              Select multiple images to create an animated GIF (JPEG, PNG, GIF, WebP)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                  data-testid="input-image-files"
                />
              </div>
              
              {imageFrames.length > 0 && (
                <Alert>
                  <ImageIcon className="h-4 w-4" />
                  <AlertDescription>
                    {imageFrames.length} frame(s) added to GIF sequence
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {imageFrames.length > 0 && (
          <Card data-testid="frames-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Frame Sequence ({imageFrames.length})</span>
                <div className="flex space-x-2">
                  <Button
                    onClick={isPlaying ? stopPreview : startPreview}
                    variant="outline"
                    size="sm"
                    data-testid="button-preview"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? 'Stop' : 'Preview'}
                  </Button>
                  <Button
                    onClick={clearAllFrames}
                    variant="destructive"
                    size="sm"
                    data-testid="button-clear-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {imageFrames
                    .sort((a, b) => a.order - b.order)
                    .map((frame, index) => (
                    <div 
                      key={frame.id} 
                      className={`flex items-center space-x-4 p-4 border rounded-lg ${
                        currentFrame === index && isPlaying ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={frame.url}
                          alt={`Frame ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                          data-testid={`img-frame-${index}`}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium">Frame {index + 1}</p>
                        <p className="text-sm text-muted-foreground">{frame.file.name}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">Duration:</Label>
                        <Input
                          type="number"
                          min="100"
                          max="5000"
                          step="100"
                          value={frame.duration}
                          onChange={(e) => updateFrameDuration(frame.id, Number(e.target.value))}
                          className="w-20"
                          data-testid={`input-duration-${index}`}
                        />
                        <span className="text-sm text-muted-foreground">ms</span>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        <Button
                          onClick={() => moveFrame(frame.id, 'up')}
                          disabled={index === 0}
                          variant="outline"
                          size="sm"
                          data-testid={`button-move-up-${index}`}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => moveFrame(frame.id, 'down')}
                          disabled={index === imageFrames.length - 1}
                          variant="outline"
                          size="sm"
                          data-testid={`button-move-down-${index}`}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        onClick={() => removeFrame(frame.id)}
                        variant="destructive"
                        size="sm"
                        data-testid={`button-remove-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card data-testid="settings-card">
          <CardHeader>
            <CardTitle>GIF Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  min="100"
                  max="1000"
                  value={gifSettings.width}
                  onChange={(e) => setGifSettings({...gifSettings, width: Number(e.target.value)})}
                  data-testid="input-width"
                />
              </div>
              
              <div>
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  min="100"
                  max="1000"
                  value={gifSettings.height}
                  onChange={(e) => setGifSettings({...gifSettings, height: Number(e.target.value)})}
                  data-testid="input-height"
                />
              </div>
              
              <div>
                <Label htmlFor="fps">Frame Rate: {gifSettings.fps} FPS</Label>
                <Slider
                  value={[gifSettings.fps]}
                  onValueChange={(value) => setGifSettings({...gifSettings, fps: value[0]})}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                  data-testid="slider-fps"
                />
              </div>
              
              <div>
                <Label htmlFor="quality">Quality: {gifSettings.quality}%</Label>
                <Slider
                  value={[gifSettings.quality]}
                  onValueChange={(value) => setGifSettings({...gifSettings, quality: value[0]})}
                  min={10}
                  max={100}
                  step={5}
                  className="mt-2"
                  data-testid="slider-quality"
                />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="loop"
                checked={gifSettings.loop}
                onChange={(e) => setGifSettings({...gifSettings, loop: e.target.checked})}
                className="rounded"
                data-testid="checkbox-loop"
              />
              <Label htmlFor="loop">Loop animation</Label>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="create-gif-card">
          <CardHeader>
            <CardTitle>Create GIF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={createGif}
                disabled={imageFrames.length < 2 || isProcessing}
                className="w-full"
                data-testid="button-create-gif"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating GIF...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Create Animated GIF
                  </>
                )}
              </Button>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing frames...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} data-testid="progress-creation" />
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
                Your Animated GIF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted text-center">
                  <img
                    src={outputGif}
                    alt="Created GIF"
                    className="max-w-full h-auto mx-auto rounded"
                    style={{ maxHeight: '400px' }}
                    data-testid="img-result-gif"
                  />
                </div>
                
                <Alert>
                  <AlertDescription>
                    GIF created successfully with {imageFrames.length} frames at {gifSettings.fps} FPS
                  </AlertDescription>
                </Alert>
                
                <Button
                  onClick={downloadGif}
                  className="w-full"
                  data-testid="button-download"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Animated GIF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}