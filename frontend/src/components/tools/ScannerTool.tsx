import React, { useState } from 'react';
import { Camera, Upload, Check, Download } from 'lucide-react';

interface ScannerToolProps {
  onImageSelected: (src: string, file: File) => void;
  onProcessScanBackend: (file: File, mode: string, brightness: number, contrast: number) => Promise<void>;
  isProcessing: boolean;
}

export const ScannerTool: React.FC<ScannerToolProps> = ({
  onImageSelected,
  onProcessScanBackend,
  isProcessing,
}) => {
  const [scanMode, setScanMode] = useState<'color' | 'bw'>('color');
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.2);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      onImageSelected(url, file);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Upload File / Live Camera Capture */}
        <label className="cursor-pointer bg-[#00C2CB] hover:bg-[#00aeb6] text-white text-xs px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-sm">
          <Camera className="w-4 h-4" />
          <span>Camera / Upload Image</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Scan Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium">Filter:</span>
          <button
            onClick={() => setScanMode('color')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              scanMode === 'color' ? 'bg-[#00C2CB] text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Enhanced Color
          </button>
          <button
            onClick={() => setScanMode('bw')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              scanMode === 'bw' ? 'bg-[#00C2CB] text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            B&W Document
          </button>
        </div>
      </div>

      <button
        onClick={() => {
          if (selectedFile) {
            onProcessScanBackend(selectedFile, scanMode, brightness, contrast);
          } else {
            alert('Please upload or capture a document image first.');
          }
        }}
        disabled={!selectedFile || isProcessing}
        className="bg-[#10B981] hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
      >
        <Download className="w-4 h-4" />
        <span>{isProcessing ? 'Processing Scan...' : 'Convert & Download PDF'}</span>
      </button>
    </div>
  );
};
