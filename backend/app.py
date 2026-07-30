import io
import json
import os
import math
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import pikepdf
except ImportError:
    pikepdf = None

try:
    from PIL import Image, ImageOps, ImageEnhance
    import numpy as np
except ImportError:
    Image = None
    np = None

app = FastAPI(title="DocuShield API", description="Privacy-first PDF Security & Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB

def check_file_size(content: bytes):
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the 25MB limit.")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/add-password")
async def add_password(
    file: UploadFile = File(...),
    password: str = Form(...)
):
    if not password:
        raise HTTPException(status_code=400, detail="Password is required.")
    
    content = await file.read()
    check_file_size(content)
    
    if pikepdf is None:
        raise HTTPException(status_code=500, detail="pikepdf library is not installed on server.")

    try:
        pdf = pikepdf.Pdf.open(io.BytesIO(content))
        out_buf = io.BytesIO()
        encryption = pikepdf.Encryption(owner=password, user=password, R=6)
        pdf.save(out_buf, encryption=encryption)
        pdf.close()
        out_buf.seek(0)
        return Response(
            content=out_buf.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="encrypted_{file.filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add password: {str(e)}")

@app.post("/remove-password")
async def remove_password(
    file: UploadFile = File(...),
    password: str = Form(...)
):
    content = await file.read()
    check_file_size(content)
    
    if pikepdf is None:
        raise HTTPException(status_code=500, detail="pikepdf library is not installed on server.")

    try:
        pdf = pikepdf.Pdf.open(io.BytesIO(content), password=password)
        out_buf = io.BytesIO()
        pdf.save(out_buf)
        pdf.close()
        out_buf.seek(0)
        return Response(
            content=out_buf.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="unlocked_{file.filename}"'}
        )
    except pikepdf.PasswordError:
        raise HTTPException(status_code=400, detail="Incorrect password provided.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove password: {str(e)}")

@app.post("/redact")
async def redact_pdf(
    file: UploadFile = File(...),
    redactions: str = Form(...)  # JSON string of [{pageIndex: int, x: float, y: float, width: float, height: float}]
):
    content = await file.read()
    check_file_size(content)
    
    if fitz is None:
        raise HTTPException(status_code=500, detail="PyMuPDF library is not installed on server.")

    try:
        redact_list = json.loads(redactions)
        doc = fitz.open(stream=content, filetype="pdf")
        
        for item in redact_list:
            page_idx = item.get("pageIndex", 0)
            if 0 <= page_idx < len(doc):
                page = doc[page_idx]
                rect = fitz.Rect(
                    item.get("x", 0),
                    item.get("y", 0),
                    item.get("x", 0) + item.get("width", 0),
                    item.get("y", 0) + item.get("height", 0)
                )
                page.add_redact_annot(rect, fill=(0, 0, 0))
                page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_PIXELS)
                
        out_buf = doc.tobytes()
        doc.close()
        return Response(
            content=out_buf,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="redacted_{file.filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process redactions: {str(e)}")

@app.post("/edit-text")
async def edit_text_pdf(
    file: UploadFile = File(...),
    edits: str = Form(...)  # JSON string of [{pageIndex, x, y, width, height, newText, fontSize, fontColor}]
):
    content = await file.read()
    check_file_size(content)
    
    if fitz is None:
        raise HTTPException(status_code=500, detail="PyMuPDF library is not installed on server.")

    try:
        edit_list = json.loads(edits)
        doc = fitz.open(stream=content, filetype="pdf")
        
        for item in edit_list:
            page_idx = item.get("pageIndex", 0)
            if 0 <= page_idx < len(doc):
                page = doc[page_idx]
                x = item.get("x", 0)
                y = item.get("y", 0)
                w = item.get("width", 50)
                h = item.get("height", 20)
                rect = fitz.Rect(x, y, x + w, y + h)
                
                # Sample background color or default to white
                page.add_redact_annot(rect, fill=(1, 1, 1))
                page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_PIXELS)
                
                new_text = item.get("newText", "")
                font_size = item.get("fontSize", 12)
                
                # Insert replacement text
                page.insert_text(
                    fitz.Point(x, y + font_size * 0.8),
                    new_text,
                    fontsize=font_size,
                    color=(0, 0, 0)
                )
                
        out_buf = doc.tobytes()
        doc.close()
        return Response(
            content=out_buf,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="edited_{file.filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to edit text: {str(e)}")

def find_coefficients(pa, pb):
    matrix = []
    for p1, p2 in zip(pa, pb):
        matrix.append([p1[0], p1[1], 1, 0, 0, 0, -p2[0]*p1[0], -p2[0]*p1[1]])
        matrix.append([0, 0, 0, 1, p1[1], p1[1], -p2[1]*p1[0], -p2[1]*p1[1]])
    A = np.matrix(matrix, dtype=float)
    B = np.array(pb).reshape(8, 1)
    res = np.dot(np.linalg.inv(A), B)
    return np.array(res).reshape(8)

@app.post("/scan-document")
async def scan_document(
    file: UploadFile = File(...),
    corners: Optional[str] = Form(None),  # JSON [{x, y}, ...]
    mode: str = Form("color"),
    brightness: float = Form(1.0),
    contrast: float = Form(1.2)
):
    content = await file.read()
    check_file_size(content)
    
    if Image is None or fitz is None:
        raise HTTPException(status_code=500, detail="Image processing libraries not installed on server.")

    try:
        img = Image.open(io.BytesIO(content))
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        
        orig_w, orig_h = img.size
        
        if corners:
            pts = json.loads(corners) # expect 4 points [TL, TR, BR, BL]
            if len(pts) == 4:
                # Target A4 dimensions ~1240x1754
                target_w, target_h = 1240, 1754
                src_pts = [(p["x"], p["y"]) for p in pts]
                dst_pts = [(0, 0), (target_w, 0), (target_w, target_h), (0, target_h)]
                
                # Homography using PIL perspective transform
                # PIL transform coefficients maps destination pixel (x,y) to source pixel (x',y')
                def get_coeffs(pa, pb):
                    # pa is dst, pb is src
                    matrix = []
                    for p1, p2 in zip(pa, pb):
                        matrix.append([p1[0], p1[1], 1, 0, 0, 0, -p2[0]*p1[0], -p2[0]*p1[1]])
                        matrix.append([0, 0, 0, 1, p1[0], p1[1], -p2[1]*p1[0], -p2[1]*p1[1]])
                    A = np.matrix(matrix, dtype=float)
                    B = np.array(pb).reshape(8, 1)
                    res = np.dot(np.linalg.pinv(A), B)
                    return np.array(res).reshape(8)
                
                coeffs = get_coeffs(dst_pts, src_pts)
                img = img.transform((target_w, target_h), Image.PERSPECTIVE, coeffs, resample=Image.BICUBIC)
        
        # Enhancement
        if mode == "bw":
            img = img.convert("L")
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(contrast * 1.5)
            # Thresholding
            threshold = 140
            img = img.point(lambda p: 255 if p > threshold else 0).convert("RGB")
        else:
            if brightness != 1.0:
                img = ImageEnhance.Brightness(img).enhance(brightness)
            if contrast != 1.0:
                img = ImageEnhance.Contrast(img).enhance(contrast)
                
        # Convert to PDF page
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="PDF")
        pdf_data = img_bytes.getvalue()
        
        return Response(
            content=pdf_data,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="scanned_doc.pdf"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scan document: {str(e)}")

# Mount static files in production if dist directory exists
dist_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
