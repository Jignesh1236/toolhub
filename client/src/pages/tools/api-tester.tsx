import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Header {
  key: string;
  value: string;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
  size: number;
}

export default function ApiTester() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Header[]>([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("headers");
  const { toast } = useToast();

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updatedHeaders = [...headers];
    updatedHeaders[index][field] = value;
    setHeaders(updatedHeaders);
  };

  const sendRequest = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const startTime = performance.now();

    try {
      // Prepare headers
      const requestHeaders: Record<string, string> = {};
      headers.forEach(header => {
        if (header.key.trim() && header.value.trim()) {
          requestHeaders[header.key] = header.value;
        }
      });

      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && body.trim()) {
        requestOptions.body = body;
        
        // Set content-type if not already specified
        if (!requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
          try {
            JSON.parse(body);
            requestHeaders['Content-Type'] = 'application/json';
          } catch {
            requestHeaders['Content-Type'] = 'text/plain';
          }
        }
      }

      const fetchResponse = await fetch(url, requestOptions);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      // Get response headers
      const responseHeaders: Record<string, string> = {};
      fetchResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Get response data
      const contentType = fetchResponse.headers.get('content-type') || '';
      let responseData;
      let size = 0;

      const responseText = await fetchResponse.text();
      size = new Blob([responseText]).size;

      try {
        if (contentType.includes('application/json')) {
          responseData = JSON.parse(responseText);
        } else {
          responseData = responseText;
        }
      } catch {
        responseData = responseText;
      }

      const apiResponse: ApiResponse = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: responseHeaders,
        data: responseData,
        responseTime,
        size,
      };

      setResponse(apiResponse);

      toast({
        title: "Request Completed",
        description: `${fetchResponse.status} ${fetchResponse.statusText} in ${responseTime}ms`,
        variant: fetchResponse.ok ? "default" : "destructive",
      });
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      setResponse({
        status: 0,
        statusText: "Network Error",
        headers: {},
        data: error instanceof Error ? error.message : "Unknown error",
        responseTime,
        size: 0,
      });

      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setUrl("");
    setHeaders([{ key: "", value: "" }]);
    setBody("");
    setResponse(null);
  };

  const loadSample = () => {
    setMethod("GET");
    setUrl("https://jsonplaceholder.typicode.com/posts/1");
    setHeaders([
      { key: "Accept", value: "application/json" },
      { key: "", value: "" }
    ]);
    setBody("");
  };

  const copyResponse = async () => {
    if (!response) return;
    
    try {
      const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
      await navigator.clipboard.writeText(responseText);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy response.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600 dark:text-green-400";
    if (status >= 300 && status < 400) return "text-blue-600 dark:text-blue-400";
    if (status >= 400 && status < 500) return "text-orange-600 dark:text-orange-400";
    if (status >= 500) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">API Tester</h1>
          <p className="text-gray-600 dark:text-gray-400">Test REST APIs with various HTTP methods</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Request Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-paper-plane text-blue-500"></i>
                    Request
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadSample}
                      data-testid="load-sample"
                    >
                      Sample
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearAll}
                      data-testid="clear-all"
                    >
                      Clear
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="w-32" data-testid="method-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                      <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Enter API URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                    data-testid="url-input"
                  />
                  <Button 
                    onClick={sendRequest}
                    disabled={isLoading || !url.trim()}
                    className="min-w-[100px]"
                    data-testid="send-request"
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Send
                      </>
                    )}
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                    <TabsTrigger value="body">Body</TabsTrigger>
                  </TabsList>

                  <TabsContent value="headers" className="space-y-3">
                    <div className="space-y-2">
                      {headers.map((header, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            placeholder="Header key"
                            value={header.key}
                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                            className="flex-1"
                            data-testid={`header-key-${index}`}
                          />
                          <Input
                            placeholder="Header value"
                            value={header.value}
                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                            className="flex-1"
                            data-testid={`header-value-${index}`}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHeader(index)}
                            disabled={headers.length === 1}
                            data-testid={`remove-header-${index}`}
                          >
                            <i className="fas fa-trash text-red-500"></i>
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={addHeader}
                      className="w-full"
                      data-testid="add-header"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add Header
                    </Button>
                  </TabsContent>

                  <TabsContent value="body">
                    <Textarea
                      placeholder="Request body (JSON, XML, text, etc.)"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                      disabled={!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)}
                      data-testid="request-body"
                    />
                    {!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Request body is not supported for {method} requests
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Response Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-reply text-green-500"></i>
                    Response
                  </span>
                  {response && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {response.responseTime}ms
                      </Badge>
                      <Badge variant="secondary">
                        {formatSize(response.size)}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={copyResponse}
                        data-testid="copy-response"
                      >
                        <i className="fas fa-copy mr-1"></i>
                        Copy
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className="space-y-4">
                    {/* Status */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <Label className="text-sm">Status</Label>
                        <p className={`text-lg font-bold ${getStatusColor(response.status)}`}>
                          {response.status} {response.statusText}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm">Time</Label>
                        <p className="text-lg font-semibold">{response.responseTime}ms</p>
                      </div>
                      <div>
                        <Label className="text-sm">Size</Label>
                        <p className="text-lg font-semibold">{formatSize(response.size)}</p>
                      </div>
                    </div>

                    <Tabs defaultValue="body" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="body">Response Body</TabsTrigger>
                        <TabsTrigger value="headers">Headers</TabsTrigger>
                      </TabsList>

                      <TabsContent value="body">
                        <Textarea
                          value={typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}
                          readOnly
                          className="min-h-[300px] font-mono text-sm bg-gray-50 dark:bg-gray-800"
                          data-testid="response-body"
                        />
                      </TabsContent>

                      <TabsContent value="headers">
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {Object.entries(response.headers).map(([key, value]) => (
                            <div key={key} className="flex gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <span className="font-medium text-sm min-w-[120px]">{key}:</span>
                              <span className="text-sm font-mono">{value}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <i className="fas fa-reply text-4xl mb-4"></i>
                    <p className="text-lg mb-2">No response yet</p>
                    <p className="text-sm">Send a request to see the response here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-star text-yellow-500"></i>
              API Testing Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <i className="fas fa-bolt text-2xl text-blue-500 mb-2"></i>
                <h3 className="font-semibold mb-1">All HTTP Methods</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Support for GET, POST, PUT, PATCH, DELETE, and more
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-list text-2xl text-green-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Custom Headers</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add authentication and custom headers
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-code text-2xl text-purple-500 mb-2"></i>
                <h3 className="font-semibold mb-1">JSON Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pretty-formatted JSON request and response bodies
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-stopwatch text-2xl text-red-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Performance Metrics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Response time and size tracking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}