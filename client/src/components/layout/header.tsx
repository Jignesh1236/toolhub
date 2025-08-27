import { useThemeContext } from "@/components/theme-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ onToggleSidebar, searchQuery, onSearchChange }: HeaderProps) {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <header className="office-header h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Toggle */}
        <Button 
          variant="ghost" 
          size="sm"
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          onClick={onToggleSidebar}
          data-testid="open-sidebar"
        >
          <i className="fas fa-bars text-lg text-gray-600 dark:text-gray-300"></i>
        </Button>


        {/* Search Bar */}
        <div className="relative ml-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400 text-sm"></i>
          </div>
          <Input
            type="text"
            className="pl-10 w-72 h-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 transition-colors"
            placeholder="Search for tools and features..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            data-testid="search-input"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Quick Actions */}
        <div className="hidden md:flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="office-btn h-8 px-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
            data-testid="new-document"
          >
            <i className="fas fa-plus mr-2 text-xs"></i>
            New
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="office-btn h-8 px-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            data-testid="recent-files"
          >
            <i className="fas fa-folder-open mr-2 text-xs"></i>
            Open
          </Button>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

        {/* Settings & Profile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          data-testid="theme-toggle"
        >
          <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-sm text-gray-500 dark:text-gray-400`}></i>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors relative"
          data-testid="notifications"
        >
          <i className="fas fa-bell text-sm text-gray-500 dark:text-gray-400"></i>
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 h-8 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            data-testid="user-menu"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">U</span>
            </div>
            <i className="fas fa-chevron-down text-xs text-gray-400"></i>
          </Button>
        </div>
      </div>
    </header>
  );
}
