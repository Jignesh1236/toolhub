import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Link, ExternalLink, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: Date;
  customAlias?: string;
}

export default function URLShortener() {
  const { toast } = useToast();
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const generateShortCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const shortenUrl = () => {
    if (!originalUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a URL to shorten",
        variant: "destructive"
      });
      return;
    }

    if (!isValidUrl(originalUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (include http:// or https://)",
        variant: "destructive"
      });
      return;
    }

    // Check if custom alias is already used
    if (customAlias && shortenedUrls.some(url => url.customAlias === customAlias)) {
      toast({
        title: "Alias already exists",
        description: "This custom alias is already in use",
        variant: "destructive"
      });
      return;
    }

    const shortCode = customAlias || generateShortCode();
    const shortUrl = `https://short.ly/${shortCode}`;

    const newShortenedUrl: ShortenedUrl = {
      id: Date.now().toString(),
      originalUrl: originalUrl.trim(),
      shortCode,
      shortUrl,
      clicks: 0,
      createdAt: new Date(),
      customAlias: customAlias || undefined
    };

    setShortenedUrls(prev => [newShortenedUrl, ...prev]);
    setOriginalUrl("");
    setCustomAlias("");

    toast({
      title: "URL shortened!",
      description: "Your shortened URL has been created successfully"
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} copied!`,
      description: `${type} has been copied to clipboard`
    });
  };

  const simulateClick = (id: string) => {
    setShortenedUrls(prev => 
      prev.map(url => 
        url.id === id ? { ...url, clicks: url.clicks + 1 } : url
      )
    );
    
    toast({
      title: "Link clicked!",
      description: "Click count updated (simulation)"
    });
  };

  const deleteUrl = (id: string) => {
    setShortenedUrls(prev => prev.filter(url => url.id !== id));
    toast({
      title: "URL deleted",
      description: "Shortened URL has been removed"
    });
  };

  const getTotalClicks = () => {
    return shortenedUrls.reduce((total, url) => total + url.clicks, 0);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">URL Shortener</h1>
        <p className="text-muted-foreground">
          Create short URLs and track click analytics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* URL Shortener Form */}
        <Card>
          <CardHeader>
            <CardTitle>Shorten URL</CardTitle>
            <CardDescription>
              Enter a long URL to create a shortened version
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="original-url">Original URL</Label>
              <Input
                id="original-url"
                type="url"
                placeholder="https://example.com/very-long-url..."
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && shortenUrl()}
                data-testid="input-original-url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-alias">Custom Alias (Optional)</Label>
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-sm">
                  short.ly/
                </span>
                <Input
                  id="custom-alias"
                  placeholder="my-link"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                  className="rounded-l-none"
                  data-testid="input-custom-alias"
                />
              </div>
            </div>

            <Button onClick={shortenUrl} className="w-full" data-testid="button-shorten-url">
              <Link className="w-4 h-4 mr-2" />
              Shorten URL
            </Button>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold" data-testid="total-urls">{shortenedUrls.length}</div>
                <div className="text-sm text-muted-foreground">URLs Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" data-testid="total-clicks">{getTotalClicks()}</div>
                <div className="text-sm text-muted-foreground">Total Clicks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shortened URLs List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Your Shortened URLs
            </CardTitle>
            <CardDescription>
              Manage and track your shortened URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {shortenedUrls.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No shortened URLs yet</p>
                <p className="text-sm">Create your first shortened URL above</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {shortenedUrls.map((url) => (
                  <div key={url.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Short URL */}
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-primary font-mono" data-testid={`short-url-${url.id}`}>
                            {url.shortUrl}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(url.shortUrl, "Short URL")}
                            data-testid={`copy-short-${url.id}`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => simulateClick(url.id)}
                            data-testid={`visit-${url.id}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Original URL */}
                        <div className="text-sm text-muted-foreground truncate" title={url.originalUrl}>
                          <span className="font-medium">Original:</span> {url.originalUrl}
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            <span data-testid={`clicks-${url.id}`}>{url.clicks} clicks</span>
                          </div>
                          <div>
                            Created: {url.createdAt.toLocaleDateString()}
                          </div>
                          {url.customAlias && (
                            <Badge variant="secondary">Custom</Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteUrl(url.id)}
                        data-testid={`delete-${url.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-4">
              <Link className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Custom Aliases</h3>
              <p className="text-muted-foreground">Create memorable short URLs with custom names</p>
            </div>
            <div className="text-center p-4">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Click Tracking</h3>
              <p className="text-muted-foreground">Monitor how many times your links are clicked</p>
            </div>
            <div className="text-center p-4">
              <Copy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Easy Sharing</h3>
              <p className="text-muted-foreground">Copy and share your shortened URLs instantly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}