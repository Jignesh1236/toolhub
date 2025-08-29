import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { format } from 'sql-formatter';

export default function SQLFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("sql");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const formatSQL = () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter some SQL to format.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formatted = format(input, {
        language: language as any,
        tabWidth: 2,
        useTabs: false,
        keywordCase: 'upper',
        linesBetweenQueries: 2,
      });
      
      setOutput(formatted);
      setIsValid(true);
      setError("");
      
      toast({
        title: "Success!",
        description: "SQL formatted successfully.",
      });
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid SQL");
      setOutput("");
      
      toast({
        title: "Invalid SQL",
        description: "Please check your SQL syntax.",
        variant: "destructive",
      });
    }
  };

  const compressSQL = () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter some SQL to compress.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simple compression - remove extra whitespace and newlines
      const compressed = input
        .replace(/\s+/g, ' ')
        .replace(/\s*([(),;])\s*/g, '$1')
        .replace(/\s*(=|<|>|!=|<=|>=)\s*/g, ' $1 ')
        .trim();
      
      setOutput(compressed);
      setIsValid(true);
      setError("");
      
      toast({
        title: "Success!",
        description: "SQL compressed successfully.",
      });
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Error compressing SQL");
      setOutput("");
    }
  };

  const validateSQL = () => {
    if (!input.trim()) {
      setIsValid(null);
      setError("");
      return;
    }

    try {
      format(input, { language: language as any });
      setIsValid(true);
      setError("");
      
      toast({
        title: "Valid SQL",
        description: "Your SQL syntax is correct.",
      });
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : "Invalid SQL");
      
      toast({
        title: "Invalid SQL",
        description: "Please check your SQL syntax.",
        variant: "destructive",
      });
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied!",
        description: "Formatted SQL copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
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

  const downloadSQL = () => {
    if (!output) {
      toast({
        title: "Error",
        description: "No formatted SQL to download. Please format your SQL first.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([output], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formatted-sql-${Date.now()}.sql`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Formatted SQL file has been downloaded.",
    });
  };

  const downloadInputSQL = () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "No SQL input to download.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([input], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `original-sql-${Date.now()}.sql`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Original SQL file has been downloaded.",
    });
  };

  const loadSample = () => {
    const sampleSQL = `select u.id, u.name, u.email, p.title as post_title, c.content as comment from users u left join posts p on u.id = p.user_id inner join comments c on p.id = c.post_id where u.created_at > '2024-01-01' and u.status = 'active' order by u.name asc, p.created_at desc limit 10;`;
    setInput(sampleSQL);
    setOutput("");
    setIsValid(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">SQL Formatter</h1>
          <p className="text-gray-600 dark:text-gray-400">Format, validate, and beautify SQL queries</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="fas fa-database text-blue-500"></i>
                  SQL Input
                </span>
                <div className="flex gap-2">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32" data-testid="language-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sql">SQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                      <SelectItem value="mariadb">MariaDB</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadSample}
                    data-testid="load-sample"
                  >
                    Sample
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Enter your SQL query here..."
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setIsValid(null);
                    setError("");
                  }}
                  className="min-h-[300px] font-mono text-sm"
                  data-testid="sql-input"
                />
                {isValid !== null && (
                  <div className="absolute top-2 right-2">
                    <Badge variant={isValid ? "default" : "destructive"}>
                      {isValid ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-exclamation-triangle text-red-500 mt-0.5"></i>
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Syntax Error
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={formatSQL}
                  className="flex-1 min-w-[120px]"
                  data-testid="format-button"
                >
                  <i className="fas fa-indent mr-2"></i>
                  Format
                </Button>
                <Button 
                  variant="outline"
                  onClick={compressSQL}
                  className="flex-1 min-w-[120px]"
                  data-testid="compress-button"
                >
                  <i className="fas fa-compress mr-2"></i>
                  Compress
                </Button>
                <Button 
                  variant="outline"
                  onClick={validateSQL}
                  className="flex-1 min-w-[120px]"
                  data-testid="validate-button"
                >
                  <i className="fas fa-check mr-2"></i>
                  Validate
                </Button>
                <Button 
                  variant="outline"
                  onClick={clearAll}
                  data-testid="clear-button"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="fas fa-code text-green-500"></i>
                  Formatted Output
                </span>
                {output && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyOutput}
                      data-testid="copy-output"
                    >
                      <i className="fas fa-copy mr-1"></i>
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={downloadSQL}
                      data-testid="download-formatted"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {output ? (
                <div className="space-y-4">
                  <Textarea
                    value={output}
                    readOnly
                    className="min-h-[300px] font-mono text-sm bg-gray-50 dark:bg-gray-800"
                    data-testid="sql-output"
                  />
                  
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {input.length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Original Characters</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {output.length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Formatted Characters</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  <i className="fas fa-code text-4xl mb-4"></i>
                  <p className="text-lg mb-2">No formatted output yet</p>
                  <p className="text-sm">Enter SQL and click "Format" to begin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-star text-yellow-500"></i>
              SQL Formatter Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <i className="fas fa-indent text-2xl text-blue-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Smart Formatting</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Proper indentation and line breaks for readability
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-database text-2xl text-green-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Multi-Database</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Support for MySQL, PostgreSQL, SQLite, and more
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-check-circle text-2xl text-purple-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Syntax Validation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time validation with error highlighting
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-compress text-2xl text-red-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Compression</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Minify SQL for production use
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}