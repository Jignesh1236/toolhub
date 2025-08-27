import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function PingTest() {
  const [host, setHost] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<{
    host: string;
    status: 'success' | 'failed' | 'timeout';
    responseTime: number;
    timestamp: string;
  }[]>([]);

  const performPing = async () => {
    if (!host.trim()) return;
    
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      // Using a CORS-enabled HTTP request as a ping alternative
      // In a real app, you'd use a backend service for actual ping
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`https://${host.replace(/^https?:\/\//, '')}`, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      const newResult = {
        host,
        status: 'success' as const,
        responseTime,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setResults(prev => [newResult, ...prev.slice(0, 9)]);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const status = responseTime >= 5000 ? 'timeout' : 'failed';
      
      const newResult = {
        host,
        status: status as 'failed' | 'timeout',
        responseTime,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setResults(prev => [newResult, ...prev.slice(0, 9)]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'timeout':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4" />;
      case 'timeout':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const averageResponseTime = results.length > 0 
    ? results.reduce((sum, result) => sum + result.responseTime, 0) / results.length
    : 0;

  const successRate = results.length > 0
    ? (results.filter(r => r.status === 'success').length / results.length) * 100
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Wifi className="w-8 h-8" />
          Ping Test
        </h1>
        <p className="text-lg text-muted-foreground">
          Test network connectivity and response times to any host
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Ping Configuration
            </CardTitle>
            <CardDescription>
              Enter a hostname or IP address to test connectivity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="host">Host or IP Address</Label>
              <Input
                id="host"
                type="text"
                placeholder="google.com"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && performPing()}
                data-testid="input-host"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Examples: google.com, 8.8.8.8, github.com
              </p>
            </div>

            <Button 
              onClick={performPing} 
              disabled={!host.trim() || isLoading}
              className="w-full"
              data-testid="button-ping"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                "Start Ping Test"
              )}
            </Button>

            {results.length > 0 && (
              <Button 
                onClick={clearResults} 
                variant="outline"
                className="w-full"
                data-testid="button-clear"
              >
                Clear Results
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Statistics</CardTitle>
            <CardDescription>
              Overview of your ping test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-avg-response">
                      {averageResponseTime.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-success-rate">
                      {successRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Tests:</span>
                    <span className="font-semibold" data-testid="text-total-tests">{results.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Successful:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {results.filter(r => r.status === 'success').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Failed:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {results.filter(r => r.status === 'failed').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Timeouts:</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                      {results.filter(r => r.status === 'timeout').length}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Wifi className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No ping tests performed yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {results.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Test Results</CardTitle>
            <CardDescription>
              Latest ping test results (showing last 10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  data-testid={`result-${index}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.host}</div>
                      <div className="text-sm text-muted-foreground">{result.timestamp}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono">
                      {result.responseTime}ms
                    </span>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status === 'success' ? 'Success' :
                       result.status === 'timeout' ? 'Timeout' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Ping Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Network Connectivity</h4>
              <p className="text-sm text-muted-foreground">
                Ping tests help diagnose network connectivity issues and measure latency to remote hosts.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Browser Limitations</h4>
              <p className="text-sm text-muted-foreground">
                This tool uses HTTP requests instead of ICMP ping due to browser security restrictions.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Response Time</h4>
              <p className="text-sm text-muted-foreground">
                Lower response times indicate better connectivity. Times above 100ms may indicate network issues.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Troubleshooting</h4>
              <p className="text-sm text-muted-foreground">
                Consistent failures may indicate DNS issues, firewall blocking, or host unavailability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}