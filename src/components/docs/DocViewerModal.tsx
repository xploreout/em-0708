import { useEffect } from 'react'
import { X, Download, ExternalLink } from 'lucide-react'
import PdfViewerModal from '../PdfViewerModal'

type DocRepo = {
  id: number
  title: string
  url: string
  file_type: string
  size_bytes: number
}

interface Props {
  doc: DocRepo
  canDownload: boolean
  onClose: () => void
}

function dlUrl(url: string) {
  return url.replace('/upload/', '/upload/fl_attachment/')
}

function ytVideoId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default function DocViewerModal({ doc, canDownload, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const { url, file_type, title } = doc

  // PDF — proxy through the server to avoid Cloudinary raw-file CORS restrictions
  if (file_type === 'application/pdf') {
    return (
      <PdfViewerModal
        url={`/api/proxy-pdf?url=${encodeURIComponent(url)}`}
        name={title}
        onClose={onClose}
        downloadUrl={canDownload ? dlUrl(url) : undefined}
        hideDownload={!canDownload}
      />
    )
  }

  // YouTube embed
  if (file_type === 'video/youtube') {
    const vid = ytVideoId(url)
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black" onClick={onClose}>
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 flex-shrink-0"
          onClick={e => e.stopPropagation()}>
          <span className="text-white text-sm font-semibold truncate max-w-xs sm:max-w-md">{title}</span>
          <div className="flex items-center gap-2 ml-2">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition">
              <ExternalLink className="w-3.5 h-3.5" /> Open on YouTube
            </a>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
          {vid ? (
            <iframe
              src={`https://www.youtube.com/embed/${vid}`}
              className="w-full max-w-4xl aspect-video rounded-lg shadow-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          ) : (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-3">Cannot embed this URL.</p>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 hover:underline text-sm">Open link →</a>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Image viewer
  if (file_type.startsWith('image/')) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.92)' }}
        onClick={onClose}>
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 flex-shrink-0"
          onClick={e => e.stopPropagation()}>
          <span className="text-white text-sm font-semibold truncate max-w-xs sm:max-w-md">{title}</span>
          <div className="flex items-center gap-2 ml-2">
            {canDownload && (
              <a href={dlUrl(url)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition">
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            )}
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto"
          onClick={e => e.stopPropagation()}>
          <img src={url} alt={title}
            className="max-w-full max-h-full object-contain rounded shadow-2xl" />
        </div>
      </div>
    )
  }

  // Audio player
  if (file_type.startsWith('audio/')) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.92)' }}
        onClick={onClose}>
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 flex-shrink-0"
          onClick={e => e.stopPropagation()}>
          <span className="text-white text-sm font-semibold truncate max-w-xs sm:max-w-md">{title}</span>
          <div className="flex items-center gap-2 ml-2">
            {canDownload && (
              <a href={dlUrl(url)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition">
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            )}
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8"
          onClick={e => e.stopPropagation()}>
          <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-lg text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-pink-400">
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
              </svg>
            </div>
            <p className="text-white font-semibold mb-4 text-sm">{title}</p>
            <audio
              src={url}
              controls
              controlsList={canDownload ? undefined : 'nodownload'}
              className="w-full"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Video player
  if (file_type.startsWith('video/')) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black" onClick={onClose}>
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 flex-shrink-0"
          onClick={e => e.stopPropagation()}>
          <span className="text-white text-sm font-semibold truncate max-w-xs sm:max-w-md">{title}</span>
          <div className="flex items-center gap-2 ml-2">
            {canDownload && (
              <a href={dlUrl(url)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition">
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            )}
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4"
          onClick={e => e.stopPropagation()}>
          <video
            src={url}
            controls
            controlsList={canDownload ? undefined : 'nodownload'}
            className="max-w-full max-h-full rounded shadow-2xl"
          />
        </div>
      </div>
    )
  }

  // PPT / Word / other — admin can download, coworker gets Google Docs Viewer
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
  const canPreview = file_type.includes('powerpoint') || file_type.includes('presentation') ||
    file_type.includes('word') || file_type.includes('document') || file_type === 'text/plain'

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 flex-shrink-0"
        onClick={e => e.stopPropagation()}>
        <span className="text-white text-sm font-semibold truncate max-w-xs sm:max-w-md">{title}</span>
        <div className="flex items-center gap-2 ml-2">
          {canDownload && (
            <a href={dlUrl(url)} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition">
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          )}
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>
        {canPreview ? (
          <iframe
            src={googleViewerUrl}
            className="w-full h-full"
            title={title}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">Preview not available for this file type.</p>
          </div>
        )}
      </div>
    </div>
  )
}
