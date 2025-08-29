import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CSSMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState({
    removeComments: true,
    removeWhitespace: true,
    removeEmptyRules: true,
    removeDuplicates: true,
    shortenColors: true,
    optimizeValues: true,
  });
  const { toast } = useToast();

  const minifyCSS = () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter some CSS to minify.",
        variant: "destructive",
      });
      return;
    }

    try {
      let minified = input;

      // Remove comments
      if (options.removeComments) {
        minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
      }

      // Remove whitespace
      if (options.removeWhitespace) {
        minified = minified
          .replace(/\s+/g, ' ')
          .replace(/\s*{\s*/g, '{')
          .replace(/;\s*/g, ';')
          .replace(/\s*}\s*/g, '}')
          .replace(/\s*,\s*/g, ',')
          .replace(/\s*:\s*/g, ':')
          .replace(/\s*>\s*/g, '>')
          .replace(/\s*\+\s*/g, '+')
          .replace(/\s*~\s*/g, '~')
          .trim();
      }

      // Remove empty rules
      if (options.removeEmptyRules) {
        minified = minified.replace(/[^{}]*{\s*}/g, '');
      }

      // Shorten colors
      if (options.shortenColors) {
        // #ffffff -> #fff
        minified = minified.replace(/#([a-fA-F0-9])\1([a-fA-F0-9])\2([a-fA-F0-9])\3/g, '#$1$2$3');
        // rgb(255,255,255) -> #fff
        minified = minified.replace(/rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/g, '#fff');
        minified = minified.replace(/rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)/g, '#000');
      }

      // Optimize values
      if (options.optimizeValues) {
        // 0px -> 0
        minified = minified.replace(/\b0+\.?0*px/g, '0');
        minified = minified.replace(/\b0+\.?0*em/g, '0');
        minified = minified.replace(/\b0+\.?0*rem/g, '0');
        minified = minified.replace(/\b0+\.?0*%/g, '0');
        // 0.5 -> .5
        minified = minified.replace(/\b0+\.(\d)/g, '.$1');
        // margin: 10px 10px 10px 10px -> margin: 10px
        minified = minified.replace(/margin:\s*(\S+)\s+\1\s+\1\s+\1/g, 'margin:$1');
        minified = minified.replace(/padding:\s*(\S+)\s+\1\s+\1\s+\1/g, 'padding:$1');
      }

      // Remove duplicate properties (basic implementation)
      if (options.removeDuplicates) {
        const rules = minified.split('}');
        const cleanedRules = rules.map(rule => {
          if (!rule.includes('{')) return rule;
          
          const [selector, declarations] = rule.split('{');
          if (!declarations) return rule;
          
          const props = declarations.split(';').filter(prop => prop.trim());
          const uniqueProps = new Map();
          
          props.forEach(prop => {
            const [property, value] = prop.split(':');
            if (property && value) {
              uniqueProps.set(property.trim(), value.trim());
            }
          });
          
          const uniqueDeclarations = Array.from(uniqueProps.entries())
            .map(([prop, value]) => `${prop}:${value}`)
            .join(';');
            
          return selector + '{' + uniqueDeclarations + (uniqueDeclarations ? ';' : '');
        });
        
        minified = cleanedRules.join('}');
      }

      // Remove trailing semicolons before }
      minified = minified.replace(/;}/g, '}');
      
      setOutput(minified);

      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([minified]).size;
      const savings = Math.round(((originalSize - minifiedSize) / originalSize) * 100);

      toast({
        title: "Success!",
        description: `CSS minified successfully. Saved ${savings}% (${originalSize - minifiedSize} bytes)`,
      });
    } catch (err) {
      toast({
        title: "Minification Failed",
        description: "Please check your CSS syntax.",
        variant: "destructive",
      });
    }
  };

  const beautifyCSS = () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter some CSS to beautify.",
        variant: "destructive",
      });
      return;
    }

    try {
      let beautified = input;

      // Add proper spacing and indentation
      beautified = beautified
        .replace(/\s*{\s*/g, ' {\n  ')
        .replace(/;\s*/g, ';\n  ')
        .replace(/\s*}\s*/g, '\n}\n\n')
        .replace(/,\s*/g, ',\n')
        .replace(/\s*>\s*/g, ' > ')
        .replace(/\s*\+\s*/g, ' + ')
        .replace(/\s*~\s*/g, ' ~ ')
        .replace(/\s*:\s*/g, ': ')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();

      setOutput(beautified);

      toast({
        title: "Success!",
        description: "CSS beautified successfully.",
      });
    } catch (err) {
      toast({
        title: "Beautification Failed",
        description: "Please check your CSS syntax.",
        variant: "destructive",
      });
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      toast({
        title: "Copied!",
        description: "Processed CSS copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadOutput = () => {
    if (!output) return;

    const blob = new Blob([output], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'minified.css';
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "CSS file has been downloaded.",
    });
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
  };

  const loadSample = () => {
    const sampleCSS = `/* Main styles */
.header {
    background-color: #ffffff;
    margin: 10px 10px 10px 10px;
    padding: 15px 15px 15px 15px;
    border-radius: 5px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-menu {
    display: flex;
    list-style: none;
    margin: 0px;
    padding: 0px;
}

.nav-menu li {
    margin-right: 20px;
}

.nav-menu li a {
    text-decoration: none;
    color: rgb(0, 0, 0);
    font-weight: bold;
}

.nav-menu li a:hover {
    color: rgb(255, 0, 0);
    text-decoration: underline;
}

/* Content area */
.content {
    margin-top: 20px;
    padding: 20px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
}

.content p {
    line-height: 1.6;
    margin-bottom: 15px;
    color: rgb(51, 51, 51);
}

/* Empty rule */
.unused {
    
}`;
    
    setInput(sampleCSS);
    setOutput("");
  };

  const originalSize = input ? new Blob([input]).size : 0;
  const minifiedSize = output ? new Blob([output]).size : 0;
  const savings = originalSize > 0 && minifiedSize > 0 
    ? Math.round(((originalSize - minifiedSize) / originalSize) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">CSS Minifier</h1>
          <p className="text-gray-600 dark:text-gray-400">Minify and optimize CSS code for production</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="fas fa-code text-blue-500"></i>
                  CSS Input
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
              <Textarea
                placeholder="Enter your CSS code here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                data-testid="css-input"
              />

              {/* Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Minification Options</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="removeComments"
                      checked={options.removeComments}
                      onCheckedChange={(checked) => 
                        setOptions({ ...options, removeComments: checked as boolean })
                      }
                      data-testid="option-remove-comments"
                    />
                    <Label htmlFor="removeComments" className="text-sm">Remove comments</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="removeWhitespace"
                      checked={options.removeWhitespace}
                      onCheckedChange={(checked) => 
                        setOptions({ ...options, removeWhitespace: checked as boolean })
                      }
                      data-testid="option-remove-whitespace"
                    />
                    <Label htmlFor="removeWhitespace" className="text-sm">Remove whitespace</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="removeEmptyRules"
                      checked={options.removeEmptyRules}
                      onCheckedChange={(checked) => 
                        setOptions({ ...options, removeEmptyRules: checked as boolean })
                      }
                      data-testid="option-remove-empty-rules"
                    />
                    <Label htmlFor="removeEmptyRules" className="text-sm">Remove empty rules</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shortenColors"
                      checked={options.shortenColors}
                      onCheckedChange={(checked) => 
                        setOptions({ ...options, shortenColors: checked as boolean })
                      }
                      data-testid="option-shorten-colors"
                    />
                    <Label htmlFor="shortenColors" className="text-sm">Shorten colors</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="optimizeValues"
                      checked={options.optimizeValues}
                      onCheckedChange={(checked) => 
                        setOptions({ ...options, optimizeValues: checked as boolean })
                      }
                      data-testid="option-optimize-values"
                    />
                    <Label htmlFor="optimizeValues" className="text-sm">Optimize values</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="removeDuplicates"
                      checked={options.removeDuplicates}
                      onCheckedChange={(checked) => 
                        setOptions({ ...options, removeDuplicates: checked as boolean })
                      }
                      data-testid="option-remove-duplicates"
                    />
                    <Label htmlFor="removeDuplicates" className="text-sm">Remove duplicates</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={minifyCSS}
                  className="flex-1"
                  data-testid="minify-button"
                >
                  <i className="fas fa-compress mr-2"></i>
                  Minify
                </Button>
                <Button 
                  onClick={beautifyCSS}
                  variant="outline"
                  className="flex-1"
                  data-testid="beautify-button"
                >
                  <i className="fas fa-expand mr-2"></i>
                  Beautify
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-500"></i>
                  Processed CSS
                </span>
                {output && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {savings > 0 ? `-${savings}%` : 'No change'}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyOutput}
                      data-testid="copy-output"
                    >
                      <i className="fas fa-copy mr-1"></i>
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={downloadOutput}
                      data-testid="download-output"
                    >
                      <i className="fas fa-download mr-1"></i>
                      Download
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {output ? (
                <div className="space-y-4">
                  <Textarea
                    value={output}
                    readOnly
                    className="min-h-[300px] font-mono text-sm bg-gray-50 dark:bg-gray-800"
                    data-testid="css-output"
                  />
                  
                  <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {(originalSize / 1024).toFixed(1)}KB
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Original Size</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {(minifiedSize / 1024).toFixed(1)}KB
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Minified Size</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {savings > 0 ? `-${savings}%` : '0%'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Size Reduction</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  <i className="fas fa-compress text-4xl mb-4"></i>
                  <p className="text-lg mb-2">No processed CSS yet</p>
                  <p className="text-sm">Enter CSS and click "Minify" or "Beautify" to begin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-star text-yellow-500"></i>
              CSS Optimizer Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <i className="fas fa-compress text-2xl text-blue-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Smart Minification</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remove unnecessary whitespace, comments, and optimize values
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-palette text-2xl text-green-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Color Optimization</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Shorten hex colors and optimize RGB values
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-trash text-2xl text-purple-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Clean Rules</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remove empty rules and duplicate properties
                </p>
              </div>
              <div className="text-center p-4">
                <i className="fas fa-expand text-2xl text-red-500 mb-2"></i>
                <h3 className="font-semibold mb-1">Beautify Option</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Format CSS with proper indentation and spacing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}