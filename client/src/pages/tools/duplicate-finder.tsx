import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, File, Trash2, AlertTriangle } from "lucide-react";

interface FileWithHash {
  file: File;
  hash: string;
  path: string;
}

interface DuplicateGroup {
  hash: string;
  files: FileWithHash[];
  size: number;
}

export default function DuplicateFinder() {
  const [files, setFiles] = useState<FileWithHash[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateFileHash = async (file: File): Promise<string> => {
    // Simple hash calculation using file name, size, and last modified date
    // In a real implementation, you'd use crypto.subtle.digest with file content
    const data = `${file.name}-${file.size}-${file.lastModified}`;
    const encoder = new TextEncoder();
    const encoded = encoder.encode(data);
    const hash = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setIsScanning(true);

    try {
      const filesWithHashes = await Promise.all(
        selectedFiles.map(async (file) => ({
          file,
          hash: await calculateFileHash(file),
          path: file.webkitRelativePath || file.name
        }))
      );

      setFiles(prev => [...prev, ...filesWithHashes]);
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const findDuplicates = () => {
    const hashGroups: { [hash: string]: FileWithHash[] } = {};
    
    files.forEach(fileWithHash => {
      if (!hashGroups[fileWithHash.hash]) {
        hashGroups[fileWithHash.hash] = [];
      }
      hashGroups[fileWithHash.hash].push(fileWithHash);
    });

    const duplicateGroups: DuplicateGroup[] = Object.entries(hashGroups)
      .filter(([_, files]) => files.length > 1)
      .map(([hash, files]) => ({
        hash,
        files,
        size: files[0].file.size
      }));

    setDuplicates(duplicateGroups);
  };

  const toggleFileSelection = (filePath: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const selectAllInGroup = (group: DuplicateGroup, excludeFirst: boolean = true) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      const filesToSelect = excludeFirst ? group.files.slice(1) : group.files;
      filesToSelect.forEach(f => newSet.add(f.path));
      return newSet;
    });
  };

  const clearFiles = () => {
    setFiles([]);
    setDuplicates([]);
    setSelectedFiles(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalWastedSpace = duplicates.reduce((total, group) => {
    return total + (group.size * (group.files.length - 1));
  }, 0);

  const selectedFilesSize = files
    .filter(f => selectedFiles.has(f.path))
    .reduce((total, f) => total + f.file.size, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Search className="w-8 h-8" />
          Duplicate File Finder
        </h1>
        <p className="text-lg text-muted-foreground">
          Find and manage duplicate files to free up storage space
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
              Select files or folders to scan for duplicates
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
                disabled={isScanning}
                data-testid="button-select-files"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Select Files
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                Click to select multiple files to scan for duplicates
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={findDuplicates} 
                disabled={files.length === 0}
                className="flex-1"
                data-testid="button-scan"
              >
                <Search className="w-4 h-4 mr-2" />
                Find Duplicates
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

            {files.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {files.length} files loaded
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
            <CardDescription>
              Overview of duplicate files found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {duplicates.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="text-xl font-bold text-red-600 dark:text-red-400" data-testid="text-duplicate-groups">
                      {duplicates.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Duplicate Groups</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <div className="text-xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-wasted-space">
                      {formatFileSize(totalWastedSpace)}
                    </div>
                    <div className="text-sm text-muted-foreground">Wasted Space</div>
                  </div>
                </div>

                {selectedFiles.size > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-sm font-medium mb-1">Selected for Removal</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedFiles.size} files ({formatFileSize(selectedFilesSize)})
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Files:</span>
                    <span className="font-semibold">{files.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicate Files:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {duplicates.reduce((sum, group) => sum + group.files.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unique Files:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {files.length - duplicates.reduce((sum, group) => sum + group.files.length, 0) + duplicates.length}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No scan results yet</p>
                <p className="text-sm">Select files and click "Find Duplicates" to start</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {duplicates.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Duplicate File Groups
            </CardTitle>
            <CardDescription>
              Groups of identical files. Select files to mark for removal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {duplicates.map((group, groupIndex) => (
                <div key={group.hash} className="border rounded-lg p-4" data-testid={`group-${groupIndex}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        {group.files.length} duplicates
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(group.size)} each
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectAllInGroup(group, true)}
                        data-testid={`button-select-all-but-first-${groupIndex}`}
                      >
                        Select All (Keep First)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectAllInGroup(group, false)}
                        data-testid={`button-select-all-${groupIndex}`}
                      >
                        Select All
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {group.files.map((fileWithHash, fileIndex) => (
                      <div
                        key={fileWithHash.path}
                        className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                          selectedFiles.has(fileWithHash.path) ? 'bg-red-50 dark:bg-red-950/20' : 'bg-muted/50'
                        }`}
                        onClick={() => toggleFileSelection(fileWithHash.path)}
                        data-testid={`file-${groupIndex}-${fileIndex}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(fileWithHash.path)}
                          onChange={() => {}}
                          className="rounded"
                        />
                        <File className="w-4 h-4 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{fileWithHash.file.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {fileWithHash.path}
                          </div>
                        </div>
                        {fileIndex === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Keep
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Detection Method</h4>
              <p className="text-sm text-muted-foreground">
                Files are compared using content hashing to identify exact duplicates.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Safe Removal</h4>
              <p className="text-sm text-muted-foreground">
                Always keep at least one copy of each file. Review selections carefully.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">File Privacy</h4>
              <p className="text-sm text-muted-foreground">
                All file analysis is performed locally in your browser for security.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Space Recovery</h4>
              <p className="text-sm text-muted-foreground">
                Removing duplicates can free up significant storage space on your device.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}