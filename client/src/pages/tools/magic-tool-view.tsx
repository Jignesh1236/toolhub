import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trash2, Maximize2, ExternalLink } from "lucide-react";

export default function MagicToolView() {
  const [, params] = useRoute("/magic/:name");
  const [, setLocation] = useLocation();
  const [html, setHtml] = useState<string | null>(null);
  const toolName = params ? decodeURIComponent(params.name) : "";

  useEffect(() => {
    const saved = localStorage.getItem('magic_tools');
    if (saved) {
      const magicTools = JSON.parse(saved);
      const tool = magicTools.find((t: any) => t.name === toolName);
      if (tool) {
        setHtml(tool.html);
      }
    }
  }, [toolName]);

  const handleDelete = () => {
    const saved = localStorage.getItem('magic_tools');
    if (saved) {
      const magicTools = JSON.parse(saved);
      const filtered = magicTools.filter((t: any) => t.name !== toolName);
      localStorage.setItem('magic_tools', JSON.stringify(filtered));
      setLocation("/");
    }
  };

  if (!html) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-4">Tool not found</h2>
        <Button onClick={() => setLocation("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-dark-bg">
      {/* Tool Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-dark-card sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{toolName}</h1>
            <p className="text-xs text-gray-500">AI Generated Magic Tool</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
          }}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Full Screen
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Tool
          </Button>
        </div>
      </div>

      {/* Tool Content Container */}
      <div className="flex-1 overflow-hidden relative">
        <iframe
          srcDoc={html}
          title={toolName}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-modals allow-forms allow-popups allow-downloads"
        />
      </div>
    </div>
  );
}
