export type ViewMode = 'landing' | 'workspace';

export type ToolType =
  | 'none'
  | 'merge'
  | 'split'
  | 'compress'
  | 'scanner'
  | 'esign'
  | 'watermark'
  | 'redact'
  | 'edit-text'
  | 'password';

export interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  arrayBuffer?: ArrayBuffer;
}

export interface WatermarkConfig {
  type: 'text' | 'image';
  text: string;
  imageUrl: string;
  size: number;
  opacity: number;
  rotation: number;
  position: 'center' | 'top-left' | 'bottom-right' | 'tile';
}

export interface RedactionArea {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextEditItem {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  originalText: string;
  newText: string;
  fontSize: number;
  fontColor: string;
}

export interface ESignItem {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
}

export interface ScanCorner {
  x: number;
  y: number;
}
