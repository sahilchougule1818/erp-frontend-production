import { ReactNode } from 'react';

interface ModalLayoutProps {
  title: string;
  children: ReactNode;
  width?: string;
  maxHeight?: string;
}

export function ModalLayout({ title, children, width = 'w-[600px]', maxHeight = 'max-h-[90vh]' }: ModalLayoutProps) {
  // Extract numeric width from Tailwind class (e.g., 'w-[700px]' -> '700px')
  const widthValue = width.match(/\[(.*?)\]/)?.[1] || '600px';
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-gray-200 ring-1 ring-black/5 flex flex-col" style={{ maxHeight: '85vh', minHeight: '200px', width: widthValue, boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)' }}>
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
