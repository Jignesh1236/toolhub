import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Editor

This is a **live markdown editor** with instant preview.

## Features

- ✅ Real-time preview
- ✅ Syntax highlighting
- ✅ Export options
- ✅ Full markdown support

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

### Lists

1. First item
2. Second item
3. Third item

- Bullet point
- Another point
  - Nested point
  - Another nested point

### Links and Images

[Visit GitHub](https://github.com)

### Tables

| Feature | Supported |
|---------|-----------|
| Tables | ✅ |
| Links | ✅ |
| Images | ✅ |
| Code | ✅ |

### Blockquotes

> This is a blockquote. It's great for highlighting important information or quotes from other sources.

---

**Happy editing!**`);

  const { toast } = useToast();

  const convertToHTML = (md: string): string => {
    let html = md;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />');
    
    // Unordered lists
    html = html.replace(/^\s*- (.+)/gim, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*<\/li>)/g, '<ul>$1</ul>');
    
    // Ordered lists
    html = html.replace(/^\s*\d+\. (.+)/gim, '<li>$1</li>');
    
    // Tables
    html = html.replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim());
      const cellsHtml = cells.map((cell: string) => `<td>${cell}</td>`).join('');
      return `<tr>${cellsHtml}</tr>`;
    });
    html = html.replace(/(<tr>[\s\S]*<\/tr>)/g, '<table style="border-collapse: collapse; width: 100%;">$1</table>');
    
    // Blockquotes
    html = html.replace(/^> (.+)/gim, '<blockquote style="border-left: 4px solid #ddd; padding-left: 1rem; margin: 1rem 0; color: #666;">$1</blockquote>');
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr style="border: 1px solid #ddd; margin: 2rem 0;" />');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    html = `<p>${html}</p>`;
    
    // Clean up
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>|<ol>|<table>|<blockquote>|<hr>|<pre>)/g, '$1');
    html = html.replace(/(<\/ul>|<\/ol>|<\/table>|<\/blockquote>|<\/pre>)<\/p>/g, '$1');
    
    return html;
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.md';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Markdown file has been downloaded.",
    });
  };

  const downloadHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Document</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 2rem; 
      color: #333; 
    }
    pre { 
      background: #f5f5f5; 
      padding: 1rem; 
      border-radius: 4px; 
      overflow-x: auto; 
    }
    code { 
      background: #f5f5f5; 
      padding: 0.2rem 0.4rem; 
      border-radius: 3px; 
      font-family: 'Monaco', 'Courier New', monospace; 
    }
    table { 
      border-collapse: collapse; 
      width: 100%; 
      margin: 1rem 0; 
    }
    td, th { 
      border: 1px solid #ddd; 
      padding: 0.5rem; 
      text-align: left; 
    }
    th { 
      background: #f5f5f5; 
      font-weight: bold; 
    }
  </style>
</head>
<body>
${convertToHTML(markdown)}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.html';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "HTML file has been downloaded.",
    });
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast({
        title: "Copied!",
        description: "Markdown copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const clearEditor = () => {
    setMarkdown("");
  };

  const loadTemplate = () => {
    const template = `# Project Title

## Description
Brief description of your project.

## Installation
\`\`\`bash
npm install your-package
\`\`\`

## Usage
\`\`\`javascript
const yourPackage = require('your-package');
yourPackage.doSomething();
\`\`\`

## Features
- [x] Feature 1
- [x] Feature 2
- [ ] Feature 3 (coming soon)

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License
This project is licensed under the MIT License.`;
    
    setMarkdown(template);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Markdown Editor</h1>
          <p className="text-gray-600 dark:text-gray-400">Live markdown editor with instant preview</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Editor Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <i className="fas fa-edit text-blue-500"></i>
                  Markdown Editor
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadTemplate}
                    data-testid="load-template"
                  >
                    Template
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearEditor}
                    data-testid="clear-editor"
                  >
                    Clear
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="min-h-[500px] font-mono text-sm resize-none"
                placeholder="Start typing your markdown here..."
                data-testid="markdown-input"
              />
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Button 
                  onClick={copyMarkdown}
                  variant="outline"
                  data-testid="copy-markdown"
                >
                  <i className="fas fa-copy mr-2"></i>
                  Copy Markdown
                </Button>
                <Button 
                  onClick={downloadMarkdown}
                  variant="outline"
                  data-testid="download-markdown"
                >
                  <i className="fas fa-download mr-2"></i>
                  Download .md
                </Button>
                <Button 
                  onClick={downloadHTML}
                  variant="outline"
                  data-testid="download-html"
                >
                  <i className="fas fa-download mr-2"></i>
                  Download HTML
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-eye text-green-500"></i>
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 min-h-[500px] bg-white dark:bg-gray-900">
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: convertToHTML(markdown) }}
                  data-testid="markdown-preview"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Syntax Guide */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-book text-purple-500"></i>
              Markdown Syntax Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Headers</h4>
                <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  # H1<br/>
                  ## H2<br/>
                  ### H3
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Text Formatting</h4>
                <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  **bold text**<br/>
                  *italic text*<br/>
                  `inline code`
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Lists</h4>
                <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  - Bullet point<br/>
                  1. Numbered item<br/>
                  - [x] Checkbox
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Links & Images</h4>
                <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  [link text](url)<br/>
                  ![alt text](image-url)
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Code Blocks</h4>
                <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  ```javascript<br/>
                  code here<br/>
                  ```
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Tables</h4>
                <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  | Header | Header |<br/>
                  |--------|--------|<br/>
                  | Cell   | Cell   |
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}