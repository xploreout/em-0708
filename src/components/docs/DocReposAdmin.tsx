import { useState, useEffect, useRef } from 'react'
import {
  Plus, Trash2, Pencil, X, Check, Loader2, Upload, Link,
  FileText, FileImage, File, Youtube, Music, Video,
  ChevronDown, Search, Star, Eye, Download,
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

type UploadMode = 'file' | 'link'

type FormState = {
  title: string
  category: string
  owner_name: string
  url: string
}

const emptyForm = (): FormState => ({ title: '', category: '', owner_name: '', url: '' })

function UploadModal({
  onClose,
  onSaved,
  categories,
}: {
  onClose: () => void
  onSaved: (doc: DocRepo) => void
  categories: string[]
}) {
  const { authFetch } = useAuth()
  const [mode, setMode] = useState<UploadMode>('file')
  const [form, setForm] = useState<FormState>(emptyForm())
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [catOpen, setCatOpen] = useState(false)

  function set(field: keyof FormState, val: string) {
    setForm(f => ({ ...f, [field]: val }))
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (mode === 'file' && !file) { setError('Please select a file'); return }
    if (mode === 'link' && !form.url.trim()) { setError('URL is required'); return }
    setSaving(true)
    setError(null)
    try {
      let res: Response
      if (mode === 'file') {
        const fd = new FormData()
        fd.append('file', file!)
        fd.append('title', form.title.trim())
        fd.append('category', form.category.trim())
        fd.append('owner_name', form.owner_name.trim())
        res = await authFetch('/api/doc-repos', { method: 'POST', body: fd })
      } else {
        res = await authFetch('/api/doc-repos/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title.trim(),
            category: form.category.trim(),
            owner_name: form.owner_name.trim(),
            url: form.url.trim(),
          }),
        })
      }
      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch { throw new Error(`Server error (${res.status}) — ${text.slice(0, 120) || 'no response'}`) }
      if (!res.ok) throw new Error(data.error || 'Save failed')
      onSaved(data)
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Add Document</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-semibold mb-4">
          <button
            onClick={() => setMode('file')}
            className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-2 transition-colors ${
              mode === 'file' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Upload className="w-4 h-4" /> Upload File
          </button>
          <button
            onClick={() => setMode('link')}
            className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-2 border-l border-gray-200 transition-colors ${
              mode === 'link' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Link className="w-4 h-4" /> YouTube / URL
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Title *</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Document title"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
            <div className="relative">
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8"
                placeholder="e.g. Sermon, Training, Music…"
                value={form.category}
                onChange={e => { set('category', e.target.value); setCatOpen(true) }}
                onFocus={() => setCatOpen(true)}
                onBlur={() => setTimeout(() => setCatOpen(false), 150)}
              />
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
            {catOpen && categories.filter(c => c.toLowerCase().includes(form.category.toLowerCase())).length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-36 overflow-y-auto">
                {categories
                  .filter(c => c.toLowerCase().includes(form.category.toLowerCase()))
                  .map(c => (
                    <button
                      key={c}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 text-gray-700 transition"
                      onMouseDown={() => { set('category', c); setCatOpen(false) }}
                    >
                      {c}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Owner */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Doc Owner / Team</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. Worship Team, Pastor John…"
              value={form.owner_name}
              onChange={e => set('owner_name', e.target.value)}
            />
          </div>

          {/* File or URL */}
          {mode === 'file' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">File * (PDF, PPT, MP3, Video…)</label>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.ppt,.pptx,.doc,.docx,.mp3,.mp4,.mov,.avi,.wav,.ogg,.jpg,.jpeg,.png,.gif,.webp,.txt"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-lg px-4 py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition flex flex-col items-center gap-1"
              >
                <Upload className="w-5 h-5" />
                {file ? (
                  <span className="font-medium text-gray-700 text-xs truncate max-w-full">{file.name}</span>
                ) : (
                  <span>Click to select file</span>
                )}
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">YouTube or External URL *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="https://youtube.com/watch?v=…"
                value={form.url}
                onChange={e => set('url', e.target.value)}
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-600 mt-2">{error}</p>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditModal({
  doc,
  onClose,
  onSaved,
  categories,
}: {
  doc: DocRepo
  onClose: () => void
  onSaved: (d: DocRepo) => void
  categories: string[]
}) {
  const { authFetch } = useAuth()
  const [form, setForm] = useState<FormState>({
    title: doc.title,
    category: doc.category,
    owner_name: doc.owner_name,
    url: doc.url,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [catOpen, setCatOpen] = useState(false)

  function set(field: keyof FormState, val: string) {
    setForm(f => ({ ...f, [field]: val }))
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await authFetch(`/api/doc-repos/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, category: form.category, owner_name: form.owner_name }),
      })
      const text = await res.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch { throw new Error(`Server error (${res.status}) — ${text.slice(0, 120) || 'no response'}`) }
      if (!res.ok) throw new Error(data.error || 'Save failed')
      onSaved(data)
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Edit Document</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Title *</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
            <div className="relative">
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8"
                value={form.category}
                onChange={e => { set('category', e.target.value); setCatOpen(true) }}
                onFocus={() => setCatOpen(true)}
                onBlur={() => setTimeout(() => setCatOpen(false), 150)}
              />
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
            {catOpen && categories.filter(c => c.toLowerCase().includes(form.category.toLowerCase())).length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-36 overflow-y-auto">
                {categories
                  .filter(c => c.toLowerCase().includes(form.category.toLowerCase()))
                  .map(c => (
                    <button key={c} className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 text-gray-700 transition"
                      onMouseDown={() => { set('category', c); setCatOpen(false) }}
                    >{c}</button>
                  ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Doc Owner / Team</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.owner_name}
              onChange={e => set('owner_name', e.target.value)}
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function adminDlUrl(url: string) {
  return url.replace('/upload/', '/upload/fl_attachment/')
}

export default function DocReposAdmin() {
  const { authFetch } = useAuth()
  const [docs, setDocs] = useState<DocRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [editDoc, setEditDoc] = useState<DocRepo | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [viewingDoc, setViewingDoc] = useState<DocRepo | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [searchQ, setSearchQ] = useState('')

  const categories = Array.from(new Set(docs.map(d => d.category).filter(Boolean))).sort()

  useEffect(() => {
    authFetch('/api/doc-repos')
      .then(r => r.json())
      .then(data => { setDocs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [authFetch])

  function showFlash(msg: string) {
    setFlash(msg)
    setTimeout(() => setFlash(null), 3000)
  }

  async function handleDelete(id: number) {
    try {
      const r = await authFetch(`/api/doc-repos/${id}`, { method: 'DELETE' })
      if (r.ok) {
        setDocs(prev => prev.filter(d => d.id !== id))
        showFlash('Document deleted.')
      }
    } catch {
      showFlash('Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 pt-2">
        <div className="flex-1">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Doc Repos</h2>
          {!loading && (
            <p className="text-xs text-gray-400 mt-0.5">
              {filtered.length} of {docs.length} document{docs.length !== 1 ? 's' : ''} · sorted by latest update
            </p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              className="w-56 border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Filter by title, category, owner…"
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
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Document
          </button>
        </div>
      </div>

      {flash && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-2 rounded-lg mb-3">
          <Check className="w-4 h-4" /> {flash}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">
          {docs.length === 0 ? 'No documents yet. Add one above.' : 'No results match your search.'}
        </p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-blue-600 border-b border-blue-700">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-blue-100 uppercase tracking-wider">Document</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-blue-100 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-blue-100 uppercase tracking-wider">Owner</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-blue-100 uppercase tracking-wider">Uploaded</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-blue-100 uppercase tracking-wider">Last Updated</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-blue-100 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc, idx) => (
                  <tr
                    key={doc.id}
                    className={`border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors ${
                      doc.id === mostRecentId ? 'ring-1 ring-inset ring-blue-200' : ''
                    }`}
                  >
                    <td className="px-4 py-3 align-top min-w-[200px]">
                      <div className="flex items-start gap-2">
                        <DocIcon fileType={doc.file_type} />
                        <div>
                          <button
                            onClick={() => setViewingDoc(doc)}
                            className="font-semibold text-blue-700 hover:underline text-sm leading-snug text-left"
                          >
                            {doc.title}
                          </button>
                          {doc.id === mostRecentId && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">
                              <Star className="w-2.5 h-2.5" /> NEW
                            </span>
                          )}
                          {doc.size_bytes > 0 && (
                            <div className="text-xs text-gray-400 mt-0.5">{fmtSize(doc.size_bytes)}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {doc.category
                        ? <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">{doc.category}</span>
                        : <span className="text-xs text-gray-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 align-top text-sm text-gray-700">
                      {doc.owner_name || <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-500 whitespace-nowrap">
                      {fmtDate(doc.created_at)}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-500 whitespace-nowrap">
                      {fmtDate(doc.updated_at)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => setViewingDoc(doc)} title="View"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {doc.file_type !== 'video/youtube' && (
                          <a href={adminDlUrl(doc.url)} target="_blank" rel="noopener noreferrer"
                            title="Download"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button onClick={() => setEditDoc(doc)} title="Edit"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeletingId(doc.id)} title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-100 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSaved={doc => setDocs(prev => [doc, ...prev])}
          categories={categories}
        />
      )}

      {editDoc && (
        <EditModal
          doc={editDoc}
          onClose={() => setEditDoc(null)}
          onSaved={updated => setDocs(prev => prev.map(d => d.id === updated.id ? updated : d))}
          categories={categories}
        />
      )}

      {deletingId !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4"
          onClick={() => setDeletingId(null)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-gray-800">Delete Document</h3>
            </div>
            <p className="text-sm text-gray-600 mb-5">This will permanently remove the document from the list.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-lg border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={() => handleDelete(deletingId!)}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingDoc && (
        <DocViewerModal
          doc={viewingDoc}
          canDownload={true}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  )
}
