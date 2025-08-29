import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, Download, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sepia: number;
  grayscale: number;
  vintage: number;
}

export default function PhotoFilters() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    vintage: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setImageLoaded(true);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const applyFilters = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // Build filter string
    const filterString = [
      `brightness(${filters.brightness}%)`,
      `contrast(${filters.contrast}%)`,
      `saturate(${filters.saturation}%)`,
      `hue-rotate(${filters.hue}deg)`,
      `blur(${filters.blur}px)`,
      `sepia(${filters.sepia}%)`,
      `grayscale(${filters.grayscale}%)`
    ].join(' ');

    ctx.filter = filterString;
    ctx.drawImage(originalImage, 0, 0);

    // Apply vintage effect if enabled
    if (filters.vintage > 0) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = `rgba(255, 230, 180, ${filters.vintage / 100})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      sepia: 0,
      grayscale: 0,
      vintage: 0
    });
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = 'filtered_image.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const applyPreset = (preset: string) => {
    const presets: Record<string, FilterSettings> = {
      vintage: {
        brightness: 110,
        contrast: 120,
        saturation: 80,
        hue: 10,
        blur: 0,
        sepia: 30,
        grayscale: 0,
        vintage: 40
      },
      blackwhite: {
        brightness: 100,
        contrast: 110,
        saturation: 0,
        hue: 0,
        blur: 0,
        sepia: 0,
        grayscale: 100,
        vintage: 0
      },
      sepia: {
        brightness: 110,
        contrast: 90,
        saturation: 80,
        hue: 20,
        blur: 0,
        sepia: 80,
        grayscale: 0,
        vintage: 20
      },
      cool: {
        brightness: 105,
        contrast: 110,
        saturation: 120,
        hue: 200,
        blur: 0,
        sepia: 0,
        grayscale: 0,
        vintage: 0
      },
      warm: {
        brightness: 110,
        contrast: 105,
        saturation: 110,
        hue: 30,
        blur: 0,
        sepia: 10,
        grayscale: 0,
        vintage: 10
      }
    };

    if (presets[preset]) {
      setFilters(presets[preset]);
    }
  };

  useEffect(() => {
    if (imageLoaded) {
      applyFilters();
    }
  }, [filters, imageLoaded]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Photo Filters</h1>
          <p className="text-lg text-muted-foreground">
            Apply Instagram-style filters and effects to your photos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload and Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Upload & Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </div>

              {imageLoaded && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Quick Presets</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" onClick={() => applyPreset('vintage')}>
                        Vintage
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => applyPreset('blackwhite')}>
                        B&W
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => applyPreset('sepia')}>
                        Sepia
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => applyPreset('cool')}>
                        Cool
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => applyPreset('warm')}>
                        Warm
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold">Manual Adjustments</h3>
                    
                    <div>
                      <Label>Brightness: {filters.brightness}%</Label>
                      <Slider
                        value={[filters.brightness]}
                        onValueChange={([value]) => setFilters(prev => ({ ...prev, brightness: value }))}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Contrast: {filters.contrast}%</Label>
                      <Slider
                        value={[filters.contrast]}
                        onValueChange={([value]) => setFilters(prev => ({ ...prev, contrast: value }))}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Saturation: {filters.saturation}%</Label>
                      <Slider
                        value={[filters.saturation]}
                        onValueChange={([value]) => setFilters(prev => ({ ...prev, saturation: value }))}
                        min={0}
                        max={200}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Hue Rotate: {filters.hue}°</Label>
                      <Slider
                        value={[filters.hue]}
                        onValueChange={([value]) => setFilters(prev => ({ ...prev, hue: value }))}
                        min={-180}
                        max={180}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Blur: {filters.blur}px</Label>
                      <Slider
                        value={[filters.blur]}
                        onValueChange={([value]) => setFilters(prev => ({ ...prev, blur: value }))}
                        min={0}
                        max={10}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Sepia: {filters.sepia}%</Label>
                      <Slider
                        value={[filters.sepia]}
                        onValueChange={([value]) => setFilters(prev => ({ ...prev, sepia: value }))}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Grayscale: {filters.grayscale}%</Label>
                      <Slider
                        value={[filters.grayscale]}
                        onValueChange={([value]) => setFilters(prev => ({ ...prev, grayscale: value }))}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Vintage: {filters.vintage}%</Label>
                      <Slider
                        value={[filters.vintage]}
                        onValueChange={([value]) => setFilters(prev => ({ ...prev, vintage: value }))}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <Button onClick={resetFilters} variant="outline" className="w-full">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Filters
                    </Button>
                    <Button onClick={downloadImage} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Image
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  {imageLoaded ? 'Your filtered photo preview' : 'Upload an image to see the preview'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imageLoaded ? (
                  <div className="space-y-4">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full h-auto border rounded-lg"
                      style={{ maxHeight: '500px' }}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Upload an image to start applying filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}