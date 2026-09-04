import { useState, useEffect } from 'react'

const DailyCheckInModal = ({ isOpen, onClose, task, onSubmit, loading = false }) => {
  const [progress, setProgress] = useState(0)
  const [accomplishments, setAccomplishments] = useState('')

  useEffect(() => {
    if (task && isOpen) {
      setProgress(Number(task.progress) || 0)
      setAccomplishments('')
    }
  }, [task, isOpen])

  const handleSubmit = async () => {
    if (!accomplishments.trim()) return
    try {
      await onSubmit({
        taskId: task?.id || task?._id,
        progress,
        accomplishments: accomplishments.trim(),
        date: new Date().toISOString()
      })
      onClose()
    } catch {
      // parent handles errors
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-title"
    >
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 id="checkin-title" className="text-xl font-bold text-white">Daily Check-in</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Progress: <span className="text-purple-400">{progress}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          <div>
            <label htmlFor="accomplishments" className="block text-sm font-medium text-gray-300 mb-2">
              What did you accomplish? <span className="text-red-400">*</span>
            </label>
            <textarea
              id="accomplishments"
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              placeholder="Describe what you worked on…"
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !accomplishments.trim()}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-700/50 text-white py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                Saving…
              </>
            ) : 'Save Check-in'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DailyCheckInModal
