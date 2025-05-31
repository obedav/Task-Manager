import { useState } from 'react'
import { Calendar, Clock, Edit3, Trash2, MoreHorizontal, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Helper function to get the task ID (handles both _id and id formats)
  const getTaskId = () => task._id || task.id

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500/30 bg-red-500/5'
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/5'
      case 'low': return 'border-green-500/30 bg-green-500/5'
      default: return 'border-slate-600/30 bg-slate-800/20'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-400" />
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-400" />
      default: return <Circle className="w-5 h-5 text-gray-400" />
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
    <div className={`group relative bg-slate-800/40 backdrop-blur-sm border rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 ${getPriorityColor(task.priority)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onStatusChange(getTaskId(), task.status === 'completed' ? 'pending' : 'completed')}
            className="hover:scale-110 transition-transform"
          >
            {getStatusIcon(task.status)}
          </button>
          <div>
            <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-white'}`}>
              {task.title}
            </h3>
            {task.category && (
              <span className="inline-block px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full mt-1">
                {task.category}
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 z-10">
              <button
                onClick={() => {
                  onEdit(task)
                  setIsMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2"
              >
                <Edit3 className="w-3 h-3" />
                <span className="text-sm">Edit</span>
              </button>
              <button
                onClick={() => {
                  onDelete(getTaskId())
                  setIsMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-slate-800 flex items-center space-x-2"
              >
                <Trash2 className="w-3 h-3" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-green-500/20 text-green-300'
          }`}>
            {task.priority}
          </span>

          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            task.status === 'completed' ? 'bg-green-500/20 text-green-300' :
            task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-300' :
            'bg-gray-500/20 text-gray-300'
          }`}>
            {task.status.replace('-', ' ')}
          </span>
        </div>

        {task.dueDate && (
          <div className={`flex items-center space-x-1 text-xs ${
            isOverdue ? 'text-red-400' : 'text-gray-400'
          }`}>
            {isOverdue && <AlertCircle className="w-3 h-3" />}
            <Calendar className="w-3 h-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>

      {task.status === 'completed' && (
        <div className="absolute inset-0 bg-green-500/5 rounded-2xl pointer-events-none"></div>
      )}
    </div>
  )
}

export default TaskCard