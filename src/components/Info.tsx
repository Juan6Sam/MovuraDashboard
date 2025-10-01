import React from 'react';

interface InfoProps {
  icon: React.ReactNode;
  title: string;
  value?: string | number | null;
}

export function InfoChip({ icon, title, value }: InfoProps) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-neutral-800">
      <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      <span className="font-medium text-gray-700 dark:text-gray-200">{title}:</span>
      <span className="text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

interface InfoLineProps extends InfoProps {
  highlight?: 'emerald' | 'red';
}

export function InfoLine({ icon, title, value, highlight }: InfoLineProps) {
  if (!value) return null;
  
  const highlightClasses = {
    emerald: 'text-emerald-600 dark:text-emerald-500',
    red: 'text-red-600 dark:text-red-500',
  };

  const valueClass = highlight ? highlightClasses[highlight] : 'text-gray-900 dark:text-white';

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      <span className="font-medium text-gray-700 dark:text-gray-200">{title}:</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
