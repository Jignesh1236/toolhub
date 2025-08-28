import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import mammoth from 'mammoth';

export default function WordProcessor() {
  const [documentName, setDocumentName] = useState('Untitled Document');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharacterCount(content.length);
  }, [content]);

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    
    if (rows && cols) {
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">Cell</td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</table>';
      
      formatText('insertHTML', tableHTML);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      formatText('insertImage', url);
    }
  };

  const saveDocument = (format: 'html' | 'docx' | 'pdf' = 'html') => {
    if (format === 'docx') {
      // Create a simple DOCX-like structure
      const docxContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head>
          <meta charset='utf-8'>
          <title>${documentName}</title>
          <style>
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 1in; }
            h1, h2, h3 { color: #2B5797; }
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #000; padding: 8px; }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `;
      
      const blob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentName}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "DOCX Exported",
        description: `${documentName}.docx has been exported successfully.`,
      });
    } else if (format === 'pdf') {
      // For PDF export, we'll use the print functionality
      printDocument();
    } else {
      // HTML format
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentName}.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Document Saved",
        description: `${documentName} has been saved successfully.`,
      });
    }
  };

  const importDocument = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx,.html,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          if (file.name.endsWith('.docx')) {
            // Use mammoth to properly parse .docx files
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const htmlContent = result.value;
            
            setContent(htmlContent);
            if (editorRef.current) {
              editorRef.current.innerHTML = htmlContent;
            }
            
            if (result.messages.length > 0) {
              console.warn('DOCX conversion warnings:', result.messages);
            }
          } else {
            // For HTML and TXT files
            const reader = new FileReader();
            reader.onload = (event) => {
              const textContent = event.target?.result as string;
              
              if (file.name.endsWith('.html')) {
                setContent(textContent);
                if (editorRef.current) {
                  editorRef.current.innerHTML = textContent;
                }
              } else {
                // For TXT files, wrap in paragraph tags
                const htmlContent = `<p>${textContent.replace(/\n/g, '</p><p>')}</p>`;
                setContent(htmlContent);
                if (editorRef.current) {
                  editorRef.current.innerHTML = htmlContent;
                }
              }
            };
            reader.readAsText(file);
          }
          
          setDocumentName(file.name.replace(/\.[^/.]+$/, ""));
          toast({
            title: "Document Imported",
            description: `${file.name} has been imported successfully.`,
          });
        } catch (error) {
          console.error('Import error:', error);
          toast({
            title: "Import Error",
            description: "Could not import the file. Please check the file format.",
            variant: "destructive"
          });
        }
      }
    };
    input.click();
  };

  const newDocument = () => {
    setDocumentName('Untitled Document');
    setContent('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  const printDocument = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${documentName}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 1in; }
              table { border-collapse: collapse; width: 100%; }
              td, th { border: 1px solid #ddd; padding: 8px; }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-file-word text-white text-sm"></i>
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      onBlur={() => setIsEditing(false)}
                      onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
                      className="h-8 w-48 text-lg font-semibold"
                      autoFocus
                      data-testid="document-name-input"
                    />
                  ) : (
                    <h1 
                      className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600"
                      onClick={() => setIsEditing(true)}
                      data-testid="document-name"
                    >
                      {documentName}
                    </h1>
                  )}
                  <p className="text-sm text-gray-500">
                    {wordCount} words • {characterCount} characters
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={newDocument}
                data-testid="new-document"
              >
                <i className="fas fa-file mr-2"></i>
                New
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={importDocument}
                data-testid="import-document"
              >
                <i className="fas fa-upload mr-2"></i>
                Import
              </Button>
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => saveDocument('html')}
                  data-testid="save-document"
                >
                  <i className="fas fa-save mr-2"></i>
                  Save ▼
                </Button>
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 hidden group-hover:block">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => saveDocument('html')}
                    className="w-full justify-start"
                    data-testid="save-html"
                  >
                    <i className="fas fa-code mr-2"></i>
                    Save as HTML
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => saveDocument('docx')}
                    className="w-full justify-start"
                    data-testid="save-docx"
                  >
                    <i className="fas fa-file-word mr-2"></i>
                    Export as DOCX
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => saveDocument('pdf')}
                    className="w-full justify-start"
                    data-testid="save-pdf"
                  >
                    <i className="fas fa-file-pdf mr-2"></i>
                    Export as PDF
                  </Button>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={printDocument}
                data-testid="print-document"
              >
                <i className="fas fa-print mr-2"></i>
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {/* Font Formatting */}
            <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('bold')}
                className="h-8 w-8 p-0"
                data-testid="bold-button"
              >
                <i className="fas fa-bold"></i>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('italic')}
                className="h-8 w-8 p-0"
                data-testid="italic-button"
              >
                <i className="fas fa-italic"></i>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('underline')}
                className="h-8 w-8 p-0"
                data-testid="underline-button"
              >
                <i className="fas fa-underline"></i>
              </Button>
            </div>

            {/* Alignment */}
            <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('justifyLeft')}
                className="h-8 w-8 p-0"
                data-testid="align-left"
              >
                <i className="fas fa-align-left"></i>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('justifyCenter')}
                className="h-8 w-8 p-0"
                data-testid="align-center"
              >
                <i className="fas fa-align-center"></i>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('justifyRight')}
                className="h-8 w-8 p-0"
                data-testid="align-right"
              >
                <i className="fas fa-align-right"></i>
              </Button>
            </div>

            {/* Lists */}
            <div className="flex items-center space-x-1 border-r border-gray-300 dark:border-gray-600 pr-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('insertUnorderedList')}
                className="h-8 w-8 p-0"
                data-testid="bullet-list"
              >
                <i className="fas fa-list-ul"></i>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('insertOrderedList')}
                className="h-8 w-8 p-0"
                data-testid="numbered-list"
              >
                <i className="fas fa-list-ol"></i>
              </Button>
            </div>

            {/* Insert */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={insertTable}
                className="h-8 px-3 text-sm"
                data-testid="insert-table"
              >
                <i className="fas fa-table mr-1"></i>
                Table
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={insertImage}
                className="h-8 px-3 text-sm"
                data-testid="insert-image"
              >
                <i className="fas fa-image mr-1"></i>
                Image
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('createLink', prompt('Enter URL:') || '')}
                className="h-8 px-3 text-sm"
                data-testid="insert-link"
              >
                <i className="fas fa-link mr-1"></i>
                Link
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[600px] p-8 focus:outline-none prose prose-lg max-w-none dark:prose-invert"
            style={{
              fontFamily: 'Times, serif',
              fontSize: '16px',
              lineHeight: '1.6',
            }}
            onInput={updateContent}
            data-placeholder="Start typing your document..."
            data-testid="document-editor"
          />
        </div>
      </div>
    </div>
  );
}