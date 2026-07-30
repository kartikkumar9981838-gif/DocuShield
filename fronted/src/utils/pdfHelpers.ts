import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { WatermarkConfig, ESignItem, RedactionArea, TextEditItem } from '../types';

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

export async function splitPDF(file: File, pageRangesStr: string): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  const selectedPageIndices: number[] = [];

  // Parse range strings like "1-3, 5, 7-10"
  const parts = pageRangesStr.split(',').map((p) => p.trim());
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map((num) => parseInt(num.trim(), 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
          selectedPageIndices.push(i - 1);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        selectedPageIndices.push(pageNum - 1);
      }
    }
  }

  // If empty or invalid, default to page 1
  const indicesToCopy = selectedPageIndices.length > 0 ? selectedPageIndices : [0];
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, indicesToCopy);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

export async function compressPDF(
  file: File,
  qualityFactor: number = 0.7
): Promise<{ bytes: Uint8Array; originalSize: number; newSize: number }> {
  const originalSize = file.size;
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  // Save with objects compressed & unneeded streams pruned
  const bytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  const newSize = bytes.length;
  return { bytes, originalSize, newSize };
}

export async function applyWatermark(file: File, config: WatermarkConfig): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let embeddedImage: any = null;
  if (config.type === 'image' && config.imageUrl) {
    try {
      const resp = await fetch(config.imageUrl);
      const imgBuffer = await resp.arrayBuffer();
      if (config.imageUrl.includes('png') || config.imageUrl.startsWith('data:image/png')) {
        embeddedImage = await pdfDoc.embedPng(imgBuffer);
      } else {
        embeddedImage = await pdfDoc.embedJpg(imgBuffer);
      }
    } catch (e) {
      console.error('Failed to embed watermark image:', e);
    }
  }

  for (const page of pages) {
    const { width, height } = page.getSize();
    const rot = degrees(config.rotation || 0);

    if (config.type === 'text' && config.text.trim()) {
      const textSize = config.size || 48;
      const textWidth = font.widthOfTextAtSize(config.text, textSize);

      if (config.position === 'center') {
        page.drawText(config.text, {
          x: (width - textWidth) / 2,
          y: height / 2,
          size: textSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: config.opacity,
          rotate: rot,
        });
      } else if (config.position === 'top-left') {
        page.drawText(config.text, {
          x: 40,
          y: height - 60,
          size: textSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: config.opacity,
          rotate: rot,
        });
      } else if (config.position === 'bottom-right') {
        page.drawText(config.text, {
          x: width - textWidth - 40,
          y: 40,
          size: textSize,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: config.opacity,
          rotate: rot,
        });
      } else if (config.position === 'tile') {
        // Tile grid watermark
        for (let x = 40; x < width; x += textWidth + 100) {
          for (let y = 60; y < height; y += 150) {
            page.drawText(config.text, {
              x,
              y,
              size: textSize * 0.7,
              font,
              color: rgb(0.5, 0.5, 0.5),
              opacity: config.opacity,
              rotate: rot,
            });
          }
        }
      }
    } else if (embeddedImage) {
      const imgDims = embeddedImage.scale(config.size / 100 || 0.5);
      if (config.position === 'center') {
        page.drawImage(embeddedImage, {
          x: (width - imgDims.width) / 2,
          y: (height - imgDims.height) / 2,
          width: imgDims.width,
          height: imgDims.height,
          opacity: config.opacity,
          rotate: rot,
        });
      } else {
        page.drawImage(embeddedImage, {
          x: 40,
          y: height - imgDims.height - 40,
          width: imgDims.width,
          height: imgDims.height,
          opacity: config.opacity,
          rotate: rot,
        });
      }
    }
  }

  return await pdfDoc.save();
}

export async function applyESign(file: File, signatures: ESignItem[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  for (const sig of signatures) {
    if (sig.pageIndex >= 0 && sig.pageIndex < pages.length && sig.dataUrl) {
      const page = pages[sig.pageIndex];
      const { height: pageHeight } = page.getSize();

      const base64Data = sig.dataUrl.split(',')[1];
      const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

      let embeddedSig;
      if (sig.dataUrl.startsWith('data:image/png')) {
        embeddedSig = await pdfDoc.embedPng(imageBytes);
      } else {
        embeddedSig = await pdfDoc.embedJpg(imageBytes);
      }

      page.drawImage(embeddedSig, {
        x: sig.x,
        y: pageHeight - sig.y - sig.height,
        width: sig.width,
        height: sig.height,
      });
    }
  }

  return await pdfDoc.save();
}
