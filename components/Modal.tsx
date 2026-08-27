"use client";

import { CloseIcon } from "./icons";

export function Modal({
  title,
  onClose,
  children,
  width = 560,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full overflow-hidden rounded-[18px] border border-border-strong bg-bg-elev shadow-2xl"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-[22px]">
          <h2 className="text-[17px] font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-elev-2 text-text-muted"
            aria-label="Fermer"
          >
            <CloseIcon className="h-[15px] w-[15px]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
