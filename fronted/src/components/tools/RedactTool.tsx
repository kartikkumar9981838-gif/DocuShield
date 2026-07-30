import React from 'react';
import { RedactionArea } from '../../types';
import { EyeOff, Trash2, Download } from 'lucide-react';

interface RedactToolProps {
  redactions: RedactionArea[];
  onClearAllRedactions: () => void;
  onApplyRedactionsBackend: () => void;
  isProcessing: boolean;
}

export const RedactTool: React.FC<RedactToolProps> = ({
  redactions,
  onClearAllRedactions,
  onApplyRedactionsBackend,
  isProcessing,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium bg-amber-950/60 border border-amber-800 px-3 py-1.5 rounded-lg">
          <EyeOff className="w-4 h-4 text-amber-400" />
          <span>Click & drag on the document page above to select redaction boxes.</span>
        </div>

        {redactions.length > 0 && (
          <span className="text-xs text-slate-300 font-semibold bg-slate-800 px-2.5 py-1 rounded">
            {redactions.length} {redactions.length === 1 ? 'Box' : 'Boxes'} marked
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {redactions.length > 0 && (
          <button
            onClick={onClearAllRedactions}
            className="text-slate-400 hover:text-red-400 text-xs px-2.5 py-1.5 rounded flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}

        <button
          onClick={onApplyRedactionsBackend}
          disabled={redactions.length === 0 || isProcessing}
          className="bg-[#00C2CB] hover:bg-[#00aeb6] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>{isProcessing ? 'Scrubbing Content...' : 'Apply Permanent Redactions'}</span>
        </button>
      </div>
    </div>
  );
};
