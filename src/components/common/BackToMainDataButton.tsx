import { Button } from '../ui/button';
import { RotateCcw } from 'lucide-react';

interface BackToMainDataButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

/**
 * Reusable "Back to Main Data" button that appears when data is filtered
 * Provides consistent styling and placement across all modules
 */
export function BackToMainDataButton({ onClick, isVisible }: BackToMainDataButtonProps) {
  if (!isVisible) return null;

  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2"
    >
      <RotateCcw className="w-4 h-4" />
      Back to Main Data
    </Button>
  );
}
