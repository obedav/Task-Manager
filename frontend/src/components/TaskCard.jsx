import { useState } from 'react'
import { Calendar, Clock, Edit3, Trash2, MoreHorizontal, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Helper function to get the task ID (handles both _id and id formats)
  const getTaskId = () => task._id || task.id

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':   return { borderLeft: '4px solid var(--priority-high)',   background: 'var(--surface)' }
      case 'medium': return { borderLeft: '4px solid var(--priority-medium)', background: 'var(--surface)' }
      case 'low':    return { borderLeft: '4px solid var(--priority-low)',    background: 'var(--surface)' }
      default:       return { borderLeft: '4px solid var(--border)',          background: 'var(--surface)' }
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':  return <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)' }} />
      case 'in-progress': return <Clock className="w-5 h-5" style={{ color: 'var(--royal)' }} />
      default:           return <Circle className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
    }
  }

  const formatDate = (date) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'

  // Debug log to see task structure
  console.log('🔍 TaskCard Debug - task:', task);
  console.log('🔍 TaskCard Debug - getTaskId():', getTaskId());

  return (
    <div
      className="group relative rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      style={{ ...getPriorityStyle(task.priority), border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(15,31,61,0.06)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onStatusChange(getTaskId(), task.status === 'completed' ? 'pending' : 'completed')}
            className="hover:scale-110 transition-transform"
          >
            {getStatusIcon(task.status)}
          </button>
          <div>
            <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through' : ''}`}
              style={{ color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text)' }}>
              {task.title}
            </h3>
            {task.category && (
              <span className="inline-block px-2 py-1 text-xs rounded-full mt-1" style={{ background: 'var(--royal-light)', color: 'var(--royal)' }}>
                {task.category}
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-surface-2"
            style={{ color: 'var(--text-muted)' }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 rounded-xl shadow-xl py-2 z-10" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <button
                onClick={() => {
                  onEdit(task)
                  setIsMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 flex items-center space-x-2 hover:bg-surface-2 transition-colors"
                style={{ color: 'var(--royal)' }}
              >
                <Edit3 className="w-3 h-3" />
                <span className="text-sm">Edit</span>
              </button>
              <button
                onClick={() => {
                  onDelete(getTaskId())
                  setIsMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 flex items-center space-x-2 transition-colors hover:bg-danger-bg"
                style={{ color: 'var(--danger)' }}
              >
                <Trash2 className="w-3 h-3" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            style={
              task.priority === 'high'
                ? { background: 'var(--danger-bg)',  color: 'var(--priority-high)'   }
                : task.priority === 'medium'
                ? { background: 'var(--warning-bg)', color: 'var(--priority-medium)' }
                : { background: 'var(--success-bg)', color: 'var(--priority-low)'    }
            }>
            {task.priority}
          </span>

          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            style={
              task.status === 'completed'
                ? { background: 'var(--success-bg)', color: 'var(--success)'  }
                : task.status === 'in-progress'
                ? { background: 'var(--royal-light)', color: 'var(--royal)'   }
                : { background: 'var(--surface-2)',   color: 'var(--text-muted)' }
            }>
            {t(`taskCard.${task.status}`)}
          </span>
        </div>

        {task.dueDate && (
          <div className={`flex items-center space-x-1 text-xs ${isOverdue ? 'text-red-500' : ''}`}
            style={isOverdue ? {} : { color: 'var(--text-muted)' }}>
            {isOverdue && <AlertCircle className="w-3 h-3" />}
            <Calendar className="w-3 h-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>

      {task.status === 'completed' && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'rgba(201,151,60,0.04)' }}></div>
      )}
    </div>
  )
}

export default TaskCard