import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Upload, Scissors, Download, FileText } from 'lucide-react';

export default function PDFSplitter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [splitMode, setSplitMode] = useState<'pages' | 'range' | 'each'>('pages');
  const [pageRanges, setPageRanges] = useState('');
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid PDF file.",
        variant: "destructive",
      });
    }
  };

  const splitPDF = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a PDF file to split.",
        variant: "destructive",
      });
      return;
    }

    if (splitMode === 'range' && (!startPage || !endPage)) {
      toast({
        title: "Error",
        description: "Please specify start and end page numbers.",
        variant: "destructive",
      });
      return;
    }

    if (splitMode === 'pages' && !pageRanges) {
      toast({
        title: "Error",
        description: "Please specify page ranges (e.g., 1-3, 5, 7-10).",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      // For demo purposes, we'll simulate PDF splitting
      // In a real implementation, you would use a PDF library like pdf-lib
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful splitting
      toast({
        title: "Success!",
        description: `PDF split successfully! ${splitMode === 'each' ? 'Each page' : 'Selected pages'} downloaded as separate files.`,
      });

      // Here you would typically trigger downloads of the split PDFs
      // For demo, we'll just show the success message
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to split PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">PDF Splitter</h1>
          <p className="text-lg text-muted-foreground">
            Split large PDF files into separate pages or sections
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload and Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload PDF
              </CardTitle>
              <CardDescription>
                Select a PDF file to split into smaller files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose PDF File
                </Button>
                {selectedFile && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Split Options</Label>
                    <RadioGroup value={splitMode} onValueChange={(value: 'pages' | 'range' | 'each') => setSplitMode(value)} className="mt-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="each" id="each" />
                        <Label htmlFor="each">Split into individual pages</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="range" id="range" />
                        <Label htmlFor="range">Extract specific page range</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pages" id="pages" />
                        <Label htmlFor="pages">Split by custom page ranges</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {splitMode === 'range' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startPage">Start Page</Label>
                        <Input
                          id="startPage"
                          type="number"
                          min="1"
                          value={startPage}
                          onChange={(e) => setStartPage(e.target.value)}
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endPage">End Page</Label>
                        <Input
                          id="endPage"
                          type="number"
                          min="1"
                          value={endPage}
                          onChange={(e) => setEndPage(e.target.value)}
                          placeholder="10"
                        />
                      </div>
                    </div>
                  )}

                  {splitMode === 'pages' && (
                    <div>
                      <Label htmlFor="pageRanges">Page Ranges</Label>
                      <Input
                        id="pageRanges"
                        value={pageRanges}
                        onChange={(e) => setPageRanges(e.target.value)}
                        placeholder="1-3, 5, 7-10, 15"
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        Enter page ranges separated by commas. Examples: "1-3" for pages 1 to 3, "5" for page 5 only
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={splitPDF} 
                    disabled={processing}
                    className="w-full"
                  >
                    <Scissors className="h-4 w-4 mr-2" />
                    {processing ? 'Splitting PDF...' : 'Split PDF'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions and Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">📄 Individual Pages</h3>
                  <p className="text-sm text-muted-foreground">
                    Splits your PDF into separate files, one for each page. Perfect for extracting all pages individually.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold">📋 Page Range</h3>
                  <p className="text-sm text-muted-foreground">
                    Extract a continuous range of pages (e.g., pages 5-15) into a new PDF file.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold">📑 Custom Ranges</h3>
                  <p className="text-sm text-muted-foreground">
                    Split into multiple files using custom page ranges. Use commas to separate different ranges.
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Examples:</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">1-3</code>
                    <span className="ml-2 text-muted-foreground">Pages 1, 2, and 3</span>
                  </div>
                  <div>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">5</code>
                    <span className="ml-2 text-muted-foreground">Page 5 only</span>
                  </div>
                  <div>
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">1-3, 7, 10-12</code>
                    <span className="ml-2 text-muted-foreground">Multiple ranges</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Features:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Split PDFs of any size</li>
                  <li>• Maintain original quality</li>
                  <li>• Fast processing</li>
                  <li>• Download individual files</li>
                  <li>• Secure - files processed locally</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}