import React from 'react';
import { TextEditItem } from '../../types';
import { Type, Download, Trash2 } from 'lucide-react';

interface EditTextToolProps {
  textEdits: TextEditItem[];
  onClearAllEdits: () => void;
  onApplyEditsBackend: () => void;
  isProcessing: boolean;
}

export const EditTextTool: React.FC<EditTextToolProps> = ({
  textEdits,
  onClearAllEdits,
  onApplyEditsBackend,
  isProcessing,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-sky-300 font-medium bg-sky-950/60 border border-sky-800 px-3 py-1.5 rounded-lg">
          <Type className="w-4 h-4 text-[#00C2CB]" />
          <span>Click & drag over text on the document to edit text.</span>
        </div>

        {textEdits.length > 0 && (
          <span className="text-xs text-slate-300 font-semibold bg-slate-800 px-2.5 py-1 rounded">
            {textEdits.length} {textEdits.length === 1 ? 'Edit' : 'Edits'} Pending
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {textEdits.length > 0 && (
          <button
            onClick={onClearAllEdits}
            className="text-slate-400 hover:text-red-400 text-xs px-2.5 py-1.5 rounded flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Edits</span>
          </button>
        )}

        <button
          onClick={onApplyEditsBackend}
          disabled={textEdits.length === 0 || isProcessing}
          className="bg-[#00C2CB] hover:bg-[#00aeb6] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>{isProcessing ? 'Saving Edits...' : 'Save PDF Text Edits'}</span>
        </button>
      </div>
    </div>
  );
};
