import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function PDFMerger() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...selectedFiles];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setSelectedFiles(newFiles);
  };

  const mergePDFs = async () => {
    if (selectedFiles.length < 2) {
      toast({
        title: "Error",
        description: "Please select at least 2 PDF files to merge.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('pdf', file);
      });

      const response = await fetch('/api/pdf/merge', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to merge PDFs');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged-document.pdf';
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "PDFs merged and downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to merge PDFs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">PDF Merger</h1>
          <p className="text-gray-600 dark:text-gray-400">Combine multiple PDF files into a single document</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Select PDF Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="file-input"
                />
                <i className="fas fa-file-pdf text-4xl text-red-400 mb-4"></i>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select multiple PDF files to merge
                </p>
                <Button onClick={() => fileInputRef.current?.click()} data-testid="select-files">
                  Select PDF Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File List Section */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Files ({selectedFiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFiles.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No files selected yet
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      data-testid={`file-item-${index}`}
                    >
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-file-pdf text-red-500"></i>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => index > 0 && moveFile(index, index - 1)}
                          disabled={index === 0}
                          data-testid={`move-up-${index}`}
                        >
                          <i className="fas fa-arrow-up"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => index < selectedFiles.length - 1 && moveFile(index, index + 1)}
                          disabled={index === selectedFiles.length - 1}
                          data-testid={`move-down-${index}`}
                        >
                          <i className="fas fa-arrow-down"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`remove-${index}`}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <Button
                  onClick={mergePDFs}
                  disabled={selectedFiles.length < 2 || processing}
                  className="w-full"
                  data-testid="merge-button"
                >
                  {processing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Merging PDFs...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download mr-2"></i>
                      Merge & Download PDF
                    </>
                  )}
                </Button>
                
                {selectedFiles.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFiles([])}
                    className="w-full"
                    data-testid="clear-files"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Clear All Files
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
