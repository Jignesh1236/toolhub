import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Network, Search, Shield, ShieldCheck, ShieldX } from "lucide-react";

interface PortScanResult {
  port: number;
  status: 'open' | 'closed' | 'filtered';
  service?: string;
}

export default function PortScanner() {
  const [host, setHost] = useState<string>("");
  const [portRange, setPortRange] = useState<string>("1-1000");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<PortScanResult[]>([]);
  const [scanTime, setScanTime] = useState<number>(0);

  const commonPorts = {
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    993: "IMAPS",
    995: "POP3S",
    1433: "MSSQL",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    5900: "VNC",
    8080: "HTTP-Alt"
  };

  const parsePortRange = (range: string): number[] => {
    const ports: number[] = [];
    const parts = range.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(p => parseInt(p.trim()));
        if (start && end && start <= end) {
          for (let i = start; i <= end; i++) {
            ports.push(i);
          }
        }
      } else {
        const port = parseInt(trimmed);
        if (port) {
          ports.push(port);
        }
      }
    }
    
    return Array.from(new Set(ports)).sort((a, b) => a - b);
  };

  const scanPort = async (host: string, port: number): Promise<PortScanResult> => {
    // Simulate port scanning since we can't actually scan ports from browser
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    
    // Simulate realistic results - common ports more likely to be open
    const isCommonPort = port in commonPorts;
    const randomFactor = Math.random();
    
    let status: 'open' | 'closed' | 'filtered';
    if (isCommonPort && randomFactor > 0.7) {
      status = 'open';
    } else if (randomFactor > 0.9) {
      status = 'filtered';
    } else {
      status = 'closed';
    }

    return {
      port,
      status,
      service: status === 'open' ? commonPorts[port as keyof typeof commonPorts] : undefined
    };
  };

  const startScan = async () => {
    if (!host.trim() || !portRange.trim()) return;
    
    setIsScanning(true);
    setProgress(0);
    setResults([]);
    setScanTime(0);
    
    const startTime = Date.now();
    const ports = parsePortRange(portRange);
    const scanResults: PortScanResult[] = [];
    
    try {
      for (let i = 0; i < ports.length; i++) {
        const result = await scanPort(host, ports[i]);
        scanResults.push(result);
        setProgress(((i + 1) / ports.length) * 100);
        
        // Update results periodically
        if (i % 10 === 0 || i === ports.length - 1) {
          setResults([...scanResults]);
        }
      }
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
      setScanTime(Date.now() - startTime);
      setProgress(0);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'filtered':
        return <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <ShieldX className="w-4 h-4 text-red-600 dark:text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'filtered':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    }
  };

  const openPorts = results.filter(r => r.status === 'open');
  const closedPorts = results.filter(r => r.status === 'closed');
  const filteredPorts = results.filter(r => r.status === 'filtered');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Network className="w-8 h-8" />
          Port Scanner
        </h1>
        <p className="text-lg text-muted-foreground">
          Scan network hosts for open ports and running services
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Scan Configuration
            </CardTitle>
            <CardDescription>
              Configure the target host and port range to scan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="host">Target Host</Label>
              <Input
                id="host"
                type="text"
                placeholder="example.com or 192.168.1.1"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                data-testid="input-host"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter hostname or IP address to scan
              </p>
            </div>

            <div>
              <Label htmlFor="ports">Port Range</Label>
              <Input
                id="ports"
                type="text"
                placeholder="1-1000, 8080, 9000-9100"
                value={portRange}
                onChange={(e) => setPortRange(e.target.value)}
                data-testid="input-ports"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter ports (e.g., "80,443" or "1-1000")
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPortRange("1-1000")}
                className="flex-1"
                data-testid="button-common-range"
              >
                Common Ports
              </Button>
              <Button
                variant="outline"
                onClick={() => setPortRange("80,443,22,21,25,53,110,143,993,995")}
                className="flex-1"
                data-testid="button-well-known"
              >
                Well-Known
              </Button>
            </div>

            <Button 
              onClick={startScan} 
              disabled={!host.trim() || !portRange.trim() || isScanning}
              className="w-full"
              data-testid="button-scan"
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Scanning... {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Start Port Scan
                </>
              )}
            </Button>

            {isScanning && progress > 0 && (
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Scanning port {Math.round((progress / 100) * parsePortRange(portRange).length)} of {parsePortRange(portRange).length}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scan Results</CardTitle>
            <CardDescription>
              Overview of the port scan results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400" data-testid="count-open">
                      {openPorts.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Open</div>
                  </div>
                  
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400" data-testid="count-filtered">
                      {filteredPorts.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Filtered</div>
                  </div>

                  <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="text-xl font-bold text-red-600 dark:text-red-400" data-testid="count-closed">
                      {closedPorts.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Closed</div>
                  </div>
                </div>

                {scanTime > 0 && (
                  <div className="text-sm text-muted-foreground text-center">
                    Scan completed in {(scanTime / 1000).toFixed(1)} seconds
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No scan results yet</p>
                <p className="text-sm">Configure scan settings and click "Start Port Scan"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {openPorts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              Open Ports
            </CardTitle>
            <CardDescription>
              Ports that are open and potentially running services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {openPorts.map((result, index) => (
                <div
                  key={result.port}
                  className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg"
                  data-testid={`open-port-${index}`}
                >
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-semibold">Port {result.port}</div>
                    {result.service && (
                      <div className="text-sm text-muted-foreground">{result.service}</div>
                    )}
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Understanding Port Scan Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Open Ports
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ports that are accepting connections and running services. These may indicate available services.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  Filtered Ports
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ports that are blocked by a firewall or security device. The scanner cannot determine if they're open or closed.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ShieldX className="w-4 h-4 text-red-600 dark:text-red-400" />
                  Closed Ports
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ports that are not accepting connections. No service is running on these ports.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Important Notes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Port scanning should only be performed on systems you own</li>
                  <li>• Results are simulated for demonstration purposes</li>
                  <li>• Actual port scanning requires server-side implementation</li>
                  <li>• Unauthorized scanning may violate network policies</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}