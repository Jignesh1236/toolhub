import { Tool } from "@/lib/tools";
import { Link } from "wouter";
import { useState } from "react";

interface ToolCardProps {
  onClick?: (tool: Tool) => void;
  onDelete?: (toolId: string) => void;
}

export function ToolCard({ tool, onClick, onDelete }: ToolCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(tool.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (tool.isMagic && onClick) {
      e.preventDefault();
      onClick(tool);
    }
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
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30',
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
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  };

  return (
    <Link href={tool.route} data-testid={`tool-card-${tool.id}`} onClick={handleClick}>
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm card-hover-effect cursor-pointer group h-full flex flex-col">
        <div className="flex items-start justify-between mb-5">
          <div className={`p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 ${colorClasses[tool.color as keyof typeof colorClasses]}`}>
            <i className={`${tool.icon} text-2xl`}></i>
          </div>
          <div className="flex gap-2">
            {tool.isMagic && (
              <button 
                onClick={handleDelete}
                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete tool"
              >
                <i className="fas fa-trash-alt text-sm"></i>
              </button>
            )}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{tool.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed flex-grow">{tool.description}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
          <span className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full ${tagColors[tool.color as keyof typeof tagColors]}`}>
            {tool.category}
          </span>
          <i className="fas fa-arrow-right text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"></i>
        </div>
      </div>
    </Link>
  );
}
