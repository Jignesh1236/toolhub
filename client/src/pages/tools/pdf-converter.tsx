import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface ConversionTask {
  id: string;
  fileName: string;
  fromFormat: string;
  toFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  inputFile: File;
  outputUrl?: string;
  progress: number;
}

const conversionOptions = [
  { from: 'pdf', to: 'word', label: 'PDF to Word (DOCX)', icon: 'fas fa-file-word', color: 'blue' },
  { from: 'pdf', to: 'excel', label: 'PDF to Excel (XLSX)', icon: 'fas fa-file-excel', color: 'green' },
  { from: 'pdf', to: 'powerpoint', label: 'PDF to PowerPoint (PPTX)', icon: 'fas fa-file-powerpoint', color: 'orange' },
  { from: 'pdf', to: 'images', label: 'PDF to Images (JPG/PNG)', icon: 'fas fa-image', color: 'purple' },
  { from: 'pdf', to: 'text', label: 'PDF to Text', icon: 'fas fa-file-alt', color: 'gray' },
  { from: 'word', to: 'pdf', label: 'Word to PDF', icon: 'fas fa-file-pdf', color: 'red' },
  { from: 'excel', to: 'pdf', label: 'Excel to PDF', icon: 'fas fa-file-pdf', color: 'red' },
  { from: 'powerpoint', to: 'pdf', label: 'PowerPoint to PDF', icon: 'fas fa-file-pdf', color: 'red' },
  { from: 'images', to: 'pdf', label: 'Images to PDF', icon: 'fas fa-file-pdf', color: 'red' },
  { from: 'html', to: 'pdf', label: 'HTML to PDF', icon: 'fas fa-file-pdf', color: 'red' },
  { from: 'text', to: 'pdf', label: 'Text to PDF', icon: 'fas fa-file-pdf', color: 'red' },
];

const pdfTools = [
  { id: 'merge', label: 'Merge PDFs', icon: 'fas fa-layer-group', color: 'blue' },
  { id: 'split', label: 'Split PDF', icon: 'fas fa-scissors', color: 'green' },
  { id: 'compress', label: 'Compress PDF', icon: 'fas fa-compress', color: 'purple' },
  { id: 'protect', label: 'Password Protect', icon: 'fas fa-lock', color: 'red' },
  { id: 'watermark', label: 'Add Watermark', icon: 'fas fa-certificate', color: 'orange' },
  { id: 'rotate', label: 'Rotate Pages', icon: 'fas fa-redo', color: 'indigo' }
];

export default function PDFConverter() {
  const [selectedTool, setSelectedTool] = useState<string>('convert');
  const [conversionType, setConversionType] = useState<string>('');
  const [tasks, setTasks] = useState<ConversionTask[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [watermarkText, setWatermarkText] = useState('');
  const [password, setPassword] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    if (selectedTool === 'merge') {
      setPdfFiles([...pdfFiles, ...newFiles.filter(f => f.type === 'application/pdf')]);
      return;
    }

    if (!conversionType) {
      toast({
        title: "Select Conversion Type",
        description: "Please select a conversion type before uploading files.",
        variant: "destructive"
      });
      return;
    }

    const selectedConversion = conversionOptions.find(opt => `${opt.from}-${opt.to}` === conversionType);
    if (!selectedConversion) return;

    newFiles.forEach(file => {
      const task: ConversionTask = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        fromFormat: selectedConversion.from,
        toFormat: selectedConversion.to,
        status: 'pending',
        inputFile: file,
        progress: 0
      };

      setTasks(prev => [...prev, task]);
      processConversion(task);
    });
  };

  const processConversion = async (task: ConversionTask) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'processing', progress: 10 } : t));

    try {
      let outputBlob: Blob;
      let outputFileName: string;

      switch (`${task.fromFormat}-${task.toFormat}`) {
        case 'pdf-text':
          outputBlob = await convertPDFToText(task.inputFile);
          outputFileName = task.fileName.replace('.pdf', '.txt');
          break;
        case 'pdf-images':
          outputBlob = await convertPDFToImages(task.inputFile);
          outputFileName = task.fileName.replace('.pdf', '_images.zip');
          break;
        case 'images-pdf':
          outputBlob = await convertImagesToPDF([task.inputFile]);
          outputFileName = task.fileName.replace(/\.[^/.]+$/, '.pdf');
          break;
        case 'html-pdf':
          outputBlob = await convertHtmlToPDF(htmlContent || '<h1>Sample HTML Content</h1>');
          outputFileName = 'converted.pdf';
          break;
        case 'text-pdf':
          outputBlob = await convertTextToPDF(textContent || 'Sample text content');
          outputFileName = 'converted.pdf';
          break;
        default:
          // Simulate document conversions (would need actual libraries in production)
          outputBlob = await simulateDocumentConversion(task);
          outputFileName = getOutputFileName(task.fileName, task.toFormat);
          break;
      }

      const outputUrl = URL.createObjectURL(outputBlob);
      
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'completed', progress: 100, outputUrl } : t
      ));

      toast({
        title: "Conversion Complete",
        description: `${task.fileName} has been converted to ${task.toFormat.toUpperCase()}.`,
      });

    } catch (error) {
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'error', progress: 0 } : t
      ));

      toast({
        title: "Conversion Failed",
        description: `Failed to convert ${task.fileName}. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const convertPDFToText = async (file: File): Promise<Blob> => {
    // Using a simple text extraction simulation
    // In production, would use pdf-parse or similar library
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const extractedText = `Extracted text from ${file.name}\n\nThis is simulated text extraction from the PDF file. In a real implementation, this would use a PDF parsing library to extract the actual text content from the PDF document.\n\nThe text would include all the readable content from each page of the PDF, preserving the structure as much as possible.`;
        const blob = new Blob([extractedText], { type: 'text/plain' });
        resolve(blob);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const convertPDFToImages = async (file: File): Promise<Blob> => {
    // Simulate image conversion - would use pdf-poppler or canvas in production
    return new Promise((resolve) => {
      setTimeout(() => {
        const simulatedImageData = 'Simulated image data from PDF pages';
        const blob = new Blob([simulatedImageData], { type: 'application/zip' });
        resolve(blob);
      }, 2000);
    });
  };

  const convertImagesToPDF = async (files: File[]): Promise<Blob> => {
    const pdfDoc = await PDFDocument.create();
    
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      let image;
      
      if (file.type === 'image/png') {
        image = await pdfDoc.embedPng(arrayBuffer);
      } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        image = await pdfDoc.embedJpg(arrayBuffer);
      } else {
        continue;
      }

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  };

  const convertTextToPDF = async (text: string): Promise<Blob> => {
    const pdfDoc = await PDFDocument.create();
    let currentPage = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const lines = text.split('\n');
    let yPosition = currentPage.getHeight() - 50;

    lines.forEach(line => {
      if (yPosition < 50) {
        currentPage = pdfDoc.addPage();
        yPosition = currentPage.getHeight() - 50;
      }
      
      currentPage.drawText(line, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  };

  const convertHtmlToPDF = async (html: string): Promise<Blob> => {
    // In production, would use html-pdf-node or puppeteer
    // For now, create a simple PDF with the HTML content as text
    const pdfDoc = await PDFDocument.create();
    let currentPage = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Strip HTML tags for simple conversion
    const textContent = html.replace(/<[^>]*>/g, '');
    const lines = textContent.split('\n');
    let yPosition = currentPage.getHeight() - 50;

    lines.forEach(line => {
      if (yPosition < 50) {
        currentPage = pdfDoc.addPage();
        yPosition = currentPage.getHeight() - 50;
      }
      
      currentPage.drawText(line, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  };

  const simulateDocumentConversion = async (task: ConversionTask): Promise<Blob> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const content = `Converted ${task.fromFormat} to ${task.toFormat}\n\nOriginal file: ${task.fileName}\nConversion type: ${task.fromFormat} → ${task.toFormat}\n\nThis is a simulated conversion. In production, this would use appropriate libraries for actual document conversion.`;
        const mimeType = getMimeType(task.toFormat);
        const blob = new Blob([content], { type: mimeType });
        resolve(blob);
      }, 3000);
    });
  };

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      toast({
        title: "Need More Files",
        description: "Please select at least 2 PDF files to merge.",
        variant: "destructive"
      });
      return;
    }

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged-document.pdf';
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "PDFs Merged",
        description: `${pdfFiles.length} PDF files have been merged successfully.`,
      });

      setPdfFiles([]);
    } catch (error) {
      toast({
        title: "Merge Failed",
        description: "Failed to merge PDF files.",
        variant: "destructive"
      });
    }
  };

  const addWatermark = async (file: File) => {
    if (!watermarkText.trim()) {
      toast({
        title: "Enter Watermark Text",
        description: "Please enter watermark text.",
        variant: "destructive"
      });
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 4,
          y: height / 2,
          size: 50,
          font,
          color: rgb(0.8, 0.8, 0.8),
          opacity: 0.5,
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_watermarked.pdf');
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Watermark Added",
        description: "Watermark has been added to the PDF.",
      });
    } catch (error) {
      toast({
        title: "Watermark Failed",
        description: "Failed to add watermark.",
        variant: "destructive"
      });
    }
  };

  const getMimeType = (format: string): string => {
    switch (format) {
      case 'word': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'powerpoint': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'text': return 'text/plain';
      case 'pdf': return 'application/pdf';
      default: return 'application/octet-stream';
    }
  };

  const getOutputFileName = (inputName: string, format: string): string => {
    const baseName = inputName.replace(/\.[^/.]+$/, '');
    switch (format) {
      case 'word': return `${baseName}.docx`;
      case 'excel': return `${baseName}.xlsx`;
      case 'powerpoint': return `${baseName}.pptx`;
      case 'text': return `${baseName}.txt`;
      case 'pdf': return `${baseName}.pdf`;
      default: return `${baseName}.${format}`;
    }
  };

  const downloadFile = (url: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  };

  const removeTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-pdf text-white text-sm"></i>
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">PDF Converter Suite</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {tasks.filter(t => t.status === 'completed').length} Completed
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllTasks}
                disabled={tasks.length === 0}
                data-testid="clear-tasks"
              >
                <i className="fas fa-trash mr-2"></i>
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${selectedTool === 'convert' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedTool('convert')}
            data-testid="convert-tool"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <i className="fas fa-exchange-alt text-blue-500"></i>
                <span>File Converter</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Convert between PDF, Word, Excel, PowerPoint, Images, Text, and HTML
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${selectedTool === 'merge' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedTool('merge')}
            data-testid="merge-tool"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <i className="fas fa-layer-group text-green-500"></i>
                <span>PDF Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Merge, split, compress, protect, and add watermarks to PDFs
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${selectedTool === 'batch' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedTool('batch')}
            data-testid="batch-tool"
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <i className="fas fa-tasks text-purple-500"></i>
                <span>Batch Processing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Process multiple files simultaneously for bulk conversions
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedTool === 'convert' && 'Conversion Options'}
                  {selectedTool === 'merge' && 'PDF Tools'}
                  {selectedTool === 'batch' && 'Batch Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTool === 'convert' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Conversion Type</label>
                      <Select value={conversionType} onValueChange={setConversionType}>
                        <SelectTrigger data-testid="conversion-type-select">
                          <SelectValue placeholder="Choose conversion..." />
                        </SelectTrigger>
                        <SelectContent>
                          {conversionOptions.map((option) => (
                            <SelectItem key={`${option.from}-${option.to}`} value={`${option.from}-${option.to}`}>
                              <div className="flex items-center space-x-2">
                                <i className={`${option.icon} text-${option.color}-500`}></i>
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {(conversionType === 'html-pdf' || conversionType === 'text-pdf') && (
                      <div className="space-y-4">
                        {conversionType === 'html-pdf' && (
                          <div>
                            <label className="block text-sm font-medium mb-2">HTML Content</label>
                            <textarea
                              value={htmlContent}
                              onChange={(e) => setHtmlContent(e.target.value)}
                              placeholder="Enter HTML content or paste URL..."
                              className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                              data-testid="html-content"
                            />
                          </div>
                        )}
                        
                        {conversionType === 'text-pdf' && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Text Content</label>
                            <textarea
                              value={textContent}
                              onChange={(e) => setTextContent(e.target.value)}
                              placeholder="Enter text content..."
                              className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                              data-testid="text-content"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {selectedTool === 'merge' && (
                  <>
                    <div className="space-y-2">
                      {pdfTools.map((tool) => (
                        <Button
                          key={tool.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            if (tool.id === 'merge') {
                              mergePDFs();
                            } else {
                              toast({
                                title: "Feature Coming Soon",
                                description: `${tool.label} feature will be available soon.`,
                              });
                            }
                          }}
                          data-testid={`tool-${tool.id}`}
                        >
                          <i className={`${tool.icon} text-${tool.color}-500 mr-2`}></i>
                          {tool.label}
                        </Button>
                      ))}
                    </div>

                    <Separator />

                    <div>
                      <label className="block text-sm font-medium mb-2">Watermark Text</label>
                      <Input
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="Enter watermark text..."
                        data-testid="watermark-text"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Password (for protection)</label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        data-testid="protection-password"
                      />
                    </div>
                  </>
                )}

                {selectedTool === 'batch' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Batch Conversion Type</label>
                      <Select value={conversionType} onValueChange={setConversionType}>
                        <SelectTrigger data-testid="batch-conversion-select">
                          <SelectValue placeholder="Choose conversion..." />
                        </SelectTrigger>
                        <SelectContent>
                          {conversionOptions.map((option) => (
                            <SelectItem key={`${option.from}-${option.to}`} value={`${option.from}-${option.to}`}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>• Upload multiple files for batch conversion</p>
                      <p>• All files will be processed with the same settings</p>
                      <p>• Download individual files or as a ZIP archive</p>
                    </div>
                  </div>
                )}

                <Separator />

                {/* File Upload */}
                <div className="space-y-3">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={selectedTool === 'convert' && !conversionType}
                    data-testid="upload-files"
                  >
                    <i className="fas fa-cloud-upload-alt mr-2"></i>
                    {selectedTool === 'merge' ? 'Upload PDF Files' : 'Upload Files'}
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={selectedTool !== 'convert'}
                    accept={selectedTool === 'merge' ? '.pdf' : '*/*'}
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />

                  {selectedTool === 'merge' && pdfFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selected PDF Files:</p>
                      {pdfFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPdfFiles(prev => prev.filter((_, i) => i !== index))}
                            data-testid={`remove-pdf-${index}`}
                          >
                            <i className="fas fa-times text-red-500"></i>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Tasks and Results */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Conversion Tasks</span>
                  <Badge variant="outline">{tasks.length} tasks</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-file-pdf text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No conversions yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Select a conversion type and upload files to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              task.status === 'completed' ? 'bg-green-500' :
                              task.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                              task.status === 'error' ? 'bg-red-500' :
                              'bg-gray-400'
                            }`}></div>
                            <span className="font-medium text-sm">{task.fileName}</span>
                            <Badge variant="outline" className="text-xs">
                              {task.fromFormat} → {task.toFormat}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {task.status === 'completed' && task.outputUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadFile(task.outputUrl!, getOutputFileName(task.fileName, task.toFormat))}
                                data-testid={`download-${task.id}`}
                              >
                                <i className="fas fa-download mr-1"></i>
                                Download
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTask(task.id)}
                              data-testid={`remove-${task.id}`}
                            >
                              <i className="fas fa-times text-red-500"></i>
                            </Button>
                          </div>
                        </div>
                        
                        {task.status === 'processing' && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        )}
                        
                        {task.status === 'error' && (
                          <p className="text-red-600 text-sm mt-1">
                            Conversion failed. Please try again.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {conversionOptions.slice(0, 6).map((option) => (
                    <Button
                      key={`${option.from}-${option.to}`}
                      variant="outline"
                      className="flex flex-col items-center space-y-1 h-auto py-3"
                      onClick={() => {
                        setSelectedTool('convert');
                        setConversionType(`${option.from}-${option.to}`);
                      }}
                      data-testid={`quick-${option.from}-${option.to}`}
                    >
                      <i className={`${option.icon} text-${option.color}-500`}></i>
                      <span className="text-xs text-center">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}