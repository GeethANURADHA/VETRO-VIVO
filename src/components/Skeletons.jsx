import React from 'react';

/**
 * Skeleton loader for a Gem Card
 */
export function GemCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      {/* Image Block */}
      <div className="aspect-square bg-slate-200 dark:bg-slate-800" />
      
      {/* Content Block */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        
        {/* Price and Carats */}
        <div className="flex justify-between items-center">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
        </div>
        
        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for a Category Card
 */
export function CategoryCardSkeleton() {
  return (
    <div className="relative aspect-[4/5] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse overflow-hidden">
      <div className="absolute inset-0 p-8 flex flex-col justify-end space-y-2">
        <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-2/3" />
        <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3" />
      </div>
    </div>
  );
}
