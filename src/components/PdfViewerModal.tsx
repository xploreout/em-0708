import { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface Props {
  url: string
  name: string
  onClose: () => void
  downloadUrl?: string
  hideDownload?: boolean
}

export default function PdfViewerModal({ url, name, onClose, downloadUrl, hideDownload }: Props) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pageWidth, setPageWidth] = useState(600)

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setPageWidth(Math.min(containerRef.current.clientWidth - 32, 850))
      }
    }
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const dlLink = downloadUrl ?? url.replace('/upload/', '/upload/fl_attachment/')

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.92)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 flex-shrink-0">
        <span className="text-white text-sm font-semibold truncate max-w-xs sm:max-w-sm">{name}</span>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {!hideDownload && (
            <a
              href={dlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF scrollable area */}
      <div ref={containerRef} className="flex-1 overflow-auto py-4 flex flex-col items-center">
        <Document
          file={url}
          onLoadSuccess={({ numPages: n }) => { setNumPages(n); setPageNumber(1) }}
          loading={<p className="text-gray-400 text-sm mt-20">Loading PDF…</p>}
          error={<p className="text-red-400 text-sm mt-20">Failed to load PDF. Try downloading instead.</p>}
        >
          <Page
            pageNumber={pageNumber}
            width={Math.round(pageWidth * scale)}
            renderTextLayer
            renderAnnotationLayer
            className="shadow-2xl"
          />
        </Document>
      </div>

      {/* Footer: zoom + pagination */}
      {numPages > 0 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 border-t border-gray-700 flex-shrink-0">
          <button
            onClick={() => setScale(s => Math.max(0.5, +(s - 0.25).toFixed(2)))}
            disabled={scale <= 0.5}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition disabled:opacity-30"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-gray-400 text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(s => Math.min(3.0, +(s + 0.25).toFixed(2)))}
            disabled={scale >= 3.0}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition disabled:opacity-30"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-600 mx-2" />

          <button
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition disabled:opacity-30"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-gray-300 text-xs min-w-[4rem] text-center">
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition disabled:opacity-30"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
