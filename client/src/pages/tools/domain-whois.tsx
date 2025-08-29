import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Calendar, User, Building, AlertCircle } from "lucide-react";

export default function DomainWhois() {
  const [domain, setDomain] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    domain: string;
    registrar: string;
    registrationDate: string;
    expirationDate: string;
    status: string;
    nameservers: string[];
    registrant: {
      name: string;
      organization: string;
      country: string;
    };
    isAvailable: boolean;
  } | null>(null);

  const performWhoisLookup = async () => {
    if (!domain.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call - in a real app, you'd use a WHOIS API service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data for demonstration
      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const isAvailable = Math.random() > 0.7; // 30% chance domain is available
      
      if (isAvailable) {
        setResult({
          domain: cleanDomain,
          registrar: "",
          registrationDate: "",
          expirationDate: "",
          status: "Available",
          nameservers: [],
          registrant: {
            name: "",
            organization: "",
            country: ""
          },
          isAvailable: true
        });
      } else {
        setResult({
          domain: cleanDomain,
          registrar: "Example Registrar Inc.",
          registrationDate: "2020-03-15",
          expirationDate: "2025-03-15",
          status: "clientTransferProhibited",
          nameservers: [
            "ns1.example.com",
            "ns2.example.com",
            "ns3.example.com"
          ],
          registrant: {
            name: "Privacy Protection Service",
            organization: "Domains By Proxy LLC",
            country: "United States"
          },
          isAvailable: false
        });
      }
    } catch (error) {
      // Handle error - could set an error state
      console.error('WHOIS lookup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    if (status === "Available") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (status.includes("Transfer")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Globe className="w-8 h-8" />
          Domain WHOIS Lookup
        </h1>
        <p className="text-lg text-muted-foreground">
          Get detailed information about domain registration and ownership
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Domain Lookup
            </CardTitle>
            <CardDescription>
              Enter a domain name to check its registration information
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
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && performWhoisLookup()}
                data-testid="input-domain"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter domain without protocol (e.g., google.com)
              </p>
            </div>

            <Button 
              onClick={performWhoisLookup} 
              disabled={!domain.trim() || isLoading}
              className="w-full"
              data-testid="button-lookup"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Looking up...
                </>
              ) : (
                "Lookup Domain"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WHOIS Information</CardTitle>
            <CardDescription>
              Domain registration details and ownership information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg" data-testid="text-domain-name">{result.domain}</h3>
                  <Badge className={getStatusColor(result.status)} data-testid="badge-status">
                    {result.isAvailable ? "Available" : "Registered"}
                  </Badge>
                </div>

                {!result.isAvailable ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Registrar</div>
                          <div className="text-sm text-muted-foreground" data-testid="text-registrar">
                            {result.registrar}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Registration Date</div>
                          <div className="text-sm text-muted-foreground" data-testid="text-registration-date">
                            {formatDate(result.registrationDate)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Expiration Date</div>
                          <div className="text-sm text-muted-foreground" data-testid="text-expiration-date">
                            {formatDate(result.expirationDate)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Registrant</div>
                          <div className="text-sm text-muted-foreground">
                            <div data-testid="text-registrant-name">{result.registrant.name}</div>
                            <div data-testid="text-registrant-org">{result.registrant.organization}</div>
                            <div data-testid="text-registrant-country">{result.registrant.country}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {result.nameservers.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-2">Name Servers</h4>
                        <div className="space-y-1">
                          {result.nameservers.map((ns, index) => (
                            <div key={index} className="text-sm bg-muted/50 p-2 rounded" data-testid={`nameserver-${index}`}>
                              {ns}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-green-600 dark:text-green-400 mb-2">
                      <AlertCircle className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">Domain Available!</h3>
                    <p className="text-sm text-muted-foreground">
                      This domain appears to be available for registration.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter a domain name to view WHOIS information</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Understanding WHOIS Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Domain Status Codes</h4>
              <p className="text-sm text-muted-foreground">
                Status codes indicate restrictions on domain operations like transfers or updates.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Privacy Protection</h4>
              <p className="text-sm text-muted-foreground">
                Many domains use privacy services to hide personal information from public WHOIS records.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Name Servers</h4>
              <p className="text-sm text-muted-foreground">
                These servers control where the domain points and handle DNS resolution.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Expiration Monitoring</h4>
              <p className="text-sm text-muted-foreground">
                Keep track of expiration dates to avoid losing domain ownership.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}