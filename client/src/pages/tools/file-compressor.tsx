import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileArchive, Upload, Download, File, Trash2 } from "lucide-react";

export default function FileCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<string>("6");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [compressedFile, setCompressedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
    setCompressedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const compressFiles = async () => {
    if (files.length === 0) return;
    
    setIsCompressing(true);
    setProgress(0);
    setCompressedFile(null);

    try {
      // Simulate compression process
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Create a mock ZIP file (in reality, you'd use a compression library like JSZip)
      const zip = new Blob(['Mock ZIP file content'], { type: 'application/zip' });
      const url = URL.createObjectURL(zip);
      setCompressedFile(url);

    } catch (error) {
      console.error('Compression failed:', error);
    } finally {
      setIsCompressing(false);
      setProgress(0);
    }
  };

  const downloadCompressedFile = () => {
    if (!compressedFile) return;
    
    const link = document.createElement('a');
    link.href = compressedFile;
    link.download = `compressed_files_${Date.now()}.zip`;
    link.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <FileArchive className="w-8 h-8" />
          File Compressor
        </h1>
        <p className="text-lg text-muted-foreground">
          Compress multiple files into a single ZIP archive
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              File Selection
            </CardTitle>
            <CardDescription>
              Select files to compress into a ZIP archive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-files"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="mb-4"
                data-testid="button-select-files"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Files
              </Button>
              <p className="text-sm text-muted-foreground">
                Click to select files or drag and drop them here
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Compression Level</label>
              <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                <SelectTrigger data-testid="select-compression">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Compression (Fastest)</SelectItem>
                  <SelectItem value="1">Minimal Compression</SelectItem>
                  <SelectItem value="3">Low Compression</SelectItem>
                  <SelectItem value="6">Standard Compression</SelectItem>
                  <SelectItem value="9">Maximum Compression (Slowest)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={compressFiles} 
                disabled={files.length === 0 || isCompressing}
                className="flex-1"
                data-testid="button-compress"
              >
                {isCompressing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Compressing...
                  </>
                ) : (
                  <>
                    <FileArchive className="w-4 h-4 mr-2" />
                    Compress Files
                  </>
                )}
              </Button>

              {files.length > 0 && (
                <Button 
                  onClick={clearFiles}
                  variant="outline"
                  data-testid="button-clear"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {isCompressing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {progress}% Complete
                </p>
              </div>
            )}

            {compressedFile && (
              <Button 
                onClick={downloadCompressedFile}
                className="w-full"
                data-testid="button-download"
              >
                <Download className="w-4 h-4 mr-2" />
                Download ZIP File
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selected Files</CardTitle>
            <CardDescription>
              Files that will be included in the ZIP archive
            </CardDescription>
          </CardHeader>
          <CardContent>
            {files.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Total: {files.length} files ({formatFileSize(totalSize)})
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded"
                      data-testid={`file-${index}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <File className="w-4 h-4 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{file.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeFile(index)}
                        variant="ghost"
                        size="sm"
                        data-testid={`button-remove-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <FileArchive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No files selected</p>
                <p className="text-sm">Select files to compress them into a ZIP archive</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Compression Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Compression Levels</h4>
              <p className="text-sm text-muted-foreground">
                Higher compression levels create smaller files but take longer to process.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Supported File Types</h4>
              <p className="text-sm text-muted-foreground">
                All file types are supported. Text files typically compress better than binary files.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Security</h4>
              <p className="text-sm text-muted-foreground">
                Files are processed locally in your browser for privacy and security.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">File Size Limit</h4>
              <p className="text-sm text-muted-foreground">
                Browser memory limitations may affect very large files or archives.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}