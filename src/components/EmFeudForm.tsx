import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

type Answer = { text: string; points: number }
type QuestionData = { question: string; answers: Answer[] }

const STORAGE_KEY = 'emfeud_questions'

export function parseCSV(text: string): QuestionData[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length === 0) return []

  // Detect header row (last col non-numeric)
  let startRow = 0
  const firstCols = splitCSVRow(lines[0])
  if (isNaN(Number(firstCols[firstCols.length - 1].trim()))) startRow = 1

  const questions: QuestionData[] = []
  let currentQuestion = ''

  for (let r = startRow; r < lines.length; r++) {
    const cols = splitCSVRow(lines[r])
    if (cols.length < 2) continue
    const q = cols[0].trim()
    const answerText = cols[1].trim()
    const points = parseInt(cols[cols.length - 1].trim(), 10)

    // Carry-forward: blank first col means same question as previous
    if (q) currentQuestion = q
    if (!currentQuestion || !answerText || isNaN(points)) continue

    if (questions.length === 0 || questions[questions.length - 1].question !== currentQuestion) {
      questions.push({ question: currentQuestion, answers: [] })
    }
    questions[questions.length - 1].answers.push({ text: answerText, points })
  }

  return questions
}

function splitCSVRow(line: string): string[] {
  const result: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuotes = !inQuotes }
    else if (ch === ',' && !inQuotes) { result.push(cur); cur = '' }
    else { cur += ch }
  }
  result.push(cur)
  return result
}

const SAMPLE_CSV = `Question,Answer,Points
Name something people do when the sermon runs long,Check their phone,38
Name something people do when the sermon runs long,Take notes,22
Name something people do when the sermon runs long,Nap / doze off,18
Name a reason someone arrives late to Sunday service,Parking,35
Name a reason someone arrives late to Sunday service,Oversleeping,28
Name a reason someone arrives late to Sunday service,Traffic,12`

export default function EmFeudForm() {
  const [questions, setQuestions] = useState<QuestionData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setError(null)
    setSaved(false)
    if (!file.name.match(/\.(csv|txt)$/i)) {
      setError('Please upload a .csv or .txt file.')
      return
    }
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length === 0) {
        setError('No valid rows found. Check your file has 3 columns: Question, Answer, Points.')
        return
      }
      setQuestions(parsed)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function saveToGame() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
    setSaved(true)
  }

  function clearSaved() {
    localStorage.removeItem(STORAGE_KEY)
    setQuestions([])
    setSaved(false)
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'emfeud_sample.csv'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: '#be185d' }}>EM Feud</h1>
            <p className="text-gray-500 text-sm mt-0.5">Question Set Builder</p>
          </div>
          <Link
            to="/games/emfeud"
            className="px-4 py-2 rounded-full text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#ec4899,#38bdf8)' }}
          >
            ▶ Play Game
          </Link>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-black text-gray-800 mb-3">How to prepare your file</h2>
          <p className="text-sm text-gray-600 mb-3">
            Upload a <strong>.csv</strong> file with exactly <strong>3 columns</strong>. Each answer gets its own row under the same question text.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs text-gray-700 leading-relaxed overflow-x-auto">
            <div className="text-gray-400 mb-1">Question, Answer, Points</div>
            <div>Name something people do when sermon runs long, Check their phone, 38</div>
            <div>Name something people do when sermon runs long, Take notes, 22</div>
            <div>Name something people do when sermon runs long, Nap / doze off, 18</div>
            <div className="text-gray-400 mt-1">Name a reason someone arrives late, Parking, 35</div>
            <div className="text-gray-400">Name a reason someone arrives late, Oversleeping, 28</div>
          </div>
          <button
            onClick={downloadSample}
            className="mt-3 text-xs font-bold text-blue-600 hover:underline"
          >
            ↓ Download sample CSV
          </button>
        </div>

        {/* Drop zone */}
        <div
          className={`rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center py-12 px-6 mb-6 ${dragging ? 'border-pink-400 bg-pink-50' : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50/40'}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleInputChange} />
          <div className="text-4xl mb-3">{dragging ? '📂' : '📄'}</div>
          <p className="font-bold text-gray-700 text-center">Drop your CSV file here</p>
          <p className="text-sm text-gray-400 mt-1">or click to browse</p>
          {error && <p className="mt-3 text-red-500 text-sm font-semibold text-center">{error}</p>}
        </div>

        {/* Preview */}
        {questions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-black text-gray-800">
                Preview — {questions.length} question{questions.length !== 1 ? 's' : ''}
              </h2>
              <span className="text-xs text-gray-400 font-semibold">
                {questions.reduce((s, q) => s + q.answers.length, 0)} answers total
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {questions.map((q, qi) => (
                <div key={qi} className="px-6 py-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className="shrink-0 w-7 h-7 rounded-full text-xs font-black text-white flex items-center justify-center"
                      style={{ background: qi % 2 === 0 ? '#0284c7' : '#be185d' }}
                    >
                      {qi + 1}
                    </span>
                    <p className="font-bold text-gray-800 text-sm leading-snug pt-0.5">{q.question}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10">
                    {q.answers.map((a, ai) => (
                      <div key={ai} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                        <span className="text-sm text-gray-700 truncate mr-2">{a.text}</span>
                        <span className="shrink-0 text-xs font-black tabular-nums" style={{ color: qi % 2 === 0 ? '#0284c7' : '#be185d' }}>
                          {a.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={saveToGame}
                className="flex-1 py-3 rounded-2xl font-black text-white text-sm uppercase tracking-widest transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#ec4899,#38bdf8)' }}
              >
                {saved ? '✓ Saved to Game!' : '💾 Save & Use in Game'}
              </button>
              <button
                onClick={clearSaved}
                className="px-4 py-3 rounded-2xl font-bold text-sm text-gray-400 hover:text-red-500 transition-colors border border-gray-200 hover:border-red-200"
              >
                Clear
              </button>
            </div>
            {saved && (
              <div className="pb-4 text-center">
                <Link to="/games/emfeud" className="text-sm font-bold text-blue-500 hover:underline">
                  ▶ Go play with these questions →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
