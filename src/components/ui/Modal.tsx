import React from "react";
export default function Modal({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <button onClick={onClose} className="rounded-xl p-2">Cerrar</button>
        </div>
        {children}
      </div>
    </div>
  );
}
