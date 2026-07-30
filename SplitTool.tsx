import React, { useState } from 'react';
import { PDFFileItem } from '../../types';
import { Download, Scissors } from 'lucide-react';
import { splitPDF } from '../../utils/pdfHelpers';

interface SplitToolProps {
  currentFile: PDFFileItem | null;
  onDownloadResult: (bytes: Uint8Array, filename: string) => void;
}

export const SplitTool: React.FC<SplitToolProps> = ({ currentFile, onDownloadResult }) => {
  const [rangeStr, setRangeStr] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSplit = async () => {
    if (!currentFile) return;
    setIsProcessing(true);
    try {
      const splitBytes = await splitPDF(currentFile.file, rangeStr);
      onDownloadResult(splitBytes, `split_${currentFile.name}`);
    } catch (e) {
      console.error('Split error:', e);
      alert('Failed to split PDF. Please enter a valid page range (e.g. 1-3, 5).');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Page Range:</span>
        <input
          type="text"
          value={rangeStr}
          onChange={(e) => setRangeStr(e.target.value)}
          placeholder="e.g. 1-3, 5, 8-10"
          className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:border-[#00C2CB]"
        />
        <span className="text-[11px] text-slate-400">Total pages: {currentFile?.pageCount || 1}</span>
      </div>

      <button
        onClick={handleSplit}
        disabled={!currentFile || isProcessing}
        className="bg-[#00C2CB] hover:bg-[#00aeb6] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
      >
        <Scissors className="w-4 h-4" />
        <span>{isProcessing ? 'Splitting...' : 'Extract Pages'}</span>
      </button>
    </div>
  );
};
