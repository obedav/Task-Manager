const CreateTaskModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    onSubmit({
      title:          fd.get('title')?.toString().trim() ?? '',
      description:    fd.get('description')?.toString().trim() ?? '',
      priority:       fd.get('priority')?.toString() ?? 'medium',
      dueDate:        fd.get('dueDate')?.toString() || null,
      category:       fd.get('category')?.toString().trim() ?? '',
      estimatedHours: fd.get('estimatedHours') ? parseFloat(fd.get('estimatedHours').toString()) : null
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 id="create-task-title" className="text-xl font-bold text-white">Create New Task</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="ct-title" className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
            <input
              id="ct-title"
              name="title"
              type="text"
              required
              placeholder="Enter task title…"
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="ct-desc" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              id="ct-desc"
              name="description"
              rows={3}
              placeholder="Add task description…"
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ct-priority" className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
              <select
                id="ct-priority"
                name="priority"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="ct-category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <input
                id="ct-category"
                name="category"
                type="text"
                placeholder="e.g. Work, Personal"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ct-due" className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
              <input
                id="ct-due"
                name="dueDate"
                type="date"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="ct-hours" className="block text-sm font-medium text-gray-300 mb-1">Est. Hours</label>
              <input
                id="ct-hours"
                name="estimatedHours"
                type="number"
                step="0.5"
                min="0"
                placeholder="e.g. 4"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-xl transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white py-3 px-4 rounded-xl transition-all transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                  Creating…
                </>
              ) : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal
