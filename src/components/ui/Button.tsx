import React from "react";

export function PrimaryButton({ children, disabled, ...props }: any) {
  return (
    <button {...props} disabled={disabled} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium shadow-sm bg-sky-600 text-white hover:bg-sky-700 ${disabled ? "opacity-50 pointer-events-none":""}`}>
      {children}
    </button>
  );
}

export function GhostButton({ children, ...props }: any) {
  return <button {...props} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm hover:bg-gray-100">{children}</button>;
}
