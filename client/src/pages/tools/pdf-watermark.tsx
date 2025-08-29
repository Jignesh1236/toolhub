import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Stamp, FileText, Type, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PDFWatermark() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null);
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState([24]);
  const [opacity, setOpacity] = useState([30]);
  const [rotation, setRotation] = useState([45]);
  const [position, setPosition] = useState("center");
  const [textColor, setTextColor] = useState("#ff0000");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const positions = [
    { value: "center", label: "Center" },
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
    { value: "top-center", label: "Top Center" },
    { value: "bottom-center", label: "Bottom Center" },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setOriginalFile(file);
      setWatermarkedUrl(null);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setWatermarkImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file.');
    }
  };

  const getWatermarkPosition = (pageWidth: number, pageHeight: number) => {
    const margin = 50;
    
    switch (position) {
      case "top-left":
        return { x: margin, y: pageHeight - margin };
      case "top-right":
        return { x: pageWidth - margin, y: pageHeight - margin };
      case "top-center":
        return { x: pageWidth / 2, y: pageHeight - margin };
      case "bottom-left":
        return { x: margin, y: margin };
      case "bottom-right":
        return { x: pageWidth - margin, y: margin };
      case "bottom-center":
        return { x: pageWidth / 2, y: margin };
      case "center":
      default:
        return { x: pageWidth / 2, y: pageHeight / 2 };
    }
  };

  const addWatermark = async () => {
    if (!originalFile || (watermarkType === "text" && !watermarkText) || (watermarkType === "image" && !watermarkImage)) {
      alert('Please provide watermark content.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Import PDF-lib dynamically
      const { PDFDocument, rgb, StandardFonts, degrees } = await import('pdf-lib');
      
      const arrayBuffer = await originalFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      // Process each page
      for (const page of pages) {
        const { width, height } = page.getSize();
        const watermarkPos = getWatermarkPosition(width, height);
        
        if (watermarkType === "text") {
          // Add text watermark
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          
          // Convert hex color to RGB
          const hexColor = textColor.replace('#', '');
          const r = parseInt(hexColor.substr(0, 2), 16) / 255;
          const g = parseInt(hexColor.substr(2, 2), 16) / 255;
          const b = parseInt(hexColor.substr(4, 2), 16) / 255;
          
          page.drawText(watermarkText, {
            x: watermarkPos.x,
            y: watermarkPos.y,
            size: fontSize[0],
            font: font,
            color: rgb(r, g, b),
            opacity: opacity[0] / 100,
            rotate: degrees(rotation[0]),
          });
        } else if (watermarkType === "image" && watermarkImage) {
          // Add image watermark
          const imageBytes = await fetch(watermarkImage).then(res => res.arrayBuffer());
          let embeddedImage;
          
          if (watermarkImage.includes('data:image/png')) {
            embeddedImage = await pdfDoc.embedPng(imageBytes);
          } else {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          }
          
          const imageDims = embeddedImage.scale(0.3);
          
          page.drawImage(embeddedImage, {
            x: watermarkPos.x - imageDims.width / 2,
            y: watermarkPos.y - imageDims.height / 2,
            width: imageDims.width,
            height: imageDims.height,
            opacity: opacity[0] / 100,
            rotate: degrees(rotation[0]),
          });
        }
      }
      
      // Save watermarked PDF
      const watermarkedBytes = await pdfDoc.save();
      
      // Create blob and URL
      const blob = new Blob([watermarkedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setWatermarkedUrl(url);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('PDF watermark error:', error);
      alert('Error adding watermark to PDF. Please try again.');
      setIsProcessing(false);
    }
  };

  const downloadWatermarked = () => {
    if (watermarkedUrl && originalFile) {
      const link = document.createElement('a');
      link.href = watermarkedUrl;
      link.download = `watermarked-${originalFile.name}`;
      link.click();
    }
  };

  const resetWatermark = () => {
    setOriginalFile(null);
    setWatermarkedUrl(null);
    setWatermarkText("CONFIDENTIAL");
    setWatermarkImage(null);
    setWatermarkType("text");
    setFontSize([24]);
    setOpacity([30]);
    setRotation([45]);
    setPosition("center");
    setTextColor("#ff0000");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PDF Watermark</h1>
          <p className="text-lg text-gray-600">Add watermarks and stamps to your PDF documents</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stamp className="h-5 w-5" />
              PDF Watermark Tool
            </CardTitle>
            <CardDescription>
              Add text or image watermarks to your PDF documents for branding, copyright protection, or document security.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Stamp className="h-4 w-4" />
              <AlertDescription>
                Watermarks are added to all pages of the PDF. You can adjust opacity, rotation, and position to suit your needs.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Label htmlFor="pdf-upload">Upload PDF File</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="flex-1"
                />
                <Button onClick={resetWatermark} variant="outline">
                  Reset
                </Button>
              </div>
            </div>

            {originalFile && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Watermark Type</Label>
                  <Select value={watermarkType} onValueChange={(value: "text" | "image") => setWatermarkType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Watermark</SelectItem>
                      <SelectItem value="image">Image Watermark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {watermarkType === "text" ? (
                  <div className="space-y-4">
                    <Label htmlFor="watermark-text">Watermark Text</Label>
                    <Textarea
                      id="watermark-text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter watermark text..."
                      rows={2}
                    />
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Font Size: {fontSize[0]}px</Label>
                        <Slider
                          value={fontSize}
                          onValueChange={setFontSize}
                          max={72}
                          min={8}
                          step={2}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Text Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-12 h-10 p-1 border rounded"
                          />
                          <Input
                            type="text"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label htmlFor="watermark-image">Upload Watermark Image</Label>
                    <Input
                      id="watermark-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={imageInputRef}
                    />
                    {watermarkImage && (
                      <div className="mt-4">
                        <img 
                          src={watermarkImage} 
                          alt="Watermark Preview" 
                          className="max-w-32 max-h-32 object-contain border rounded"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Opacity: {opacity[0]}%</Label>
                    <Slider
                      value={opacity}
                      onValueChange={setOpacity}
                      max={100}
                      min={5}
                      step={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rotation: {rotation[0]}°</Label>
                    <Slider
                      value={rotation}
                      onValueChange={setRotation}
                      max={360}
                      min={0}
                      step={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select value={position} onValueChange={setPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={addWatermark} 
                    disabled={isProcessing}
                    className="px-8"
                  >
                    {isProcessing ? 'Adding Watermark...' : 'Add Watermark'}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Original PDF
                    </Label>
                    <div className="border rounded-lg p-6 bg-white text-center">
                      <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <p className="font-medium text-gray-900">{originalFile.name}</p>
                      <p className="text-sm text-gray-500">No watermark</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Stamp className="h-4 w-4" />
                      Watermarked PDF
                    </Label>
                    <div className="border rounded-lg p-6 bg-white text-center">
                      {watermarkedUrl ? (
                        <>
                          <div className="relative">
                            <FileText className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <Stamp className="h-6 w-6 text-blue-500 absolute top-0 right-1/2 transform translate-x-1/2 bg-white rounded-full p-1" />
                          </div>
                          <p className="font-medium text-gray-900">watermarked-{originalFile.name}</p>
                          <p className="text-sm text-gray-500">With Watermark</p>
                          <Button 
                            onClick={downloadWatermarked} 
                            className="mt-4"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </>
                      ) : (
                        <div className="text-gray-400">
                          <div className="relative">
                            <FileText className="h-16 w-16 mx-auto mb-4" />
                            <Stamp className="h-6 w-6 absolute top-0 right-1/2 transform translate-x-1/2 bg-white rounded-full p-1" />
                          </div>
                          <p>{isProcessing ? 'Adding watermark...' : 'Watermarked PDF will appear here'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!originalFile && (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">Click to upload a PDF file</p>
                <p className="text-sm text-gray-500">Add watermarks and stamps to your document</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}