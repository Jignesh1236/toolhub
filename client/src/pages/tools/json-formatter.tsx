import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

export default function JSONFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const formatJSON = () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter some JSON to format.",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsValid(true);
      setError("");
      
      toast({
        title: "Success!",
        description: "JSON formatted successfully.",
      });
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid JSON");
      setOutput("");
      
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax.",
        variant: "destructive",
      });
    }
  };

  const minifyJSON = () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter some JSON to minify.",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
      setError("");
      
      toast({
        title: "Success!",
        description: "JSON minified successfully.",
      });
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid JSON");
      setOutput("");
    }
  };

  const validateJSON = () => {
    if (!input.trim()) {
      setIsValid(null);
      setError("");
      return;
    }

    try {
      JSON.parse(input);
      setIsValid(true);
      setError("");
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "JSON copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setIsValid(null);
    setError("");
  };

  const downloadJSON = () => {
    if (!output) {
      toast({
        title: "Error",
        description: "No formatted JSON to download. Please format your JSON first.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formatted-json-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "JSON file has been downloaded.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">JSON Formatter</h1>
          <p className="text-gray-600 dark:text-gray-400">Format, validate, and beautify your JSON data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Input JSON</CardTitle>
                <div className="flex items-center space-x-2">
                  {isValid === true && <Badge className="bg-green-100 text-green-800">Valid</Badge>}
                  {isValid === false && <Badge variant="destructive">Invalid</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  validateJSON();
                }}
                placeholder="Paste your JSON here..."
                className="min-h-96 font-mono text-sm"
                data-testid="json-input"
              />
              
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300" data-testid="error-message">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={formatJSON} data-testid="format-button">
                  <i className="fas fa-code mr-2"></i>
                  Format JSON
                </Button>
                <Button onClick={minifyJSON} variant="outline" data-testid="minify-button">
                  <i className="fas fa-compress mr-2"></i>
                  Minify JSON
                </Button>
                <Button onClick={clearAll} variant="outline" data-testid="clear-button">
                  <i className="fas fa-times mr-2"></i>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Formatted JSON</CardTitle>
                {output && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(output)}
                      data-testid="copy-button"
                    >
                      <i className="fas fa-copy mr-2"></i>
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={downloadJSON}
                      data-testid="download-json"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {output ? (
                <Textarea
                  value={output}
                  readOnly
                  className="min-h-96 font-mono text-sm"
                  data-testid="json-output"
                />
              ) : (
                <div className="min-h-96 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="text-center">
                    <i className="fas fa-code text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-500 dark:text-gray-400">
                      Formatted JSON will appear here
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* JSON Stats */}
        {input && isValid && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>JSON Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {input.length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Characters</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {output.length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Formatted Characters</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {(input.length / 1024).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">KB</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {input.split('\n').length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lines</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
