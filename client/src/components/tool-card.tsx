import { Tool } from "@/lib/tools";
import { Link } from "wouter";
import { useState } from "react";

interface ToolCardProps {
  tool: Tool;
  onBookmark?: (toolId: string) => void;
}

export function ToolCard({ tool, onBookmark }: ToolCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(tool.isBookmarked || false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.(tool.id);
  };

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/30',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 group-hover:bg-pink-100 dark:group-hover:bg-pink-900/30',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30',
    gray: 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-600',
    sky: 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30',
  };

  const tagColors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    sky: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
  };

  return (
    <Link href={tool.route} data-testid={`tool-card-${tool.id}`}>
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg transition-colors ${colorClasses[tool.color as keyof typeof colorClasses]}`}>
            <i className={`${tool.icon} text-xl`}></i>
          </div>
          <button 
            onClick={handleBookmark}
            className="text-gray-400 hover:text-yellow-500 transition-colors"
            data-testid={`bookmark-${tool.id}`}
          >
            <i className={isBookmarked ? "fas fa-bookmark text-yellow-500" : "far fa-bookmark"}></i>
          </button>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tool.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tool.description}</p>
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full capitalize ${tagColors[tool.color as keyof typeof tagColors]}`}>
            {tool.category}
          </span>
          <i className="fas fa-arrow-right text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"></i>
        </div>
      </div>
    </Link>
  );
}
