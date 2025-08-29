import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertTriangle, FileText, Upload } from "lucide-react";

interface ValidationError {
  line: number;
  column: number;
  message: string;
  type: 'error' | 'warning';
  rule: string;
}

export default function HTMLValidator() {
  const [htmlCode, setHtmlCode] = useState("");
  const [validationResults, setValidationResults] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validating, setValidating] = useState(false);

  const validateHTML = () => {
    setValidating(true);
    setTimeout(() => {
      const errors: ValidationError[] = [];
      
      // Basic HTML validation rules
      const lines = htmlCode.split('\n');
      
      lines.forEach((line, lineIndex) => {
        const lineNumber = lineIndex + 1;
        
        // Check for unclosed tags
        const openTags = line.match(/<[^/>][^>]*[^/]>/g) || [];
        const closeTags = line.match(/<\/[^>]+>/g) || [];
        
        // Check for missing DOCTYPE
        if (lineNumber === 1 && !line.toLowerCase().includes('<!doctype')) {
          errors.push({
            line: lineNumber,
            column: 1,
            message: 'Missing DOCTYPE declaration',
            type: 'warning',
            rule: 'doctype'
          });
        }
        
        // Check for missing alt attributes in img tags
        const imgTags = line.match(/<img[^>]*>/g) || [];
        imgTags.forEach((img) => {
          if (!img.includes('alt=')) {
            const column = line.indexOf(img) + 1;
            errors.push({
              line: lineNumber,
              column,
              message: 'Missing alt attribute in img tag',
              type: 'error',
              rule: 'img-alt'
            });
          }
        });
        
        // Check for inline styles (should use CSS)
        if (line.includes('style=')) {
          const column = line.indexOf('style=') + 1;
          errors.push({
            line: lineNumber,
            column,
            message: 'Inline styles should be avoided. Use external CSS instead.',
            type: 'warning',
            rule: 'inline-styles'
          });
        }
        
        // Check for deprecated attributes
        const deprecatedAttributes = ['bgcolor', 'width', 'height', 'align', 'valign'];
        deprecatedAttributes.forEach(attr => {
          if (line.includes(`${attr}=`)) {
            const column = line.indexOf(`${attr}=`) + 1;
            errors.push({
              line: lineNumber,
              column,
              message: `Deprecated attribute "${attr}" should be replaced with CSS`,
              type: 'warning',
              rule: 'deprecated-attributes'
            });
          }
        });
        
        // Check for missing lang attribute in html tag
        if (line.toLowerCase().includes('<html') && !line.includes('lang=')) {
          errors.push({
            line: lineNumber,
            column: line.indexOf('<html') + 1,
            message: 'Missing lang attribute in html tag',
            type: 'warning',
            rule: 'html-lang'
          });
        }
        
        // Check for empty href attributes
        if (line.includes('href=""') || line.includes("href=''")) {
          const column = line.indexOf('href=') + 1;
          errors.push({
            line: lineNumber,
            column,
            message: 'Empty href attribute',
            type: 'error',
            rule: 'empty-href'
          });
        }
        
        // Check for missing title in head
        if (lineNumber === lines.length && !htmlCode.toLowerCase().includes('<title>')) {
          errors.push({
            line: 1,
            column: 1,
            message: 'Missing title element in head section',
            type: 'error',
            rule: 'missing-title'
          });
        }
      });
      
      // Check for unclosed tags
      const tagStack: string[] = [];
      const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
      let match;
      
      while ((match = tagRegex.exec(htmlCode)) !== null) {
        const fullTag = match[0];
        const tagName = match[1].toLowerCase();
        
        // Skip self-closing tags
        const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
        if (selfClosingTags.includes(tagName) || fullTag.endsWith('/>')) {
          continue;
        }
        
        if (fullTag.startsWith('</')) {
          // Closing tag
          if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tagName) {
            const lineNumber = htmlCode.substring(0, match.index).split('\n').length;
            errors.push({
              line: lineNumber,
              column: match.index - htmlCode.lastIndexOf('\n', match.index),
              message: `Unexpected closing tag "${tagName}"`,
              type: 'error',
              rule: 'unclosed-tags'
            });
          } else {
            tagStack.pop();
          }
        } else {
          // Opening tag
          tagStack.push(tagName);
        }
      }
      
      // Check for unclosed tags at the end
      tagStack.forEach(tagName => {
        errors.push({
          line: lines.length,
          column: 1,
          message: `Unclosed tag "${tagName}"`,
          type: 'error',
          rule: 'unclosed-tags'
        });
      });
      
      setValidationResults(errors);
      setIsValid(errors.filter(e => e.type === 'error').length === 0);
      setValidating(false);
    }, 500);
  };

  const getValidationSummary = () => {
    const errors = validationResults.filter(r => r.type === 'error').length;
    const warnings = validationResults.filter(r => r.type === 'warning').length;
    return { errors, warnings };
  };

  const loadSampleHTML = () => {
    const sampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample HTML Page</title>
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is a sample HTML document for validation.</p>
            <img src="sample.jpg" alt="Sample image description">
        </section>
        
        <section id="about">
            <h2>About Section</h2>
            <p>Learn more about our services and mission.</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 Sample Website. All rights reserved.</p>
    </footer>
</body>
</html>`;
    setHtmlCode(sampleHTML);
  };

  const summary = getValidationSummary();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">HTML Validator</h1>
        <p className="text-muted-foreground">
          Validate HTML markup and find syntax errors and best practice violations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>HTML Input</CardTitle>
            <CardDescription>
              Paste your HTML code here for validation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="html-code">HTML Code</Label>
              <Textarea
                id="html-code"
                placeholder="Paste your HTML code here..."
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                rows={20}
                className="font-mono text-sm"
                data-testid="textarea-html-code"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={validateHTML} disabled={!htmlCode.trim() || validating} data-testid="button-validate">
                <FileText className="w-4 h-4 mr-2" />
                {validating ? "Validating..." : "Validate HTML"}
              </Button>
              <Button onClick={loadSampleHTML} variant="outline" data-testid="button-load-sample">
                Load Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {isValid === null ? (
                "Validation Results"
              ) : isValid ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Valid HTML
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Invalid HTML
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Errors and warnings found in your HTML code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isValid === null ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Enter HTML code and click "Validate HTML" to see results</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-2xl font-bold text-red-600" data-testid="error-count">
                      {summary.errors}
                    </div>
                    <div className="text-sm text-red-700">Errors</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600" data-testid="warning-count">
                      {summary.warnings}
                    </div>
                    <div className="text-sm text-yellow-700">Warnings</div>
                  </div>
                </div>

                {/* Results List */}
                <Tabs defaultValue="all" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All ({validationResults.length})</TabsTrigger>
                    <TabsTrigger value="errors">Errors ({summary.errors})</TabsTrigger>
                    <TabsTrigger value="warnings">Warnings ({summary.warnings})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-2 max-h-96 overflow-y-auto">
                    {validationResults.length === 0 ? (
                      <div className="text-center py-8 text-green-600">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                        <p>No issues found! Your HTML is valid.</p>
                      </div>
                    ) : (
                      validationResults.map((result, index) => (
                        <ValidationItem key={index} result={result} />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="errors" className="space-y-2 max-h-96 overflow-y-auto">
                    {validationResults.filter(r => r.type === 'error').map((result, index) => (
                      <ValidationItem key={index} result={result} />
                    ))}
                  </TabsContent>

                  <TabsContent value="warnings" className="space-y-2 max-h-96 overflow-y-auto">
                    {validationResults.filter(r => r.type === 'warning').map((result, index) => (
                      <ValidationItem key={index} result={result} />
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>HTML Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Essential Elements</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Always include DOCTYPE declaration</li>
                <li>• Add lang attribute to html element</li>
                <li>• Include title element in head</li>
                <li>• Use meta charset declaration</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Accessibility</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Add alt attributes to all images</li>
                <li>• Use semantic HTML elements</li>
                <li>• Ensure proper heading hierarchy</li>
                <li>• Include form labels</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Modern Standards</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Avoid inline styles and scripts</li>
                <li>• Don't use deprecated attributes</li>
                <li>• Close all HTML tags properly</li>
                <li>• Use lowercase for tag names</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Performance</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Minimize HTML file size</li>
                <li>• Use external CSS and JS files</li>
                <li>• Optimize images and media</li>
                <li>• Remove unnecessary whitespace</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ValidationItemProps {
  result: ValidationError;
}

function ValidationItem({ result }: ValidationItemProps) {
  return (
    <div className={`p-3 border rounded-lg ${
      result.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start gap-2">
        {result.type === 'error' ? (
          <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={result.type === 'error' ? 'destructive' : 'secondary'}>
              {result.type}
            </Badge>
            <span className="text-sm font-mono">
              Line {result.line}, Column {result.column}
            </span>
          </div>
          <p className="text-sm font-medium">{result.message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Rule: {result.rule}
          </p>
        </div>
      </div>
    </div>
  );
}