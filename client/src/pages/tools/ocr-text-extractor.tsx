import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Tesseract from 'tesseract.js';

export default function OCRTextExtractor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [language, setLanguage] = useState("eng");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setExtractedText("");
      setProgress(0);
    }
  };

  const extractText = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select an image file first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const { data: { text } } = await Tesseract.recognize(selectedFile, language, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      setExtractedText(text);
      toast({
        title: "Text Extraction Complete",
        description: "Text has been successfully extracted from the image.",
      });
    } catch (error) {
      console.error("OCR Error:", error);
      toast({
        title: "Extraction Failed",
        description: "Failed to extract text from the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const copyText = async () => {
    if (!extractedText) return;
    
    try {
      await navigator.clipboard.writeText(extractedText);
      toast({
        title: "Copied!",
        description: "Extracted text copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadText = () => {
    if (!extractedText) return;

    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted-text.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setSelectedFile(null);
    setExtractedText("");
    setPreviewUrl("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">OCR Text Extractor</h1>
          <p className="text-gray-600 dark:text-gray-400">Extract text from images using advanced OCR technology</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-upload text-blue-500"></i>
                  Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="file-input"
                  />
                  <i className="fas fa-image text-4xl text-blue-400 mb-4"></i>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Select an image containing text
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Supports JPG, PNG, GIF, TIFF, BMP formats
                  </p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="select-image"
                  >
                    <i className="fas fa-folder-open mr-2"></i>
                    Select Image
                  </Button>
                </div>

                {selectedFile && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-file-image text-blue-500"></i>
                        <div>
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Ready</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={extractText}
                        disabled={isProcessing}
                        className="flex-1"
                        data-testid="extract-text"
                      >
                        {isProcessing ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Extracting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-text-width mr-2"></i>
                            Extract Text
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={clearAll}
                        data-testid="clear-all"
                      >
                        <i className="fas fa-trash mr-2"></i>
                        Clear
                      </Button>
                    </div>

                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image Preview */}
            {previewUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-eye text-green-500"></i>
                    Image Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative max-h-64 overflow-hidden rounded-lg border">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-file-alt text-purple-500"></i>
                Extracted Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              {extractedText ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium">
                        {extractedText.length} characters, {extractedText.split(/\s+/).length} words
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={copyText}
                          data-testid="copy-text"
                        >
                          <i className="fas fa-copy mr-1"></i>
                          Copy
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={downloadText}
                          data-testid="download-text"
                        >
                          <i className="fas fa-download mr-1"></i>
                          Download
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={extractedText}
                      onChange={(e) => setExtractedText(e.target.value)}
                      className="min-h-[300px] resize-none"
                      placeholder="Extracted text will appear here..."
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <i className="fas fa-text-width text-4xl mb-4"></i>
                  <p className="text-lg mb-2">No text extracted yet</p>
                  <p className="text-sm">Upload an image and click "Extract Text" to begin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-star text-yellow-500"></i>
              OCR Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <i className="fas fa-language text-2xl text-blue-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Multi-language</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Supports multiple languages including English, Spanish, French, German, and more
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-bolt text-2xl text-green-500 mb-2"></i>
                <h3 className="font-semibold mb-1">High Accuracy</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced OCR technology for accurate text recognition
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-shield-alt text-2xl text-purple-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Privacy First</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All processing happens locally in your browser
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}