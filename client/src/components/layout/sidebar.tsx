import { toolCategories } from "@/lib/tools";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function Sidebar({ isOpen, onClose, activeCategory, onCategoryChange }: SidebarProps) {
  const [location] = useLocation();

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center shadow-sm">
              <i className="fas fa-th-large text-white text-xs"></i>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Office Tools</h1>
          </div>
          <button 
            className="lg:hidden p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-500 dark:text-gray-400"
            onClick={onClose}
            data-testid="close-sidebar"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>
        
        <nav className="mt-4 px-2">
          <div className="space-y-0.5">
            {toolCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`nav-item w-full text-left flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'active bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                data-testid={`nav-${category.id}`}
              >
                <i className={`${category.icon} w-4 h-4 mr-3 flex-shrink-0`}></i>
                <span className="truncate">{category.name}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="px-3 mb-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Access</p>
            </div>
            <div className="space-y-0.5">
              <Link href="/bookmarks" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-md hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                <i className="fas fa-bookmark w-4 h-4 mr-3 flex-shrink-0"></i>
                <span className="truncate">Bookmarked</span>
              </Link>
              <Link href="/recent" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-md hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                <i className="fas fa-history w-4 h-4 mr-3 flex-shrink-0"></i>
                <span className="truncate">Recent</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
