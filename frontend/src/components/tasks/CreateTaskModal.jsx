import { useState, useRef, useEffect } from 'react'
import api from '../../services/api'

const inputCls = 'w-full px-4 py-3 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary'
const selectCls = 'w-full px-4 py-3 border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-primary'
const surfaceStyle = { background: 'var(--surface-2)', color: 'var(--text)' }

const CreateTaskModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [aiMode, setAiMode] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [prefilled, setPrefilled] = useState(null)
  const titleRef = useRef(null)

  useEffect(() => {
    if (isOpen && titleRef.current && !aiMode) titleRef.current.focus()
  }, [isOpen, aiMode])

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

  const handleAIParse = async () => {
    if (!aiText.trim()) return
    setAiLoading(true)
    setAiError('')
    try {
      const res = await api.post('/ai/parse-task', { text: aiText })
      setPrefilled(res.task)
      setAiMode(false)
    } catch (err) {
      setAiError(err.message || 'AI parsing failed. Please fill the form manually.')
      setAiMode(false)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
      role="dialog" aria-modal="true" aria-labelledby="create-task-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-line"
        style={{ background: 'var(--surface)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-line">
          <h2 id="create-task-title" className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            Create New Task
          </h2>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => { setAiMode(!aiMode); setAiError(''); }}
              title="Use AI to create task from natural language"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={aiMode
                ? { background: 'var(--royal)', color: '#fff' }
                : { background: 'var(--royal-light)', color: 'var(--royal)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>AI</span>
            </button>
            <button type="button" onClick={onClose} aria-label="Close dialog"
              className="p-2 rounded-lg transition-colors hover:bg-surface-2"
              style={{ color: 'var(--text-muted)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* AI input panel */}
        {aiMode && (
          <div className="p-6 border-b border-line" style={{ background: 'var(--royal-light)' }}>
            <label htmlFor="ai-input" className="block text-sm font-medium mb-2" style={{ color: 'var(--royal)' }}>
              Describe your task in plain English
            </label>
            <textarea
              id="ai-input"
              value={aiText}
              onChange={e => setAiText(e.target.value)}
              placeholder='e.g. "Review and respond to client emails by Friday, high priority"'
              rows={3}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'var(--royal)' }}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAIParse() }}
            />
            <button onClick={handleAIParse} disabled={aiLoading || !aiText.trim()}
              className="mt-3 px-4 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--royal)' }}>
              {aiLoading ? 'Parsing…' : 'Parse with AI'}
            </button>
            <p className="mt-2 text-xs" style={{ color: 'var(--royal)' }}>Tip: ⌘ + Enter to parse</p>
          </div>
        )}

        {aiError && (
          <div className="mx-6 mt-4 p-3 rounded-lg text-sm" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning)' }}>
            {aiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="ct-title" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Title *</label>
            <input
              id="ct-title" ref={titleRef} name="title" type="text" required
              defaultValue={prefilled?.title ?? ''}
              placeholder="Enter task title…"
              className={inputCls} style={surfaceStyle}
            />
          </div>

          <div>
            <label htmlFor="ct-desc" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Description</label>
            <textarea
              id="ct-desc" name="description" rows={3}
              defaultValue={prefilled?.description ?? ''}
              placeholder="Add task description…"
              className={`${inputCls} resize-none`} style={surfaceStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ct-priority" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Priority</label>
              <select id="ct-priority" name="priority" defaultValue={prefilled?.priority ?? 'medium'}
                className={selectCls} style={surfaceStyle}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label htmlFor="ct-category" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Category</label>
              <input id="ct-category" name="category" type="text"
                defaultValue={prefilled?.category ?? ''}
                placeholder="e.g. Work, Personal"
                className={inputCls} style={surfaceStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ct-due" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Due Date</label>
              <input id="ct-due" name="dueDate" type="date"
                defaultValue={prefilled?.dueDate ?? ''}
                className={selectCls} style={surfaceStyle} />
            </div>
            <div>
              <label htmlFor="ct-hours" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Est. Hours</label>
              <input id="ct-hours" name="estimatedHours" type="number" step="0.5" min="0"
                placeholder="e.g. 4" className={inputCls} style={surfaceStyle} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl transition-colors font-medium"
              style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl transition-all font-medium text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, var(--royal), var(--gold))' }}>
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />Creating…</>
              ) : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal
