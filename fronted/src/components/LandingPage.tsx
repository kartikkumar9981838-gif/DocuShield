import React, { useState } from 'react';
import { Logo } from './Logo';
import {
  ShieldCheck,
  Lock,
  WifiOff,
  HardDrive,
  ChevronDown,
  Layers,
  FileArchive,
  Camera,
  PenTool,
  EyeOff,
  Type,
  Stamp,
  ArrowRight,
  Check,
  Plus,
  Minus,
} from 'lucide-react';
import { ToolType } from '../types';

interface LandingPageProps {
  onOpenWorkspace: (tool?: ToolType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenWorkspace }) => {
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const capabilities = [
    {
      id: 'merge-split' as ToolType,
      title: 'Merge & Split PDFs Instantly',
      description:
        'Combine multiple PDFs into a unified document or extract specific page ranges with exact page-level precision. Completely reorder pages before exporting.',
      icon: Layers,
      svgType: 'merge',
    },
    {
      id: 'compress' as ToolType,
      title: 'Smart PDF Compression',
      description:
        'Shrink bulky PDF files for email attachments and web upload without compromising visual clarity. Real-time before and after size calculation.',
      icon: FileArchive,
      svgType: 'compress',
    },
    {
      id: 'scanner' as ToolType,
      title: 'Scan-to-PDF with Camera Capture',
      description:
        'Capture documents directly using your mobile camera or upload paper scans. Auto EXIF orientation correction, 4-corner perspective adjustment, and contrast enhancement.',
      icon: Camera,
      svgType: 'scanner',
    },
    {
      id: 'esign' as ToolType,
      title: 'Legally Compliant E-Signatures',
      description:
        'Draw your handwritten signature or generate crisp typed signatures. Drag, scale, and place signatures anywhere on any page with permanent PDF flattening.',
      icon: PenTool,
      svgType: 'esign',
    },
    {
      id: 'redact' as ToolType,
      title: 'Permanent Data Redaction & Protection',
      description:
        'Permanently scrub sensitive text, SSNs, and financials from PDF streams. PyMuPDF pixel redaction ensures underlying text is completely unrecoverable.',
      icon: EyeOff,
      svgType: 'redact',
    },
    {
      id: 'edit-text' as ToolType,
      title: 'In-Place Text Editing',
      description:
        'Detect text runs, update typos, or rewrite document text directly on the canvas with matching typography, font weight, background patch, and positioning.',
      icon: Type,
      svgType: 'edit',
    },
    {
      id: 'watermark' as ToolType,
      title: 'Custom Text & Logo Watermarking',
      description:
        'Protect intellectual property with custom text or image watermarks. Control size, opacity, angle, and grid alignment with live preview before applying.',
      icon: Stamp,
      svgType: 'watermark',
    },
  ];

  const faqs = [
    {
      q: 'Are my uploaded PDF files stored on any cloud server?',
      a: 'No. DocuShield is built with a strict zero-knowledge architecture. Client-side tools execute directly in your web browser memory using WebAssembly and Web Crypto API. Server-backed tools run statelessly in RAM and purge file streams immediately upon response output.',
    },
    {
      q: 'How does client-side PDF processing work?',
      a: 'We utilize compiled PDF engines (pdf-lib & pdf.js) directly inside your browser tab. Tasks such as merging, splitting, compressing, e-signing, and watermarking happen locally on your processor without transmitting data over the internet.',
    },
    {
      q: 'What encryption standard is used for password protection?',
      a: 'DocuShield applies genuine AES-256 (Revision 6) PDF standard encryption. Documents locked with DocuShield demand a valid password prompt in Adobe Acrobat, Google Chrome, Apple Preview, and mobile PDF readers.',
    },
    {
      q: 'Can redacted sensitive text be highlighted or recovered?',
      a: 'No. Unlike basic black box annotations that can be moved or copied, DocuShield performs true stream-level pixel scrubbing. The underlying text vectors and image pixels inside the bounding box are permanently purged from the PDF object tree.',
    },
    {
      q: 'Does Scan-to-PDF work on mobile devices?',
      a: 'Yes! Scan-to-PDF integrates with your native device camera. You can capture paper documents, adjust the 4 corner boundary points to correct perspective distortion, apply B&W contrast enhancement, and download crisp A4 PDFs.',
    },
    {
      q: 'What is the maximum file size supported?',
      a: 'DocuShield supports PDF files up to 25MB. Browser client-side operations can handle even larger files depending on your system RAM.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#1A202C]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />

          {/* Navigation items */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
            <div className="relative">
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className="flex items-center gap-1 hover:text-[#12233F] transition-colors py-2"
              >
                <span>Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {toolsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-2 z-50">
                  {capabilities.map((cap) => (
                    <button
                      key={cap.id}
                      onClick={() => {
                        setToolsDropdownOpen(false);
                        onOpenWorkspace(cap.id);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-[#1A202C] hover:bg-[#F9FAFB] hover:text-[#00C2CB] flex items-center gap-3 transition-colors"
                    >
                      <cap.icon className="w-4 h-4 text-[#00C2CB]" />
                      <span className="font-semibold">{cap.title.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a href="#how-it-works" className="hover:text-[#12233F] transition-colors">
              How It Works
            </a>
            <a href="#faq" className="hover:text-[#12233F] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Teal CTA button */}
          <button
            onClick={() => onOpenWorkspace('none')}
            className="bg-[#00C2CB] hover:bg-[#00aeb6] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Split Hero Section */}
      <section className="py-16 md:py-24 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Hero Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12233F]/5 border border-[#12233F]/10 text-xs font-semibold text-[#12233F]">
                <ShieldCheck className="w-4 h-4 text-[#00C2CB]" />
                <span>Zero-Knowledge PDF Security Platform</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#12233F] leading-tight">
                Your PDF Files Never Leave Your Device
              </h1>

              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed">
                DocuShield empowers professionals to merge, edit, e-sign, redact, and protect PDF documents directly
                in browser memory. Maximum privacy, zero upload risks, and instant performance.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() => onOpenWorkspace('none')}
                  className="bg-[#00C2CB] hover:bg-[#00aeb6] text-white font-bold text-base px-8 py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg text-center flex items-center justify-center gap-2"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <a
                  href="#how-it-works"
                  className="px-6 py-3.5 border border-[#E5E7EB] hover:border-[#12233F] text-[#1A202C] font-semibold text-base rounded-lg text-center transition-colors"
                >
                  Explore Features
                </a>
              </div>

              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#E5E7EB] text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span>100% Client-Side</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span>AES-256 Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span>Permanent Redaction</span>
                </div>
              </div>
            </div>

            {/* Hero Right Mockup Illustration */}
            <div className="relative flex justify-center">
              <div className="w-full max-w-lg bg-[#F9FAFB] p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                {/* SVG Mockup Illustration */}
                <svg viewBox="0 0 400 320" className="w-full h-auto" fill="none">
                  {/* Background Document Paper */}
                  <rect x="40" y="20" width="240" height="280" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2" />
                  {/* Header line */}
                  <rect x="70" y="50" width="120" height="12" rx="3" fill="#12233F" />
                  <rect x="70" y="74" width="80" height="8" rx="2" fill="#00C2CB" />

                  {/* Text line mockups */}
                  <rect x="70" y="100" width="180" height="6" rx="2" fill="#E5E7EB" />
                  <rect x="70" y="114" width="160" height="6" rx="2" fill="#E5E7EB" />
                  <rect x="70" y="128" width="140" height="6" rx="2" fill="#E5E7EB" />

                  {/* Redacted Bar Mockup */}
                  <rect x="70" y="148" width="120" height="14" rx="2" fill="#12233F" />

                  {/* More lines */}
                  <rect x="70" y="174" width="170" height="6" rx="2" fill="#E5E7EB" />
                  <rect x="70" y="188" width="150" height="6" rx="2" fill="#E5E7EB" />

                  {/* E-Sign Signature Line */}
                  <line x1="70" y1="240" x2="160" y2="240" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path
                    d="M 80 235 Q 95 210 110 230 T 140 220"
                    stroke="#00C2CB"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Shield Overlay Card */}
                  <g transform="translate(220, 140)">
                    <rect
                      x="0"
                      y="0"
                      width="140"
                      height="130"
                      rx="12"
                      fill="#12233F"
                      stroke="#00C2CB"
                      strokeWidth="2"
                    />
                    <path
                      d="M 70 25 C 90 40 100 55 100 75 C 100 95 85 110 70 115 C 55 110 40 95 40 75 C 40 55 50 40 70 25 Z"
                      stroke="#00C2CB"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <path
                      d="M 58 75 L 66 83 L 82 65"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text x="70" y="32" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                      LOCAL SHIELD
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternating Feature Showcase Section */}
      <section id="how-it-works" className="py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-[#12233F]">Comprehensive PDF Suite Capabilities</h2>
            <p className="text-base text-[#64748B]">
              Every tool is engineered for precision, high performance, and absolute local privacy.
            </p>
          </div>

          {capabilities.map((cap, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={cap.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white p-8 sm:p-12 rounded-2xl border border-[#E5E7EB] ${
                  !isEven ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Text Description */}
                <div className={`space-y-4 ${!isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="w-12 h-12 rounded-xl bg-[#00C2CB]/10 flex items-center justify-center text-[#00C2CB]">
                    <cap.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#12233F]">{cap.title}</h3>
                  <p className="text-base text-[#64748B] leading-relaxed">{cap.description}</p>
                  <button
                    onClick={() => onOpenWorkspace(cap.id)}
                    className="inline-flex items-center gap-2 font-semibold text-sm text-[#00C2CB] hover:text-[#00aeb6] transition-colors pt-2"
                  >
                    <span>Launch {cap.title.split(' ')[0]} Tool</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Flat Illustration / Mockup */}
                <div
                  className={`bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6 flex items-center justify-center min-h-[240px] ${
                    !isEven ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <div className="w-full max-w-xs text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#12233F] shadow-sm">
                      <cap.icon className="w-8 h-8 text-[#00C2CB]" />
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-[#E5E7EB] space-y-2 text-left shadow-xs">
                      <div className="h-3 bg-[#12233F]/10 rounded w-3/4"></div>
                      <div className="h-2 bg-[#E5E7EB] rounded w-full"></div>
                      <div className="h-2 bg-[#E5E7EB] rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & Security Full-Width Band */}
      <section className="py-16 bg-[#12233F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight">Guaranteed Privacy & Local Security</h2>
            <p className="text-slate-300 text-base">
              DocuShield process architecture ensures your sensitive contracts, tax records, and legal briefs remain strictly inside your browser environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#00C2CB]/20 flex items-center justify-center text-[#00C2CB]">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">No File Storage</h3>
              <p className="text-slate-300 text-sm">
                Files are never uploaded, logged, or cached to any cloud storage bucket. Once closed, data vanishes.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#00C2CB]/20 flex items-center justify-center text-[#00C2CB]">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Real AES Encryption</h3>
              <p className="text-slate-300 text-sm">
                Standard pikepdf AES-256 standard encryption enforces real passwords recognized by Adobe & Chrome.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#00C2CB]/20 flex items-center justify-center text-[#00C2CB]">
                <WifiOff className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Works Offline</h3>
              <p className="text-slate-300 text-sm">
                Once loaded, client tools work completely offline without active internet connectivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-[#12233F]">Frequently Asked Questions</h2>
            <p className="text-base text-[#64748B]">
              Everything you need to know about DocuShield’s privacy model and capabilities.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div key={idx} className="border border-[#E5E7EB] rounded-xl overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 bg-white hover:bg-[#F9FAFB] flex items-center justify-between font-bold text-base text-[#12233F] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <Minus className="w-5 h-5 text-[#00C2CB] shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-[#64748B] shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 bg-white text-sm text-[#64748B] leading-relaxed border-t border-[#E5E7EB]/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden sm:inline">|</span>
            <span>Privacy-first client-side PDF workspace</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#12233F] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#12233F] transition-colors">
              Security Whitepaper
            </a>
            <a href="#" className="hover:text-[#12233F] transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-[#12233F] transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
