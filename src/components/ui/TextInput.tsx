import React from "react";
export default function TextInput({ label, type = "text", value, onChange, placeholder, leftIcon, autoFocus }: any) {
  return (
    <label className="block">
      {label && <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>}
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
        {leftIcon}
        <input className="w-full bg-transparent outline-none placeholder:text-gray-400" type={type} value={value} onChange={(e)=> onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} />
      </div>
    </label>
  );
}
