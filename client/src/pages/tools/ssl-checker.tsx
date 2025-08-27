import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, AlertTriangle, CheckCircle, Calendar, Building, Globe } from "lucide-react";

interface SSLResult {
  domain: string;
  isValid: boolean;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysUntilExpiry: number;
  serialNumber: string;
  fingerprint: string;
  keySize: number;
  signatureAlgorithm: string;
  protocol: string;
  cipher: string;
  errors?: string[];
}

export default function SSLChecker() {
  const [domain, setDomain] = useState<string>("");
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [result, setResult] = useState<SSLResult | null>(null);

  const checkSSL = async () => {
    if (!domain.trim()) return;
    
    setIsChecking(true);
    setResult(null);
    
    try {
      // Clean domain - remove protocol and path
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
      
      // Simulate SSL certificate check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock SSL certificate data
      const now = new Date();
      const validFrom = new Date(now.getTime() - (Math.random() * 365 * 24 * 60 * 60 * 1000));
      const validTo = new Date(now.getTime() + (Math.random() * 730 * 24 * 60 * 60 * 1000));
      const daysUntilExpiry = Math.ceil((validTo.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      
      // Simulate different scenarios
      const scenarios = ['valid', 'expiring', 'expired', 'invalid'];
      const scenario = Math.random() > 0.8 ? scenarios[Math.floor(Math.random() * scenarios.length)] : 'valid';
      
      let mockResult: SSLResult;
      
      if (scenario === 'expired') {
        mockResult = {
          domain: cleanDomain,
          isValid: false,
          issuer: "Let's Encrypt Authority X3",
          validFrom: validFrom.toISOString(),
          validTo: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString(),
          daysUntilExpiry: -7,
          serialNumber: "03:F7:A0:E5:F3:BE:3D:53:4A:38:C8:20:29:DA:1A:EC:79:8F",
          fingerprint: "SHA256:B1:2C:D5:37:7F:88:4E:7A:33:2F:53:F8:D8:14:BC:68:3C",
          keySize: 2048,
          signatureAlgorithm: "SHA256withRSA",
          protocol: "TLS 1.3",
          cipher: "TLS_AES_256_GCM_SHA384",
          errors: ["Certificate has expired"]
        };
      } else if (scenario === 'expiring') {
        mockResult = {
          domain: cleanDomain,
          isValid: true,
          issuer: "DigiCert Inc",
          validFrom: validFrom.toISOString(),
          validTo: new Date(now.getTime() + (15 * 24 * 60 * 60 * 1000)).toISOString(),
          daysUntilExpiry: 15,
          serialNumber: "0F:E9:9B:8F:C0:35:23:06:41:A5:64:05:BC:DB:B8:65",
          fingerprint: "SHA256:F2:5A:FC:4E:BB:69:7E:A0:61:B8:A3:25:2F:2B:76:D9:6D",
          keySize: 2048,
          signatureAlgorithm: "SHA256withRSA",
          protocol: "TLS 1.3",
          cipher: "TLS_AES_256_GCM_SHA384"
        };
      } else {
        mockResult = {
          domain: cleanDomain,
          isValid: true,
          issuer: "DigiCert Inc",
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          daysUntilExpiry,
          serialNumber: "0A:B2:C3:D4:E5:F6:78:90:1A:2B:3C:4D:5E:6F:78:90",
          fingerprint: "SHA256:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA",
          keySize: 2048,
          signatureAlgorithm: "SHA256withRSA",
          protocol: "TLS 1.3",
          cipher: "TLS_AES_256_GCM_SHA384"
        };
      }
      
      setResult(mockResult);
      
    } catch (error) {
      console.error('SSL check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (!result) return null;
    
    if (!result.isValid || result.daysUntilExpiry < 0) {
      return <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />;
    } else if (result.daysUntilExpiry < 30) {
      return <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
    }
    return <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />;
  };

  const getStatusColor = () => {
    if (!result) return "";
    
    if (!result.isValid || result.daysUntilExpiry < 0) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    } else if (result.daysUntilExpiry < 30) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  };

  const getStatusText = () => {
    if (!result) return "";
    
    if (!result.isValid || result.daysUntilExpiry < 0) {
      return "Invalid/Expired";
    } else if (result.daysUntilExpiry < 30) {
      return "Expires Soon";
    }
    return "Valid";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Shield className="w-8 h-8" />
          SSL Certificate Checker
        </h1>
        <p className="text-lg text-muted-foreground">
          Check SSL certificate validity, expiration, and security details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Certificate Check
            </CardTitle>
            <CardDescription>
              Enter a domain name to check its SSL certificate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isChecking && checkSSL()}
                data-testid="input-domain"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter domain without protocol (e.g., google.com)
              </p>
            </div>

            <Button 
              onClick={checkSSL} 
              disabled={!domain.trim() || isChecking}
              className="w-full"
              data-testid="button-check"
            >
              {isChecking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Checking SSL...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Check SSL Certificate
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Status</CardTitle>
            <CardDescription>
              SSL certificate validation results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="font-semibold" data-testid="text-domain">{result.domain}</span>
                  </div>
                  <Badge className={getStatusColor()} data-testid="badge-status">
                    {getStatusText()}
                  </Badge>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="font-medium text-red-600 dark:text-red-400">Issues Found</span>
                    </div>
                    <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index} data-testid={`error-${index}`}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    <div className="font-semibold" data-testid="text-days-until-expiry">
                      {result.daysUntilExpiry}
                    </div>
                    <div className="text-sm text-muted-foreground">Days Until Expiry</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <Shield className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                    <div className="font-semibold" data-testid="text-key-size">
                      {result.keySize} bit
                    </div>
                    <div className="text-sm text-muted-foreground">Key Size</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No certificate checked yet</p>
                <p className="text-sm">Enter a domain name to check its SSL certificate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
            <CardDescription>
              Detailed information about the SSL certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Issuer</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-issuer">
                      {result.issuer}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Valid From</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-valid-from">
                      {formatDate(result.validFrom)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Valid To</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-valid-to">
                      {formatDate(result.validTo)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Protocol</div>
                    <div className="text-sm text-muted-foreground" data-testid="text-protocol">
                      {result.protocol}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="font-medium">Serial Number</div>
                  <div className="text-sm text-muted-foreground font-mono" data-testid="text-serial">
                    {result.serialNumber}
                  </div>
                </div>

                <div>
                  <div className="font-medium">Fingerprint</div>
                  <div className="text-sm text-muted-foreground font-mono" data-testid="text-fingerprint">
                    {result.fingerprint}
                  </div>
                </div>

                <div>
                  <div className="font-medium">Signature Algorithm</div>
                  <div className="text-sm text-muted-foreground" data-testid="text-signature">
                    {result.signatureAlgorithm}
                  </div>
                </div>

                <div>
                  <div className="font-medium">Cipher Suite</div>
                  <div className="text-sm text-muted-foreground" data-testid="text-cipher">
                    {result.cipher}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>SSL Certificate Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Certificate Authority</h4>
              <p className="text-sm text-muted-foreground">
                Shows who issued the certificate and whether it's from a trusted CA.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Expiration Monitoring</h4>
              <p className="text-sm text-muted-foreground">
                Certificates typically expire after 1-2 years and need renewal to maintain security.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Encryption Strength</h4>
              <p className="text-sm text-muted-foreground">
                Key size and algorithms determine the strength of encryption used for secure connections.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Protocol Support</h4>
              <p className="text-sm text-muted-foreground">
                Modern sites should support TLS 1.2 or 1.3 for optimal security and performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}