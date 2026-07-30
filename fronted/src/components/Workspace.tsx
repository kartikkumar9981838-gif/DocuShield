import React, { useState, useRef } from 'react';
import { Logo } from './Logo';
import { PdfViewer } from './PdfViewer';
import {
  ToolType,
  PDFFileItem,
  WatermarkConfig,
  RedactionArea,
  TextEditItem,
  ESignItem,
  ScanCorner,
} from '../types';
import {
  ArrowLeft,
  Upload,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Layers,
  Scissors,
  FileArchive,
  Camera,
  PenTool,
  Stamp,
  EyeOff,
  Type,
  Lock,
  RefreshCw,
  FileText,
} from 'lucide-react';

import { MergeTool } from './tools/MergeTool';
import { SplitTool } from './tools/SplitTool';
import { CompressTool } from './tools/CompressTool';
import { ScannerTool } from './tools/ScannerTool';
import { ESignTool } from './tools/ESignTool';
import { WatermarkTool } from './tools/WatermarkTool';
import { RedactTool } from './tools/RedactTool';
import { EditTextTool } from './tools/EditTextTool';
import { PasswordTool } from './tools/PasswordTool';

import { applyWatermark, applyESign } from '../utils/pdfHelpers';

interface WorkspaceProps {
  initialTool?: ToolType;
  onBackToHome: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ initialTool = 'none', onBackToHome }) => {
  const [activeTool, setActiveTool] = useState<ToolType>(initialTool);
  const [files, setFiles] = useState<PDFFileItem[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.0);

  const [isProcessing, setIsProcessing] = useState(false);

  // Watermark State
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({
    type: 'text',
    text: 'CONFIDENTIAL',
    imageUrl: '',
    size: 48,
    opacity: 0.3,
    rotation: -45,
    position: 'center',
  });
  const [showWatermarkPreview, setShowWatermarkPreview] = useState(false);

  // Redaction State
  const [redactions, setRedactions] = useState<RedactionArea[]>([]);

  // Text Edit State
  const [textEdits, setTextEdits] = useState<TextEditItem[]>([]);

  // E-Sign State
  const [signatures, setSignatures] = useState<ESignItem[]>([]);

  // Scanner State
  const [scanImageSrc, setScanImageSrc] = useState<string | null>(null);
  const [scanImageFile, setScanImageFile] = useState<File | null>(null);
  const [scanCorners, setScanCorners] = useState<ScanCorner[]>([
    { x: 10, y: 10 },
    { x: 90, y: 10 },
    { x: 90, y: 90 },
    { x: 10, y: 90 },
  ]);

  const currentFile = files[currentFileIndex] || null;

  // Upload PDF files handler
  const handleFileUpload = async (uploadedFiles: FileList | File[]) => {
    const newItems: PDFFileItem[] = [];
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const buffer = await file.arrayBuffer();
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          size: file.size,
          pageCount: 1,
          arrayBuffer: buffer,
        });
      }
    }

    if (newItems.length > 0) {
      setFiles((prev) => [...prev, ...newItems]);
      if (files.length === 0) {
        setCurrentFileIndex(0);
        setCurrentPage(1);
      }
    }
  };

  const downloadBytes = (bytes: Uint8Array, filename: string) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Backend Calls using fetch relative endpoints
  const handleAddPasswordBackend = async (password: string) => {
    if (!currentFile) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', currentFile.file);
      formData.append('password', password);

      const resp = await fetch('/add-password', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const errJson = await resp.json();
        throw new Error(errJson.detail || errJson.error || 'Failed to encrypt PDF.');
      }

      const blob = await resp.blob();
      const arrayBuffer = await blob.arrayBuffer();
      downloadBytes(new Uint8Array(arrayBuffer), `encrypted_${currentFile.name}`);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePasswordBackend = async (password: string) => {
    if (!currentFile) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', currentFile.file);
      formData.append('password', password);

      const resp = await fetch('/remove-password', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const errJson = await resp.json();
        throw new Error(errJson.detail || errJson.error || 'Failed to remove password.');
      }

      const blob = await resp.blob();
      const arrayBuffer = await blob.arrayBuffer();
      downloadBytes(new Uint8Array(arrayBuffer), `unlocked_${currentFile.name}`);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyRedactionsBackend = async () => {
    if (!currentFile || redactions.length === 0) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', currentFile.file);
      formData.append('redactions', JSON.stringify(redactions));

      const resp = await fetch('/redact', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const errJson = await resp.json();
        throw new Error(errJson.detail || errJson.error || 'Failed to apply redactions.');
      }

      const blob = await resp.blob();
      const arrayBuffer = await blob.arrayBuffer();
      downloadBytes(new Uint8Array(arrayBuffer), `redacted_${currentFile.name}`);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyEditsBackend = async () => {
    if (!currentFile || textEdits.length === 0) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', currentFile.file);
      formData.append('edits', JSON.stringify(textEdits));

      const resp = await fetch('/edit-text', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const errJson = await resp.json();
        throw new Error(errJson.detail || errJson.error || 'Failed to save edits.');
      }

      const blob = await resp.blob();
      const arrayBuffer = await blob.arrayBuffer();
      downloadBytes(new Uint8Array(arrayBuffer), `edited_${currentFile.name}`);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessScanBackend = async (
    file: File,
    mode: string,
    brightness: number,
    contrast: number
  ) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('corners', JSON.stringify(scanCorners));
      formData.append('mode', mode);
      formData.append('brightness', brightness.toString());
      formData.append('contrast', contrast.toString());

      const resp = await fetch('/scan-document', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const errJson = await resp.json();
        throw new Error(errJson.detail || errJson.error || 'Failed to process scan.');
      }

      const blob = await resp.blob();
      const arrayBuffer = await blob.arrayBuffer();
      downloadBytes(new Uint8Array(arrayBuffer), 'scanned_document.pdf');
    } catch (e: any) {
      alert(`Error processing scan: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyWatermarkClient = async () => {
    if (!currentFile) return;
    setIsProcessing(true);
    try {
      const bytes = await applyWatermark(currentFile.file, watermarkConfig);
      downloadBytes(bytes, `watermarked_${currentFile.name}`);
    } catch (e) {
      console.error(e);
      alert('Failed to apply watermark.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplySignaturesClient = async () => {
    if (!currentFile || signatures.length === 0) return;
    setIsProcessing(true);
    try {
      const bytes = await applyESign(currentFile.file, signatures);
      downloadBytes(bytes, `signed_${currentFile.name}`);
    } catch (e) {
      console.error(e);
      alert('Failed to apply signatures.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#1A202C]">
      {/* Layer 1: Fixed Thin Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] h-14 px-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="p-1.5 rounded-lg hover:bg-[#F9FAFB] text-[#64748B] hover:text-[#12233F] transition-colors"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <Logo size="sm" />

          {currentFile && (
            <div className="hidden sm:flex items-center gap-2 text-xs border-l border-[#E5E7EB] pl-4 text-[#64748B]">
              <FileText className="w-4 h-4 text-[#00C2CB]" />
              <span className="font-semibold text-[#1A202C] truncate max-w-[180px]">
                {currentFile.name}
              </span>
              <span>({(currentFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>
          )}
        </div>

        {/* Page Navigation & Zoom Controls */}
        {currentFile && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-2 py-1 text-xs">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="hover:text-[#00C2CB] disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-[#12233F] min-w-[50px] text-center">
                {currentPage} / {numPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="hover:text-[#00C2CB] disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="hidden md:flex items-center gap-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-2 py-1 text-xs">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                className="hover:text-[#00C2CB]"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-semibold w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
                className="hover:text-[#00C2CB]"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {currentFile.arrayBuffer && (
              <button
                onClick={() => downloadBytes(new Uint8Array(currentFile.arrayBuffer!), currentFile.name)}
                className="bg-[#00C2CB] hover:bg-[#00aeb6] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Layer 2: Center Stage (Scrollable area with bottom padding = toolbar height pb-24) */}
      <main className="flex-1 p-4 sm:p-8 flex items-center justify-center overflow-auto pb-28">
        {!currentFile && activeTool !== 'scanner' ? (
          /* Upload Drop Zone */
          <div className="max-w-md w-full bg-white border-2 border-dashed border-[#E5E7EB] hover:border-[#00C2CB] rounded-2xl p-8 text-center space-y-4 shadow-sm transition-colors">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00C2CB]/10 flex items-center justify-center text-[#00C2CB]">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#12233F]">Select or Drop PDF Files</h2>
              <p className="text-xs text-[#64748B]">Files stay 100% local in your browser memory.</p>
            </div>

            <label className="inline-block cursor-pointer bg-[#00C2CB] hover:bg-[#00aeb6] text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-sm transition-colors">
              <span>Choose PDF File</span>
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => {
                  if (e.target.files) handleFileUpload(e.target.files);
                }}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          /* PDF Page Renderer Stage */
          <div className="flex flex-col items-center">
            <PdfViewer
              arrayBuffer={currentFile?.arrayBuffer || null}
              currentPage={currentPage}
              zoom={zoom}
              activeTool={activeTool}
              watermarkConfig={watermarkConfig}
              showWatermarkPreview={showWatermarkPreview}
              redactions={redactions}
              textEdits={textEdits}
              signatures={signatures}
              scanCorners={scanCorners}
              scanImageSrc={scanImageSrc}
              onAddRedaction={(area) =>
                setRedactions((prev) => [
                  ...prev,
                  { ...area, id: Math.random().toString(36).substring(2, 9) },
                ])
              }
              onRemoveRedaction={(id) => setRedactions((prev) => prev.filter((r) => r.id !== id))}
              onAddTextEdit={(item) =>
                setTextEdits((prev) => [
                  ...prev,
                  { ...item, id: Math.random().toString(36).substring(2, 9) },
                ])
              }
              onUpdateTextEdit={(id, updates) =>
                setTextEdits((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
              }
              onRemoveTextEdit={(id) => setTextEdits((prev) => prev.filter((t) => t.id !== id))}
              onUpdateSignature={(id, updates) =>
                setSignatures((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
              }
              onRemoveSignature={(id) => setSignatures((prev) => prev.filter((s) => s.id !== id))}
              onUpdateScanCorner={(idx, pt) =>
                setScanCorners((prev) => {
                  const updated = [...prev];
                  updated[idx] = pt;
                  return updated;
                })
              }
              onNumPagesLoaded={(num) => setNumPages(num)}
            />
          </div>
        )}
      </main>

      {/* Layer 3: Sticky Bottom Toolbar (position: fixed, bottom-0, left-0, right-0, height ~64px-72px, always visible) */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#12233F] text-white border-t border-slate-800 shadow-2xl px-4 py-3 flex items-center justify-center min-h-[64px]">
        {activeTool === 'none' ? (
          /* Main Tool Palette Icons */
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto max-w-7xl mx-auto py-1">
            {[
              { id: 'merge', label: 'Merge', icon: Layers },
              { id: 'split', label: 'Split', icon: Scissors },
              { id: 'compress', label: 'Compress', icon: FileArchive },
              { id: 'scanner', label: 'Scanner', icon: Camera },
              { id: 'esign', label: 'E-Sign', icon: PenTool },
              { id: 'watermark', label: 'Watermark', icon: Stamp },
              { id: 'redact', label: 'Redact', icon: EyeOff },
              { id: 'edit-text', label: 'Edit PDF', icon: Type },
              { id: 'password', label: 'Password', icon: Lock },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as ToolType)}
                className="flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-[#00C2CB] transition-colors shrink-0"
              >
                <tool.icon className="w-5 h-5 text-[#00C2CB]" />
                <span className="text-[11px] font-semibold">{tool.label}</span>
              </button>
            ))}
          </div>
        ) : (
          /* Active Tool Sub-Panel Control with Back Button */
          <div className="w-full max-w-7xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setActiveTool('none')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg font-bold flex items-center gap-1 shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#00C2CB]" />
              <span>Back</span>
            </button>

            <div className="flex-1 overflow-x-auto">
              {activeTool === 'merge' && (
                <MergeTool
                  files={files}
                  onAddFiles={(newFiles) => handleFileUpload(newFiles)}
                  onRemoveFile={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
                  onReorderFiles={(reordered) => setFiles(reordered)}
                  onDownloadResult={(bytes, filename) => downloadBytes(bytes, filename)}
                />
              )}

              {activeTool === 'split' && (
                <SplitTool
                  currentFile={currentFile}
                  onDownloadResult={(bytes, filename) => downloadBytes(bytes, filename)}
                />
              )}

              {activeTool === 'compress' && (
                <CompressTool
                  currentFile={currentFile}
                  onDownloadResult={(bytes, filename) => downloadBytes(bytes, filename)}
                />
              )}

              {activeTool === 'scanner' && (
                <ScannerTool
                  onImageSelected={(src, file) => {
                    setScanImageSrc(src);
                    setScanImageFile(file);
                  }}
                  onProcessScanBackend={handleProcessScanBackend}
                  isProcessing={isProcessing}
                />
              )}

              {activeTool === 'esign' && (
                <ESignTool
                  currentPage={currentPage}
                  onAddSignature={(sig) =>
                    setSignatures((prev) => [
                      ...prev,
                      { ...sig, id: Math.random().toString(36).substring(2, 9) },
                    ])
                  }
                  onApplyAllSignatures={handleApplySignaturesClient}
                  hasSignatures={signatures.length > 0}
                  isProcessing={isProcessing}
                />
              )}

              {activeTool === 'watermark' && (
                <WatermarkTool
                  config={watermarkConfig}
                  showPreview={showWatermarkPreview}
                  onUpdateConfig={(updates) =>
                    setWatermarkConfig((prev) => ({ ...prev, ...updates }))
                  }
                  onTogglePreview={() => setShowWatermarkPreview((prev) => !prev)}
                  onApplyWatermark={handleApplyWatermarkClient}
                  isProcessing={isProcessing}
                />
              )}

              {activeTool === 'redact' && (
                <RedactTool
                  redactions={redactions}
                  onClearAllRedactions={() => setRedactions([])}
                  onApplyRedactionsBackend={handleApplyRedactionsBackend}
                  isProcessing={isProcessing}
                />
              )}

              {activeTool === 'edit-text' && (
                <EditTextTool
                  textEdits={textEdits}
                  onClearAllEdits={() => setTextEdits([])}
                  onApplyEditsBackend={handleApplyEditsBackend}
                  isProcessing={isProcessing}
                />
              )}

              {activeTool === 'password' && (
                <PasswordTool
                  onAddPassword={handleAddPasswordBackend}
                  onRemovePassword={handleRemovePasswordBackend}
                  isProcessing={isProcessing}
                />
              )}
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};
