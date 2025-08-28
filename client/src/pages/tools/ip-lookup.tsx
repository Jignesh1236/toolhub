import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface IPInfo {
  ip: string;
  type: 'IPv4' | 'IPv6';
  country: string;
  countryCode: string;
  region: string;
  city: string;
  timezone: string;
  isp: string;
  organization: string;
  asn: string;
  latitude: number;
  longitude: number;
  isProxy: boolean;
  isVPN: boolean;
  isTor: boolean;
}

export default function IPLookup() {
  const [ipAddress, setIpAddress] = useState("");
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userIP, setUserIP] = useState("");
  const { toast } = useToast();

  const validateIP = (ip: string): boolean => {
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // IPv6 validation (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const getIPType = (ip: string): 'IPv4' | 'IPv6' => {
    return ip.includes(':') ? 'IPv6' : 'IPv4';
  };

  const mockIPLookup = async (ip: string): Promise<IPInfo> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data for demonstration
    const mockData: Partial<IPInfo> = {
      ip: ip,
      type: getIPType(ip),
    };

    // Generate realistic mock data based on IP
    if (ip.startsWith('8.8.')) {
      // Google DNS
      return {
        ...mockData,
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        city: 'Mountain View',
        timezone: 'America/Los_Angeles',
        isp: 'Google LLC',
        organization: 'Google Public DNS',
        asn: 'AS15169',
        latitude: 37.4056,
        longitude: -122.0775,
        isProxy: false,
        isVPN: false,
        isTor: false,
      } as IPInfo;
    } else if (ip.startsWith('1.1.')) {
      // Cloudflare DNS
      return {
        ...mockData,
        country: 'Australia',
        countryCode: 'AU',
        region: 'Queensland',
        city: 'Brisbane',
        timezone: 'Australia/Brisbane',
        isp: 'Cloudflare Inc',
        organization: 'Cloudflare Public DNS',
        asn: 'AS13335',
        latitude: -27.4679,
        longitude: 153.0278,
        isProxy: false,
        isVPN: false,
        isTor: false,
      } as IPInfo;
    } else {
      // Generic mock data
      return {
        ...mockData,
        country: 'United Kingdom',
        countryCode: 'GB',
        region: 'England',
        city: 'London',
        timezone: 'Europe/London',
        isp: 'British Telecom',
        organization: 'BT Group',
        asn: 'AS2856',
        latitude: 51.5074,
        longitude: -0.1278,
        isProxy: false,
        isVPN: Math.random() > 0.7,
        isTor: false,
      } as IPInfo;
    }
  };

  const lookupIP = async (ip: string = ipAddress) => {
    if (!ip.trim()) {
      toast({
        title: "Error",
        description: "Please enter an IP address.",
        variant: "destructive",
      });
      return;
    }

    if (!validateIP(ip.trim())) {
      toast({
        title: "Invalid IP Address",
        description: "Please enter a valid IPv4 or IPv6 address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await mockIPLookup(ip.trim());
      setIpInfo(result);
      
      toast({
        title: "Lookup Complete",
        description: `Found information for ${ip}`,
      });
    } catch (error) {
      toast({
        title: "Lookup Failed",
        description: "Failed to retrieve IP information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMyIP = async () => {
    setIsLoading(true);
    
    try {
      // In a real application, you would call a service to get the user's IP
      // For demo purposes, we'll use a mock IP
      const mockUserIP = "203.0.113.1"; // RFC 5737 test IP
      setUserIP(mockUserIP);
      setIpAddress(mockUserIP);
      
      await lookupIP(mockUserIP);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to detect your IP address.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setIpAddress("");
    setIpInfo(null);
    setUserIP("");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Information copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const loadSamples = [
    { name: "Google DNS", ip: "8.8.8.8" },
    { name: "Cloudflare DNS", ip: "1.1.1.1" },
    { name: "OpenDNS", ip: "208.67.222.222" },
    { name: "Quad9 DNS", ip: "9.9.9.9" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">IP Address Lookup</h1>
          <p className="text-gray-600 dark:text-gray-400">Get detailed information about any IP address</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-search text-blue-500"></i>
                  IP Address Lookup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ipAddress">IP Address</Label>
                  <Input
                    id="ipAddress"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="Enter IP address (e.g., 8.8.8.8)"
                    data-testid="ip-input"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supports both IPv4 and IPv6 addresses
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => lookupIP()}
                    disabled={isLoading}
                    className="flex-1"
                    data-testid="lookup-button"
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Looking up...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search mr-2"></i>
                        Lookup IP
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={getMyIP}
                    disabled={isLoading}
                    data-testid="get-my-ip"
                  >
                    <i className="fas fa-user mr-2"></i>
                    My IP
                  </Button>
                </div>

                <Button 
                  variant="outline"
                  onClick={clearResults}
                  className="w-full"
                  data-testid="clear-results"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Clear Results
                </Button>
              </CardContent>
            </Card>

            {/* Sample IPs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-list text-green-500"></i>
                  Sample IPs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {loadSamples.map((sample) => (
                    <Button
                      key={sample.ip}
                      variant="outline"
                      onClick={() => {
                        setIpAddress(sample.ip);
                        lookupIP(sample.ip);
                      }}
                      className="justify-start"
                      data-testid={`sample-${sample.ip}`}
                    >
                      <span className="font-medium">{sample.name}:</span>
                      <span className="ml-2 font-mono text-sm">{sample.ip}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-info-circle text-purple-500"></i>
                  IP Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ipInfo ? (
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">IP Address</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(ipInfo.ip)}
                            data-testid="copy-ip"
                          >
                            <i className="fas fa-copy text-xs"></i>
                          </Button>
                        </div>
                        <p className="font-mono text-lg">{ipInfo.ip}</p>
                        <Badge variant="secondary">{ipInfo.type}</Badge>
                      </div>
                      
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-sm font-medium">Location</span>
                        <p className="font-semibold">{ipInfo.city}, {ipInfo.region}</p>
                        <p className="text-sm text-gray-600">{ipInfo.country} ({ipInfo.countryCode})</p>
                      </div>
                    </div>

                    {/* Network Info */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Network Information</h3>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-medium">ISP:</span>
                          <span>{ipInfo.isp}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-medium">Organization:</span>
                          <span>{ipInfo.organization}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-medium">ASN:</span>
                          <span className="font-mono">{ipInfo.asn}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="font-medium">Timezone:</span>
                          <span>{ipInfo.timezone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Geographic Coordinates */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Geographic Coordinates</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="text-sm font-medium">Latitude:</span>
                          <p className="font-mono">{ipInfo.latitude.toFixed(4)}°</p>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="text-sm font-medium">Longitude:</span>
                          <p className="font-mono">{ipInfo.longitude.toFixed(4)}°</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(`${ipInfo.latitude}, ${ipInfo.longitude}`)}
                        className="w-full"
                        data-testid="copy-coordinates"
                      >
                        <i className="fas fa-copy mr-2"></i>
                        Copy Coordinates
                      </Button>
                    </div>

                    {/* Security Info */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Security Information</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={ipInfo.isProxy ? "destructive" : "default"}>
                          <i className={`fas ${ipInfo.isProxy ? 'fa-shield-alt' : 'fa-check'} mr-1`}></i>
                          {ipInfo.isProxy ? 'Proxy Detected' : 'No Proxy'}
                        </Badge>
                        <Badge variant={ipInfo.isVPN ? "destructive" : "default"}>
                          <i className={`fas ${ipInfo.isVPN ? 'fa-user-secret' : 'fa-check'} mr-1`}></i>
                          {ipInfo.isVPN ? 'VPN Detected' : 'No VPN'}
                        </Badge>
                        <Badge variant={ipInfo.isTor ? "destructive" : "default"}>
                          <i className={`fas ${ipInfo.isTor ? 'fa-eye-slash' : 'fa-check'} mr-1`}></i>
                          {ipInfo.isTor ? 'Tor Exit Node' : 'No Tor'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <i className="fas fa-search text-4xl mb-4"></i>
                    <p className="text-lg mb-2">No IP information yet</p>
                    <p className="text-sm">Enter an IP address and click "Lookup IP" to begin</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500"></i>
                  Lookup Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-globe text-blue-500"></i>
                    <span>Geographic location detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-network-wired text-green-500"></i>
                    <span>ISP and organization identification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-shield-alt text-red-500"></i>
                    <span>Security threat detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-map-marker-alt text-purple-500"></i>
                    <span>Precise coordinates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-clock text-orange-500"></i>
                    <span>Timezone information</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}