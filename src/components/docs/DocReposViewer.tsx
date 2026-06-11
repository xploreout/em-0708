import { useState, useEffect } from 'react'
import {
  Search, X, FileText, FileImage, File, Youtube, Music, Video, Star, Eye,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import DocViewerModal from './DocViewerModal'

type DocRepo = {
  id: number
  title: string
  category: string
  owner_name: string
  url: string
  file_type: string
  size_bytes: number
  original_filename: string
  created_at: string
  updated_at: string
}

function fmtSize(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fmtDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function DocIcon({ fileType, className = 'w-5 h-5' }: { fileType: string; className?: string }) {
  if (fileType === 'video/youtube') return <Youtube className={`${className} text-red-500`} />
  if (fileType.startsWith('video/')) return <Video className={`${className} text-purple-500`} />
  if (fileType.startsWith('audio/')) return <Music className={`${className} text-pink-500`} />
  if (fileType === 'application/pdf') return <FileText className={`${className} text-red-600`} />
  if (fileType.startsWith('image/')) return <FileImage className={`${className} text-blue-500`} />
  if (fileType.includes('powerpoint') || fileType.includes('presentation'))
    return <FileText className={`${className} text-orange-500`} />
  return <File className={`${className} text-gray-400`} />
}

export default function DocReposViewer() {
  const { authFetch } = useAuth()
  const [docs, setDocs] = useState<DocRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [viewingDoc, setViewingDoc] = useState<DocRepo | null>(null)

  const categories = Array.from(new Set(docs.map(d => d.category).filter(Boolean))).sort()
  const owners     = Array.from(new Set(docs.map(d => d.owner_name).filter(Boolean))).sort()

  useEffect(() => {
    authFetch('/api/doc-repos')
      .then(r => r.json())
      .then(data => { setDocs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [authFetch])

  const q = searchQ.trim().toLowerCase()
  const filtered = q
    ? docs.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.owner_name.toLowerCase().includes(q)
      )
    : docs

  const mostRecentId = docs[0]?.id

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">

      {/* Header + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex-1">
          <h2 className="font-semibold text-gray-800 text-lg leading-tight">Doc Repos</h2>
          {!loading && (
            <p className="text-xs text-gray-400 mt-0.5">
              {filtered.length} of {docs.length} document{docs.length !== 1 ? 's' : ''} · sorted by latest update
            </p>
          )}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            className="w-full border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Filter by title, category, or owner…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
          {searchQ && (
            <button onClick={() => setSearchQ('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category / owner chips */}
      {!loading && (categories.length > 0 || owners.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {categories.map(cat => (
            <button key={cat}
              onClick={() => setSearchQ(q === cat.toLowerCase() ? '' : cat)}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition ${
                q === cat.toLowerCase()
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100'
              }`}>
              {cat}
            </button>
          ))}
          {owners.map(own => (
            <button key={own}
              onClick={() => setSearchQ(q === own.toLowerCase() ? '' : own)}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition ${
                q === own.toLowerCase()
                  ? 'bg-gray-700 text-white border-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
              }`}>
              {own}
            </button>
          ))}
        </div>
      )}

      {/* Doc list */}
      {loading ? (
        <p className="text-sm text-gray-400 py-12 text-center">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-12 text-center">
          {docs.length === 0 ? 'No documents available yet.' : 'No documents match your filter.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(doc => (
            <div key={doc.id}
              className={`bg-white border rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm hover:shadow transition ${
                doc.id === mostRecentId ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                <DocIcon fileType={doc.file_type} className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <button onClick={() => setViewingDoc(doc)}
                    className="font-semibold text-blue-700 hover:underline text-sm leading-snug text-left">
                    {doc.title}
                  </button>
                  {doc.id === mostRecentId && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">
                      <Star className="w-2.5 h-2.5" /> NEW
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                  {doc.category && (
                    <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {doc.category}
                    </span>
                  )}
                  {doc.owner_name && (
                    <span className="text-xs text-gray-500">{doc.owner_name}</span>
                  )}
                  {doc.size_bytes > 0 && (
                    <span className="text-xs text-gray-400">{fmtSize(doc.size_bytes)}</span>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <button onClick={() => setViewingDoc(doc)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition">
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <div className="text-right">
                  <div className="text-[11px] text-gray-400 leading-tight">
                    Updated {fmtDate(doc.updated_at)}
                  </div>
                  {doc.updated_at !== doc.created_at && (
                    <div className="text-[11px] text-gray-300 leading-tight">
                      Added {fmtDate(doc.created_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewingDoc && (
        <DocViewerModal
          doc={viewingDoc}
          canDownload={false}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  )
}
