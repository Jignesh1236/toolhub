import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Upload, Code, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function XMLFormatter() {
  const { toast } = useToast();
  const [xmlInput, setXmlInput] = useState("");
  const [formattedXml, setFormattedXml] = useState("");
  const [indentSize, setIndentSize] = useState("2");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string>("");

  const formatXML = (xml: string, indent: number = 2): string => {
    let formatted = '';
    let pad = 0;
    
    xml.split(/>\s*</).forEach((node, index) => {
      let indent_level = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent_level = 0;
      } else if (node.match(/^<\/\w/) && pad > 0) {
        pad -= 1;
      } else if (node.match(/^<\w[^>]*[^\/]$/)) {
        indent_level = 1;
      } else {
        indent_level = 0;
      }

      formatted += ' '.repeat(pad * indent) + '<' + node + '>\n';
      pad += indent_level;
    });

    return formatted.substring(1, formatted.length - 2);
  };

  const validateXML = (xml: string): { valid: boolean; error?: string } => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        return {
          valid: false,
          error: parseError.textContent || 'XML parsing error'
        };
      }
      
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const handleFormat = () => {
    if (!xmlInput.trim()) {
      toast({
        title: "No XML content",
        description: "Please enter XML content to format",
        variant: "destructive"
      });
      return;
    }

    try {
      // First validate the XML
      const validation = validateXML(xmlInput);
      setIsValid(validation.valid);
      setValidationError(validation.error || "");

      if (!validation.valid) {
        setFormattedXml("");
        toast({
          title: "Invalid XML",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }

      // Format the XML
      const formatted = formatXML(xmlInput, parseInt(indentSize));
      setFormattedXml(formatted);
      
      toast({
        title: "XML formatted successfully",
        description: "Your XML has been formatted and validated"
      });
    } catch (error) {
      setIsValid(false);
      setValidationError(error instanceof Error ? error.message : "Formatting error");
      toast({
        title: "Formatting failed",
        description: "There was an error formatting your XML",
        variant: "destructive"
      });
    }
  };

  const minifyXML = () => {
    if (!xmlInput.trim()) return;

    try {
      const validation = validateXML(xmlInput);
      if (!validation.valid) {
        toast({
          title: "Invalid XML",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }

      // Remove extra whitespace and newlines
      const minified = xmlInput
        .replace(/>\s+</g, '><')
        .replace(/^\s+|\s+$/g, '')
        .replace(/\s+/g, ' ');
      
      setFormattedXml(minified);
      setIsValid(true);
      setValidationError("");
      
      toast({
        title: "XML minified",
        description: "Whitespace has been removed from your XML"
      });
    } catch (error) {
      toast({
        title: "Minification failed",
        description: "There was an error minifying your XML",
        variant: "destructive"
      });
    }
  };

  const copyFormatted = () => {
    if (!formattedXml) return;
    
    navigator.clipboard.writeText(formattedXml);
    toast({
      title: "Copied to clipboard",
      description: "Formatted XML has been copied"
    });
  };

  const downloadFormatted = () => {
    if (!formattedXml) return;
    
    const blob = new Blob([formattedXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.xml';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Formatted XML file has been downloaded"
    });
  };

  const loadSampleXML = () => {
    const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
<book id="1">
<title>The Great Gatsby</title>
<author>F. Scott Fitzgerald</author>
<genre>Fiction</genre>
<price currency="USD">12.99</price>
<publishDate>1925-04-10</publishDate>
<description>A classic American novel set in the Jazz Age.</description>
</book>
<book id="2">
<title>To Kill a Mockingbird</title>
<author>Harper Lee</author>
<genre>Fiction</genre>
<price currency="USD">14.99</price>
<publishDate>1960-07-11</publishDate>
<description>A gripping tale of racial injustice and childhood innocence.</description>
</book>
</bookstore>`;
    setXmlInput(sampleXML);
  };

  const clearAll = () => {
    setXmlInput("");
    setFormattedXml("");
    setIsValid(null);
    setValidationError("");
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">XML Formatter</h1>
        <p className="text-muted-foreground">
          Format, validate, and beautify XML documents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>XML Input</CardTitle>
            <CardDescription>
              Paste your XML content here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="xml-input">XML Content</Label>
              <Textarea
                id="xml-input"
                placeholder="Paste your XML here..."
                value={xmlInput}
                onChange={(e) => setXmlInput(e.target.value)}
                rows={16}
                className="font-mono text-sm"
                data-testid="textarea-xml-input"
              />
            </div>

            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2">
                <Label htmlFor="indent-size">Indent:</Label>
                <Select value={indentSize} onValueChange={setIndentSize}>
                  <SelectTrigger className="w-20" data-testid="select-indent-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">spaces</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleFormat} data-testid="button-format">
                <Code className="w-4 h-4 mr-2" />
                Format
              </Button>
              <Button onClick={minifyXML} variant="outline" data-testid="button-minify">
                Minify
              </Button>
              <Button onClick={loadSampleXML} variant="outline" data-testid="button-load-sample">
                <Upload className="w-4 h-4 mr-2" />
                Sample
              </Button>
              <Button onClick={clearAll} variant="outline" data-testid="button-clear">
                Clear
              </Button>
            </div>

            {/* Validation Status */}
            {isValid !== null && (
              <div className={`p-3 rounded-lg border ${
                isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-medium ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                    {isValid ? 'Valid XML' : 'Invalid XML'}
                  </span>
                </div>
                {!isValid && validationError && (
                  <p className="text-sm text-red-600 mt-1" data-testid="validation-error">
                    {validationError}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formatted Output</CardTitle>
            <CardDescription>
              Formatted and validated XML
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Formatted XML</Label>
                <div className="flex gap-2">
                  {formattedXml && (
                    <>
                      <Button
                        onClick={copyFormatted}
                        size="sm"
                        variant="outline"
                        data-testid="button-copy-formatted"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        onClick={downloadFormatted}
                        size="sm"
                        variant="outline"
                        data-testid="button-download-formatted"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <Textarea
                value={formattedXml}
                readOnly
                rows={16}
                className="font-mono text-sm"
                placeholder="Formatted XML will appear here..."
                data-testid="textarea-formatted-output"
              />
            </div>

            {formattedXml && (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-semibold" data-testid="input-size">
                    {xmlInput.length.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Input Size</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-semibold" data-testid="output-size">
                    {formattedXml.length.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Output Size</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* XML Guide */}
      <Card>
        <CardHeader>
          <CardTitle>XML Formatting Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-4">
              <Code className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Format & Beautify</h3>
              <p className="text-muted-foreground">Properly indent and structure your XML</p>
            </div>
            <div className="text-center p-4">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Validate Syntax</h3>
              <p className="text-muted-foreground">Check for XML syntax errors and validity</p>
            </div>
            <div className="text-center p-4">
              <Copy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium">Minify & Compress</h3>
              <p className="text-muted-foreground">Remove whitespace to reduce file size</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}