import { RequireAuth } from '../../context/AuthContext'

const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
const ROLES = ['Worship Leader', 'Piano', 'Guitar', 'Bass', 'Drums', 'Vocals 1', 'Vocals 2', 'Sound']

export default function PraiseTeam() {
  return (
    <RequireAuth role="praiseTeam">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Praise Team Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">Monthly rotation roster</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="px-4 py-3 text-left font-semibold w-36">Role</th>
                {WEEKS.map(w => (
                  <th key={w} className="px-4 py-3 text-center font-semibold">{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role, i) => (
                <tr key={role} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-700">{role}</td>
                  {WEEKS.map(w => (
                    <td key={w} className="px-4 py-3 text-center">
                      <div className="h-8 rounded-lg border border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition cursor-pointer" />
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
