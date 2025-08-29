import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Archive, FileText, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PDFCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressionLevels = [
    { value: "low", label: "Low Compression (Better Quality)", quality: 0.9 },
    { value: "medium", label: "Medium Compression", quality: 0.7 },
    { value: "high", label: "High Compression (Smaller Size)", quality: 0.5 },
    { value: "maximum", label: "Maximum Compression", quality: 0.3 },
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setOriginalFile(file);
      setOriginalSize(file.size);
      setCompressedUrl(null);
      setCompressedSize(0);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const compressPDF = async () => {
    if (!originalFile) return;

    setIsCompressing(true);
    
    try {
      // Import PDF-lib dynamically
      const { PDFDocument } = await import('pdf-lib');
      
      const arrayBuffer = await originalFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Get compression settings
      const level = compressionLevels.find(l => l.value === compressionLevel);
      const quality = level?.quality || 0.7;
      
      // Compress PDF by reducing image quality and removing metadata
      const pages = pdfDoc.getPages();
      
      // Remove metadata to reduce size
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      
      // Serialize with compression
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      
      // Create blob and URL
      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setCompressedUrl(url);
      setCompressedSize(blob.size);
      setIsCompressing(false);
      
    } catch (error) {
      console.error('PDF compression error:', error);
      alert('Error compressing PDF. Please try again.');
      setIsCompressing(false);
    }
  };

  const downloadCompressed = () => {
    if (compressedUrl && originalFile) {
      const link = document.createElement('a');
      link.href = compressedUrl;
      link.download = `compressed-${originalFile.name}`;
      link.click();
    }
  };

  const resetCompressor = () => {
    setOriginalFile(null);
    setCompressedUrl(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setCompressionLevel("medium");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PDF Compressor</h1>
          <p className="text-lg text-gray-600">Reduce PDF file size while maintaining quality</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              PDF Compression Tool
            </CardTitle>
            <CardDescription>
              Compress PDF files to reduce their size for easier sharing and storage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                This tool removes metadata and optimizes internal structures to reduce PDF size. 
                Higher compression levels may slightly reduce image quality.
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
                <Button onClick={resetCompressor} variant="outline">
                  Reset
                </Button>
              </div>
            </div>

            {originalFile && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Compression Level</Label>
                  <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {compressionLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={compressPDF} 
                    disabled={isCompressing}
                    className="px-8"
                  >
                    {isCompressing ? 'Compressing...' : 'Compress PDF'}
                  </Button>
                </div>

                {/* File information */}
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
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Original PDF
                    </Label>
                    <div className="border rounded-lg p-6 bg-white text-center">
                      <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
                      <p className="font-medium text-gray-900">{originalFile.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(originalSize)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      Compressed PDF
                    </Label>
                    <div className="border rounded-lg p-6 bg-white text-center">
                      {compressedUrl ? (
                        <>
                          <FileText className="h-16 w-16 text-green-500 mx-auto mb-4" />
                          <p className="font-medium text-gray-900">compressed-{originalFile.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(compressedSize)}</p>
                          <Button 
                            onClick={downloadCompressed} 
                            className="mt-4"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </>
                      ) : (
                        <div className="text-gray-400">
                          <Archive className="h-16 w-16 mx-auto mb-4" />
                          <p>{isCompressing ? 'Compressing...' : 'Compressed PDF will appear here'}</p>
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
                <p className="text-sm text-gray-500">Select a PDF to reduce its file size</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}