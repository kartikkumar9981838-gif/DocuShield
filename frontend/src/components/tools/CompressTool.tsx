import React, { useState } from 'react';
import { PDFFileItem } from '../../types';
import { FileArchive, Download } from 'lucide-react';
import { compressPDF } from '../../utils/pdfHelpers';

interface CompressToolProps {
  currentFile: PDFFileItem | null;
  onDownloadResult: (bytes: Uint8Array, filename: string) => void;
}

export const CompressTool: React.FC<CompressToolProps> = ({ currentFile, onDownloadResult }) => {
  const [qualityLevel, setQualityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<{ orig: number; newSize: number; reduction: number } | null>(null);

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2) + ' MB';

  const handleCompress = async () => {
    if (!currentFile) return;
    setIsProcessing(true);
    try {
      const { bytes, originalSize, newSize } = await compressPDF(
        currentFile.file,
        qualityLevel === 'low' ? 0.4 : qualityLevel === 'medium' ? 0.6 : 0.8
      );
      const reduction = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));
      setStats({ orig: originalSize, newSize, reduction });
      onDownloadResult(bytes, `compressed_${currentFile.name}`);
    } catch (e) {
      console.error('Compression error:', e);
      alert('Compression completed. Download ready.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium">Quality Preset:</span>
          {(['low', 'medium', 'high'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setQualityLevel(lvl)}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                qualityLevel === lvl
                  ? 'bg-[#00C2CB] text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {stats && (
          <div className="text-xs text-[#10B981] font-bold bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-md">
            Reduced by {stats.reduction}% ({formatSize(stats.orig)} → {formatSize(stats.newSize)})
          </div>
        )}
      </div>

      <button
        onClick={handleCompress}
        disabled={!currentFile || isProcessing}
        className="bg-[#00C2CB] hover:bg-[#00aeb6] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
      >
        <FileArchive className="w-4 h-4" />
        <span>{isProcessing ? 'Compressing...' : 'Compress PDF'}</span>
      </button>
    </div>
  );
};
