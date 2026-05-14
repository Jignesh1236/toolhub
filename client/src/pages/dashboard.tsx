import { useState, useMemo, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ToolCard } from "@/components/tool-card";
import { tools, getToolsByCategory, searchTools, toolCategories } from "@/lib/tools";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Load magic tools from local storage
  const [magicTools, setMagicTools] = useState<{name: string, html: string}[]>(() => {
    const saved = localStorage.getItem('magic_tools');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('magic_tools', JSON.stringify(magicTools));
  }, [magicTools]);

  const displayedTools = useMemo(() => {
    let filtered = [];
    
    // Map magic tools to Tool format
    const magicAsTools = magicTools.map(t => ({
      id: `magic-${t.name}`,
      name: t.name,
      category: 'magic',
      description: `AI generated tool for ${t.name}`,
      icon: 'fas fa-magic',
      route: `/magic/${encodeURIComponent(t.name)}`,
      color: 'purple',
      isMagic: true,
      html: t.html
    }));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = searchTools(searchQuery);
      const matchingMagic = magicAsTools.filter(t => t.name.toLowerCase().includes(query));
      return [...filtered, ...matchingMagic];
    } 
    
    if (activeCategory === 'magic') {
      return magicAsTools;
    }

    filtered = getToolsByCategory(activeCategory);
    return filtered;
  }, [activeCategory, searchQuery, magicTools]);

  const handleSeeMagic = async () => {
    setIsGenerating(true);
    try {
      const systemPrompt = `Create a high-quality, professional-grade, and detailed single-file HTML tool. 
      Requirements:
      1. Modern and beautiful UI using Tailwind CSS.
      2. Comprehensive features.
      3. Mobile-responsive design.
      4. Interactive elements with polished JavaScript.
      5. Dark mode support.
      Return ONLY the complete HTML code starting with <!DOCTYPE html>. No talk, just code.`;
      
      const userPrompt = `Generate a fully functional tool for "${searchQuery}".`;
      
      // Primary: Pollinations AI
      let html = "";
      try {
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(userPrompt)}?system=${encodeURIComponent(systemPrompt)}&seed=${Math.floor(Math.random() * 1000)}&model=qwen-coder`);
        if (!response.ok) throw new Error("Pollinations failed");
        html = await response.text();
      } catch (pollError) {
        console.log("Pollinations failed, trying Hugging Face fallback...");
        // Fallback: Hugging Face Qwen Coder
        const hfResponse = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-32B-Instruct", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${import.meta.env.VITE_HF_TOKEN || ''}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            inputs: `<|im_start|>system\n${systemPrompt}<|im_end|>\n<|im_start|>user\n${userPrompt}<|im_end|>\n<|im_start|>assistant\n`,
            parameters: { max_new_tokens: 2000 }
          })
        });
        
        const data = await hfResponse.json();
        html = data.generated_text || data[0]?.generated_text || "";
        
        if (html.includes("<|im_start|>assistant\n")) {
          html = html.split("<|im_start|>assistant\n").pop().split("<|im_end|>")[0];
        }
      }
      
      if (html && html.length > 100) {
        let finalHtml = html;
        // Clean up markdown code blocks if AI wrapped them
        if (finalHtml.includes('```html')) {
          finalHtml = finalHtml.split('```html')[1].split('```')[0].trim();
        } else if (finalHtml.includes('```')) {
          const parts = finalHtml.split('```');
          if (parts.length >= 3) {
            finalHtml = parts[1].trim();
            // If the first line is a language tag, remove it
            if (finalHtml.startsWith('html\n')) finalHtml = finalHtml.substring(5);
          }
        }

        // Ensure it has basic HTML structure if it looks like just body content
        if (!finalHtml.toLowerCase().includes('<html')) {
          finalHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></head><body class="bg-gray-50 dark:bg-slate-900">${finalHtml}</body></html>`;
        }

        setMagicTools(prev => [...prev, { name: searchQuery, html: finalHtml }]);
        toast({
           title: "✨ Magic happened!",
           description: `A new tool for "${searchQuery}" has been created. Opening now...`,
         });
         setLocation(`/magic/${encodeURIComponent(searchQuery)}`);
       } else {
         throw new Error("Response too short or invalid");
       }
    } catch (error) {
      console.error("Magic failed:", error);
      toast({
        title: "❌ Magic failed",
        description: "Could not generate the tool. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const categoryTitle = useMemo(() => {
    if (searchQuery.trim()) {
      return `Search Results for "${searchQuery}"`;
    }
    const category = toolCategories.find(cat => cat.id === activeCategory);
    return category?.name || 'All Tools';
  }, [activeCategory, searchQuery]);

  const recentTools = tools.slice(0, 4);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setSearchQuery('');
  };

  const handleToolClick = (tool: Tool) => {
    // Standard tools use the link in ToolCard
  };

  const handleDeleteMagicTool = (toolId: string) => {
    const toolName = toolId.replace('magic-', '');
    setMagicTools(prev => prev.filter(t => t.name !== toolName));
    toast({
      title: "Tool deleted",
      description: `Magic tool "${toolName}" has been removed.`,
    });
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-bg">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="flex-1 flex flex-col lg:ml-64">
        <Header
          onToggleSidebar={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white dark:bg-dark-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <i className="fas fa-tools text-blue-600 dark:text-blue-400"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tools</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white" data-testid="total-tools">
                      {tools.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-dark-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <i className="fas fa-chart-line text-green-600 dark:text-green-400"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tools Used Today</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white" data-testid="used-today">
                      0
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-dark-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <i className="fas fa-bookmark text-purple-600 dark:text-purple-400"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bookmarked</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white" data-testid="bookmarked">
                      0
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-dark-card">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <i className="fas fa-clock text-orange-600 dark:text-orange-400"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Saved</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white" data-testid="time-saved">
                      0h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recently Used Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full"></span>
                Recently Used
              </h2>
              <Button variant="link" className="text-blue-600 dark:text-blue-400 font-medium">
                View all
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* File Share Quick Access */}
              <Card 
                className="card-hover-effect cursor-pointer border-none shadow-md bg-white dark:bg-dark-card"
                onClick={() => setLocation('/tools/file-share')}
              >
                <CardContent className="p-5">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                      <i className="fas fa-file-alt text-blue-600 dark:text-blue-400 text-xl"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">File Share</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Quickly share files</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Text Share Quick Access */}
              <Card 
                className="card-hover-effect cursor-pointer border-none shadow-md bg-white dark:bg-dark-card"
                onClick={() => setLocation('/tools/text-share')}
              >
                <CardContent className="p-5">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                      <i className="fas fa-quote-left text-purple-600 dark:text-purple-400 text-xl"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Text Share</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Share text snippets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Magic Tool Placeholder 1 */}
              {magicTools.length > 0 ? (
                <Card 
                  className="card-hover-effect cursor-pointer border-none shadow-md bg-white dark:bg-dark-card"
                  onClick={() => setLocation(`/magic/${encodeURIComponent(magicTools[0].name)}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                        <i className="fas fa-magic text-orange-600 dark:text-orange-400 text-xl"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{magicTools[0].name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">AI Generated Tool</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-none shadow-md bg-white dark:bg-dark-card opacity-60">
                  <CardContent className="p-5">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <i className="fas fa-wand-sparkles text-gray-400 text-xl"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-400 truncate">No Magic Tool</p>
                        <p className="text-xs text-gray-500">Create with AI</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chatbot Quick Access */}
              <Card 
                className="card-hover-effect cursor-pointer border-none shadow-md bg-white dark:bg-dark-card"
                onClick={() => setLocation('/tools/chatbot')}
              >
                <CardContent className="p-5">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                      <i className="fas fa-robot text-green-600 dark:text-green-400 text-xl"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">AI Chatbot</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Talk with Qwen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full"></span>
                {searchQuery ? `Search Results for "${searchQuery}"` : activeCategory === 'all' ? 'All Tools' : toolCategories.find(c => c.id === activeCategory)?.name}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="tools-grid">
              {displayedTools.map((tool) => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  onDelete={handleDeleteMagicTool}
                />
              ))}
            </div>
            
            {displayedTools.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-search text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tools found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchQuery ? `No tools match "${searchQuery}"` : 'No tools available in this category'}
                </p>
                {searchQuery && (
                  <Button 
                    onClick={handleSeeMagic}
                    disabled={isGenerating}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Creating Magic...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic mr-2"></i>
                        Create "{searchQuery}" with AI
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Load More */}
          {displayedTools.length > 0 && (
            <div className="text-center">
              <Button 
                variant="outline"
                className="inline-flex items-center px-6 py-3 text-sm font-medium"
                data-testid="load-more"
              >
                <i className="fas fa-plus mr-2"></i>
                Load More Tools
              </Button>
            </div>
          )}
        </main>
      </div>


    </div>
  );
}
