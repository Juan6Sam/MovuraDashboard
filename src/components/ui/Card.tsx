import React from "react";
export default function Card({ children, className = "" }: any) {
  return <div className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 ${className}`}>{children}</div>;
}
