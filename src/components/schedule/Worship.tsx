import { RequireAuth } from '../../context/AuthContext'

const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
const ITEMS = ['Message Topic', 'Scripture', 'Speaker', 'AV / Slides', 'Offering', 'Announcements', 'Prayer Lead', 'Welcome']

export default function Worship() {
  return (
    <RequireAuth role="worship">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Worship Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">Sunday service planning</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-amber-500 text-white">
                <th className="px-4 py-3 text-left font-semibold w-40">Item</th>
                {WEEKS.map(w => (
                  <th key={w} className="px-4 py-3 text-center font-semibold">{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ITEMS.map((item, i) => (
                <tr key={item} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-700">{item}</td>
                  {WEEKS.map(w => (
                    <td key={w} className="px-4 py-3 text-center">
                      <div className="h-8 rounded-lg border border-dashed border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition cursor-pointer" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">Schedule editing coming soon — contact Admin to update entries.</p>
      </div>
    </RequireAuth>
  )
}
