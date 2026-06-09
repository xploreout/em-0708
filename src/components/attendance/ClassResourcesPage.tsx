import { useState, useEffect } from 'react'
import { Search, FileText, FileImage, File, Download, Clock, MapPin, Users, Archive, ChevronDown, ChevronRight, BookOpen, Youtube, Play, ExternalLink } from 'lucide-react'
import PdfViewerModal from '../PdfViewerModal'

type ClassDoc = {
  id: number; name: string; url: string; file_type: string
  size_bytes: number; created_at: string
}
type ClassWithDocs = {
  id: number; name: string; lead_name: string; description: string
  location: string; meeting_day: string; meeting_time: string; end_time: string | null
  recurrence: string; end_date: string | null; archived: boolean
  documents: ClassDoc[]
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Force Cloudinary to serve with Content-Disposition: attachment (download)
function dlUrl(url: string) {
  return url.replace('/upload/', '/upload/fl_attachment/')
}

function formatBytes(b: number) {
  if (!b) return ''
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function ytVideoId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function ytEmbedUrl(url: string): string {
  const vid = ytVideoId(url)
  if (vid) return `https://www.youtube.com/embed/${vid}?autoplay=1`
  if (url.includes('/embed/')) return url
  return url
}

function DocIcon({ type }: { type: string }) {
  if (type === 'video/youtube') return <Youtube className="w-4 h-4 text-red-500 flex-shrink-0" />
  if (type.startsWith('image/')) return <FileImage className="w-4 h-4 text-purple-500 flex-shrink-0" />
  if (type === 'application/pdf') return <FileText className="w-4 h-4 text-red-400 flex-shrink-0" />
  if (type.includes('word')) return <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
  if (type.includes('powerpoint') || type.includes('presentation')) return <FileText className="w-4 h-4 text-orange-500 flex-shrink-0" />
  if (type.includes('excel') || type.includes('spreadsheet')) return <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
  return <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
}

function ClassCard({ cls }: { cls: ClassWithDocs }) {
  const [open, setOpen] = useState(false)
  const [viewingPdf, setViewingPdf] = useState<{ url: string; name: string; downloadUrl: string } | null>(null)
  const [expandedYt, setExpandedYt] = useState<Set<number>>(new Set())

  function toggleYt(id: number) {
    setExpandedYt(prev => {
      const s = new Set(prev)
      if (s.has(id)) { s.delete(id) } else { s.add(id) }
      return s
    })
  }

  return (
    <>
    {viewingPdf && (
      <PdfViewerModal
        url={viewingPdf.url}
        name={viewingPdf.name}
        downloadUrl={viewingPdf.downloadUrl}
        onClose={() => setViewingPdf(null)}
      />
    )}
    <div className={`bg-white border rounded-lg overflow-hidden shadow-sm ${cls.archived ? 'border-dashed border-gray-200 opacity-70' : 'border-gray-200'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-base ${cls.archived ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {cls.name}
            </span>
            {cls.archived && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Archived
              </span>
            )}
            {cls.documents.length > 0 && (
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {cls.documents.length} doc{cls.documents.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {cls.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{cls.description}</p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
            {cls.lead_name && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Users className="w-3 h-3" />{cls.lead_name}
              </span>
            )}
            {cls.meeting_day && cls.meeting_time && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {cls.recurrence === 'weekly' ? `every ${cls.meeting_day}` : `${cls.meeting_day}s`}
                {' · '}{cls.meeting_time}{cls.end_time ? ` – ${cls.end_time}` : ''}
              </span>
            )}
            {cls.end_date && (
              <span className="text-xs text-gray-400">ends {fmtDate(cls.end_date)}</span>
            )}
            {cls.location && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />{cls.location}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          {cls.documents.length === 0 && (
            <span className="text-xs text-gray-300 hidden sm:block">No documents</span>
          )}
          {open
            ? <ChevronDown className="w-4 h-4 text-gray-400" />
            : <ChevronRight className="w-4 h-4 text-gray-400" />
          }
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 py-4">
          {cls.documents.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">No documents uploaded yet.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {cls.documents.map(doc => {
                const isYt  = doc.file_type === 'video/youtube'
                const isPdf = doc.file_type === 'application/pdf'
                const isImg = doc.file_type.startsWith('image/')
                const vid   = isYt ? ytVideoId(doc.url) : null

                const ytExpanded = isYt && expandedYt.has(doc.id)
                return (
                  <div key={doc.id} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                    <div className="flex items-center gap-3 px-3 py-2">
                      {vid
                        ? <img src={`https://img.youtube.com/vi/${vid}/default.jpg`} alt=""
                            onClick={() => toggleYt(doc.id)}
                            className="w-12 h-8 object-cover rounded flex-shrink-0 cursor-pointer hover:opacity-80 transition" />
                        : <DocIcon type={doc.file_type} />
                      }

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate leading-tight">{doc.name}</div>
                        {doc.size_bytes > 0 && <div className="text-xs text-gray-400">{formatBytes(doc.size_bytes)}</div>}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isYt && (
                          <>
                            <button
                              onClick={() => toggleYt(doc.id)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${ytExpanded ? 'bg-red-100 text-red-600' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                            >
                              <Play className="w-3 h-3" fill={ytExpanded ? 'currentColor' : 'none'} />
                              {ytExpanded ? 'Hide' : 'View'}
                            </button>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs transition"
                              title="Open on YouTube">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                        {isPdf && (
                          <>
                            <button
                              onClick={() => setViewingPdf({ url: `/api/proxy-pdf?url=${encodeURIComponent(doc.url)}`, name: doc.name, downloadUrl: dlUrl(doc.url) })}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                            >
                              View
                            </button>
                            <a href={dlUrl(doc.url)} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition">
                              <Download className="w-3 h-3" />
                            </a>
                          </>
                        )}
                        {isImg && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition">
                            View
                          </a>
                        )}
                        {!isYt && !isPdf && !isImg && (
                          <a href={dlUrl(doc.url)} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition">
                            <Download className="w-3 h-3" /> Download
                          </a>
                        )}
                      </div>
                    </div>
                    {ytExpanded && isYt && (
                      <div className="px-3 pb-3">
                        <div className="aspect-video w-full rounded overflow-hidden bg-black">
                          <iframe
                            src={ytEmbedUrl(doc.url)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={doc.name}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
    </>
  )
}

export default function ClassResourcesPage() {
  const [allClasses, setAllClasses] = useState<ClassWithDocs[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [query, setQuery]           = useState('')
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    fetch('/api/public/class-resources')
      .then(r => r.json())
      .then(d => { setAllClasses(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => { setError('Could not load class resources.'); setLoading(false) })
  }, [])

  const q = query.trim().toLowerCase()
  const matches = (cls: ClassWithDocs) =>
    !q ||
    cls.name.toLowerCase().includes(q) ||
    (cls.description || '').toLowerCase().includes(q) ||
    (cls.lead_name || '').toLowerCase().includes(q) ||
    (cls.location || '').toLowerCase().includes(q)

  const active   = allClasses.filter(c => !c.archived && matches(c))
  const archived = allClasses.filter(c =>  c.archived && matches(c))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 px-4 py-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Class Resources</h1>
          <p className="text-gray-500 text-base mb-6">
            Browse documents and materials shared by each class.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by class name or description…"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 transition bg-white shadow-sm"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              >×</button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-gray-400 text-center py-16">Loading…</p>
        ) : error ? (
          <p className="text-red-500 text-center py-16">{error}</p>
        ) : (
          <>
            {/* Active classes */}
            {active.length === 0 && !q ? (
              <p className="text-gray-400 text-center py-16">No classes available.</p>
            ) : active.length === 0 && q ? (
              <p className="text-gray-400 text-center py-8">No classes match "{query}".</p>
            ) : (
              <div className="flex flex-col gap-3">
                {active.map(cls => <ClassCard key={cls.id} cls={cls} />)}
              </div>
            )}

            {/* Archived section */}
            {archived.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={() => setShowArchived(s => !s)}
                  className="w-full flex items-center justify-between px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-600">
                      Archived Classes ({archived.length})
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{showArchived ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {showArchived && (
                  <div className="flex flex-col gap-3">
                    {archived.map(cls => <ClassCard key={cls.id} cls={cls} />)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
