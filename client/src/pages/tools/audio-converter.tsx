import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Music, FileAudio, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioFile {
  file: File;
  name: string;
  size: string;
  format: string;
  duration?: string;
}

export default function AudioConverter() {
  const { toast } = useToast();
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [targetFormat, setTargetFormat] = useState("mp3");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);

  const supportedFormats = [
    { value: "mp3", label: "MP3", description: "Most compatible format" },
    { value: "wav", label: "WAV", description: "Uncompressed audio" },
    { value: "flac", label: "FLAC", description: "Lossless compression" },
    { value: "m4a", label: "M4A", description: "Apple format" },
    { value: "ogg", label: "OGG", description: "Open source format" },
    { value: "aac", label: "AAC", description: "Advanced audio coding" },
    { value: "wma", label: "WMA", description: "Windows media audio" },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const audioFiles = files.filter(file => {
      return file.type.startsWith('audio/') || 
             ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac', '.wma'].some(ext => 
               file.name.toLowerCase().endsWith(ext)
             );
    });

    if (audioFiles.length === 0) {
      toast({
        title: "No audio files selected",
        description: "Please select audio files to convert",
        variant: "destructive"
      });
      return;
    }

    const newFiles: AudioFile[] = audioFiles.map(file => ({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      format: getFileExtension(file.name),
      duration: "Unknown" // In a real app, you'd analyze the audio to get duration
    }));

    setAudioFiles(prev => [...prev, ...newFiles]);
    
    toast({
      title: "Files added",
      description: `${audioFiles.length} audio file(s) ready for conversion`
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || 'unknown';
  };

  const simulateConversion = async () => {
    if (audioFiles.length === 0) {
      toast({
        title: "No files to convert",
        description: "Please add audio files first",
        variant: "destructive"
      });
      return;
    }

    setIsConverting(true);
    setConversionProgress(0);

    // Simulate conversion progress
    for (let i = 0; i <= 100; i += 10) {
      setConversionProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setIsConverting(false);
    setConversionProgress(100);

    toast({
      title: "Conversion completed!",
      description: `${audioFiles.length} file(s) converted to ${targetFormat.toUpperCase()}`
    });

    // In a real application, you would:
    // 1. Send files to a conversion service
    // 2. Process the audio conversion
    // 3. Return download links for converted files
  };

  const downloadConvertedFiles = () => {
    // In a real app, this would trigger download of converted files
    toast({
      title: "Download started",
      description: "Your converted files are being downloaded"
    });
  };

  const removeFile = (index: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setAudioFiles([]);
    setConversionProgress(0);
  };

  const getFormatInfo = (format: string) => {
    return supportedFormats.find(f => f.value === format);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Audio Converter</h1>
        <p className="text-muted-foreground">
          Convert audio files between different formats quickly and easily
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload and Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Upload & Convert</CardTitle>
            <CardDescription>
              Select audio files and choose output format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Audio Files</label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Drag and drop audio files here, or click to select
                </p>
                <Button asChild variant="outline" data-testid="button-upload">
                  <label>
                    Choose Files
                    <input
                      type="file"
                      multiple
                      accept="audio/*,.mp3,.wav,.flac,.m4a,.ogg,.aac,.wma"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: MP3, WAV, FLAC, M4A, OGG, AAC, WMA
              </p>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Output Format</label>
              <Select value={targetFormat} onValueChange={setTargetFormat}>
                <SelectTrigger data-testid="select-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedFormats.map(format => (
                    <SelectItem key={format.value} value={format.value}>
                      <div className="flex flex-col">
                        <span>{format.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {format.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFormatInfo(targetFormat) && (
                <p className="text-xs text-muted-foreground">
                  {getFormatInfo(targetFormat)?.description}
                </p>
              )}
            </div>

            {/* Conversion Controls */}
            <div className="space-y-3">
              <Button 
                onClick={simulateConversion}
                disabled={audioFiles.length === 0 || isConverting}
                className="w-full"
                data-testid="button-convert"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isConverting ? "Converting..." : `Convert to ${targetFormat.toUpperCase()}`}
              </Button>

              {isConverting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Converting files...</span>
                    <span>{conversionProgress}%</span>
                  </div>
                  <Progress value={conversionProgress} data-testid="conversion-progress" />
                </div>
              )}

              {conversionProgress === 100 && !isConverting && (
                <Button onClick={downloadConvertedFiles} variant="outline" className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download Converted Files
                </Button>
              )}

              {audioFiles.length > 0 && (
                <Button onClick={clearAllFiles} variant="outline" className="w-full" data-testid="button-clear">
                  Clear All Files
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        <Card>
          <CardHeader>
            <CardTitle>
              <FileAudio className="w-5 h-5 inline mr-2" />
              Files for Conversion ({audioFiles.length})
            </CardTitle>
            <CardDescription>
              Audio files ready for conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            {audioFiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No audio files selected</p>
                <p className="text-sm">Upload files to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {audioFiles.map((audioFile, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileAudio className="w-4 h-4 text-primary" />
                        <span className="font-medium truncate">{audioFile.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {audioFile.format.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Size: {audioFile.size}
                        {audioFile.duration && ` • Duration: ${audioFile.duration}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Will convert to: {targetFormat.toUpperCase()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      data-testid={`remove-file-${index}`}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Format Information */}
      <Card>
        <CardHeader>
          <CardTitle>Audio Format Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {supportedFormats.map(format => (
              <div key={format.value} className="p-3 border rounded-lg">
                <h3 className="font-medium">{format.label}</h3>
                <p className="text-muted-foreground">{format.description}</p>
                <div className="mt-2 text-xs">
                  {format.value === 'mp3' && "Best for: General use, streaming"}
                  {format.value === 'wav' && "Best for: Professional audio, editing"}
                  {format.value === 'flac' && "Best for: Archival, audiophiles"}
                  {format.value === 'm4a' && "Best for: Apple devices, iTunes"}
                  {format.value === 'ogg' && "Best for: Web streaming, gaming"}
                  {format.value === 'aac' && "Best for: Mobile devices, YouTube"}
                  {format.value === 'wma' && "Best for: Windows systems"}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}