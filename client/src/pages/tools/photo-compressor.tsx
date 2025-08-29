import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Archive, Image as ImageIcon, FileText } from "lucide-react";

export default function PhotoCompressor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState([80]);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getImageSize = (dataUrl: string): number => {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    return binary.length;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalSize(file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImage(result);
        setCompressedImage(null);
        setCompressedSize(0);
        // Auto-compress with default quality
        compressImage(result, quality[0]);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = async (imageData: string, qualityValue: number) => {
    if (!canvasRef.current) return;

    setIsCompressing(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image
        ctx?.drawImage(img, 0, 0);
        
        // Convert to compressed format
        const compressedDataUrl = canvas.toDataURL('image/jpeg', qualityValue / 100);
        setCompressedImage(compressedDataUrl);
        setCompressedSize(getImageSize(compressedDataUrl));
        setIsCompressing(false);
      };
      
      img.src = imageData;
    } catch (error) {
      console.error('Compression error:', error);
      setIsCompressing(false);
    }
  };

  const handleQualityChange = (newQuality: number[]) => {
    setQuality(newQuality);
    if (originalImage) {
      compressImage(originalImage, newQuality[0]);
    }
  };

  const downloadImage = () => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.download = `compressed-image-${quality[0]}q.jpg`;
      link.href = compressedImage;
      link.click();
    }
  };

  const resetCompressor = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setQuality([80]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Photo Compressor</h1>
          <p className="text-lg text-gray-600">Compress photos to reduce file size without losing quality</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Image Compression Tool
            </CardTitle>
            <CardDescription>
              Reduce image file size while maintaining visual quality. Adjust compression level to balance size and quality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="image-upload">Upload Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="flex-1"
                />
                <Button onClick={resetCompressor} variant="outline">
                  Reset
                </Button>
              </div>
            </div>

            {originalImage && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    Compression Quality: {quality[0]}%
                  </Label>
                  <div className="px-4">
                    <Slider
                      value={quality}
                      onValueChange={handleQualityChange}
                      max={100}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Higher Compression</span>
                      <span>Better Quality</span>
                    </div>
                  </div>
                </div>

                {/* File size comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Original Size</p>
                    <p className="text-lg font-bold text-gray-900">{formatFileSize(originalSize)}</p>
                  </div>
                  
                  <div className="text-center">
                    <Archive className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Compressed Size</p>
                    <p className="text-lg font-bold text-gray-900">
                      {isCompressing ? 'Compressing...' : formatFileSize(compressedSize)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <Download className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Space Saved</p>
                    <p className="text-lg font-bold text-gray-900">
                      {compressionRatio.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Original Image
                    </Label>
                    <div className="border rounded-lg p-4 bg-white">
                      <img 
                        src={originalImage} 
                        alt="Original" 
                        className="w-full h-auto max-h-96 object-contain mx-auto"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      Compressed Image
                    </Label>
                    <div className="border rounded-lg p-4 bg-white">
                      {compressedImage ? (
                        <img 
                          src={compressedImage} 
                          alt="Compressed" 
                          className="w-full h-auto max-h-96 object-contain mx-auto"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-96 text-gray-400">
                          {isCompressing ? 'Compressing...' : 'Compressed image will appear here'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {compressedImage && (
                  <div className="flex justify-center">
                    <Button onClick={downloadImage} className="px-8">
                      <Download className="h-4 w-4 mr-2" />
                      Download Compressed Image
                    </Button>
                  </div>
                )}
              </div>
            )}

            {!originalImage && (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">Click to upload an image</p>
                <p className="text-sm text-gray-500">Supports JPEG, PNG, and other image formats</p>
              </div>
            )}
          </CardContent>
        </Card>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}