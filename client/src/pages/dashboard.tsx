import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ToolCard } from "@/components/tool-card";
import { tools, getToolsByCategory, searchTools, toolCategories } from "@/lib/tools";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const displayedTools = useMemo(() => {
    if (searchQuery.trim()) {
      return searchTools(searchQuery);
    }
    return getToolsByCategory(activeCategory);
  }, [activeCategory, searchQuery]);

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

  const handleBookmark = (toolId: string) => {
    console.log('Bookmarking tool:', toolId);
    // TODO: Implement bookmark functionality with backend
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

          {/* Tools Grid */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4" data-testid="category-title">
              {categoryTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="tools-grid">
              {displayedTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} onBookmark={handleBookmark} />
              ))}
            </div>
            
            {displayedTools.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-search text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tools found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? `No tools match "${searchQuery}"` : 'No tools available in this category'}
                </p>
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
