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
      const prompt = `Create a high-quality, professional-grade, and detailed single-file HTML tool for "${searchQuery}". 
      Requirements:
      1. Modern and beautiful UI using Tailwind CSS.
      2. Comprehensive features related to "${searchQuery}".
      3. Mobile-responsive design.
      4. Interactive elements with polished JavaScript.
      5. Dark mode support.
      6. Clear instructions and professional layout.
      Return ONLY the complete HTML code. No talk, just code.`;
      
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      const html = await response.text();
      
      if (html) {
        setMagicTools(prev => [...prev, { name: searchQuery, html }]);
        toast({
           title: "✨ Magic happened!",
           description: `A new tool for "${searchQuery}" has been created. Opening now...`,
         });
         // Redirect to the new tool immediately
         setLocation(`/magic/${encodeURIComponent(searchQuery)}`);
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

          {/* Recently Used Tools */}
          {!searchQuery && activeCategory === 'all' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recently Used</h2>
                <Button variant="link" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium">
                  View all
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentTools.map((tool) => (
                  <Card key={tool.id} className="bg-white dark:bg-dark-card hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${tool.color}-50 dark:bg-${tool.color}-900/20`}>
                          <i className={`${tool.icon} text-${tool.color}-600 dark:text-${tool.color}-400`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tool.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Never used</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recently Used Shared Files & Texts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Recently Used Tools (Horizontal Scroll or List) */}
        <Card className="card-hover-effect border-none shadow-md overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-dark-card dark:to-blue-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <i className="fas fa-history text-blue-500"></i>
              Recently Used Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {/* This would be populated from tool usage history */}
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  <i className="fas fa-file-pdf text-red-500"></i>
                </div>
                <span className="text-[10px] font-medium">PDF Merger</span>
              </div>
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  <i className="fas fa-robot text-blue-500"></i>
                </div>
                <span className="text-[10px] font-medium">Chatbot</span>
              </div>
              <div className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  <i className="fas fa-share-alt text-green-500"></i>
                </div>
                <span className="text-[10px] font-medium">File Share</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recently Used Magic Tools */}
        <Card className="card-hover-effect border-none shadow-md overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-dark-card dark:to-purple-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <i className="fas fa-magic text-purple-500"></i>
              Recent Magic Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {magicTools.slice(0, 3).map((tool) => (
                <div key={tool.name} className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer" onClick={() => setLocation(`/magic/${encodeURIComponent(tool.name)}`)}>
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                    <i className="fas fa-wand-sparkles text-purple-500"></i>
                  </div>
                  <span className="text-[10px] font-medium truncate w-full text-center">{tool.name}</span>
                </div>
              ))}
              {magicTools.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">No magic tools created yet</p>
              )}
            </div>
          </CardContent>
        </Card>
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
