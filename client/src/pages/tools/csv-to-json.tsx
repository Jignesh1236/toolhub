import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, Upload, FileText, Braces } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CsvToJson() {
  const [csvInput, setCsvInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [hasHeaders, setHasHeaders] = useState(true);
  const [indentSize, setIndentSize] = useState(2);
  const [arrayMode, setArrayMode] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setCsvInput(content);
        };
        reader.readAsText(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file",
          variant: "destructive",
        });
      }
    }
  };

  const convertToJson = () => {
    if (!csvInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter CSV data to convert",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = csvInput.trim().split('\n');
      const result = [];
      
      let headers: string[] = [];
      let dataStartIndex = 0;

      if (hasHeaders && lines.length > 0) {
        headers = parseCSVLine(lines[0], delimiter);
        dataStartIndex = 1;
      } else {
        // Generate generic headers if no headers provided
        const firstLineData = parseCSVLine(lines[0] || '', delimiter);
        headers = firstLineData.map((_, index) => `column${index + 1}`);
        dataStartIndex = 0;
      }

      for (let i = dataStartIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const values = parseCSVLine(line, delimiter);
          
          if (arrayMode) {
            result.push(values);
          } else {
            const obj: Record<string, string> = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            result.push(obj);
          }
        }
      }

      const jsonString = JSON.stringify(result, null, indentSize);
      setJsonOutput(jsonString);

      toast({
        title: "Success!",
        description: `Converted ${result.length} rows to JSON`,
      });

    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Error",
        description: "Failed to convert CSV to JSON. Please check your CSV format.",
        variant: "destructive",
      });
    }
  };

  const parseCSVLine = (line: string, delimiter: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const copyToClipboard = async () => {
    if (!jsonOutput) return;

    try {
      await navigator.clipboard.writeText(jsonOutput);
      toast({
        title: "Copied!",
        description: "JSON copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadJson = () => {
    if (!jsonOutput) return;

    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleData = () => {
    const sampleCsv = `Name,Age,City,Country
John Doe,30,New York,USA
Jane Smith,25,London,UK
Bob Johnson,35,Toronto,Canada
Alice Brown,28,Sydney,Australia`;
    setCsvInput(sampleCsv);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">CSV to JSON Converter</h1>
        <p className="text-muted-foreground">
          Convert CSV data to JSON format with customizable options
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card data-testid="input-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CSV Input
              </CardTitle>
              <CardDescription>
                Paste CSV data or upload a CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                  data-testid="input-csv-file"
                />
              </div>

              <div className="flex justify-between items-center">
                <Label htmlFor="csv-data">CSV Data</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSampleData}
                  data-testid="button-load-sample"
                >
                  Load Sample
                </Button>
              </div>
              
              <Textarea
                id="csv-data"
                placeholder="Name,Age,City&#10;John Doe,30,New York&#10;Jane Smith,25,London"
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                data-testid="textarea-csv-input"
              />
            </CardContent>
          </Card>

          <Card data-testid="settings-card">
            <CardHeader>
              <CardTitle>Conversion Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delimiter">Delimiter</Label>
                  <Select value={delimiter} onValueChange={setDelimiter}>
                    <SelectTrigger data-testid="select-delimiter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=",">, (Comma)</SelectItem>
                      <SelectItem value=";">; (Semicolon)</SelectItem>
                      <SelectItem value="\t">⇥ (Tab)</SelectItem>
                      <SelectItem value="|">| (Pipe)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="indent">Indent Size</Label>
                  <Select value={indentSize.toString()} onValueChange={(v) => setIndentSize(Number(v))}>
                    <SelectTrigger data-testid="select-indent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="2">2 spaces</SelectItem>
                      <SelectItem value="4">4 spaces</SelectItem>
                      <SelectItem value="8">8 spaces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-headers"
                    checked={hasHeaders}
                    onCheckedChange={(checked) => setHasHeaders(!!checked)}
                    data-testid="checkbox-has-headers"
                  />
                  <Label htmlFor="has-headers">First row contains headers</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="array-mode"
                    checked={arrayMode}
                    onCheckedChange={(checked) => setArrayMode(!!checked)}
                    data-testid="checkbox-array-mode"
                  />
                  <Label htmlFor="array-mode">Array mode (no field names)</Label>
                </div>
              </div>

              <Button
                onClick={convertToJson}
                className="w-full"
                disabled={!csvInput.trim()}
                data-testid="button-convert"
              >
                <Braces className="h-4 w-4 mr-2" />
                Convert to JSON
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="output-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Braces className="h-5 w-5" />
                JSON Output
              </span>
              {jsonOutput && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    data-testid="button-copy"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadJson}
                    data-testid="button-download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Converted JSON data will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {jsonOutput ? (
              <div className="space-y-4">
                <Textarea
                  value={jsonOutput}
                  readOnly
                  className="min-h-[500px] font-mono text-sm bg-muted"
                  data-testid="textarea-json-output"
                />
                <div className="text-sm text-muted-foreground">
                  {jsonOutput.split('\n').length - 1} lines, {jsonOutput.length} characters
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Braces className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter CSV data and click "Convert to JSON" to see the result</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}