import { ReactNode } from 'react';

interface ModalLayoutProps {
  title: string;
  children: ReactNode;
  width?: string;
  maxHeight?: string;
}

export function ModalLayout({ title, children, width = 'w-[600px]', maxHeight = 'max-h-[90vh]' }: ModalLayoutProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${width} bg-white rounded-lg border p-0 shadow-lg flex flex-col ${maxHeight}`}>
        <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <h4 className="text-lg font-semibold">{title}</h4>
        </div>
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}