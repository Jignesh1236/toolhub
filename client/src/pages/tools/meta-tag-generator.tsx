import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MetaTagGenerator() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [locale, setLocale] = useState("en_US");
  const [type, setType] = useState("website");

  const generateMetaTags = () => {
    const tags = [];

    // Basic Meta Tags
    if (title) {
      tags.push(`<title>${title}</title>`);
      tags.push(`<meta name="title" content="${title}">`);
    }
    
    if (description) {
      tags.push(`<meta name="description" content="${description}">`);
    }
    
    if (keywords) {
      tags.push(`<meta name="keywords" content="${keywords}">`);
    }
    
    if (author) {
      tags.push(`<meta name="author" content="${author}">`);
    }

    // Open Graph Tags
    if (title) {
      tags.push(`<meta property="og:title" content="${title}">`);
    }
    
    if (description) {
      tags.push(`<meta property="og:description" content="${description}">`);
    }
    
    if (url) {
      tags.push(`<meta property="og:url" content="${url}">`);
    }
    
    if (imageUrl) {
      tags.push(`<meta property="og:image" content="${imageUrl}">`);
    }
    
    if (siteName) {
      tags.push(`<meta property="og:site_name" content="${siteName}">`);
    }
    
    tags.push(`<meta property="og:type" content="${type}">`);
    tags.push(`<meta property="og:locale" content="${locale}">`);

    // Twitter Card Tags
    tags.push(`<meta name="twitter:card" content="summary_large_image">`);
    
    if (title) {
      tags.push(`<meta name="twitter:title" content="${title}">`);
    }
    
    if (description) {
      tags.push(`<meta name="twitter:description" content="${description}">`);
    }
    
    if (imageUrl) {
      tags.push(`<meta name="twitter:image" content="${imageUrl}">`);
    }

    // Additional SEO Tags
    tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);
    tags.push(`<meta charset="UTF-8">`);
    tags.push(`<meta name="robots" content="index, follow">`);

    return tags.join('\n');
  };

  const copyMetaTags = () => {
    const metaTags = generateMetaTags();
    navigator.clipboard.writeText(metaTags);
    toast({
      title: "Meta tags copied!",
      description: "Meta tags have been copied to clipboard",
    });
  };

  const metaTags = generateMetaTags();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Meta Tag Generator</h1>
        <p className="text-muted-foreground">
          Generate SEO meta tags for better search engine optimization
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Information</CardTitle>
            <CardDescription>
              Enter your website details to generate meta tags
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                placeholder="e.g., My Awesome Website"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-title"
              />
              <p className="text-xs text-muted-foreground">Recommended: 50-60 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Meta Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your page..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                data-testid="textarea-description"
              />
              <p className="text-xs text-muted-foreground">Recommended: 150-160 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                placeholder="keyword1, keyword2, keyword3"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                data-testid="input-keywords"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Your name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  data-testid="input-author"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  placeholder="Your website name"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  data-testid="input-site-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Page URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                data-testid="input-url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-url">Featured Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                data-testid="input-image-url"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Locale</Label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger data-testid="select-locale">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_US">English (US)</SelectItem>
                    <SelectItem value="en_GB">English (UK)</SelectItem>
                    <SelectItem value="es_ES">Spanish</SelectItem>
                    <SelectItem value="fr_FR">French</SelectItem>
                    <SelectItem value="de_DE">German</SelectItem>
                    <SelectItem value="it_IT">Italian</SelectItem>
                    <SelectItem value="pt_BR">Portuguese</SelectItem>
                    <SelectItem value="zh_CN">Chinese</SelectItem>
                    <SelectItem value="ja_JP">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Globe className="w-5 h-5 inline mr-2" />
              Generated Meta Tags
            </CardTitle>
            <CardDescription>
              Copy these tags to your HTML head section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>HTML Meta Tags</Label>
                <Button onClick={copyMetaTags} size="sm" data-testid="button-copy-meta-tags">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-mono overflow-x-auto" data-testid="meta-tags-output">
                  {metaTags || "Enter website information to generate meta tags"}
                </pre>
              </div>
            </div>

            {title && description && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer" data-testid="preview-title">
                    {title}
                  </div>
                  <div className="text-green-700 text-sm" data-testid="preview-url">
                    {url || "https://example.com"}
                  </div>
                  <div className="text-gray-600 text-sm mt-1" data-testid="preview-description">
                    {description}
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Place these tags inside the &lt;head&gt; section of your HTML</p>
              <p>• Test your meta tags using Google's Rich Results Test</p>
              <p>• Update meta tags regularly for better SEO performance</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}