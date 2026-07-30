import React, { useState } from 'react';
import { PDFFileItem } from '../../types';
import { Upload, ArrowUp, ArrowDown, Trash2, Layers, Download } from 'lucide-react';
import { mergePDFs } from '../../utils/pdfHelpers';

interface MergeToolProps {
  files: PDFFileItem[];
  onAddFiles: (newFiles: File[]) => void;
  onRemoveFile: (id: string) => void;
  onReorderFiles: (files: PDFFileItem[]) => void;
  onDownloadResult: (bytes: Uint8Array, filename: string) => void;
}

export const MergeTool: React.FC<MergeToolProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onReorderFiles,
  onDownloadResult,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    const temp = newFiles[index - 1];
    newFiles[index - 1] = newFiles[index];
    newFiles[index] = temp;
    onReorderFiles(newFiles);
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    const temp = newFiles[index + 1];
    newFiles[index + 1] = newFiles[index];
    newFiles[index] = temp;
    onReorderFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      const mergedBytes = await mergePDFs(files.map((f) => f.file));
      onDownloadResult(mergedBytes, 'merged_document.pdf');
    } catch (e) {
      console.error('Merge error:', e);
      alert('Failed to merge PDFs. Please check the file contents.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3 overflow-x-auto py-1 max-w-xl">
        {files.map((f, i) => (
          <div
            key={f.id}
            className="flex items-center gap-2 bg-[#12233F]/80 text-white px-3 py-1.5 rounded-lg text-xs shrink-0 border border-slate-700"
          >
            <span className="font-bold text-[#00C2CB]">#{i + 1}</span>
            <span className="truncate max-w-[120px]">{f.name}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => moveUp(i)} disabled={i === 0} className="hover:text-[#00C2CB] disabled:opacity-30">
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveDown(i)}
                disabled={i === files.length - 1}
                className="hover:text-[#00C2CB] disabled:opacity-30"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onRemoveFile(f.id)} className="hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-colors">
          <Upload className="w-3.5 h-3.5 text-[#00C2CB]" />
          <span>Add More PDFs</span>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                onAddFiles(Array.from(e.target.files));
              }
            }}
            className="hidden"
          />
        </label>

        <button
          onClick={handleMerge}
          disabled={files.length < 2 || isProcessing}
          className="bg-[#00C2CB] hover:bg-[#00aeb6] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>{isProcessing ? 'Merging...' : `Merge ${files.length} PDFs`}</span>
        </button>
      </div>
    </div>
  );
};
